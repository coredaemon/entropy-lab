import assert from "node:assert/strict";
import test from "node:test";
import { getSecureRandomBigInt } from "../js/generators/random.js";

test("getSecureRandomBigInt works for range above 2^32 (no infinite loop)", () => {
  const hi = 1n << 40n;
  for (let i = 0; i < 16; i++) {
    const r = getSecureRandomBigInt(hi);
    assert.ok(r >= 0n && r < hi);
  }
});
