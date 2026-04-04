import assert from "node:assert/strict";
import test from "node:test";
import {
  buildPasswordClassArrays,
  generatePassword,
} from "../js/generators/password-generator.js";
import { buildConstrainedWaysTable } from "../js/math/constrained-count.js";

function hasAllClasses(str, classArrays) {
  for (const arr of classArrays) {
    const set = new Set(arr);
    if (![...str].some((ch) => set.has(ch))) {
      return false;
    }
  }
  return true;
}

test("required classes: generated password always contains each class", () => {
  const options = {
    includeLowercase: true,
    includeUppercase: true,
    includeDigits: true,
    includeSymbols: true,
    excludeSimilar: true,
    requireAllSelectedClasses: true,
    targetEntropy: 80,
  };
  const classArrays = buildPasswordClassArrays(options);
  for (let i = 0; i < 24; i++) {
    const pw = generatePassword(options);
    assert.ok(
      hasAllClasses(pw, classArrays),
      `missing class in: ${pw}`,
    );
  }
});

test("single enabled class: only lowercase", () => {
  const options = {
    includeLowercase: true,
    includeUppercase: false,
    includeDigits: false,
    includeSymbols: false,
    excludeSimilar: false,
    requireAllSelectedClasses: true,
    targetEntropy: 40,
  };
  const classArrays = buildPasswordClassArrays(options);
  assert.equal(classArrays.length, 1);
  const pw = generatePassword(options);
  assert.ok(/^[a-z]+$/.test(pw));
});

test("edge L < k is rejected", () => {
  const options = {
    includeLowercase: true,
    includeUppercase: true,
    includeDigits: true,
    includeSymbols: false,
    excludeSimilar: false,
    requireAllSelectedClasses: true,
    targetEntropy: 1,
  };
  assert.throws(() => generatePassword(options), RangeError);
});

test("single-class constrained space size is n^L", () => {
  const L = 4;
  const classSizes = [3];
  const { ways } = buildConstrainedWaysTable(L, classSizes);
  assert.equal(ways, 81n);
});
