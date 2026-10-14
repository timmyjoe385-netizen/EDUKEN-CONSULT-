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

test("rate-limit policy limits public form spam, confirmation-email abuse and token guessing", async () => {
  assert.deepEqual(emailAlertRateLimitPolicy("subscribe"), { limit: 5, windowSeconds: 900 });
  assert.deepEqual(emailAlertRateLimitPolicy("consultation"), { limit: 5, windowSeconds: 900 });
  assert.deepEqual(emailAlertRateLimitPolicy("service-request"), { limit: 5, windowSeconds: 900 });
  assert.deepEqual(emailAlertRateLimitPolicy("verify"), { limit: 20, windowSeconds: 900 });
  assert.deepEqual(emailAlertRateLimitPolicy("unsubscribe"), { limit: 20, windowSeconds: 900 });
  assert.equal(emailAlertRateLimitPolicy("unknown"), null);
});

test("client IP extraction trusts gateway headers, not caller-supplied x-real-ip", async () => {
  assert.equal(getEmailAlertClientIp(new Headers({
    "cf-connecting-ip": "203.0.113.4",
    "x-forwarded-for": "198.51.100.9, 203.0.113.5",
  })), "203.0.113.4");
  assert.equal(getEmailAlertClientIp(new Headers({
    "x-forwarded-for": "198.51.100.9, 203.0.113.5",
  })), "203.0.113.5");
  assert.equal(getEmailAlertClientIp(new Headers({
    "x-real-ip": "203.0.113.99",
    "x-forwarded-for": "198.51.100.9, 203.0.113.5",
  })), "203.0.113.5");
  assert.equal(getEmailAlertClientIp(new Headers({ "x-real-ip": "203.0.113.99" })), null);
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
  assert.match(migration, /create table if not exists public\.email_alert_rate_limits/);
  assert.match(migration, /create or replace function public\.consume_email_alert_rate_limit\(/);
  assert.match(migration, /on conflict \(key_hash\) do update/);
  assert.match(migration, /p_key_hash is null[\s\S]*?p_limit is null[\s\S]*?p_window_seconds is null/i);
  assert.match(migration, /length\(p_key_hash\) <> 64/);
  assert.match(migration, /translate\(p_key_hash, '0123456789abcdef', ''\) <> ''/);
  assert.match(migration, /p_limit < 1 or p_limit > 100/);
  assert.match(migration, /p_window_seconds < 1 or p_window_seconds > 86400/);
  assert.equal((migration.match(/create or replace function public\.consume_email_alert_rate_limit\(/g) || []).length, 1);
  assert.ok(migration.trimEnd().endsWith("revoke all on table public.email_alert_rate_limits from public, anon, authenticated;"));
  assert.match(migration, /revoke all on function public\.consume_email_alert_rate_limit\(text, integer, integer\) from public, anon, authenticated/);
  assert.match(migration, /grant execute on function public\.consume_email_alert_rate_limit\(text, integer, integer\) to service_role/);
  assert.match(migration, /alter table public\.email_alert_subscriptions enable row level security/i);
  assert.match(migration, /alter table public\.email_alert_deliveries enable row level security/i);
  assert.match(migration, /alter table public\.email_alert_rate_limits enable row level security/i);
  assert.match(migration, /revoke all on table public\.email_alert_subscriptions from public, anon, authenticated/i);
  assert.match(migration, /revoke all on table public\.email_alert_deliveries from public, anon, authenticated/i);
  assert.match(migration, /revoke all on table public\.email_alert_rate_limits from public, anon, authenticated/i);
  assert.match(migration, /security definer[\s\S]*?set search_path = pg_catalog, public/i);
  assert.doesNotMatch(migration, /grant execute on function public\.consume_email_alert_rate_limit\(text, integer, integer\) to public, anon, authenticated/i);
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
  assert.match(migration, /postgres is not a member of that role/i);
  assert.match(migration, /revoke execute on all functions in schema public from public, anon, authenticated/i);
  assert.match(migration, /alter default privileges for role postgres in schema public[\s\S]*revoke execute on functions from public, anon, authenticated/i);
  assert.match(migration, /grant select on table[\s\S]*public\.opportunities[\s\S]*public\.admissions[\s\S]*public\.updates[\s\S]*public\.faqs[\s\S]*public\.services[\s\S]*to anon, authenticated/i);
  assert.match(migration, /grant select, insert, update on table public\.profiles to authenticated/i);
  assert.match(migration, /grant select, update on table public\.notifications to authenticated/i);
  assert.match(migration, /grant select on table public\.payments to authenticated/i);
  assert.doesNotMatch(migration, /grant all privileges/i);
  assert.doesNotMatch(migration, /grant [^;]* on table public\.service_requests to authenticated/i);
  assert.doesNotMatch(migration, /grant [^;]* on table public\.consultations to (anon|authenticated)/i);
  assert.match(migration, /drop policy if exists "Anyone can submit a consultation" on public\.consultations/i);
  assert.match(migration, /drop policy if exists "Users can create service requests" on public\.service_requests/i);
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


test("email-alert subscribe responses do not disclose whether an address is already subscribed", async () => {
  const { readFile } = await import("node:fs/promises");
  const { fileURLToPath } = await import("node:url");
  const { dirname, resolve } = await import("node:path");
  const here = dirname(fileURLToPath(import.meta.url));
  const api = await readFile(resolve(here, "../supabase/functions/eduken-api/index.ts"), "utf8");
  const genericResponse = 'message: "If this address is eligible, your request has been processed. Check your inbox if confirmation is required."';

  assert.equal(api.split(genericResponse).length - 1, 4);
  assert.doesNotMatch(api, /Your email alert preferences have been updated/);
  assert.doesNotMatch(api, /A confirmation was requested recently/);
  assert.doesNotMatch(api, /Check your inbox for a confirmation link/);
});


test("public consultation and service-request routes enforce the atomic database limiter before parsing payloads", async () => {
  const { readFile } = await import("node:fs/promises");
  const { fileURLToPath } = await import("node:url");
  const { dirname, resolve } = await import("node:path");
  const here = dirname(fileURLToPath(import.meta.url));
  const api = await readFile(resolve(here, "../supabase/functions/eduken-api/index.ts"), "utf8");

  const consultation = api.slice(
    api.indexOf('if (req.method === "POST" && (path === "/consultations"'),
    api.indexOf('if (path === "/api/me"')
  );
  const serviceRequest = api.slice(
    api.indexOf('if (path === "/api/service-requests" && req.method === "POST")'),
    api.indexOf('if (path === "/api/service-requests" && req.method === "GET")')
  );

  assert.match(consultation, /consumeEmailAlertRateLimit\(req, "consultation"\)/);
  assert.match(consultation, /if \(rateAllowed === null\)[\s\S]*?503/);
  assert.match(consultation, /if \(!rateAllowed\)[\s\S]*?429/);
  assert.ok(consultation.indexOf("consumeEmailAlertRateLimit") < consultation.indexOf("req.json()"));

  assert.match(serviceRequest, /consumeEmailAlertRateLimit\(req, "service-request"\)/);
  assert.match(serviceRequest, /if \(rateAllowed === null\)[\s\S]*?503/);
  assert.match(serviceRequest, /if \(!rateAllowed\)[\s\S]*?429/);
  assert.ok(serviceRequest.indexOf("consumeEmailAlertRateLimit") < serviceRequest.indexOf("req.json()"));
});

test("database grant-hardening migration preserves least-privilege client access", async () => {
  const { readFile } = await import("node:fs/promises");
  const { fileURLToPath } = await import("node:url");
  const { dirname, resolve } = await import("node:path");
  const here = dirname(fileURLToPath(import.meta.url));
  const migration = await readFile(resolve(here, "../supabase/migrations/20261013150000_harden_public_table_grants.sql"), "utf8");

  assert.match(migration, /revoke all privileges on all tables in schema public from public, anon, authenticated/i);
  assert.match(migration, /revoke all privileges on all sequences in schema public from public, anon, authenticated/i);
  assert.match(migration, /alter default privileges for role postgres in schema public[\s\S]*?revoke all privileges on tables from public, anon, authenticated/i);
  assert.match(migration, /alter default privileges for role postgres in schema public[\s\S]*?revoke all privileges on sequences from public, anon, authenticated/i);
  assert.match(migration, /revoke execute on all functions in schema public from public, anon, authenticated/i);
  assert.match(migration, /alter default privileges for role postgres in schema public[\s\S]*?revoke execute on functions from public, anon, authenticated/i);
  assert.match(migration, /grant select on table[\s\S]*?public\.opportunities,[\s\S]*?public\.admissions,[\s\S]*?public\.updates,[\s\S]*?public\.faqs,[\s\S]*?public\.services[\s\S]*?to anon, authenticated/i);
  assert.match(migration, /drop policy if exists "Anyone can submit a consultation" on public\.consultations/i);
  assert.match(migration, /drop policy if exists "Users can create service requests" on public\.service_requests/i);
  assert.doesNotMatch(migration, /grant\s+[^;]*\bon\s+table\s+(?:public\.)?(?:consultations|service_requests)\b/i);
  assert.match(migration, /supabase_admin/i);
});

test("restored historical opportunity migrations retain the database-recorded schema changes", async () => {
  const { readFile } = await import("node:fs/promises");
  const { fileURLToPath } = await import("node:url");
  const { dirname, resolve } = await import("node:path");
  const here = dirname(fileURLToPath(import.meta.url));
  const controls = await readFile(resolve(here, "../supabase/migrations/20261011063351_add_opportunity_controls.sql"), "utf8");
  const details = await readFile(resolve(here, "../supabase/migrations/20261011192027_add_opportunity_editor_detail_fields.sql"), "utf8");

  assert.match(controls, /add column if not exists verified boolean not null default false/i);
  assert.match(controls, /add column if not exists featured boolean not null default false/i);
  assert.match(controls, /add column if not exists urgent boolean not null default false/i);
  assert.match(controls, /add column if not exists notify_on_publish boolean not null default false/i);
  assert.match(controls, /set verified = \(official_source is not null and btrim\(official_source\) <> ''\)[\s\S]*?where verified = false/i);
  assert.match(details, /add column if not exists content text[\s\S]*?add column if not exists eligibility text[\s\S]*?add column if not exists benefits text[\s\S]*?add column if not exists how_to_apply text/i);
});


test("schema recovery instructions use a supported read-only dump and forbid remote reset", async () => {
  const { readFile } = await import("node:fs/promises");
  const { fileURLToPath } = await import("node:url");
  const { dirname, resolve } = await import("node:path");
  const here = dirname(fileURLToPath(import.meta.url));
  const docs = await readFile(resolve(here, "../docs/account-free-email-alerts.md"), "utf8");

  assert.match(docs, /supabase db dump --db-url "\$EDUKEN_DATABASE_URL" --schema public -f \/tmp\/eduken-live-public-schema\.sql/);
  assert.match(docs, /`--schema-only` is not a supported/);
  assert.match(docs, /Separately inventory any custom triggers or policies on managed/);
  assert.match(docs, /Do not use `supabase db reset --linked`, `supabase db push`/);
  assert.doesNotMatch(docs, /supabase db dump --schema-only/);
});
