import test from "node:test";
import assert from "node:assert/strict";
import { fingerprintQuestion, parseQuestionImportRows, validateQuestionInput, validateStatusTransition } from "../supabase/functions/eduken-api/question-bank-validation.mjs";

const sample = {
  exam_type: "JAMB", subject: "Use of English", topic: "Grammar", subtopic: "Nouns",
  question_text: "Which word is a noun?", options: { A: "quickly", B: "happiness", C: "blue", D: "run" },
  correct_option: "B", explanation: "Happiness names a state.", difficulty: "easy", source_type: "original",
};

test("validates complete original question and creates a stable fingerprint", () => {
  const result = validateQuestionInput(sample);
  assert.equal(result.valid, true);
  assert.equal(result.question.status, "draft");
  assert.match(result.question.question_fingerprint, /^qfp-[a-f0-9]{16}$/);
  assert.equal(fingerprintQuestion(result.question), result.question.question_fingerprint);
});

test("rejects missing options and invalid answer keys", () => {
  assert.equal(validateQuestionInput({ ...sample, options: { A: "one" } }).valid, false);
  assert.ok(validateQuestionInput({ ...sample, correct_option: "E" }).errors.some(x => /Correct answer/.test(x)));
});

test("requires provenance and licensing notes for past questions", () => {
  const result = validateQuestionInput({ ...sample, source_type: "past_question" });
  assert.ok(result.errors.some(x => /source name, year, provenance notes and licensing notes/.test(x)));
});

test("import parser reports duplicate rows and never auto-publishes", () => {
  const result = parseQuestionImportRows([sample, { ...sample, question_text: "  Which   word is a noun? " }]);
  assert.equal(result.valid.length, 1);
  assert.equal(result.errors.length, 1);
  assert.equal(result.errors[0].type, "duplicate_in_file");
  assert.equal(result.valid[0].question.status, "draft");
});

test("status transitions require review and approval before publication", () => {
  assert.equal(validateStatusTransition("draft", "published").valid, false);
  assert.equal(validateStatusTransition("reviewed", "approved").valid, true);
  assert.equal(validateStatusTransition("approved", "published").valid, true);
});


test("rejects out-of-range source years and oversized question text", () => {
  assert.ok(validateQuestionInput({ ...sample, source_year: 2101 }).errors.some(x => /Source year/.test(x)));
  assert.ok(validateQuestionInput({ ...sample, question_text: "x".repeat(10001) }).errors.some(x => /Question text/.test(x)));
});

test("status workflow does not allow skipping review or approval", () => {
  assert.equal(validateStatusTransition("draft", "approved").valid, false);
  assert.equal(validateStatusTransition("draft", "published").valid, false);
  assert.equal(validateStatusTransition("reviewed", "published").valid, false);
  assert.equal(validateStatusTransition("approved", "published").valid, true);
  assert.equal(validateStatusTransition("published", "draft").valid, false);
});
