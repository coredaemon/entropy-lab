/**
 * Константы приложения: целевые уровни энтропии, алфавиты, словарь.
 */

import { WORDLIST } from "../data/wordlist-7776.js";

export const CONFIG = {
  entropyLevels: {
    minimal: 68,
    optimal: 80,
    maximum: 128,
  },

  /** Строчные буквы a–z */
  lowercaseChars: "abcdefghijklmnopqrstuvwxyz",

  /** Заглавные буквы A–Z */
  uppercaseChars: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",

  /** Цифры 0–9 */
  digitChars: "0123456789",

  /**
   * Ровно baseSymbolSetSize символов; без пересечения с similarChars,
   * чтобы логика совпадала с math/alphabet.js (спецсимволы не урезаются).
   */
  symbolChars: "!@#$%^&*()[]",

  /** Похожие символы: исключаются из букв и цифр при excludeSimilar */
  similarChars: "0O1lI",

  normalPasswordAlphabet: {
    includeLowercase: true,
    includeUppercase: true,
    includeDigits: true,
    includeSymbols: true,
    excludeSimilar: true,
    requireAllSelectedClasses: false,
  },

  extendedPasswordAlphabet: {
    includeLowercase: true,
    includeUppercase: true,
    includeDigits: true,
    includeSymbols: true,
    excludeSimilar: true,
    requireAllSelectedClasses: true,
  },

  lowercaseAlphabetSize: 26,
  uppercaseAlphabetSize: 26,
  digitAlphabetSize: 10,
  baseSymbolSetSize: 12,

  separator: "-",
  dictionarySize: WORDLIST.length,
};
