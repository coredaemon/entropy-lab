/**
 * Генерация passphrase по словарной модели.
 *
 * Вся математика вынесена в math/passphrase.js,
 * а вся крипто-случайность — в generators/random.js.
 */

import {
  calculatePassphraseEntropy,
  calculateWordsForTargetEntropy,
} from "../math/passphrase.js";
import { pickSecureRandomItem } from "./random.js";
import { WORDLIST } from "../../data/wordlist-7776.js";

function assertValidOptions(options) {
  if (!options || typeof options !== "object") {
    throw new RangeError("generatePassphrase: options должны быть объектом");
  }

  const { targetEntropy, separator } = options;

  if (typeof separator !== "string" || separator.length === 0) {
    throw new RangeError("generatePassphrase: separator должен быть непустым строкой");
  }
  if (typeof targetEntropy !== "number" || Number.isNaN(targetEntropy)) {
    throw new RangeError("generatePassphrase: targetEntropy должен быть числом");
  }
}

export function generatePassphrase(options) {
  assertValidOptions(options);
  const { targetEntropy, separator } = options;

  const dictionarySize = WORDLIST.length;
  const wordCount = calculateWordsForTargetEntropy(targetEntropy, dictionarySize);
  const entropy = calculatePassphraseEntropy(wordCount, dictionarySize);

  const words = new Array(wordCount);
  for (let i = 0; i < wordCount; i++) {
    words[i] = pickSecureRandomItem(WORDLIST);
  }

  return {
    value: words.join(separator),
    wordCount,
    dictionarySize,
    entropy,
  };
}

export function generatePassphraseBatch(options, count) {
  if (!Number.isInteger(count) || count < 0) {
    throw new RangeError(
      "generatePassphraseBatch: count должен быть неотрицательным целым",
    );
  }

  assertValidOptions(options);

  const results = [];
  for (let i = 0; i < count; i++) {
    results.push(generatePassphrase(options));
  }

  return results;
}

