import test from "node:test";
import assert from "node:assert/strict";
import { normalizeServicePrice } from "../supabase/functions/eduken-api/service-price-validation.mjs";

test("accepts whole non-negative Naira prices and numeric strings", () => {
  assert.deepEqual(normalizeServicePrice(0), { valid: true, provided: true, value: 0 });
  assert.deepEqual(normalizeServicePrice(7128), { valid: true, provided: true, value: 7128 });
  assert.deepEqual(normalizeServicePrice("7128"), { valid: true, provided: true, value: 7128 });
});

test("preserves an unset price as To be confirmed", () => {
  assert.deepEqual(normalizeServicePrice(null), { valid: true, provided: true, value: null });
  assert.deepEqual(normalizeServicePrice(""), { valid: true, provided: true, value: null });
  assert.deepEqual(normalizeServicePrice("   "), { valid: true, provided: true, value: null });
  assert.deepEqual(normalizeServicePrice(undefined), { valid: true, provided: false, value: undefined });
});

test("rejects negative, fractional, non-numeric, unsafe, and non-scalar prices", () => {
  for (const value of [-1, "-1", 1.5, "1.5", "1e3", "not-a-price", true, {}, [], Infinity, Number.MAX_SAFE_INTEGER + 1]) {
    assert.deepEqual(normalizeServicePrice(value), { valid: false, provided: true, value: null }, String(value));
  }
});
