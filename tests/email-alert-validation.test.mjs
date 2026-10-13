import test from "node:test";
import assert from "node:assert/strict";
import {
  ALLOWED_EMAIL_ALERT_TOPICS,
  isAllowedEmailAlertTopic,
  normalizeAlertEmail,
  validateEmailAlertSubscription,
  isWithinEmailAlertCooldown,
  emailAlertRateLimitPolicy,
  getEmailAlertClientIp,
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

test("confirmation-email cooldown prevents repeated sends but permits old or invalid timestamps", () => {
  assert.equal(isWithinEmailAlertCooldown("2026-10-13T10:00:00.000Z", Date.parse("2026-10-13T10:01:00.000Z")), true);
  assert.equal(isWithinEmailAlertCooldown("2026-10-13T10:00:00.000Z", Date.parse("2026-10-13T10:02:00.000Z")), false);
  assert.equal(isWithinEmailAlertCooldown("invalid", Date.parse("2026-10-13T10:01:00.000Z")), false);
  assert.equal(isWithinEmailAlertCooldown("2026-10-13T10:02:00.000Z", Date.parse("2026-10-13T10:01:00.000Z")), true);
});

test("topic allowlist is fixed and type-safe", () => {
  assert.equal(ALLOWED_EMAIL_ALERT_TOPICS.length, 6);
  assert.equal(isAllowedEmailAlertTopic("admissions"), true);
  assert.equal(isAllowedEmailAlertTopic("admin"), false);
  assert.equal(isAllowedEmailAlertTopic(null), false);
});

 
test("rate-limit policy limits confirmation-email abuse and token guessing", async () => {
  const { emailAlertRateLimitPolicy } = await import("../supabase/functions/eduken-api/email-alert-validation.mjs");
  assert.deepEqual(emailAlertRateLimitPolicy("subscribe"), { limit: 5, windowSeconds: 900 });
  assert.deepEqual(emailAlertRateLimitPolicy("verify"), { limit: 20, windowSeconds: 900 });
  assert.deepEqual(emailAlertRateLimitPolicy("unsubscribe"), { limit: 20, windowSeconds: 900 });
  assert.equal(emailAlertRateLimitPolicy("unknown"), null);
});

test("client IP extraction prefers platform headers and uses the nearest forwarded address", async () => {
  const { getEmailAlertClientIp } = await import("../supabase/functions/eduken-api/email-alert-validation.mjs");
  assert.equal(getEmailAlertClientIp(new Headers({
    "cf-connecting-ip": "203.0.113.4",
    "x-forwarded-for": "198.51.100.9, 203.0.113.5",
  })), "203.0.113.4");
  assert.equal(getEmailAlertClientIp(new Headers({
    "x-forwarded-for": "198.51.100.9, 203.0.113.5",
  })), "203.0.113.5");
  assert.equal(getEmailAlertClientIp(new Headers()), null);
  assert.equal(getEmailAlertClientIp(new Headers({ "x-real-ip": "x".repeat(129) })), null);
});


test("delivery retries use bounded exponential backoff and stop after five attempts", async () => {
  const {
    MAX_EMAIL_ALERT_DELIVERY_ATTEMPTS,
    emailAlertRetryDelayMs,
    isEmailAlertAttemptExhausted,
  } = await import("../supabase/functions/eduken-api/email-alert-validation.mjs");
  assert.equal(MAX_EMAIL_ALERT_DELIVERY_ATTEMPTS, 5);
  assert.equal(emailAlertRetryDelayMs(1), 60_000);
  assert.equal(emailAlertRetryDelayMs(2), 120_000);
  assert.equal(emailAlertRetryDelayMs(3), 240_000);
  assert.equal(emailAlertRetryDelayMs(4), 480_000);
  assert.equal(emailAlertRetryDelayMs(5), 960_000);
  assert.equal(emailAlertRetryDelayMs(30), 6 * 60 * 60 * 1000);
  assert.equal(isEmailAlertAttemptExhausted(4), false);
  assert.equal(isEmailAlertAttemptExhausted(5), true);
  assert.equal(isEmailAlertAttemptExhausted(6), true);
});

