import {
  setMode,
  setOutputType,
  setLevel,
  setCount,
  setPreviewVisible,
  setPasswordBatch,
  setPassphraseBatch,
  setGenerationError,
  state,
} from "./state.js";
import { renderAll } from "./ui.js";
import { CONFIG } from "./config.js";
import { generatePasswordBatch } from "./generators/password-generator.js";
import { calculatePasswordEntropy } from "./math/entropy.js";
import { generatePassphraseBatch } from "./generators/phrase-generator.js";
import { copyTextToClipboard } from "./clipboard.js";

function hidePreview() {
  setPreviewVisible(false);
  setPasswordBatch(null);
  setPassphraseBatch(null);
  setGenerationError(null);
}

function getPasswordGenerationOptions() {
  const base =
    state.mode === "extended"
      ? CONFIG.extendedPasswordAlphabet
      : CONFIG.normalPasswordAlphabet;
  return {
    ...base,
    targetEntropy: CONFIG.entropyLevels[state.level],
  };
}

function runGenerate() {
  setGenerationError(null);
  setPasswordBatch(null);
  setPassphraseBatch(null);

  if (state.outputType === "passphrase") {
    try {
      const options = {
        targetEntropy: CONFIG.entropyLevels[state.level],
        separator: CONFIG.separator,
      };
      const batch = generatePassphraseBatch(options, state.count);
      setPassphraseBatch(batch);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Не удалось сгенерировать фразы";
      setGenerationError(message);
    }
    return;
  }

  try {
    const options = getPasswordGenerationOptions();
    const { passwords, length, alphabetSize } = generatePasswordBatch(
      options,
      state.count,
    );
    const entropy = calculatePasswordEntropy(length, alphabetSize);
    setPasswordBatch({ passwords, length, alphabetSize, entropy });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Не удалось сгенерировать пароли";
    setGenerationError(message);
  }
}

export function registerEvents() {
  document.querySelectorAll('input[name="mode"]').forEach((input) => {
    input.addEventListener("change", () => {
      if (!input.checked) return;
      setMode(input.value);
      hidePreview();
      renderAll();
    });
  });

  document.querySelectorAll('input[name="output-type"]').forEach((input) => {
    input.addEventListener("change", () => {
      if (!input.checked) return;
      setOutputType(input.value);
      hidePreview();
      renderAll();
    });
  });

  document.querySelectorAll('input[name="level"]').forEach((input) => {
    input.addEventListener("change", () => {
      if (!input.checked) return;
      setLevel(input.value);
      hidePreview();
      renderAll();
    });
  });

  document.querySelectorAll('input[name="count"]').forEach((input) => {
    input.addEventListener("change", () => {
      if (!input.checked) return;
      setCount(input.value);
      hidePreview();
      renderAll();
    });
  });

  const generateBtn = document.getElementById("btn-generate");
  if (generateBtn) {
    generateBtn.addEventListener("click", () => {
      setPreviewVisible(true);
      runGenerate();
      renderAll();
    });
  }

  const resultsContainer = document.getElementById("results-container");
  if (resultsContainer) {
    resultsContainer.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-copy-index]");
      if (!btn) return;
      e.preventDefault();
      const idx = Number(btn.getAttribute("data-copy-index"));
      const kind = btn.getAttribute("data-copy-kind") ?? "password";

      if (kind === "password") {
        const batch = state.passwordBatch;
        if (!batch || !batch.passwords[idx]) return;
        copyTextToClipboard(batch.passwords[idx]).catch(() => {
          /* игнорируем отказ буфера в тихом режиме */
        });
        return;
      }

      if (kind === "passphrase") {
        const batch = state.passphraseBatch;
        if (!batch || !batch[idx]) return;
        copyTextToClipboard(batch[idx].value).catch(() => {
          /* игнорируем отказ буфера в тихом режиме */
        });
      }
    });
  }
}
