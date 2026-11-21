import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
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

const edgeSource = readFileSync(new URL("../supabase/functions/eduken-api/index.ts", import.meta.url), "utf8");

test("CBT start, submission, username claiming and personal history require a Google identity", () => {
  assert.match(edgeSource, /async function requireGoogleUser\(req: Request\)/);
  assert.match(edgeSource, /user\.app_metadata\?\.provider === "google"/);
  assert.match(edgeSource, /identity\?\.provider === "google"/);
  assert.match(edgeSource, /if \(path === "\/api\/cbt\/start" && req\.method === "POST"\)[\s\S]*?requireGoogleUser\(req\)/);
  assert.match(edgeSource, /if \(path === "\/api\/cbt\/submit" && req\.method === "POST"\)[\s\S]*?requireGoogleUser\(req\)/);
  assert.match(edgeSource, /if \(path === "\/api\/cbt\/student-profile" && req\.method === "POST"\)[\s\S]*?requireGoogleUser\(req\)/);
  assert.match(edgeSource, /if \(path === "\/api\/cbt\/attempts" && req\.method === "GET"\)[\s\S]*?requireGoogleUser\(req\)/);
  assert.match(edgeSource, /if \(path === "\/api\/cbt\/arena\/summary" && req\.method === "GET"\)[\s\S]*?requireGoogleUser\(req\)/);
});
