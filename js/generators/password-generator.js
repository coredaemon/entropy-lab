/**
 * Генерация символьных паролей на основе targetEntropy и алфавита из config.
 */

import { CONFIG } from "../config.js";
import { getAlphabetSize } from "../math/alphabet.js";
import { calculateLengthForTargetEntropy } from "../math/entropy.js";
import { getSecureRandomInt, pickSecureRandomItem } from "./random.js";

function shuffleInPlace(items) {
  for (let i = items.length - 1; i > 0; i--) {
    const j = getSecureRandomInt(i + 1);
    const t = items[i];
    items[i] = items[j];
    items[j] = t;
  }
  return items;
}

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
 * Непустые классы символов (для requireAllSelectedClasses), в фиксированном порядке.
 */
function buildClassArrays(options) {
  const classes = [];

  if (options.includeLowercase) {
    const c = buildSegment(options, "lowercase");
    if (c.length > 0) classes.push(c);
  }
  if (options.includeUppercase) {
    const c = buildSegment(options, "uppercase");
    if (c.length > 0) classes.push(c);
  }
  if (options.includeDigits) {
    const c = buildSegment(options, "digit");
    if (c.length > 0) classes.push(c);
  }
  if (options.includeSymbols) {
    const c = [...CONFIG.symbolChars];
    if (c.length > 0) classes.push(c);
  }

  return classes;
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

  const classArrays = buildClassArrays(options);
  const k = classArrays.length;
  if (k === 0) {
    throw new RangeError("Нет доступных классов символов");
  }
  if (length < k) {
    throw new RangeError(
      `Недостаточная длина пароля (${length}) для покрытия всех выбранных классов (${k})`,
    );
  }

  const indices = Array.from({ length }, (_, i) => i);
  shuffleInPlace(indices);
  const positions = indices.slice(0, k);

  const chars = new Array(length);
  const used = new Set();

  for (let i = 0; i < k; i++) {
    const pos = positions[i];
    chars[pos] = pickSecureRandomItem(classArrays[i]);
    used.add(pos);
  }

  for (let i = 0; i < length; i++) {
    if (!used.has(i)) {
      chars[i] = pickSecureRandomItem(alphabet);
    }
  }

  shuffleInPlace(chars);
  return chars.join("");
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
  for (let i = 0; i < count; i++) {
    passwords.push(generatePassword(options));
  }

  return { passwords, length, alphabetSize };
}
