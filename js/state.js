/**
 * Единственный источник истины для параметров интерфейса.
 */

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
