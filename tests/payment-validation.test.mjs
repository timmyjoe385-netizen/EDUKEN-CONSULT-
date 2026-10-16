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
  const ambiguousResponseGuard = initializeRoute.indexOf("if (paystack.status >= 500 || (paystack.ok && !authorizationUrl))");
  const failedStatusUpdate = initializeRoute.indexOf('db.from("payments").update({ status: "Failed" })');
  assert.notEqual(ambiguousResponseGuard, -1, "ambiguous 5xx and malformed 2xx responses must retain Pending status");
  assert.ok(ambiguousResponseGuard < failedStatusUpdate, "resolve ambiguity before marking a payment Failed");
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


test("server rejects out-of-range JAMB candidate quantities instead of silently capping them", async () => {
  const { readFile } = await import("node:fs/promises");
  const source = await readFile(new URL("../supabase/functions/eduken-api/index.ts", import.meta.url), "utf8");
  const start = source.indexOf('if (path === "/api/payments/initialize"');
  const end = source.indexOf('if (path === "/api/payments/verify"', start);
  assert.notEqual(start, -1);
  assert.notEqual(end, -1);
  const initialize = source.slice(start, end);
  assert.ok(initialize.includes('Number of candidates:\\s*([^\\r\\n]+)'), "parse the entire candidate quantity so decimals and malformed values are rejected");
  assert.ok(initialize.includes("const requestedQuantity = candidateMatch ? Number(candidateMatch[1].trim()) : 1"));
  assert.match(initialize, /!Number\.isSafeInteger\(requestedQuantity\) \|\| requestedQuantity < 1 \|\| requestedQuantity > 100/);
  assert.match(initialize, /Candidate quantity must be a whole number from 1 to 100/);
  assert.ok(
    initialize.indexOf("if (!Number.isSafeInteger(requestedQuantity)") < initialize.indexOf("const trustedAmount = unitAmount * quantity"),
    "reject invalid quantities before calculating the amount",
  );
  assert.doesNotMatch(initialize, /Math\.min\(100, Math\.max\(1, Number\(candidateMatch/);
});


test("payment initialization rejects published services that are marked unavailable", async () => {
  const { readFile } = await import("node:fs/promises");
  const source = await readFile(new URL("../supabase/functions/eduken-api/index.ts", import.meta.url), "utf8");
  const start = source.indexOf('if (path === "/api/payments/initialize"');
  const end = source.indexOf('if (path === "/api/payments/verify"', start);
  assert.notEqual(start, -1);
  assert.notEqual(end, -1);
  const initialize = source.slice(start, end);
  assert.match(initialize, /services\(name,price,is_published,is_available\)/);
  assert.match(initialize, /!service\.is_published \|\| !service\.is_available/);
  assert.match(initialize, /This service is currently unavailable for online checkout/);
  assert.ok(
    initialize.indexOf("!service.is_available") < initialize.indexOf('db.from("payments").insert'),
    "reject unavailable services before creating a payment record",
  );
  assert.ok(
    initialize.indexOf("!service.is_available") < initialize.indexOf('fetch("https://api.paystack.co/transaction/initialize"'),
    "reject unavailable services before contacting Paystack",
  );
});

test("Paystack webhook verifies the HMAC-SHA512 signature before parsing or touching payment records", async () => {
  const { readFile } = await import("node:fs/promises");
  const source = await readFile(new URL("../supabase/functions/eduken-api/index.ts", import.meta.url), "utf8");
  const start = source.indexOf('if (path === "/api/payments/webhook"');
  const end = source.indexOf('if (req.method === "GET" && (path === "/public-content"', start);
  assert.notEqual(start, -1);
  assert.notEqual(end, -1);
  const webhook = source.slice(start, end);
  const signatureRead = webhook.indexOf('req.headers.get("x-paystack-signature")');
  const signatureCheck = webhook.indexOf('crypto.subtle.verify("HMAC"');
  const payloadParse = webhook.indexOf('JSON.parse(rawBody)');
  const paymentLookup = webhook.indexOf('db.from("payments")');
  assert.notEqual(signatureRead, -1);
  assert.ok(webhook.includes("if (!/^[a-f0-9]{128}$/i.test(supplied))"), "reject malformed signature values");
  assert.match(webhook, /hash: "SHA-512"/);
  assert.ok(signatureRead < signatureCheck, "read the supplied signature before verifying it");
  assert.ok(signatureCheck < payloadParse, "reject forged payloads before parsing event data");
  assert.ok(signatureCheck < paymentLookup, "reject forged payloads before querying payment records");
});

test("admin payment list is authorization-gated and renders guest payment details", async () => {
  const { readFile } = await import("node:fs/promises");
  const source = await readFile(new URL("../supabase/functions/eduken-api/index.ts", import.meta.url), "utf8");
  const ui = await readFile(new URL("../src/PaymentsAdmin.tsx", import.meta.url), "utf8");
  const start = source.indexOf('if (path === "/api/admin/payments" && req.method === "GET")');
  const end = source.indexOf('if (path === "/api/admin/system-settings")', start);
  assert.notEqual(start, -1);
  assert.notEqual(end, -1);
  const route = source.slice(start, end);
  const authorization = route.indexOf("await requireAdmin(req)");
  const query = route.indexOf('db.from("payments").select');
  assert.ok(authorization >= 0, "payment list must require admin authorization");
  assert.ok(query > authorization, "authorize before reading payment records");
  assert.match(route, /service_requests\(reference_number,customer_name\)/);
  assert.match(ui, /api.get\('\/api\/admin\/payments'\)/);
  assert.match(ui, /Payment reference:/);
  assert.match(ui, /service_requests\?\.customer_name \|\| 'Student'/);
  assert.match(ui, /item\.status \|\| 'Pending'/);
});


test("JAMB catalogue recognizes known legacy service names before admin conversion", async () => {
  const { isJambCatalogueService } = await import("../src/lib/jamb-service-catalogue.mjs");
  for (const name of [
    "JAMB e-PIN (UTME Without Mock)",
    "JAMB e-PIN (UTME With Mock)",
    "JAMB e-PIN (Direct Entry)",
    "JAMB e-PIN (Trial-Testing Mock)",
    "JAMB Original Result Slip Guidance",
  ]) {
    assert.equal(isJambCatalogueService({ name, is_catalog_item: false }), true, name);
  }
  assert.equal(isJambCatalogueService({ name: "Unrelated service", is_catalog_item: false }), false);
  assert.equal(isJambCatalogueService({ name: "Unrelated service", is_catalog_item: true }), true);
});

test("JAMB template conversion preserves existing price and availability settings", async () => {
  const { readFile } = await import("node:fs/promises");
  const source = await readFile(new URL("../src/App.tsx", import.meta.url), "utf8");
  const start = source.indexOf("const addJambServiceTemplates = async () =>");
  const end = source.indexOf("const updateServiceRequest =", start);
  assert.notEqual(start, -1);
  assert.notEqual(end, -1);
  const setup = source.slice(start, end);
  assert.match(setup, /price: Object\.prototype\.hasOwnProperty\.call\(match, 'price'\) \? match\.price : templateData\.price/);
  assert.match(setup, /is_available: Object\.prototype\.hasOwnProperty\.call\(match, 'is_available'\) \? match\.is_available : templateData\.is_available/);
  assert.match(setup, /Once a row is marked as a catalogue item, repeat clicks never overwrite admin pricing or availability/);
});


test("legacy JAMB e-PIN defaults remain unavailable when database availability is missing", async () => {
  const { jambServiceDefaultAvailability } = await import("../src/lib/jamb-service-catalogue.mjs");
  assert.equal(jambServiceDefaultAvailability({ name: "JAMB e-PIN (UTME Without Mock)" }), false);
  assert.equal(jambServiceDefaultAvailability({ name: "JAMB e-PIN (UTME With Mock)" }), false);
  assert.equal(jambServiceDefaultAvailability({ name: "JAMB e-PIN (Direct Entry)" }), false);
  assert.equal(jambServiceDefaultAvailability({ name: "JAMB e-PIN (Trial-Testing Mock)" }), false);
  assert.equal(jambServiceDefaultAvailability({ name: "JAMB Original Result Slip Guidance" }), true);
  const { readFile } = await import("node:fs/promises");
  const source = await readFile(new URL("../src/App.tsx", import.meta.url), "utf8");
  assert.match(source, /is_available: item\.is_available === undefined \? jambServiceDefaultAvailability\(item\) : normalizeFlag\(item\.is_available\)/);
});
