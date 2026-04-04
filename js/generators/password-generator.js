/**
 * Генерация символьных паролей на основе targetEntropy и алфавита из config.
 */

import { CONFIG } from "../config.js";
import { getAlphabetSize } from "../math/alphabet.js";
import { buildConstrainedWaysTable } from "../math/constrained-count.js";
import { calculateLengthForTargetEntropy } from "../math/entropy.js";
import {
  pickSecureIndexByBigIntWeights,
  pickSecureRandomItem,
} from "./random.js";

function filterSimilarChars(characters) {
  const forbidden = new Set(CONFIG.similarChars);
  return [...characters].filter((ch) => !forbidden.has(ch));
}

function buildSegment(options, key) {
  const raw = CONFIG[`${key}Chars`];
  if (!raw) {
    throw new Error(`password-generator: не задан CONFIG.${key}Chars`);
  }
  let chars = [...raw];
  if (options.excludeSimilar) {
    chars = filterSimilarChars(chars);
  }
  return chars;
}

/**
 * Собирает массив символов алфавита в том же порядке и с теми же правилами,
 * что и getAlphabetSize() в math/alphabet.js.
 */
export function buildPasswordAlphabet(options) {
  const chars = [];

  if (options.includeLowercase) {
    chars.push(...buildSegment(options, "lowercase"));
  }
  if (options.includeUppercase) {
    chars.push(...buildSegment(options, "uppercase"));
  }
  if (options.includeDigits) {
    chars.push(...buildSegment(options, "digit"));
  }
  if (options.includeSymbols) {
    const sym = CONFIG.symbolChars;
    chars.push(...sym);
  }

  if (chars.length === 0) {
    throw new RangeError(
      "Алфавит пуст: включите хотя бы один класс символов",
    );
  }

  const expected = getAlphabetSize({
    includeLowercase: options.includeLowercase,
    includeUppercase: options.includeUppercase,
    includeDigits: options.includeDigits,
    includeSymbols: options.includeSymbols,
    excludeSimilar: options.excludeSimilar,
  });

  if (chars.length !== expected) {
    throw new Error(
      `Несоответствие размера алфавита: ожидалось ${expected}, получено ${chars.length}`,
    );
  }

  return chars;
}

/**
 * Классы символов для requireAllSelectedClasses (тот же порядок, что в DP).
 * Если класс включён в опциях, он должен быть непустым после исключений — иначе RangeError.
 */
export function buildPasswordClassArrays(options) {
  const classes = [];

  if (options.includeLowercase) {
    const c = buildSegment(options, "lowercase");
    if (c.length === 0) {
      throw new RangeError(
        "Класс строчных букв пуст после исключения похожих символов",
      );
    }
    classes.push(c);
  }
  if (options.includeUppercase) {
    const c = buildSegment(options, "uppercase");
    if (c.length === 0) {
      throw new RangeError(
        "Класс заглавных букв пуст после исключения похожих символов",
      );
    }
    classes.push(c);
  }
  if (options.includeDigits) {
    const c = buildSegment(options, "digit");
    if (c.length === 0) {
      throw new RangeError(
        "Класс цифр пуст после исключения похожих символов",
      );
    }
    classes.push(c);
  }
  if (options.includeSymbols) {
    const c = [...CONFIG.symbolChars];
    if (c.length === 0) {
      throw new RangeError("Класс спецсимволов пуст");
    }
    classes.push(c);
  }

  return classes;
}

/**
 * Равномерная случайная строка по множеству «каждый класс ≥ 1 раз»; dp из buildConstrainedWaysTable.
 */
function sampleUniformConstrainedPassword(classArrays, length, dp) {
  const k = classArrays.length;
  let mask = 0;
  let out = "";
  for (let pos = 0; pos < length; pos++) {
    const rem = length - pos;
    const weights = new Array(k);
    for (let i = 0; i < k; i++) {
      const mask2 = mask | (1 << i);
      weights[i] = BigInt(classArrays[i].length) * dp[rem - 1][mask2];
    }
    const classIndex = pickSecureIndexByBigIntWeights(weights);
    out += pickSecureRandomItem(classArrays[classIndex]);
    mask |= 1 << classIndex;
  }
  return out;
}

export function generatePassword(options) {
  const alphabet = buildPasswordAlphabet(options);
  const alphabetSize = alphabet.length;
  const length = calculateLengthForTargetEntropy(
    options.targetEntropy,
    alphabetSize,
  );

  if (!options.requireAllSelectedClasses) {
    let out = "";
    for (let i = 0; i < length; i++) {
      out += pickSecureRandomItem(alphabet);
    }
    return out;
  }

  const classArrays = buildPasswordClassArrays(options);
  const k = classArrays.length;
  if (k === 0) {
    throw new RangeError("Нет доступных классов символов");
  }
  if (length < k) {
    throw new RangeError(
      `Недостаточная длина пароля (${length}) для покрытия всех выбранных классов (${k})`,
    );
  }

  const classSizes = classArrays.map((a) => a.length);
  const { dp, ways } = buildConstrainedWaysTable(length, classSizes);
  if (ways === 0n) {
    throw new RangeError(
      "Нет допустимых паролей при заданных длине и обязательных классах",
    );
  }

  return sampleUniformConstrainedPassword(classArrays, length, dp);
}

export function generatePasswordBatch(options, count) {
  if (!Number.isInteger(count) || count < 0) {
    throw new RangeError("generatePasswordBatch: count должен быть неотрицательным целым");
  }

  const alphabet = buildPasswordAlphabet(options);
  const alphabetSize = alphabet.length;
  const length = calculateLengthForTargetEntropy(
    options.targetEntropy,
    alphabetSize,
  );

  const passwords = [];

  if (options.requireAllSelectedClasses) {
    const classArrays = buildPasswordClassArrays(options);
    const k = classArrays.length;
    if (k === 0) {
      throw new RangeError("Нет доступных классов символов");
    }
    if (length < k) {
      throw new RangeError(
        `Недостаточная длина пароля (${length}) для покрытия всех выбранных классов (${k})`,
      );
    }
    const classSizes = classArrays.map((a) => a.length);
    const { dp, ways } = buildConstrainedWaysTable(length, classSizes);
    if (ways === 0n) {
      throw new RangeError(
        "Нет допустимых паролей при заданных длине и обязательных классах",
      );
    }
    for (let i = 0; i < count; i++) {
      passwords.push(sampleUniformConstrainedPassword(classArrays, length, dp));
    }
  } else {
    for (let i = 0; i < count; i++) {
      let out = "";
      for (let j = 0; j < length; j++) {
        out += pickSecureRandomItem(alphabet);
      }
      passwords.push(out);
    }
  }

  return { passwords, length, alphabetSize };
}
