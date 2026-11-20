import test from "node:test";
import assert from "node:assert/strict";
import {
  aggregateCbtSubjectScores,
  isNationalLeaderboardEligible,
  isSubjectLeaderboardEligible,
  validateStudentUsername,
} from "../supabase/functions/eduken-api/student-arena-validation.mjs";

test("accepts a simple student username and trims surrounding whitespace", () => {
  assert.deepEqual(validateStudentUsername("  FutureDoctor27  "), {
    valid: true, username: "FutureDoctor27", error: "",
  });
});

test("rejects usernames with invalid length or characters", () => {
  assert.equal(validateStudentUsername("ab").valid, false);
  assert.equal(validateStudentUsername("student name").valid, false);
  assert.equal(validateStudentUsername("student!").valid, false);
});

test("rejects reserved usernames without regard to case", () => {
  assert.equal(validateStudentUsername("EDUKEN").valid, false);
  assert.equal(validateStudentUsername("Admin").valid, false);
});

test("aggregates subject scores only from server review entries", () => {
  assert.deepEqual(aggregateCbtSubjectScores([
    { subject: "Biology", isCorrect: true },
    { subject: "Biology", isCorrect: false },
    { subject: "Physics", isCorrect: true },
    { subject: "", isCorrect: true },
  ]), [
    { subject: "Biology", score: 1, total: 2 },
    { subject: "Physics", score: 1, total: 1 },
  ]);
});

test("requires a signed-in owner and a full 180-question mock for national ranking", () => {
  assert.equal(isNationalLeaderboardEligible({ user_id: "u1", mode: "mock", total: 180 }), true);
  assert.equal(isNationalLeaderboardEligible({ user_id: null, mode: "mock", total: 180 }), false);
  assert.equal(isNationalLeaderboardEligible({ user_id: "u1", mode: "practice", total: 180 }), false);
  assert.equal(isNationalLeaderboardEligible({ user_id: "u1", mode: "mock", total: 100 }), false);
});

test("requires at least 20 subject questions for subject ranking", () => {
  assert.equal(isSubjectLeaderboardEligible({ user_id: "u1", score: 15, total: 20 }), true);
  assert.equal(isSubjectLeaderboardEligible({ user_id: "u1", score: 19, total: 19 }), false);
  assert.equal(isSubjectLeaderboardEligible({ user_id: null, score: 20, total: 20 }), false);
  assert.equal(isSubjectLeaderboardEligible({ user_id: "u1", score: 21, total: 20 }), false);
});
