import { state, ENTROPY_RANGE } from "./state.js";
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
import {
  getAdvancedPasswordMetrics,
  getAdvancedPassphraseMetrics,
  getModelComparison,
} from "./math/advanced-model.js";
import { applyDomI18n, t } from "./i18n/index.js";

function syncRadioGroup(name, value) {
  document.querySelectorAll(`input[name="${name}"]`).forEach((input) => {
    input.checked = input.value === String(value);
  });
}

function renderParamsHint(el) {
  if (!el) return;
  el.textContent =
    state.mode === "extended"
      ? t("params.hintExtended")
      : t("params.hintNormal");
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

/** @param {object | undefined} err */
function formatAdvancedPasswordError(err) {
  if (!err || typeof err !== "object") return "";
  if (err.code === "ADV_PW_ALPHABET") return t("errors.advPwAlphabet");
  if (err.code === "ADV_PW_TARGET") return t("errors.advPwTarget");
  if (err.code === "ADV_PW_REQUIRE_ALL") {
    return t("errors.advPwRequireAll", {
      requiredLength: err.requiredLength,
      classCount: err.classCount,
    });
  }
  return "";
}

function modeLabel() {
  return state.mode === "extended" ? t("mode.extended") : t("mode.normal");
}

function outputTypeLabel() {
  return state.outputType === "passphrase"
    ? t("type.passphrase")
    : t("type.password");
}

function levelLabel() {
  const bits = CONFIG.entropyLevels[state.level];
  return t(`level.${state.level}`, { bits });
}

function bitsSuffix() {
  return `${t("math.bitsUnit")}`;
}

function buildPasswordMathCard() {
  const mode = modeLabel();
  const outputType = outputTypeLabel();

  if (state.mode === "extended") {
    const adv = state.advanced.password;
    const m = getAdvancedPasswordMetrics(adv);
    const rows = [
      [t("math.rowMode"), mode],
      [t("math.rowType"), outputType],
      [t("math.rowTargetEntropy"), String(adv.targetEntropy)],
    ];

    if (!m.ok) {
      rows.push([t("math.rowModel"), formatAdvancedPasswordError(m.error)]);
      return `
        <section class="math-preview">
          <h3>${escapeHtml(t("math.calcPasswordTitle"))}</h3>
          <dl class="descr-list">${buildDlRows(rows)}</dl>
        </section>
      `;
    }

    rows.push(
      [t("math.rowAlphabetN"), String(m.alphabetSize)],
      [t("math.rowRequiredLen"), String(m.requiredLength)],
      [
        t("math.rowModelEntropy"),
        `${formatEntropyOneDecimal(m.actualEntropy)} ${bitsSuffix()}`,
      ],
    );

    return `
      <section class="math-preview">
        <h3>${escapeHtml(t("math.calcPasswordTitle"))}</h3>
        <dl class="descr-list">${buildDlRows(rows)}</dl>
      </section>
    `;
  }

  const lvl = levelLabel();
  const targetEntropy = CONFIG.entropyLevels[state.level];
  const alphabetSource = CONFIG.normalPasswordAlphabet;
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
    [t("math.rowMode"), mode],
    [t("math.rowType"), outputType],
    [t("math.rowLevel"), lvl],
    [t("math.rowTargetEntropy"), String(targetEntropy)],
    [t("math.rowAlphabetSize"), String(alphabetSize)],
    [t("math.rowRequiredLength"), String(requiredLength)],
    [
      t("math.rowActualEntropy"),
      `${formatEntropyOneDecimal(actualEntropy)} ${bitsSuffix()}`,
    ],
  ];

  return `
    <section class="math-preview">
      <h3>${escapeHtml(t("math.calcPasswordTitle"))}</h3>
      <dl class="descr-list">${buildDlRows(rows)}</dl>
    </section>
  `;
}

