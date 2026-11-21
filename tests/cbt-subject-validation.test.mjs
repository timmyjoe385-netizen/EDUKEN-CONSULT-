import test from "node:test";
import assert from "node:assert/strict";
import { CBT_OPTIONAL_SUBJECTS, validateCbtSubjectCombination } from "../supabase/functions/eduken-api/cbt-subject-validation.mjs";

test("JAMB optional subject registry includes the three added subjects", () => {
  assert.ok(CBT_OPTIONAL_SUBJECTS.includes("Christian Religious Studies"));
  assert.ok(CBT_OPTIONAL_SUBJECTS.includes("Commerce"));
  assert.ok(CBT_OPTIONAL_SUBJECTS.includes("Principles of Accounts"));
});

test("mixed mock accepts exactly three unique canonical optional subjects", () => {
  assert.deepEqual(validateCbtSubjectCombination(["Commerce", "Christian Religious Studies", "Principles of Accounts"]), { valid: true });
  assert.deepEqual(validateCbtSubjectCombination(["Mathematics", "Biology", "Physics"]), { valid: true });
});

test("mixed mock rejects duplicates, aliases and unknown subject labels", () => {
  for (const values of [
    ["Commerce", "Commerce", "Biology"],
    ["CRS", "Commerce", "Biology"],
    ["Financial Accounting", "Commerce", "Biology"],
    ["English Language", "Commerce", "Biology"],
    ["Commerce", "Biology"],
    ["Commerce", "Biology", "History", "Physics"],
  ]) {
    assert.equal(validateCbtSubjectCombination(values).valid, false);
  }
});
