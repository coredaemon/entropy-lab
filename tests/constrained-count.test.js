import assert from "node:assert/strict";
import test from "node:test";
import {
  buildConstrainedWaysTable,
  constrainedEntropyBits,
  log2BigInt,
} from "../js/math/constrained-count.js";
import { calculatePasswordEntropy, log2 } from "../js/math/entropy.js";

function countBruteRecursive(L, classSizes) {
  const k = classSizes.length;
  const fullMask = (1 << k) - 1;
  function rec(rem, mask) {
    if (rem === 0) {
      return mask === fullMask ? 1n : 0n;
    }
    let sum = 0n;
    for (let i = 0; i < k; i++) {
      sum += BigInt(classSizes[i]) * rec(rem - 1, mask | (1 << i));
    }
    return sum;
  }
  return rec(L, 0);
}

test("unconstrained entropy matches L * log2(N)", () => {
  const L = 12;
  const N = 64;
  const e = calculatePasswordEntropy(L, N);
  assert.ok(Math.abs(e - L * log2(N)) < 1e-9);
});

test("DP count matches brute force on toy cases", () => {
  const cases = [
    { L: 2, sizes: [1, 1] },
    { L: 3, sizes: [2, 1] },
    { L: 4, sizes: [1, 2, 1] },
    { L: 5, sizes: [2, 2, 2] },
    { L: 3, sizes: [3, 3] },
  ];
  for (const { L, sizes } of cases) {
    const { ways } = buildConstrainedWaysTable(L, sizes);
    const brute = countBruteRecursive(L, sizes);
    assert.equal(ways, brute, `L=${L} sizes=${JSON.stringify(sizes)}`);
  }
});

test("weight identity holds for DP table", () => {
  const L = 6;
  const classSizes = [2, 3, 1];
  const k = classSizes.length;
  const { dp } = buildConstrainedWaysTable(L, classSizes);
  for (let rem = 1; rem <= L; rem++) {
    for (let mask = 0; mask < 1 << k; mask++) {
      let sum = 0n;
      for (let i = 0; i < k; i++) {
        const mask2 = mask | (1 << i);
        sum += BigInt(classSizes[i]) * dp[rem - 1][mask2];
      }
      assert.equal(dp[rem][mask], sum, `rem=${rem} mask=${mask}`);
    }
  }
});

test("constrainedEntropyBits matches log2(ways)", () => {
  const L = 4;
  const sizes = [2, 2];
  const { ways } = buildConstrainedWaysTable(L, sizes);
  const bits = constrainedEntropyBits(L, sizes);
  assert.ok(Math.abs(bits - log2BigInt(ways)) < 1e-6);
});

test("log2BigInt matches Math.log2 for small integers", () => {
  for (const n of [1n, 2n, 100n, 1000000n]) {
    assert.ok(Math.abs(log2BigInt(n) - Math.log2(Number(n))) < 1e-9);
  }
});
