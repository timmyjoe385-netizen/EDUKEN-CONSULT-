import test from "node:test";
import assert from "node:assert/strict";
import { DEFAULT_CBT_MOCK_QUESTION_COUNT, getCbtMockFallbackDurationSeconds } from "../src/lib/cbt-mock-config.mjs";
import { getCbtSubjectQuestionCounts } from "../supabase/functions/eduken-api/cbt-question-selection.mjs";

test("mixed mock defaults to ten questions", () => {
  assert.equal(DEFAULT_CBT_MOCK_QUESTION_COUNT, 10);
});

test("starter mock requires one question from each of the four selected subjects", () => {
  assert.deepEqual([...getCbtSubjectQuestionCounts(4, ["Biology", "Chemistry", "Physics"])], [
    ["Use of English", 1], ["Biology", 1], ["Chemistry", 1], ["Physics", 1],
  ]);
});

test("full 180-question mock uses 120 minutes", () => {
  assert.equal(getCbtMockFallbackDurationSeconds(180), 120 * 60);
});

test("four-question starter uses four minutes and other mocks use thirty", () => {
  assert.equal(getCbtMockFallbackDurationSeconds(4), 4 * 60);
  assert.equal(getCbtMockFallbackDurationSeconds(10), 30 * 60);
  assert.equal(getCbtMockFallbackDurationSeconds(100), 30 * 60);
});
