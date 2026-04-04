import {
  setMode,
  setOutputType,
  setLevel,
  setCount,
  setPreviewVisible,
  setPasswordBatch,
  setPassphraseBatch,
  setGenerationError,
  setAdvancedPassword,
  setAdvancedPassphrase,
  state,
} from "./state.js";
import { renderAll } from "./ui.js";
import { CONFIG } from "./config.js";
import { generatePasswordBatch } from "./generators/password-generator.js";
import { calculatePasswordEntropy } from "./math/entropy.js";
import { generatePassphraseBatch } from "./generators/phrase-generator.js";
import { copyTextToClipboard } from "./clipboard.js";
import {
  formatPasswordGenerationError,
  formatPassphraseGenerationError,
} from "./generation-errors.js";
import { t } from "./i18n/index.js";

function hidePreview() {
  setPreviewVisible(false);
  setPasswordBatch(null);
  setPassphraseBatch(null);
  setGenerationError(null);
}

function getPasswordGenerationOptions() {
  if (state.mode === "extended") {
    const a = state.advanced.password;
    return {
      includeLowercase: a.includeLowercase,
      includeUppercase: a.includeUppercase,
      includeDigits: a.includeDigits,
      includeSymbols: a.includeSymbols,
      excludeSimilar: a.excludeSimilar,
      requireAllSelectedClasses: a.requireAllSelectedClasses,
      targetEntropy: a.targetEntropy,
    };
  }
  return {
    ...CONFIG.normalPasswordAlphabet,
    targetEntropy: CONFIG.entropyLevels[state.level],
  };
}

function getPassphraseGenerationOptions() {
  if (state.mode === "extended") {
    const a = state.advanced.passphrase;
    return {
      targetEntropy: a.targetEntropy,
      separator: a.separator,
    };
  }
  return {
    targetEntropy: CONFIG.entropyLevels[state.level],
    separator: CONFIG.separator,
  };
}

function runGenerate() {
  setGenerationError(null);
  setPasswordBatch(null);
  setPassphraseBatch(null);

  if (state.outputType === "passphrase") {
    try {
      const options = getPassphraseGenerationOptions();
      const batch = generatePassphraseBatch(options, state.count);
      setPassphraseBatch(batch);
    } catch (err) {
      setGenerationError(formatPassphraseGenerationError(err));
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
    setGenerationError(formatPasswordGenerationError(err));
  }
}

function registerAdvancedEntropyPair(rangeEl, numberEl, setEntropy) {
  if (!rangeEl || !numberEl) return;

  rangeEl.addEventListener("input", () => {
    setEntropy(Number(rangeEl.value));
    hidePreview();
    renderAll();
  });

  numberEl.addEventListener("input", () => {
    const raw = numberEl.value;
    if (raw === "" || raw === "-") return;
    const n = Number(raw);
    if (Number.isNaN(n)) return;
    setEntropy(n);
    hidePreview();
    renderAll();
  });

  numberEl.addEventListener("blur", () => {
    const raw = numberEl.value;
    if (raw === "" || Number.isNaN(Number(raw))) {
      renderAll();
      return;
    }
    setEntropy(Number(raw));
    hidePreview();
    renderAll();
  });
}

function registerAdvancedPasswordControls() {
  registerAdvancedEntropyPair(
    document.getElementById("adv-pw-entropy-range"),
    document.getElementById("adv-pw-entropy-input"),
    (v) => setAdvancedPassword({ targetEntropy: v }),
  );

  document.querySelectorAll("[data-adv-password]").forEach((input) => {
    input.addEventListener("change", () => {
      const key = input.getAttribute("data-adv-password");
      if (!key) return;
      const patch = { [key]: input.checked };
      setAdvancedPassword(patch);
      hidePreview();
      renderAll();
    });
  });
}

function registerAdvancedPassphraseControls() {
  registerAdvancedEntropyPair(
    document.getElementById("adv-ph-entropy-range"),
    document.getElementById("adv-ph-entropy-input"),
    (v) => setAdvancedPassphrase({ targetEntropy: v }),
  );

  const sel = document.getElementById("adv-ph-separator");
  if (sel) {
    sel.addEventListener("change", () => {
      setAdvancedPassphrase({ separator: sel.value });
      hidePreview();
      renderAll();
    });
  }
}

function showCopyFeedback(btn) {
  const fallback = t("copy.action");
  const original = btn.getAttribute("data-copy-label") || fallback;
  const labelEl = btn.querySelector("[data-copy-label-text]");
  const setLabel = (text) => {
    if (labelEl) labelEl.textContent = text;
    else btn.textContent = text;
  };
  setLabel(t("copy.copied"));
  btn.disabled = true;
  const prev = btn.dataset.copyTimerId;
  if (prev) {
    clearTimeout(Number(prev));
  }
  const id = window.setTimeout(() => {
    setLabel(original);
    btn.disabled = false;
    delete btn.dataset.copyTimerId;
  }, 2000);
  btn.dataset.copyTimerId = String(id);
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

  registerAdvancedPasswordControls();
  registerAdvancedPassphraseControls();

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
        copyTextToClipboard(batch.passwords[idx])
          .then(() => {
            showCopyFeedback(btn);
          })
          .catch(() => {});
        return;
      }

      if (kind === "passphrase") {
        const batch = state.passphraseBatch;
        if (!batch || !batch[idx]) return;
        copyTextToClipboard(batch[idx].value)
          .then(() => {
            showCopyFeedback(btn);
          })
          .catch(() => {});
      }
    });
  }
}
