/**
 * Криптографически стойкая случайность (без смещения модуло).
 */

const UINT32_RANGE = 0x100000000;

export function getSecureRandomInt(maxExclusive) {
  if (!Number.isInteger(maxExclusive) || maxExclusive <= 0) {
    throw new RangeError("getSecureRandomInt: ожидается целое maxExclusive > 0");
  }
  if (maxExclusive > UINT32_RANGE) {
    throw new RangeError(
      "getSecureRandomInt: maxExclusive must be at most 2^32 (use getSecureRandomBigInt)",
    );
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

/**
 * Равномерное целое из [0, maxExclusive) для произвольного maxExclusive > 0 (BigInt).
 */
export function getSecureRandomBigInt(maxExclusive) {
  if (typeof maxExclusive !== "bigint" || maxExclusive <= 0n) {
    throw new RangeError("getSecureRandomBigInt: ожидается maxExclusive > 0n (bigint)");
  }
  if (maxExclusive <= BigInt(UINT32_RANGE)) {
    return BigInt(getSecureRandomInt(Number(maxExclusive)));
  }

  const maxVal = maxExclusive - 1n;
  let k = 0n;
  let t = maxVal;
  while (t > 0n) {
    k++;
    t >>= 1n;
  }
  const byteLen = Number((k + 7n) / 8n);
  const mask = k > 0n ? (1n << k) - 1n : 0n;
  const buf = new Uint8Array(byteLen);

  let r;
  do {
    crypto.getRandomValues(buf);
    r = 0n;
    for (let i = 0; i < byteLen; i++) {
      r = (r << 8n) | BigInt(buf[i]);
    }
    r &= mask;
  } while (r >= maxExclusive);

  return r;
}

/**
 * Индекс i с вероятностью weights[i] / sum(weights).
 * @param {bigint[]} weights
 */
export function pickSecureIndexByBigIntWeights(weights) {
  if (!Array.isArray(weights) || weights.length === 0) {
    throw new RangeError("pickSecureIndexByBigIntWeights: ожидается непустой массив весов");
  }
  let total = 0n;
  for (const w of weights) {
    if (w < 0n) {
      throw new RangeError("pickSecureIndexByBigIntWeights: отрицательный вес");
    }
    total += w;
  }
  if (total <= 0n) {
    throw new RangeError("pickSecureIndexByBigIntWeights: сумма весов должна быть > 0");
  }

  const r = getSecureRandomBigInt(total);
  let acc = 0n;
  for (let i = 0; i < weights.length; i++) {
    acc += weights[i];
    if (r < acc) {
      return i;
    }
  }
  return weights.length - 1;
}
