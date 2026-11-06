import test from "node:test";
import assert from "node:assert/strict";
import { DEFAULT_CBT_MOCK_QUESTION_COUNT, getCbtMockFallbackDurationSeconds } from "../src/lib/cbt-mock-config.mjs";

test("CBT mixed mock starts with the same ten-question default shown by the selector", () => {
  assert.equal(DEFAULT_CBT_MOCK_QUESTION_COUNT, 10);
});

test("full 180-question mock fallback timer is 120 minutes", () => {
  assert.equal(getCbtMockFallbackDurationSeconds(180), 120 * 60);
});

test("shorter and local starter mocks retain the 30-minute fallback", () => {
  assert.equal(getCbtMockFallbackDurationSeconds(10), 30 * 60);
  assert.equal(getCbtMockFallbackDurationSeconds(8), 30 * 60);
});