function buildPassphraseMathCard() {
  const mode = modeLabel();
  const outputType = outputTypeLabel();

  if (state.mode === "extended") {
    const adv = state.advanced.passphrase;
    const m = getAdvancedPassphraseMetrics(adv);
    const sepDisplay =
      adv.separator === " " ? t("adv.separatorDisplaySpace") : adv.separator;
    const rows = [
      [t("math.rowMode"), mode],
      [t("math.rowType"), outputType],
      [t("math.rowTargetEntropy"), String(adv.targetEntropy)],
      [t("math.rowSeparator"), sepDisplay],
      [t("math.rowDictionarySize"), String(m.dictionarySize)],
      [t("math.rowWordEntropy"), formatLogThreeDecimals(m.wordEntropy)],
      [t("math.rowWordsRequired"), String(m.requiredWords)],
      [
        t("math.rowModelEntropy"),
        `${formatEntropyOneDecimal(m.actualEntropy)} ${bitsSuffix()}`,
      ],
    ];

    return `
      <section class="math-preview">
        <h3>${escapeHtml(t("math.calcPassphraseTitle"))}</h3>
        <dl class="descr-list">${buildDlRows(rows)}</dl>
      </section>
    `;
  }

  const lvl = levelLabel();
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
    [t("math.rowMode"), mode],
    [t("math.rowType"), outputType],
    [t("math.rowLevel"), lvl],
    [t("math.rowTargetEntropy"), String(targetEntropy)],
    [t("math.rowDictionarySize"), String(dictionarySize)],
    [t("math.rowWordEntropy"), formatLogThreeDecimals(wordEntropy)],
    [t("math.rowWordsRequired"), String(requiredWords)],
    [
      t("math.rowActualEntropy"),
      `${formatEntropyOneDecimal(actualEntropy)} ${bitsSuffix()}`,
    ],
  ];

  return `
    <section class="math-preview">
      <h3>${escapeHtml(t("math.calcPassphraseTitle"))}</h3>
      <dl class="descr-list">${buildDlRows(rows)}</dl>
    </section>
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
  const copyLabel = escapeHtml(t("copy.action"));

  const cards = batch.passwords
    .map((pwd, index) => {
      return `
        <article class="result-card">
          <pre class="result-card__value">${escapeHtml(pwd)}</pre>
          <dl class="result-card__meta">
            <dt>${escapeHtml(t("result.metaEntropy"))}</dt>
            <dd>${escapeHtml(entropyStr)} ${escapeHtml(t("math.bitsUnit"))}</dd>
            <dt>${escapeHtml(t("result.metaLength"))}</dt>
            <dd>${escapeHtml(lengthStr)}</dd>
            <dt>${escapeHtml(t("result.metaAlphabetSize"))}</dt>
            <dd>${escapeHtml(alphabetStr)}</dd>
          </dl>
          <p class="result-card__actions">
            <button
              type="button"
              class="btn btn--ghost"
              data-copy-index="${index}"
              data-copy-label="${copyLabel}"
            >
              <span data-copy-label-text>${copyLabel}</span>
            </button>
          </p>
        </article>
      `;
    })
    .join("");

  return cards;
}

function buildPassphraseResultsMarkup() {
  const items = state.passphraseBatch;
  if (!Array.isArray(items) || items.length === 0) return "";

  const copyLabel = escapeHtml(t("copy.action"));

  const cards = items
    .map((item, index) => {
      const valueStr = String(item.value ?? "");
      const wordCountStr = String(item.wordCount ?? "");
      const dictionarySizeStr = String(item.dictionarySize ?? "");
      const entropyStr = formatEntropyOneDecimal(item.entropy ?? 0);

      return `
        <article class="result-card">
          <pre class="result-card__value">${escapeHtml(valueStr)}</pre>
          <dl class="result-card__meta">
            <dt>${escapeHtml(t("result.metaWords"))}</dt>
            <dd>${escapeHtml(wordCountStr)}</dd>
            <dt>${escapeHtml(t("result.metaDictionary"))}</dt>
            <dd>${escapeHtml(dictionarySizeStr)}</dd>
            <dt>${escapeHtml(t("result.metaEntropyEstimate"))}</dt>
            <dd>${escapeHtml(entropyStr)} ${escapeHtml(t("math.bitsUnit"))}</dd>
          </dl>
          <p class="result-card__actions">
            <button
              type="button"
              class="btn btn--ghost"
              data-copy-kind="passphrase"
              data-copy-index="${index}"
              data-copy-label="${copyLabel}"
            >
              <span data-copy-label-text>${copyLabel}</span>
            </button>
          </p>
        </article>
      `;
    })
    .join("");

  return cards;
}

function buildGenerationErrorMarkup() {
  const msg = state.generationError ?? "";
  return `
    <section class="result-alert" role="alert">
      <h3 class="result-alert__title">${escapeHtml(t("result.errorTitle"))}</h3>
      <p class="result-alert__msg">${escapeHtml(msg)}</p>
    </section>
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
  } else {
    container.innerHTML = `
      <div class="results-empty">
        <p class="results-empty__title">${escapeHtml(t("result.emptyTitle"))}</p>
        <p class="results-empty__hint">${escapeHtml(t("result.emptyHint"))}</p>
      </div>`;
  }
}

