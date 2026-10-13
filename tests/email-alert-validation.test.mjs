import test from "node:test";
import assert from "node:assert/strict";
import {
  ALLOWED_EMAIL_ALERT_TOPICS,
  isAllowedEmailAlertTopic,
  normalizeAlertEmail,
  validateEmailAlertSubscription,
} from "../supabase/functions/eduken-api/email-alert-validation.mjs";

test("normalizes valid emails and rejects unsafe or malformed addresses", () => {
  assert.equal(normalizeAlertEmail("  Student.Example@Example.COM "), "student.example@example.com");
  for (const value of [null, 42, "", "not-an-email", "name@localhost", "a\r\nb@example.com", "a b@example.com", "x".repeat(250) + "@example.com"]) {
    assert.equal(normalizeAlertEmail(value), null, String(value));
  }
});

test("accepts an account-free subscription with approved topics", () => {
  assert.deepEqual(validateEmailAlertSubscription({
    email: "  Student@Example.com ",
    topics: ["admissions", "scholarships-grants"],
  }), { data: { email: "student@example.com", topics: ["admissions", "scholarships-grants"] } });
});

test("rejects malformed payloads, empty topics, unknown topics and duplicates", () => {
  for (const body of [null, [], "text", {}, { email: "student@example.com", topics: [] },
    { email: "student@example.com", topics: "admissions" },
    { email: "student@example.com", topics: ["unknown-topic"] },
    { email: "student@example.com", topics: ["admissions", "admissions"] },
    { email: "invalid", topics: ["admissions"] }]) {
    assert.ok(validateEmailAlertSubscription(body).error, JSON.stringify(body));
  }
});

test("topic allowlist is fixed and type-safe", () => {
  assert.equal(ALLOWED_EMAIL_ALERT_TOPICS.length, 6);
  assert.equal(isAllowedEmailAlertTopic("admissions"), true);
  assert.equal(isAllowedEmailAlertTopic("admin"), false);
  assert.equal(isAllowedEmailAlertTopic(null), false);
});
