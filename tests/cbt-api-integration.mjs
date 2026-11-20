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
assert.equal(started.data.durationSeconds, 60, "A one-question practice attempt should use a one-minute timer.");
assert.ok(Array.isArray(started.data.questions) && started.data.questions.length > 0, "The session should include published questions.");

for (const question of started.data.questions) {
  assert.equal(Object.hasOwn(question, "correct_option"), false, "Correct answers must not be exposed before submission.");
  assert.equal(Object.hasOwn(question, "correctOption"), false, "Correct answers must not be exposed before submission.");
  assert.equal(Object.hasOwn(question, "explanation"), false, "Explanations must remain hidden until submission.");
}

const fixture = started.data.questions.find(question => question.prompt === "Which word names a person, place, or thing?");
assert.ok(fixture, "The isolated original Use of English fixture should be included in the practice session.");
const correctIndex = fixture.options.indexOf("Happiness");
assert.notEqual(correctIndex, -1, "The known correct option text must remain present after option shuffling.");
const answers = Object.fromEntries(started.data.questions.map(question => [
  String(question.id),
  String(question.id) === String(fixture.id) ? correctIndex : null,
]));

const submitted = await request("/api/cbt/submit", { attemptToken: started.data.attemptToken, answers });
assert.equal(submitted.response.status, 200, "The server should accept and grade the practice submission.");
assert.equal(submitted.data.score, 1, "The server should award one point for the known correct answer.");
assert.equal(submitted.data.total, started.data.questions.length);
assert.equal(submitted.data.percent, Math.round(100 / started.data.questions.length));
assert.equal(submitted.data.review.find(question => String(question.id) === String(fixture.id))?.correctOption, ["A", "B", "C", "D"][correctIndex]);
assert.equal(submitted.data.review.find(question => String(question.id) === String(fixture.id))?.isCorrect, true);

const repeated = await request("/api/cbt/submit", { attemptToken: started.data.attemptToken, answers: {} });
assert.equal(repeated.response.status, 200, "A repeated submission should return the stored result safely.");
assert.equal(repeated.data.alreadySubmitted, true, "A repeated submission should be marked as already submitted.");
assert.equal(repeated.data.score, submitted.data.score, "Repeated submission must not change the stored score.");


const fullMock = await request("/api/cbt/start", {
  mode: "mock",
  subject: "Use of English",
  questionCount: 180,
  subjectCombination: ["Biology", "Chemistry", "Physics"],
});
assert.equal(fullMock.response.status, 409, "A full mock must be rejected until every selected subject has its required published bank.");
assert.equal(fullMock.data.requiredBySubject?.["Use of English"], 60);
assert.equal(fullMock.data.requiredBySubject?.Biology, 40);
assert.equal(fullMock.data.requiredBySubject?.Chemistry, 40);
assert.equal(fullMock.data.requiredBySubject?.Physics, 40);

console.log("CBT API integration passed: published-only question payload, hidden answer key, server grading and idempotent repeat submission.");

// Administrative question-bank endpoints must reject requests that carry only the
// public API key and no authenticated user session.
const adminHeaders = { apikey: key, "Content-Type": "application/json" };
const adminList = await fetch(endpoint + "/api/admin/cbt/questions", { headers: adminHeaders });
assert.equal(adminList.status, 401, "The admin question-bank list must require an authenticated user.");
const adminHistory = await fetch(endpoint + "/api/admin/cbt/imports", { headers: adminHeaders });
assert.equal(adminHistory.status, 401, "The admin import history must require an authenticated user.");
const adminImport = await fetch(endpoint + "/api/admin/cbt/import", {
  method: "POST",
  headers: adminHeaders,
  body: JSON.stringify({ filename: "unauthorised.csv", rows: [{ subject: "Use of English" }] }),
});
assert.equal(adminImport.status, 401, "The admin import endpoint must reject unauthenticated writes before parsing or inserting data.");

console.log("CBT admin API security passed: question list, import history and CSV import reject unauthenticated requests.");
