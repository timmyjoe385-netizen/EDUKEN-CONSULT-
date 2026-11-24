import assert from "node:assert/strict";

const base = String(process.env.CBT_TEST_SUPABASE_URL || "").trim().replace(/\/+$/, "");
const key = String(process.env.CBT_TEST_SUPABASE_PUBLISHABLE_KEY || "").trim();
assert.ok(base && key, "Isolated CBT test URL and publishable key must be configured.");
assert.equal(new URL(base).hostname, "wpktzogarfqrgkirzdpy.supabase.co", "Refusing to run CBT integration writes against anything except the isolated test project.");

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

// Personal progress summaries must also require the authenticated account owner.
{
  const response = await fetch(endpoint + "/api/cbt/arena/summary", { headers: { apikey: key } });
  assert.equal(response.status, 401, "Personal arena summaries must require authentication.");
}

// Weekly champions are public-safe and never expose account identifiers.
{
  const response = await fetch(endpoint + "/api/cbt/arena/champions", { headers: { apikey: key } });
  assert.equal(response.status, 200, "Weekly champions should be readable without a student session.");
  const payload = await response.json();
  assert.ok(Array.isArray(payload.champions), "Weekly champions response should include a list.");
  for (const champion of payload.champions) {
    assert.ok(["top-performer", "most-improved", "most-consistent"].includes(champion.category));
    for (const privateField of ["user_id", "email", "phone", "auth_id", "id"]) {
      assert.equal(Object.hasOwn(champion, privateField), false, `Weekly champions must not expose ${privateField}.`);
    }
  }
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


console.log("CBT API integration passed: public-safe arena reads, profile ownership, and leaderboard privacy.");
