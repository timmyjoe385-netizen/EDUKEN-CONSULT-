import assert from "node:assert/strict";

const base = String(process.env.CBT_TEST_SUPABASE_URL || "").trim().replace(/\\/+$/, "");
const key = String(process.env.CBT_TEST_SUPABASE_PUBLISHABLE_KEY || "").trim();
const route = process.argv[2];
assert.ok(base && key, "Isolated CBT test URL and publishable key must be configured.");
assert.equal(new URL(base).hostname, "wpktzogarfqrgkirzdpy.supabase.co", "Refusing to run guest authentication checks against any project except the isolated test project.");
assert.ok(["start", "submit"].includes(route), "Pass exactly one isolated route: start or submit.");

const body = route === "start"
  ? { mode: "practice", subject: "Use of English", questionCount: 1 }
  : { attemptToken: "a".repeat(64), answers: {} };

const response = await fetch(base + "/functions/v1/eduken-api/api/cbt/" + route, {
  method: "POST",
  headers: { apikey: key, "Content-Type": "application/json" },
  body: JSON.stringify(body),
  signal: AbortSignal.timeout(25_000),
});
const responseText = await response.text();
let payload = {};
try { payload = responseText ? JSON.parse(responseText) : {}; } catch { payload = { raw: responseText }; }

assert.equal(response.status, 401, `Guest CBT ${route} must return 401; received ${response.status}: ${JSON.stringify(payload)}`);
if (route === "start") {
  assert.match(String(payload.error || ""), /sign in|authentication|unauthorized/i, "The start API should explain that a signed-in student account is required.");
}
console.log(`Isolated guest CBT ${route} authentication check passed (HTTP 401).`);
