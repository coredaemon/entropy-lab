/**
 * Размер алфавита N для символьного пароля.
 * Похожие символы при excludeSimilar: 0, O, 1, l, I (вычитаются из соответствующих наборов).
 */

import { CONFIG } from "../config.js";

export function getAlphabetSize({
  includeLowercase,
  includeUppercase,
  includeDigits,
  includeSymbols,
  excludeSimilar,
}) {
  const {
    lowercaseAlphabetSize,
    uppercaseAlphabetSize,
    digitAlphabetSize,
    baseSymbolSetSize,
  } = CONFIG;

  let total = 0;

  if (includeLowercase) {
    total += excludeSimilar ? lowercaseAlphabetSize - 1 : lowercaseAlphabetSize;
  }
  if (includeUppercase) {
    total += excludeSimilar ? uppercaseAlphabetSize - 2 : uppercaseAlphabetSize;
  }
  if (includeDigits) {
    total += excludeSimilar ? digitAlphabetSize - 2 : digitAlphabetSize;
  }
  if (includeSymbols) {
    total += baseSymbolSetSize;
  }

  return total;
}
