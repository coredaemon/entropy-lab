import { state } from "./state.js";
import { CONFIG } from "./config.js";
import { getAlphabetSize } from "./math/alphabet.js";
import {
  calculateLengthForTargetEntropy,
  calculatePasswordEntropy,
} from "./math/entropy.js";
import {
  calculatePassphraseEntropy,
  calculateWordsForTargetEntropy,
  getWordEntropy,
} from "./math/passphrase.js";

const MODE_LABELS = {
  normal: "Обычный",
  extended: "Расширенный",
};

const OUTPUT_TYPE_LABELS = {
  password: "Символьный пароль",
  passphrase: "Passphrase",
};

const LEVEL_LABELS = {
  minimal: "Минимальный (~68 бит)",
  optimal: "Оптимальный (~80 бит)",
  maximum: "Максимальный (~128 бит)",
};

function syncRadioGroup(name, value) {
  document.querySelectorAll(`input[name="${name}"]`).forEach((input) => {
    input.checked = input.value === String(value);
  });
}

function renderParamsHint(el) {
  if (!el) return;
  el.textContent =
    state.mode === "extended" ? "Расширенный режим" : "Обычный режим";
}

function formatEntropyOneDecimal(value) {
  return value.toFixed(1);
}

function formatLogThreeDecimals(value) {
  return value.toFixed(3);
}