function renderAdvancedModelBlock(el) {
  if (!el) return;
  if (state.mode !== "extended") {
    el.innerHTML = "";
    return;
  }

  if (state.outputType === "password") {
    const m = getAdvancedPasswordMetrics(state.advanced.password);
    if (!m.ok) {
      el.innerHTML = `
        <section class="info-panel">
          <h3>${escapeHtml(t("adv.modelTitle"))}</h3>
          <p>${escapeHtml(formatAdvancedPasswordError(m.error))}</p>
        </section>`;
      return;
    }
    el.innerHTML = `
      <section class="info-panel">
        <h3>${escapeHtml(t("adv.modelTitle"))}</h3>
        <dl class="descr-list">
          <dt>${escapeHtml(t("math.rowAlphabetN"))}</dt><dd>${escapeHtml(String(m.alphabetSize))}</dd>
          <dt>${escapeHtml(t("math.rowRequiredLen"))}</dt><dd>${escapeHtml(String(m.requiredLength))}</dd>
          <dt>${escapeHtml(t("math.rowModelEntropy"))}</dt><dd>${escapeHtml(formatEntropyOneDecimal(m.actualEntropy))} ${escapeHtml(t("math.bitsUnit"))}</dd>
        </dl>
      </section>`;
    return;
  }

  const m = getAdvancedPassphraseMetrics(state.advanced.passphrase);
  el.innerHTML = `
    <section class="info-panel">
      <h3>${escapeHtml(t("adv.modelTitle"))}</h3>
      <dl class="descr-list">
        <dt>${escapeHtml(t("math.rowDictionarySize"))}</dt><dd>${escapeHtml(String(m.dictionarySize))}</dd>
        <dt>${escapeHtml(t("math.rowWordEntropy"))}</dt><dd>${escapeHtml(formatLogThreeDecimals(m.wordEntropy))}</dd>
        <dt>${escapeHtml(t("math.rowWordsRequired"))}</dt><dd>${escapeHtml(String(m.requiredWords))}</dd>
        <dt>${escapeHtml(t("math.rowModelEntropy"))}</dt><dd>${escapeHtml(formatEntropyOneDecimal(m.actualEntropy))} ${escapeHtml(t("math.bitsUnit"))}</dd>
      </dl>
    </section>`;
}

function renderAdvancedCompareBlock(el) {
  if (!el) return;
  if (state.mode !== "extended") {
    el.innerHTML = "";
    return;
  }

  const cmp = getModelComparison(state);
  const tEnt = cmp.targetEntropy;
  const pw = cmp.password;
  const ph = cmp.passphrase;

  let passwordLine;
  if (pw.ok && pw.requiredLength != null) {
    passwordLine = t("adv.comparePasswordLine", {
      n: pw.alphabetSize,
      len: pw.requiredLength,
    });
  } else {
    passwordLine = t("adv.comparePasswordInvalid");
  }

  const passphraseLine = t("adv.comparePassphraseLine", {
    dict: ph.dictionarySize,
    words: ph.requiredWords,
  });

  el.innerHTML = `
    <section class="info-panel">
      <h3>${escapeHtml(t("adv.compareTitle"))}</h3>
      <p>${escapeHtml(t("adv.compareMeta", { bits: tEnt }))}</p>
      <ul>
        <li>${escapeHtml(t("adv.comparePasswordLabel"))} ${escapeHtml(passwordLine)}</li>
        <li>${escapeHtml(t("adv.comparePassphraseLabel"))} ${escapeHtml(passphraseLine)}</li>
      </ul>
    </section>`;
}

