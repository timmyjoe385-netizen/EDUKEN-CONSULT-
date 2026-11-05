import assert from "node:assert/strict";

const base = String(process.env.CBT_TEST_SUPABASE_URL || "").trim().replace(/\/+$/, "");
const key = String(process.env.CBT_TEST_SUPABASE_PUBLISHABLE_KEY || "").trim();
assert.ok(base && key, "Isolated CBT test URL and publishable key must be configured.");
assert.equal(new URL(base).hostname, "wpktzogarfqrgkirzdpy.supabase.co", "Refusing to run CBT integration writes against anything except the isolated test project.");

const endpoint = base + "/functions/v1/eduken-api";
const request = async (path, body) => {
  const response = await fetch(endpoint + path, {
    method: "POST",
    headers: { apikey: key, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const text = await response.text();
  let data;
  try { data = text ? JSON.parse(text) : {}; } catch { data = { raw: text }; }
  return { response, data };
};

const started = await request("/api/cbt/start", { mode: "practice", subject: "Use of English", questionCount: 1 });
assert.equal(started.response.status, 201, "A practice session should start from published isolated sample questions.");
assert.match(started.data.attemptToken || "", /^[a-f0-9]{64}$/i, "The server should issue an opaque attempt token.");
// Non-default practice lengths use one minute per requested question; this fixture requests one.
assert.equal(started.data.durationSeconds, 60, "A one-question practice session should use a one-minute timer.");
assert.ok(Array.isArray(started.data.questions) && started.data.questions.length > 0, "The session should include published questions.");

for (const question of started.data.questions) {
  assert.equal(Object.hasOwn(question, "correct_option"), false, "Correct answers must not be exposed before submission.");
  assert.equal(Object.hasOwn(question, "correctOption"), false, "Correct answers must not be exposed before submission.");
  assert.equal(Object.hasOwn(question, "explanation"), false, "Explanations must remain hidden until submission.");
}

const fixture = started.data.questions.find(question => question.prompt === "Which word names a person, place, or thing?");
assert.ok(fixture, "The isolated original Use of English fixture should be included in the practice session.");
// The API shuffles answer options for every attempt. Select the known correct
// answer by its displayed text rather than assuming its original database letter.
const fixtureCorrectIndex = fixture.options.findIndex(option => option === "Happiness");
assert.notEqual(fixtureCorrectIndex, -1, "The known correct answer should appear among the shuffled options.");
const optionKeys = ["A", "B", "C", "D"];
const answers = Object.fromEntries(started.data.questions.map(question => [
  String(question.id),
  String(question.id) === String(fixture.id) ? fixtureCorrectIndex : null,
]));

const submitted = await request("/api/cbt/submit", { attemptToken: started.data.attemptToken, answers });
assert.equal(submitted.response.status, 200, "The server should accept and grade the practice submission.");
assert.equal(submitted.data.score, 1, "The server should award one point for the known correct answer.");
assert.equal(submitted.data.total, started.data.questions.length);
assert.equal(submitted.data.percent, Math.round(100 / started.data.questions.length));
const fixtureReview = submitted.data.review.find(question => String(question.id) === String(fixture.id));
assert.equal(fixtureReview?.correctOption, optionKeys[fixtureCorrectIndex], "The server-side correct key should follow the shuffled option order.");
assert.equal(fixtureReview?.options[fixtureCorrectIndex], "Happiness", "The correct key should identify the known correct answer text.");
assert.equal(fixtureReview?.isCorrect, true);

const repeated = await request("/api/cbt/submit", { attemptToken: started.data.attemptToken, answers: {} });
assert.equal(repeated.response.status, 200, "A repeated submission should return the stored result safely.");
assert.equal(repeated.data.alreadySubmitted, true, "A repeated submission should be marked as already submitted.");
assert.equal(repeated.data.score, submitted.data.score, "Repeated submission must not change the stored score.");

console.log("CBT API integration passed: published-only question payload, hidden answer key, server grading and idempotent repeat submission.");
