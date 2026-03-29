/**
 * Энтропия passphrase по модели словаря: E = W * log2(D).
 */

import { log2 } from "./entropy.js";

export function getWordEntropy(dictionarySize) {
  if (dictionarySize <= 1) {
    throw new RangeError("getWordEntropy: размер словаря должен быть больше 1");
  }
  return log2(dictionarySize);
}

export function calculateWordsForTargetEntropy(targetEntropy, dictionarySize) {
  if (targetEntropy < 0) {
    throw new RangeError(
      "calculateWordsForTargetEntropy: целевая энтропия не может быть отрицательной",
    );
  }
  const bitsPerWord = getWordEntropy(dictionarySize);
  return Math.ceil(targetEntropy / bitsPerWord);
}

export function calculatePassphraseEntropy(wordCount, dictionarySize) {
  if (wordCount < 0 || !Number.isInteger(wordCount)) {
    throw new RangeError(
      "calculatePassphraseEntropy: число слов должно быть неотрицательным целым",
    );
  }
  if (dictionarySize <= 1) {
    throw new RangeError(
      "calculatePassphraseEntropy: размер словаря должен быть больше 1",
    );
  }
  return wordCount * log2(dictionarySize);
}