function escapeHtml(text) {
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };
  return String(text).replace(/[&<>"']/g, (ch) => map[ch] ?? ch);
}

function buildDlRows(rows) {
  return rows
    .map(
      ([dt, dd]) => `
        <dt>${escapeHtml(dt)}</dt>
        <dd>${escapeHtml(dd)}</dd>`,
    )
    .join("");
}

function buildPasswordMathCard() {
  const mode = MODE_LABELS[state.mode] ?? state.mode;
  const outputType = OUTPUT_TYPE_LABELS[state.outputType] ?? state.outputType;
  const levelLabel = LEVEL_LABELS[state.level] ?? state.level;

  const targetEntropy = CONFIG.entropyLevels[state.level];
  const alphabetSource =
    state.mode === "extended"
      ? CONFIG.extendedPasswordAlphabet
      : CONFIG.normalPasswordAlphabet;
  const alphabetSize = getAlphabetSize(alphabetSource);
  const requiredLength = calculateLengthForTargetEntropy(
    targetEntropy,
    alphabetSize,
  );
  const actualEntropy = calculatePasswordEntropy(
    requiredLength,
    alphabetSize,
  );

  const rows = [
    ["Режим", mode],
    ["Тип", outputType],
    ["Уровень", levelLabel],
    ["Целевая энтропия", String(targetEntropy)],
    ["Размер алфавита", String(alphabetSize)],
    ["Требуемая длина", String(requiredLength)],
    [
      "Фактическая энтропия",
      formatEntropyOneDecimal(actualEntropy),
    ],
  ];

  return `
    <div class="result-preview">
      <p class="result-preview__title">Расчёт (символьный пароль)</p>
      <dl class="result-preview__list">
        ${buildDlRows(rows)}
      </dl>
    </div>
  `;
}

function buildPassphraseMathCard() {
  const mode = MODE_LABELS[state.mode] ?? state.mode;
  const outputType = OUTPUT_TYPE_LABELS[state.outputType] ?? state.outputType;
  const levelLabel = LEVEL_LABELS[state.level] ?? state.level;

  const dictionarySize = CONFIG.dictionarySize;
  const targetEntropy = CONFIG.entropyLevels[state.level];
  const wordEntropy = getWordEntropy(dictionarySize);
  const requiredWords = calculateWordsForTargetEntropy(
    targetEntropy,
    dictionarySize,
  );
  const actualEntropy = calculatePassphraseEntropy(
    requiredWords,
    dictionarySize,
  );

  const rows = [
    ["Режим", mode],
    ["Тип", outputType],
    ["Уровень", levelLabel],
    ["Целевая энтропия", String(targetEntropy)],
    ["Размер словаря", String(dictionarySize)],
    ["Энтропия на слово", formatLogThreeDecimals(wordEntropy)],
    ["Требуемо слов", String(requiredWords)],
    [
      "Фактическая энтропия",
      formatEntropyOneDecimal(actualEntropy),
    ],
  ];

  return `
    <div class="result-preview">
      <p class="result-preview__title">Расчёт (passphrase)</p>
      <dl class="result-preview__list">
        ${buildDlRows(rows)}
      </dl>
    </div>
  `;
}

function buildPasswordResultsMarkup() {
  const batch = state.passwordBatch;
  if (!batch || !Array.isArray(batch.passwords)) {
    return "";
  }
  const entropyStr = formatEntropyOneDecimal(batch.entropy);
  const lengthStr = String(batch.length);
  const alphabetStr = String(batch.alphabetSize);

  const cards = batch.passwords
    .map((pwd, index) => {
      return `
        <article class="password-card">
          <div class="password-card__row password-card__row--main">
            <code class="password-card__value">${escapeHtml(pwd)}</code>
            <button
              type="button"
              class="btn btn--secondary btn--compact"
              data-copy-index="${index}"
            >
              Копировать
            </button>
          </div>
          <dl class="password-card__meta">
            <dt>Энтропия</dt>
            <dd>${escapeHtml(entropyStr)} бит</dd>
            <dt>Длина</dt>
            <dd>${escapeHtml(lengthStr)}</dd>
            <dt>Размер алфавита</dt>
            <dd>${escapeHtml(alphabetStr)}</dd>
          </dl>
        </article>
      `;
    })
    .join("");

  return `<div class="password-results">${cards}</div>`;
}

function buildPassphraseResultsMarkup() {
  const items = state.passphraseBatch;
  if (!Array.isArray(items) || items.length === 0) return "";

  const cards = items
    .map((item, index) => {
      const valueStr = String(item.value ?? "");
      const wordCountStr = String(item.wordCount ?? "");
      const dictionarySizeStr = String(item.dictionarySize ?? "");
      const entropyStr = formatEntropyOneDecimal(item.entropy ?? 0);

      return `
        <article class="password-card">
          <div class="password-card__row password-card__row--main">
            <code class="password-card__value">${escapeHtml(valueStr)}</code>
            <button
              type="button"
              class="btn btn--secondary btn--compact"
              data-copy-kind="passphrase"
              data-copy-index="${index}"
            >
              Копировать
            </button>
          </div>
          <dl class="password-card__meta">
            <dt>слов</dt>
            <dd>${escapeHtml(wordCountStr)}</dd>
            <dt>словарь</dt>
            <dd>${escapeHtml(dictionarySizeStr)}</dd>
            <dt>расчётная энтропия</dt>
            <dd>${escapeHtml(entropyStr)} бит</dd>
          </dl>
        </article>
      `;
    })
    .join("");

  return `<div class="password-results">${cards}</div>`;
}

function buildGenerationErrorMarkup() {
  const msg = state.generationError ?? "";
  return `
    <div class="result-preview result-preview--error" role="alert">
      <p class="result-preview__title">Ошибка</p>
      <p class="result-preview__error-text">${escapeHtml(msg)}</p>
    </div>
  `;
}

function buildResultsMarkup() {
  if (state.generationError) {
    return buildGenerationErrorMarkup();
  }

  if (state.outputType === "passphrase") {
    if (state.passphraseBatch) {
      return buildPassphraseResultsMarkup();
    }
    return buildPassphraseMathCard();
  }

  if (state.passwordBatch) {
    return buildPasswordResultsMarkup();
  }

  return buildPasswordMathCard();
}

function renderResults(container) {
  if (!container) return;
  if (state.previewVisible) {
    container.innerHTML = buildResultsMarkup();
    container.classList.remove("results-placeholder--empty");
  } else {
    container.innerHTML = "";
    container.classList.add("results-placeholder--empty");
  }
}

export function renderAll() {
  syncRadioGroup("mode", state.mode);
  syncRadioGroup("output-type", state.outputType);
  syncRadioGroup("level", state.level);
  syncRadioGroup("count", state.count);

  renderParamsHint(document.getElementById("params-hint"));
  renderResults(document.getElementById("results-container"));
}
