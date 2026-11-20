import assert from "node:assert/strict";
import { CBT_QUESTION_COUNTS, parseCbtQuestionCount } from "../supabase/functions/eduken-api/cbt-question-count-validation.mjs";

assert.deepEqual(CBT_QUESTION_COUNTS, [20, 40, 60, 100, 180]);
for (const count of CBT_QUESTION_COUNTS) {
  assert.deepEqual(parseCbtQuestionCount(count, "practice"), { valid: true, value: count });
  assert.deepEqual(parseCbtQuestionCount(String(count), "mock"), { valid: true, value: count });
}
assert.deepEqual(parseCbtQuestionCount(undefined, "practice"), { valid: true, value: 20 });
assert.deepEqual(parseCbtQuestionCount(undefined, "mock"), { valid: true, value: 180 });
for (const count of [0, 1, 8, 10, 50, 80, 120, 160, 181, 20.5, "not-a-number"]) {
  assert.equal(parseCbtQuestionCount(count, "practice").valid, false, String(count));
}
console.log("CBT question-count validation passed.");
