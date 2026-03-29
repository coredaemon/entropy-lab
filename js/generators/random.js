/**
 * Криптографически стойкая случайность (без смещения модуло).
 */

const UINT32_RANGE = 0x100000000;

export function getSecureRandomInt(maxExclusive) {
  if (!Number.isInteger(maxExclusive) || maxExclusive <= 0) {
    throw new RangeError("getSecureRandomInt: ожидается целое maxExclusive > 0");
  }
  if (maxExclusive === 1) {
    return 0;
  }

  const limit = Math.floor(UINT32_RANGE / maxExclusive) * maxExclusive;
  const buf = new Uint32Array(1);

  let x;
  do {
    crypto.getRandomValues(buf);
    x = buf[0];
  } while (x >= limit);

  return x % maxExclusive;
}

export function pickSecureRandomItem(array) {
  if (!Array.isArray(array) || array.length === 0) {
    throw new RangeError("pickSecureRandomItem: ожидается непустой массив");
  }
  const index = getSecureRandomInt(array.length);
  return array[index];
}
