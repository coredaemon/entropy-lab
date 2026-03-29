/**
 * Энтропия символьного пароля: E = L * log2(N).
 */

export function log2(x) {
  if (x <= 0) {
    throw new RangeError("log2: ожидается положительное число");
  }
  return Math.log(x) / Math.LN2;
}

export function calculatePasswordEntropy(length, alphabetSize) {
  if (length < 0 || !Number.isInteger(length)) {
    throw new RangeError("calculatePasswordEntropy: длина должна быть неотрицательным целым");
  }
  if (alphabetSize <= 0) {
    throw new RangeError("calculatePasswordEntropy: размер алфавита должен быть положительным");
  }
  return length * log2(alphabetSize);
}

export function calculateLengthForTargetEntropy(targetEntropy, alphabetSize) {
  if (targetEntropy < 0) {
    throw new RangeError("calculateLengthForTargetEntropy: целевая энтропия не может быть отрицательной");
  }
  if (alphabetSize <= 1) {
    throw new RangeError(
      "calculateLengthForTargetEntropy: размер алфавита должен быть больше 1",
    );
  }
  const bitsPerSymbol = log2(alphabetSize);
  return Math.ceil(targetEntropy / bitsPerSymbol);
}
