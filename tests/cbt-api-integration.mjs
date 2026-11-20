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

const tooSmall = await request("/api/cbt/start", { mode: "practice", subject: "Use of English", questionCount: 10 });
assert.equal(tooSmall.response.status, 400, "Counts below 20 must be rejected.");

const practice = await request("/api/cbt/start", { mode: "practice", subject: "Use of English", questionCount: 20 });
assert.equal(practice.response.status, 409, "The isolated fixture has fewer than 20 published English questions.");
assert.equal(practice.data.available, 1);
assert.equal(practice.data.requested, 20);

const mixed = await request("/api/cbt/start", {
  mode: "mock",
  subject: "Use of English",
  questionCount: 20,
  subjectCombination: ["Biology", "Chemistry", "Physics"],
});
assert.equal(mixed.response.status, 409, "The isolated fixtures must report insufficient published subject questions instead of returning a partial mock.");
assert.equal(mixed.data.requested, 7, "The 20-question mixed blueprint should allocate seven questions to English.");
assert.equal(mixed.data.requiredBySubject["Use of English"], 7);
assert.equal(mixed.data.requiredBySubject.Biology, 4);
assert.equal(mixed.data.requiredBySubject.Chemistry, 4);
assert.equal(mixed.data.requiredBySubject.Physics, 5);

console.log("CBT API integration passed: allowed-count enforcement, exact-count shortage handling and mixed-subject blueprint.");
