/**
 * Единственный источник истины для параметров интерфейса.
 */

export const ENTROPY_RANGE = { min: 40, max: 256 };

/** Допустимые разделители passphrase в расширенном режиме */
export const PASSPHRASE_SEPARATORS = ["-", "_", " "];

function clampEntropy(value) {
  const x = Math.round(Number(value));
  if (Number.isNaN(x)) {
    return ENTROPY_RANGE.min;
  }
  return Math.min(ENTROPY_RANGE.max, Math.max(ENTROPY_RANGE.min, x));
}

export const state = {
  mode: "normal",
  outputType: "password",
  level: "optimal",
  count: 5,
  previewVisible: false,
  /** @type {{ passwords: string[], length: number, alphabetSize: number, entropy: number } | null} */
  passwordBatch: null,
  /**
   * @type {null | Array<{ value: string, wordCount: number, dictionarySize: number, entropy: number }>}
   */
  passphraseBatch: null,
  /** @type {string | null} */
  generationError: null,

  advanced: {
    password: {
      targetEntropy: 80,
      includeLowercase: true,
      includeUppercase: true,
      includeDigits: true,
      includeSymbols: true,
      excludeSimilar: true,
      requireAllSelectedClasses: true,
    },
    passphrase: {
      targetEntropy: 80,
      separator: "-",
    },
  },
};

export function setMode(mode) {
  if (mode === "normal" || mode === "extended") {
    state.mode = mode;
  }
}

export function setOutputType(outputType) {
  if (outputType === "password" || outputType === "passphrase") {
    state.outputType = outputType;
  }
}

export function setLevel(level) {
  if (level === "minimal" || level === "optimal" || level === "maximum") {
    state.level = level;
  }
}

export function setCount(count) {
  const n = Number(count);
  if (n === 3 || n === 5 || n === 10) {
    state.count = n;
  }
}

export function setPreviewVisible(visible) {
  state.previewVisible = Boolean(visible);
}

export function setPasswordBatch(batch) {
  state.passwordBatch = batch;
}

export function setPassphraseBatch(batch) {
  state.passphraseBatch = batch;
}

export function setGenerationError(message) {
  state.generationError = message == null ? null : String(message);
}

/**
 * @param {Partial<typeof state.advanced.password>} patch
 */
export function setAdvancedPassword(patch) {
  if (!patch || typeof patch !== "object") return;
  const p = state.advanced.password;
  if ("targetEntropy" in patch) {
    p.targetEntropy = clampEntropy(patch.targetEntropy);
  }
  if (typeof patch.includeLowercase === "boolean") {
    p.includeLowercase = patch.includeLowercase;
  }
  if (typeof patch.includeUppercase === "boolean") {
    p.includeUppercase = patch.includeUppercase;
  }
  if (typeof patch.includeDigits === "boolean") {
    p.includeDigits = patch.includeDigits;
  }
  if (typeof patch.includeSymbols === "boolean") {
    p.includeSymbols = patch.includeSymbols;
  }
  if (typeof patch.excludeSimilar === "boolean") {
    p.excludeSimilar = patch.excludeSimilar;
  }
  if (typeof patch.requireAllSelectedClasses === "boolean") {
    p.requireAllSelectedClasses = patch.requireAllSelectedClasses;
  }
}

/**
 * @param {Partial<typeof state.advanced.passphrase>} patch
 */
export function setAdvancedPassphrase(patch) {
  if (!patch || typeof patch !== "object") return;
  const ph = state.advanced.passphrase;
  if ("targetEntropy" in patch) {
    ph.targetEntropy = clampEntropy(patch.targetEntropy);
  }
  if (typeof patch.separator === "string" && PASSPHRASE_SEPARATORS.includes(patch.separator)) {
    ph.separator = patch.separator;
  }
}
