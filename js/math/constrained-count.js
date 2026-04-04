/**
 * Точный подсчёт числа строк длины L над объединением классов,
 * в которых каждый класс встречается хотя бы один раз (DP по маске покрытия).
 */

/**
 * @param {number} L
 * @param {number[]} classSizes — размеры непустых классов (фиксированный порядок)
 * @returns {{ dp: bigint[][], ways: bigint, k: number, fullMask: number }}
 */
export function buildConstrainedWaysTable(L, classSizes) {
  const k = classSizes.length;
  if (k === 0) {
    throw new RangeError("constrained-count: нет классов");
  }
  for (const n of classSizes) {
    if (!Number.isInteger(n) || n < 0) {
      throw new RangeError("constrained-count: ожидаются неотрицательные целые размеры классов");
    }
  }
  const fullMask = (1 << k) - 1;
  const dp = Array.from({ length: L + 1 }, () => Array(1 << k).fill(0n));

  dp[0][fullMask] = 1n;

  for (let rem = 1; rem <= L; rem++) {
    for (let mask = 0; mask < 1 << k; mask++) {
      let sum = 0n;
      for (let i = 0; i < k; i++) {
        const mask2 = mask | (1 << i);
        sum += BigInt(classSizes[i]) * dp[rem - 1][mask2];
      }
      dp[rem][mask] = sum;
    }
  }

  return { dp, ways: dp[L][0], k, fullMask };
}

/**
 * log₂(n) для положительного BigInt; достаточно точности для отображения (1 знак).
 * @param {bigint} n
 */
export function log2BigInt(n) {
  if (n <= 0n) {
    throw new RangeError("log2BigInt: ожидается n > 0");
  }
  if (n <= BigInt(Number.MAX_SAFE_INTEGER)) {
    return Math.log2(Number(n));
  }
  const bl = n.toString(2).length;
  const shift = BigInt(bl - 53);
  const mant = Number(n >> shift);
  return Number(shift) + Math.log2(mant);
}

/**
 * @param {number} L
 * @param {number[]} classSizes
 * @returns {number}
 */
export function constrainedEntropyBits(L, classSizes) {
  const { ways } = buildConstrainedWaysTable(L, classSizes);
  if (ways <= 0n) {
    throw new RangeError("constrained-count: допустимых строк нет (ways = 0)");
  }
  return log2BigInt(ways);
}
