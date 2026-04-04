/**
 * Метрики и сравнение моделей для расширенного режима (без побочных эффектов).
 */

import { CONFIG } from "../config.js";
import { getAlphabetSize } from "./alphabet.js";
import {
  calculateLengthForTargetEntropy,
  calculatePasswordEntropy,
} from "./entropy.js";
import {
  calculatePassphraseEntropy,
  calculateWordsForTargetEntropy,
  getWordEntropy,
} from "./passphrase.js";

/** Сколько непустых классов символов выбрано (как в password-generator). */
export function countPasswordClasses(options) {
  let k = 0;
  if (options.includeLowercase) {
    const n = options.excludeSimilar
      ? CONFIG.lowercaseAlphabetSize - 1
      : CONFIG.lowercaseAlphabetSize;
    if (n > 0) k += 1;
  }
  if (options.includeUppercase) {
    const n = options.excludeSimilar
      ? CONFIG.uppercaseAlphabetSize - 2
      : CONFIG.uppercaseAlphabetSize;
    if (n > 0) k += 1;
  }
  if (options.includeDigits) {
    const n = options.excludeSimilar
      ? CONFIG.digitAlphabetSize - 2
      : CONFIG.digitAlphabetSize;
    if (n > 0) k += 1;
  }
  if (options.includeSymbols && CONFIG.baseSymbolSetSize > 0) {
    k += 1;
  }
  return k;
}

/**
 * Коды ошибок модели (тексты для UI — в i18n).
 * @typedef {{ code: "ADV_PW_ALPHABET" } | { code: "ADV_PW_TARGET" } | { code: "ADV_PW_REQUIRE_ALL", requiredLength: number, classCount: number }} AdvancedPasswordError
 */

/**
 * @param {object} passwordAdvanced — поля как в state.advanced.password (без лишнего)
 * @returns {{ ok: true, alphabetSize: number, requiredLength: number, actualEntropy: number, classCount: number } | { ok: false, error: AdvancedPasswordError }}
 */
export function getAdvancedPasswordMetrics(passwordAdvanced) {
  const opts = {
    includeLowercase: passwordAdvanced.includeLowercase,
    includeUppercase: passwordAdvanced.includeUppercase,
    includeDigits: passwordAdvanced.includeDigits,
    includeSymbols: passwordAdvanced.includeSymbols,
    excludeSimilar: passwordAdvanced.excludeSimilar,
  };

  const classCount = countPasswordClasses(opts);

  const alphabetSize = getAlphabetSize(opts);
  if (alphabetSize <= 1) {
    return {
      ok: false,
      error: { code: "ADV_PW_ALPHABET" },
    };
  }

  const targetEntropy = passwordAdvanced.targetEntropy;
  let requiredLength;
  try {
    requiredLength = calculateLengthForTargetEntropy(
      targetEntropy,
      alphabetSize,
    );
  } catch {
    return { ok: false, error: { code: "ADV_PW_TARGET" } };
  }

  if (passwordAdvanced.requireAllSelectedClasses && classCount > 0) {
    if (requiredLength < classCount) {
      return {
        ok: false,
        error: {
          code: "ADV_PW_REQUIRE_ALL",
          requiredLength,
          classCount,
        },
      };
    }
  }

  const actualEntropy = calculatePasswordEntropy(requiredLength, alphabetSize);
  return {
    ok: true,
    alphabetSize,
    requiredLength,
    actualEntropy,
    classCount,
  };
}

/**
 * @param {object} passphraseAdvanced — state.advanced.passphrase
 */
export function getAdvancedPassphraseMetrics(passphraseAdvanced) {
  const dictionarySize = CONFIG.dictionarySize;
  const wordEntropy = getWordEntropy(dictionarySize);
  const requiredWords = calculateWordsForTargetEntropy(
    passphraseAdvanced.targetEntropy,
    dictionarySize,
  );
  const actualEntropy = calculatePassphraseEntropy(
    requiredWords,
    dictionarySize,
  );
  return {
    dictionarySize,
    wordEntropy,
    requiredWords,
    actualEntropy,
  };
}

/**
 * Одинаковая целевая энтропия для обеих строк: берётся из активного типа вывода.
 */
export function getModelComparison(state) {
  const targetEntropy =
    state.outputType === "password"
      ? state.advanced.password.targetEntropy
      : state.advanced.passphrase.targetEntropy;

  const pwOpts = state.advanced.password;
  const n = getAlphabetSize({
    includeLowercase: pwOpts.includeLowercase,
    includeUppercase: pwOpts.includeUppercase,
    includeDigits: pwOpts.includeDigits,
    includeSymbols: pwOpts.includeSymbols,
    excludeSimilar: pwOpts.excludeSimilar,
  });

  let passwordRow = { alphabetSize: n, requiredLength: null, ok: false };
  if (n > 1) {
    try {
      passwordRow = {
        ok: true,
        alphabetSize: n,
        requiredLength: calculateLengthForTargetEntropy(targetEntropy, n),
      };
    } catch {
      passwordRow = { ok: false, alphabetSize: n, requiredLength: null };
    }
  }

  const dictionarySize = CONFIG.dictionarySize;
  const passphraseRow = {
    dictionarySize,
    requiredWords: calculateWordsForTargetEntropy(
      targetEntropy,
      dictionarySize,
    ),
  };

  return {
    targetEntropy,
    password: passwordRow,
    passphrase: passphraseRow,
  };
}
