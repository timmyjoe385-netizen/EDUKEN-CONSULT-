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

// Profile reads and claims must reject callers without an EDUKEN session.
for (const [method, path, body] of [
  ["GET", "/api/cbt/student-profile", undefined],
  ["POST", "/api/cbt/student-profile", { username: "arena_guest_test" }],
]) {
  const response = await fetch(endpoint + path, {
    method,
    headers: { apikey: key, ...(body ? { "Content-Type": "application/json" } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  assert.equal(response.status, 401, `${method} ${path} must require an authenticated EDUKEN user.`);
}

// Public leaderboard reads return only the safe ranking contract, never account identifiers.
for (const path of [
  "/api/cbt/leaderboard?scope=national&period=all-time&page=0&limit=10",
  "/api/cbt/leaderboard?scope=subject&subject=Use%20of%20English&period=week&page=0&limit=10",
]) {
  const response = await fetch(endpoint + path, { headers: { apikey: key } });
  assert.equal(response.status, 200, "Public leaderboard reads should succeed without a user session.");
  const payload = await response.json();
  assert.ok(Array.isArray(payload.items), "Leaderboard response should include a page of rows.");
  for (const row of payload.items) {
    for (const privateField of ["user_id", "email", "phone", "auth_id", "id"]) {
      assert.equal(Object.hasOwn(row, privateField), false, `Public leaderboard must not expose ${privateField}.`);
    }
    for (const publicField of ["rank", "username", "score", "total", "percentage", "duration_seconds", "submitted_at"]) {
      assert.ok(Object.hasOwn(row, publicField), `Leaderboard row should expose ${publicField}.`);
    }
  }
}

// Reject incomplete subject queries and enforce safe public pagination bounds.
{
  const missingSubject = await fetch(endpoint + "/api/cbt/leaderboard?scope=subject&period=week", { headers: { apikey: key } });
  assert.equal(missingSubject.status, 400, "Subject leaderboard requests must include a subject.");
  const bounded = await fetch(endpoint + "/api/cbt/leaderboard?scope=national&period=all-time&page=-10&limit=999", { headers: { apikey: key } });
  assert.equal(bounded.status, 200, "National leaderboard should tolerate out-of-range pagination inputs safely.");
  const payload = await bounded.json();
  assert.equal(payload.page, 0, "Negative page numbers must be clamped to the first page.");
  assert.equal(payload.limit, 100, "Public page size must be capped at 100 rows.");
}


const started = await request("/api/cbt/start", { mode: "practice", subject: "Use of English", questionCount: 1 });
assert.equal(started.response.status, 201, "A practice session should start from published isolated sample questions.");
assert.match(started.data.attemptToken || "", /^[a-f0-9]{64}$/i, "The server should issue an opaque attempt token.");
assert.equal(started.data.durationSeconds, 60, "A one-question practice session should use a one-minute timer.");
assert.ok(Array.isArray(started.data.questions) && started.data.questions.length > 0, "The session should include published questions.");

for (const question of started.data.questions) {
  assert.equal(Object.hasOwn(question, "correct_option"), false, "Correct answers must not be exposed before submission.");
  assert.equal(Object.hasOwn(question, "correctOption"), false, "Correct answers must not be exposed before submission.");
  assert.equal(Object.hasOwn(question, "explanation"), false, "Explanations must remain hidden until submission.");
}

const fixture = started.data.questions.find(question => question.prompt === "Which word names a person, place, or thing?");
assert.ok(fixture, "The isolated original Use of English fixture should be included in the practice session.");
const answers = Object.fromEntries(started.data.questions.map(question => [
  String(question.id),
  String(question.id) === String(fixture.id) ? 1 : null,
]));

const submitted = await request("/api/cbt/submit", { attemptToken: started.data.attemptToken, answers });
assert.equal(submitted.response.status, 200, "The server should accept and grade the practice submission.");
assert.equal(submitted.data.score, 1, "The server should award one point for the known correct answer.");
assert.equal(submitted.data.total, started.data.questions.length);
assert.equal(submitted.data.percent, Math.round(100 / started.data.questions.length));
assert.equal(submitted.data.review.find(question => String(question.id) === String(fixture.id))?.correctOption, "B");
assert.equal(submitted.data.review.find(question => String(question.id) === String(fixture.id))?.isCorrect, true);

const repeated = await request("/api/cbt/submit", { attemptToken: started.data.attemptToken, answers: {} });
assert.equal(repeated.response.status, 200, "A repeated submission should return the stored result safely.");
assert.equal(repeated.data.alreadySubmitted, true, "A repeated submission should be marked as already submitted.");
assert.equal(repeated.data.score, submitted.data.score, "Repeated submission must not change the stored score.");

console.log("CBT API integration passed: published-only question payload, hidden answer key, server grading and idempotent repeat submission.");
