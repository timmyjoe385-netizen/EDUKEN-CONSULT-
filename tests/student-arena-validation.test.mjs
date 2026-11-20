import test from "node:test";
import assert from "node:assert/strict";
import {
  aggregateCbtSubjectScores,
  isNationalLeaderboardEligible,
  isSubjectLeaderboardEligible,
  validateStudentUsername,
} from "../supabase/functions/eduken-api/student-arena-validation.mjs";

test("student usernames are trimmed and accepted within the allowed format", () => {
  assert.deepEqual(validateStudentUsername("  Josh_2027  "), {
    valid: true,
    username: "Josh_2027",
    error: "",
  });
});

test("student usernames reject invalid lengths, symbols and reserved names", () => {
  for (const value of ["ab", "a".repeat(21), "bad name", "admin", "EDUKEN"]) {
    assert.equal(validateStudentUsername(value).valid, false, value);
  }
});

test("subject score aggregation counts correct answers by subject", () => {
  assert.deepEqual(aggregateCbtSubjectScores([
    { subject: "Use of English", isCorrect: true },
    { subject: "Mathematics", isCorrect: false },
    { subject: "Use of English", isCorrect: false },
    { subject: " Mathematics ", isCorrect: true },
    { subject: "", isCorrect: true },
  ]), [
    { subject: "Use of English", score: 1, total: 2 },
    { subject: "Mathematics", score: 1, total: 2 },
  ]);
});

test("national leaderboard accepts only signed-in full mock attempts", () => {
  assert.equal(isNationalLeaderboardEligible({ user_id: "u1", mode: "mock", total: 180 }), true);
  assert.equal(isNationalLeaderboardEligible({ user_id: null, mode: "mock", total: 180 }), false);
  assert.equal(isNationalLeaderboardEligible({ user_id: "u1", mode: "practice", total: 180 }), false);
  assert.equal(isNationalLeaderboardEligible({ user_id: "u1", mode: "mock", total: 120 }), false);
});

test("subject leaderboard requires a signed-in attempt with a valid minimum score total", () => {
  assert.equal(isSubjectLeaderboardEligible({ user_id: "u1", total: 20, score: 15 }), true);
  assert.equal(isSubjectLeaderboardEligible({ user_id: null, total: 20, score: 15 }), false);
  assert.equal(isSubjectLeaderboardEligible({ user_id: "u1", total: 19, score: 15 }), false);
  assert.equal(isSubjectLeaderboardEligible({ user_id: "u1", total: 20, score: 21 }), false);
});