function renderAdvancedOrientBlock(el) {
  if (!el) return;
  if (state.mode !== "extended") {
    el.innerHTML = "";
    return;
  }

  el.innerHTML = `
    <section class="info-panel">
      <h3>${escapeHtml(t("adv.orientTitle"))}</h3>
      <ul>
        <li>${escapeHtml(t("adv.orient60"))}</li>
        <li>${escapeHtml(t("adv.orient80"))}</li>
        <li>${escapeHtml(t("adv.orient128"))}</li>
      </ul>
    </section>`;
}

function syncAdvancedPanels() {
  const normal = document.getElementById("params-panel-normal");
  const extended = document.getElementById("params-panel-extended");
  const pwPanel = document.getElementById("extended-password-panel");
  const phPanel = document.getElementById("extended-passphrase-panel");

  if (normal && extended) {
    const isExt = state.mode === "extended";
    normal.hidden = isExt;
    extended.hidden = !isExt;
  }

  if (pwPanel && phPanel) {
    const isPw = state.outputType === "password";
    pwPanel.hidden = !isPw;
    phPanel.hidden = isPw;
  }
}

function syncAdvancedInputsFromState() {
  const ap = state.advanced.password;
  const af = state.advanced.passphrase;

  const rPw = document.getElementById("adv-pw-entropy-range");
  const nPw = document.getElementById("adv-pw-entropy-input");
  if (rPw && nPw) {
    rPw.min = String(ENTROPY_RANGE.min);
    rPw.max = String(ENTROPY_RANGE.max);
    nPw.min = String(ENTROPY_RANGE.min);
    nPw.max = String(ENTROPY_RANGE.max);
    rPw.value = String(ap.targetEntropy);
    nPw.value = String(ap.targetEntropy);
  }

  const rPh = document.getElementById("adv-ph-entropy-range");
  const nPh = document.getElementById("adv-ph-entropy-input");
  if (rPh && nPh) {
    rPh.min = String(ENTROPY_RANGE.min);
    rPh.max = String(ENTROPY_RANGE.max);
    nPh.min = String(ENTROPY_RANGE.min);
    nPh.max = String(ENTROPY_RANGE.max);
    rPh.value = String(af.targetEntropy);
    nPh.value = String(af.targetEntropy);
  }

  const fields = [
    ["adv-pw-lowercase", ap.includeLowercase],
    ["adv-pw-uppercase", ap.includeUppercase],
    ["adv-pw-digits", ap.includeDigits],
    ["adv-pw-symbols", ap.includeSymbols],
    ["adv-pw-exclude-similar", ap.excludeSimilar],
    ["adv-pw-require-all", ap.requireAllSelectedClasses],
  ];
  for (const [id, checked] of fields) {
    const inputEl = document.getElementById(id);
    if (inputEl) inputEl.checked = checked;
  }

  const sel = document.getElementById("adv-ph-separator");
  if (sel) {
    sel.value = af.separator;
  }
}

function renderLevelSegmentLabels() {
  document.querySelectorAll('input[name="level"]').forEach((input) => {
    const lev = input.value;
    const span = input.nextElementSibling;
    if (
      span &&
      (lev === "minimal" || lev === "optimal" || lev === "maximum")
    ) {
      const bits = CONFIG.entropyLevels[lev];
      span.textContent = t(`level.${lev}`, { bits });
    }
  });
}

export function renderAll() {
  try {
    syncRadioGroup("mode", state.mode);
    syncRadioGroup("output-type", state.outputType);
    syncRadioGroup("level", state.level);
    syncRadioGroup("count", state.count);

    renderLevelSegmentLabels();
    renderParamsHint(document.getElementById("params-hint"));
    syncAdvancedPanels();
    syncAdvancedInputsFromState();

    renderAdvancedModelBlock(document.getElementById("advanced-model-block"));
    renderAdvancedCompareBlock(document.getElementById("advanced-compare-block"));
    renderAdvancedOrientBlock(document.getElementById("advanced-orient-block"));

    renderResults(document.getElementById("results-container"));
  } finally {
    applyDomI18n(document.body);
  }
}
