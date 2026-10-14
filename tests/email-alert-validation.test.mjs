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
  assert.deepEqual(emailAlertRateLimitPolicy("subscribe"), { limit: 5, windowSeconds: 900 });
  assert.deepEqual(emailAlertRateLimitPolicy("verify"), { limit: 20, windowSeconds: 900 });
  assert.deepEqual(emailAlertRateLimitPolicy("unsubscribe"), { limit: 20, windowSeconds: 900 });
  assert.equal(emailAlertRateLimitPolicy("unknown"), null);
});

test("client IP extraction prefers platform headers and uses the nearest forwarded address", async () => {
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

test("email alert migration requires an opportunity for every idempotent delivery", async () => {
  const { readFile } = await import("node:fs/promises");
  const { fileURLToPath } = await import("node:url");
  const { dirname, resolve } = await import("node:path");
  const here = dirname(fileURLToPath(import.meta.url));
  const migration = await readFile(resolve(here, "../supabase/migrations/20261013130000_account_free_email_alerts.sql"), "utf8");
  assert.match(migration, /opportunity_id uuid not null references public\.opportunities\(id\) on delete cascade/);
  assert.match(migration, /unique \(subscription_id, opportunity_id, event_type\)/);
  assert.match(migration, /alter table public\.email_alert_deliveries enable row level security/);
});

test("email alert scheduler pins the processor URL before sending its bearer secret", async () => {
  const { readFile } = await import("node:fs/promises");
  const { fileURLToPath } = await import("node:url");
  const { dirname, resolve } = await import("node:path");
  const here = dirname(fileURLToPath(import.meta.url));
  const workflow = await readFile(resolve(here, "../.github/workflows/email-alert-delivery.yml"), "utf8");

  for (const required of [
    'expected_host = "pphxltbkwygqjtjgkhxu.supabase.co"',
    'expected_path = "/functions/v1/eduken-api/api/internal/email-alerts/process"',
    'url.scheme != "https"',
    "url.hostname != expected_host",
    "url.port is not None",
    "url.username is not None",
    "url.password is not None",
    'url.path.rstrip("/") != expected_path',
    "url.query",
    "url.fragment",
    "Authorization: Bearer $CRON_SECRET",
  ]) {
    assert.ok(workflow.includes(required), `Missing scheduler security check: ${required}`);
  }
});

test("least-privilege migration removes broad client grants and keeps only required table access", async () => {
  const { readFile } = await import("node:fs/promises");
  const { fileURLToPath } = await import("node:url");
  const { dirname, resolve } = await import("node:path");
  const here = dirname(fileURLToPath(import.meta.url));
  const migration = await readFile(resolve(here, "../supabase/migrations/20261013150000_harden_public_table_grants.sql"), "utf8");

  assert.match(migration, /revoke all privileges on all tables in schema public from public, anon, authenticated/i);
  assert.match(migration, /revoke all privileges on all sequences in schema public from public, anon, authenticated/i);
  assert.match(migration, /alter default privileges for role postgres in schema public[\s\S]*revoke all privileges on tables from public, anon, authenticated/i);
  assert.match(migration, /alter default privileges for role postgres in schema public[\s\S]*revoke all privileges on sequences from public, anon, authenticated/i);
  assert.match(migration, /revoke execute on all functions in schema public from public, anon, authenticated/i);
  assert.match(migration, /alter default privileges for role postgres in schema public[\s\S]*revoke execute on functions from public, anon, authenticated/i);
  assert.match(migration, /grant select on table[\s\S]*public\.opportunities[\s\S]*public\.admissions[\s\S]*public\.updates[\s\S]*public\.faqs[\s\S]*public\.services[\s\S]*to anon, authenticated/i);
  assert.match(migration, /grant select, insert, update on table public\.profiles to authenticated/i);
  assert.match(migration, /grant select, update on table public\.notifications to authenticated/i);
  assert.match(migration, /grant select on table public\.payments to authenticated/i);
  assert.doesNotMatch(migration, /grant all privileges/i);
  assert.doesNotMatch(migration, /grant [^;]* on table public\.service_requests to authenticated/i);
  assert.doesNotMatch(migration, /grant [^;]* on table public\.consultations to (anon|authenticated)/i);
  assert.match(migration, /RLS policies remain the row-level authorization boundary/i);
});


test("verified opportunity email alerts permit a missing source but reject unsafe supplied URLs", async () => {
  const { isEmailAlertOpportunityEligible } = await import("../supabase/functions/eduken-api/email-alert-validation.mjs");
  const base = { is_published: true, verified: true, notify_on_publish: true };
  assert.equal(isEmailAlertOpportunityEligible({ ...base, official_source: null }), true);
  assert.equal(isEmailAlertOpportunityEligible({ ...base, official_source: "   " }), true);
  assert.equal(isEmailAlertOpportunityEligible({ ...base, official_source: "https://official.example/path" }), true);
  assert.equal(isEmailAlertOpportunityEligible({ ...base, official_source: "http://official.example/path" }), true);
  for (const source of [
    "javascript:alert(1)",
    "ftp://official.example",
    "not a URL",
    "https://user:password@official.example/path",
    "http://:password@official.example/path",
  ]) {
    assert.equal(isEmailAlertOpportunityEligible({ ...base, official_source: source }), false, source);
  }
  assert.equal(isEmailAlertOpportunityEligible({ ...base, verified: false, official_source: null }), false);
  assert.equal(isEmailAlertOpportunityEligible({ ...base, is_published: false, official_source: null }), false);
  assert.equal(isEmailAlertOpportunityEligible({ ...base, notify_on_publish: false, official_source: null }), false);
});
