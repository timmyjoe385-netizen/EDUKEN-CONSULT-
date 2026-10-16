import test from "node:test";
import assert from "node:assert/strict";
import {
  getNextPaymentStatus,
  getPaystackAuthorizationUrl,
  isFinalPaystackFailure,
  isSuccessfulPaystackTransaction,
  matchesStoredPaystackPayment,
  normalizePaystackStatus,
} from "../supabase/functions/eduken-api/payment-validation.mjs";

test("normalizes provider statuses safely", () => {
  assert.equal(normalizePaystackStatus(" SUCCESS "), "success");
  assert.equal(normalizePaystackStatus(null), "");
  assert.equal(isSuccessfulPaystackTransaction({ status: "Success" }), true);
  assert.equal(isSuccessfulPaystackTransaction(null), false);
});

test("only explicit terminal provider failures are marked Failed", () => {
  for (const status of ["failed", "abandoned", "reversed"]) {
    assert.equal(isFinalPaystackFailure({ status }), true);
    assert.equal(getNextPaymentStatus({ status }), "Failed");
  }
  for (const status of ["pending", "ongoing", "processing", "queued", "unknown", ""]) {
    assert.equal(isFinalPaystackFailure({ status }), false, status);
    assert.equal(getNextPaymentStatus({ status }), "Pending", status);
  }
  assert.equal(getNextPaymentStatus(null), "Pending");
  assert.equal(getNextPaymentStatus({ status: "success" }), "Paid");
});

test("successful transaction must match stored amount, currency and reference", () => {
  const expected = { amount: 1250, currency: "NGN", reference: "EDK-PAY-1234567890ABCDEF12" };
  assert.equal(matchesStoredPaystackPayment({
    status: "success", amount: 125000, currency: "NGN", reference: expected.reference,
  }, expected), true);
  assert.equal(matchesStoredPaystackPayment({
    status: "success", amount: 124999, currency: "NGN", reference: expected.reference,
  }, expected), false);
  assert.equal(matchesStoredPaystackPayment({
    status: "success", amount: 125000, currency: "USD", reference: expected.reference,
  }, expected), false);
  assert.equal(matchesStoredPaystackPayment({
    status: "success", amount: 125000, currency: "NGN", reference: "OTHER",
  }, expected), false);
  assert.equal(matchesStoredPaystackPayment(null, expected), false);
  assert.equal(matchesStoredPaystackPayment({
    amount: 125000, currency: "NGN", reference: expected.reference,
  }, expected), true);
});

test("rejects invalid or non-positive stored amounts", () => {
  const transaction = { amount: 100, currency: "NGN", reference: "ref" };
  assert.equal(matchesStoredPaystackPayment(transaction, { amount: 0, reference: "ref" }), false);
  assert.equal(matchesStoredPaystackPayment(transaction, { amount: "not-a-number", reference: "ref" }), false);
});

test("only returns HTTPS Paystack-hosted checkout URLs", () => {
  assert.equal(
    getPaystackAuthorizationUrl({ status: true, data: { authorization_url: "https://checkout.paystack.com/abc123" } }),
    "https://checkout.paystack.com/abc123",
  );
  for (const authorization_url of [
    "http://checkout.paystack.com/abc",
    "https://example.com/fake-checkout",
    "https://checkout.paystack.com.evil.example/abc",
    "https://user:pass@checkout.paystack.com/abc",
    "https://checkout.paystack.com:444/abc",
    "https://checkout.paystack.com/",
    "not a URL",
    "",
  ]) {
    assert.equal(getPaystackAuthorizationUrl({ status: true, data: { authorization_url } }), null, authorization_url);
  }
  assert.equal(getPaystackAuthorizationUrl({ status: false, data: { authorization_url: "https://checkout.paystack.com/abc" } }), null);
  assert.equal(getPaystackAuthorizationUrl(null), null);
});

