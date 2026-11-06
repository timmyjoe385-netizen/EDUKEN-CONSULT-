import test from "node:test";
import assert from "node:assert/strict";
import { gradeCbtAttempt, getCbtAttemptExpiry, CBT_SUBMISSION_GRACE_SECONDS } from "../supabase/functions/eduken-api/cbt-attempt-validation.mjs";

const snapshot = [
  { id: "q-1", subject: "Mathematics", prompt: "2 + 2?", options: { A: "3", B: "4", C: "5", D: "6" }, correct_option: "B", explanation: "Two plus two is four." },
  { id: "q-2", subject: "Use of English", prompt: "A noun names a…", options: { A: "person/place/thing/idea", B: "verb", C: "sound only", D: "punctuation" }, correct_option: "A", explanation: "A noun names a person, place, thing, or idea." },
];

test("server grading calculates score and returns review only after submission", () => {
  const result = gradeCbtAttempt(snapshot, { "q-1": 1, "q-2": "B" });
  assert.equal(result.valid, true);
  assert.equal(result.score, 1);
  assert.equal(result.total, 2);
  assert.equal(result.percent, 50);
  assert.equal(result.review[0].isCorrect, true);
  assert.equal(result.review[0].correctOption, "B");
  assert.equal(result.review[1].isCorrect, false);
});

test("unanswered questions are scored as incorrect without rejecting the attempt", () => {
  const result = gradeCbtAttempt(snapshot, { "q-1": 1 });
  assert.equal(result.valid, true);
  assert.equal(result.score, 1);
  assert.equal(result.normalizedAnswers["q-2"], null);
});

test("rejects answers for questions outside the attempt", () => {
  const result = gradeCbtAttempt(snapshot, { "q-1": 1, "not-in-attempt": "A" });
  assert.equal(result.valid, false);
  assert.ok(result.errors.some(error => /not part of this attempt/.test(error)));
});

test("rejects malformed answer values and malformed snapshots", () => {
  assert.equal(gradeCbtAttempt(snapshot, { "q-1": 9 }).valid, false);
  assert.equal(gradeCbtAttempt([], {}).valid, false);
  assert.equal(gradeCbtAttempt([{ id: "q", options: {}, correct_option: "Z" }], {}).valid, false);
});


test("timed CBT expiry includes a short server grace window for automatic submission", () => {
  const started = new Date("2026-10-29T07:00:00.000Z");
  assert.equal(CBT_SUBMISSION_GRACE_SECONDS, 15);
  assert.equal(
    getCbtAttemptExpiry(started, 900),
    "2026-10-29T07:15:15.000Z",
  );
  assert.equal(getCbtAttemptExpiry("not-a-date", 900), null);
  assert.equal(getCbtAttemptExpiry(started, 0), null);
  assert.equal(getCbtAttemptExpiry(started, 900, -1), null);
});

import { getCbtSubjectQuestionCounts, remapCbtQuestionOptions } from "../supabase/functions/eduken-api/cbt-question-selection.mjs";

test("full JAMB mock uses 60 English and 40 from each of three selected subjects", () => {
  const counts = getCbtSubjectQuestionCounts(180, ["Biology", "Chemistry", "Physics"]);
  assert.deepEqual(Object.fromEntries(counts), {
    "Use of English": 60, Biology: 40, Chemistry: 40, Physics: 40,
  });
  assert.equal([...counts.values()].reduce((sum, value) => sum + value, 0), 180);
});

test("shorter mixed mocks distribute the requested count across all four subjects", () => {
  const counts = getCbtSubjectQuestionCounts(100, ["Biology", "Chemistry", "Physics"]);
  assert.deepEqual(Object.fromEntries(counts), {
    "Use of English": 33, Biology: 23, Chemistry: 22, Physics: 22,
  });
  assert.equal([...counts.values()].reduce((sum, value) => sum + value, 0), 100);
});

test("option shuffling remaps the correct key for every possible option order", () => {
  const keys = ["A", "B", "C", "D"];
  const original = { A: "first", B: "second", C: "third", D: "fourth" };
  const permutations = [];
  const permute = (remaining, prefix = []) => {
    if (!remaining.length) { permutations.push(prefix); return; }
    remaining.forEach((key, index) => permute([...remaining.slice(0, index), ...remaining.slice(index + 1)], [...prefix, key]));
  };
  permute(keys);
  for (const order of permutations) {
    const result = remapCbtQuestionOptions(original, "C", order);
    assert.equal(result.options[result.correct_option], "third");
    assert.deepEqual(Object.values(result.options).sort(), Object.values(original).sort());
  }
  assert.equal(permutations.length, 24);
});

test("option remapping rejects incomplete permutations and invalid answer keys", () => {
  assert.throws(() => remapCbtQuestionOptions({ A: "a" }, "A", ["A", "A", "C", "D"]), /exactly once/);
  assert.throws(() => remapCbtQuestionOptions({ A: "a" }, "E", ["A", "B", "C", "D"]), /correct option/);
});