test("payment record is persisted before Paystack initialization and ambiguous outcomes stay reconcilable", async () => {
  const { readFile } = await import("node:fs/promises");
  const source = await readFile(new URL("../supabase/functions/eduken-api/index.ts", import.meta.url), "utf8");
  const initializeRoute = source.slice(
    source.indexOf('if (path === "/api/payments/initialize"'),
    source.indexOf('if (path === "/api/payments/verify"'),
  );
  assert.notEqual(initializeRoute.indexOf('db.from("payments").insert'), -1);
  assert.ok(
    initializeRoute.indexOf('db.from("payments").insert') < initializeRoute.indexOf('fetch("https://api.paystack.co/transaction/initialize"'),
    "store the reference before asking Paystack to initialize the transaction",
  );
  assert.match(initializeRoute, /PAYMENT_INITIALIZATION_UNCONFIRMED/);
  assert.match(initializeRoute, /Leave Pending: a timeout can occur after Paystack created the transaction/);
  assert.match(initializeRoute, /db\.from\("payments"\)\.update\(\{ status: "Failed" \}\)/);
});

test("Paystack callback defaults to the canonical EDUKEN website hostname", async () => {
  const { readFile } = await import("node:fs/promises");
  const source = await readFile(new URL("../supabase/functions/eduken-api/index.ts", import.meta.url), "utf8");
  const initializeRoute = source.slice(
    source.indexOf('if (path === "/api/payments/initialize"'),
    source.indexOf('if (path === "/api/payments/verify"'),
  );
  assert.match(initializeRoute, /PAYSTACK_CALLBACK_URL.*https:\/\/eduken-consult\.workers\.dev\//);
  assert.doesNotMatch(initializeRoute, /PAYSTACK_CALLBACK_URL.*eduken-consult\.timmyjoe385\.workers\.dev/);
});

test("write guard allows only the canonical production origin and keeps preview origins isolated", async () => {
  const { readFile } = await import("node:fs/promises");
  const source = await readFile(new URL("../src/lib/api.ts", import.meta.url), "utf8");
  assert.ok(source.includes("return window.location.origin !== 'https://eduken-consult.workers.dev';"));
  assert.ok(!source.includes("return window.location.origin !== 'https://eduken-consult.timmyjoe385.workers.dev';"));
});


test("payment callback keeps the reference for retry until verification succeeds", async () => {
  const { readFile } = await import("node:fs/promises");
  const source = await readFile(new URL("../src/App.tsx", import.meta.url), "utf8");
  const callback = source.slice(
    source.indexOf("const reference = params.get('payment_reference')"),
    source.indexOf("  }, []);", source.indexOf("const reference = params.get('payment_reference')")),
  );
  const verifyIndex = callback.indexOf("api.post('/api/payments/verify'");
  const firstRemovalIndex = callback.indexOf("params.delete('payment_reference')");
  assert.notEqual(verifyIndex, -1);
  assert.notEqual(firstRemovalIndex, -1);
  assert.ok(firstRemovalIndex > callback.indexOf("if (result.data?.paid) {"), "remove the callback reference only after paid verification");
  assert.ok(firstRemovalIndex > verifyIndex, "do not remove the reference before requesting verification");
  assert.match(callback, /Reference: '\s*\+ reference/);
  assert.match(callback, /refresh to retry/);
});

test("Paystack initialize, verify, and webhook enforce matching test/live secret prefixes", async () => {
  const { readFile } = await import("node:fs/promises");
  const source = await readFile(new URL("../supabase/functions/eduken-api/index.ts", import.meta.url), "utf8");
  for (const route of [
    'if (path === "/api/payments/initialize"',
    'if (path === "/api/payments/verify"',
    'if (path === "/api/payments/webhook"',
  ]) {
    const start = source.indexOf(route);
    assert.notEqual(start, -1, `expected route exists: ${route}`);
    const nextRoute = source.indexOf('if (path === "/api/', start + route.length);
    const block = source.slice(start, nextRoute === -1 ? undefined : nextRoute);
    assert.match(block, /PAYSTACK_MODE/);
    assert.match(block, /sk_test_/);
    assert.match(block, /sk_live_/);
  }
});


test("payment verification requires the matching signed-in owner for account-linked payments while allowing guest references", async () => {
  const { readFile } = await import("node:fs/promises");
  const source = await readFile(new URL("../supabase/functions/eduken-api/index.ts", import.meta.url), "utf8");
  assert.match(
    source,
    /if \(!existingPayment \|\| \(existingPayment\.user_id && \(!user \|\| existingPayment\.user_id !== user\.id\)\)\) return json\(\{ error: "Payment record not found\." \}, 404\);/,
  );
});


test("payment verification reconciles service request status when payment was already Paid", async () => {
  const { readFile } = await import("node:fs/promises");
  const source = await readFile(new URL("../supabase/functions/eduken-api/index.ts", import.meta.url), "utf8");
  const start = source.indexOf('if (path === "/api/payments/verify"');
  const endMarker = 'return json({ paid, payment: payment || existingPayment });';
  const end = source.indexOf(endMarker, start);
  assert.notEqual(start, -1);
  assert.notEqual(end, -1);
  const verify = source.slice(start, end + endMarker.length);
  const alreadyPaidStart = verify.indexOf('if (existingPayment.status === "Paid") {');
  const alreadyPaidEnd = verify.indexOf('return json({ paid: true, payment: existingPayment });', alreadyPaidStart);
  assert.notEqual(alreadyPaidStart, -1);
  assert.notEqual(alreadyPaidEnd, -1);
  const alreadyPaid = verify.slice(alreadyPaidStart, alreadyPaidEnd);
  assert.match(alreadyPaid, /db\.from\("service_requests"\)\.update\(\{ status: "Paid" \}\)/);
  assert.match(alreadyPaid, /requestUpdate\.is\("user_id", null\)/);
  assert.match(alreadyPaid, /requestUpdate\.eq\("user_id", existingPayment\.user_id\)/);
});


test("Paystack webhook does not mark a service request Paid unless stored payment status is confirmed Paid", async () => {
  const { readFile } = await import("node:fs/promises");
  const source = await readFile(new URL("../supabase/functions/eduken-api/index.ts", import.meta.url), "utf8");
  const start = source.indexOf('if (path === "/api/payments/webhook"');
  const end = source.indexOf('if (req.method === "GET" && (path === "/public-content"', start);
  assert.notEqual(start, -1);
  assert.notEqual(end, -1);
  const webhook = source.slice(start, end);
  assert.match(webhook, /paymentConfirmedPaid = updatedPayment\?\.status === "Paid"/);
  assert.match(webhook, /if \(!paymentConfirmedPaid\) \{[\s\S]*?return json\(\{ error: "Payment status could not be confirmed\./);
  assert.match(webhook, /if \(paymentConfirmedPaid && payment\.service_request_id\)/);
});


test("paid service email is validated before a service request is saved", async () => {
  const { readFile } = await import("node:fs/promises");
  const source = await readFile(new URL("../src/App.tsx", import.meta.url), "utf8");
  const start = source.indexOf("const hasOnlinePrice =");
  const end = source.indexOf("const submitEmailAlerts", start);
  assert.notEqual(start, -1);
  assert.notEqual(end, -1);
  const handler = source.slice(start, end);
  const emailGuard = handler.indexOf("if (hasOnlinePrice && !email)");
  const saveRequest = handler.indexOf("api.post('/api/service-requests'");
  assert.notEqual(emailGuard, -1, "paid checkout must reject a missing email");
  assert.notEqual(saveRequest, -1, "service request submission must exist");
  assert.ok(emailGuard < saveRequest, "validate email before saving to avoid orphaned requests");
});


test("payment ledger migration is reproducible, idempotent, and owner-scoped", async () => {
  const { readFile } = await import("node:fs/promises");
  const migration = await readFile(
    new URL("../supabase/migrations/20261016090000_create_payments_table.sql", import.meta.url),
    "utf8",
  );
  assert.match(migration, /create table if not exists public\.payments/i);
  for (const column of [
    "user_id uuid", "service_request_id uuid", "amount numeric not null",
    "currency text not null default 'NGN'", "status text not null default 'Pending'",
    "payment_reference text unique", "paid_at timestamptz", "created_at timestamptz",
  ]) {
    assert.ok(migration.includes(column), `Missing payment ledger schema: ${column}`);
  }
  assert.match(migration, /references auth\.users\(id\) on delete set null/i);
  assert.match(migration, /references public\.service_requests\(id\) on delete set null/i);
  assert.match(migration, /create index if not exists payments_service_request_id_idx/i);
  assert.match(migration, /create index if not exists payments_user_id_idx/i);
  assert.match(migration, /alter table public\.payments enable row level security/i);
  assert.match(migration, /using \(\(select auth\.uid\(\)\) = user_id\)/i);
  assert.match(migration, /grant select on table public\.payments to authenticated/i);
  assert.match(migration, /grant select, insert, update on table public\.payments to service_role/i);
  assert.doesNotMatch(migration, /insert into public\.payments/i);
});
