import test from "node:test";
import assert from "node:assert/strict";
import {
  getNextPaymentStatus,
  getPaystackAuthorizationUrl,
  getPaystackCallbackUrl,
  getPaystackInitializationFailureDisposition,
  isFinalPaystackFailure,
  isSuccessfulPaystackTransaction,
  matchesStoredPaystackPayment,
  normalizePaystackStatus,
  isValidPaystackWebhookSignature,
  isPaystackTestModeEnabled,
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


test("Paystack webhook signatures are HMAC-SHA512 verified against the exact body", async () => {
  const secret = "test-paystack-secret";
  const body = JSON.stringify({ event: "charge.success", data: { reference: "EDK-PAY-1234567890ABCDEF12", amount: 125000, currency: "NGN", status: "success" } });
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-512" }, false, ["sign"]);
  const bytes = new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body)));
  const signature = Array.from(bytes, byte => byte.toString(16).padStart(2, "0")).join("");
  assert.equal(await isValidPaystackWebhookSignature(body, signature, secret), true);
  assert.equal(await isValidPaystackWebhookSignature(body + " ", signature, secret), false);
  assert.equal(await isValidPaystackWebhookSignature(body, signature, "wrong-secret"), false);
  assert.equal(await isValidPaystackWebhookSignature(body, "bad-signature", secret), false);
});


test("Paystack checkout requires explicit test mode and a test secret key", () => {
  assert.equal(isPaystackTestModeEnabled("test", "sk_test_0123456789abcdef"), true);
  assert.equal(isPaystackTestModeEnabled("live", "sk_test_0123456789abcdef"), false);
  assert.equal(isPaystackTestModeEnabled("test", "sk_live_0123456789abcdef"), false);
  assert.equal(isPaystackTestModeEnabled(undefined, "sk_test_0123456789abcdef"), false);
  assert.equal(isPaystackTestModeEnabled("test", undefined), false);
  assert.equal(isPaystackTestModeEnabled(" test ", "sk_test_0123456789abcdef"), true);
});


test("Paystack callback URL requires a clean HTTPS site origin and valid payment reference", () => {
  const reference = "EDK-PAY-1234567890ABCDEF12";
  assert.equal(
    getPaystackCallbackUrl("https://eduken-consult.example/", reference),
    "https://eduken-consult.example/make-payments?reference=EDK-PAY-1234567890ABCDEF12",
  );
  for (const siteUrl of [
    undefined,
    "",
    "http://eduken-consult.example/",
    "https://user:pass@eduken-consult.example/",
    "https://eduken-consult.example/path",
    "https://eduken-consult.example/?next=https://evil.example",
    "https://eduken-consult.example/#fragment",
    "not a URL",
  ]) {
    assert.equal(getPaystackCallbackUrl(siteUrl, reference), null, String(siteUrl));
  }
  assert.equal(getPaystackCallbackUrl("https://eduken-consult.example/", "invalid-reference"), null);
});

test("ambiguous Paystack initialization responses remain pending for reconciliation", () => {
  for (const status of [408, 500, 502, 503]) {
    assert.equal(getPaystackInitializationFailureDisposition({ ok: false, status, hasAuthorizationUrl: false }), "unconfirmed", String(status));
  }
  assert.equal(getPaystackInitializationFailureDisposition({ ok: true, status: 200, hasAuthorizationUrl: false }), "unconfirmed");
  assert.equal(getPaystackInitializationFailureDisposition({ ok: true, status: 200, hasAuthorizationUrl: true }), "unconfirmed", "contradictory 2xx response must not fail a possibly-created checkout");
  assert.equal(getPaystackInitializationFailureDisposition({ ok: false, status: 400, hasAuthorizationUrl: false }), "failed");
  assert.equal(getPaystackInitializationFailureDisposition({ ok: false, status: 400, providerStatus: true, hasAuthorizationUrl: true }), "unconfirmed", "provider success indicators must override an HTTP rejection");
  assert.equal(getPaystackInitializationFailureDisposition({ ok: false, status: 401, hasAuthorizationUrl: false }), "failed");
});

test("wallet deposit and both service checkout flows classify ambiguous provider responses before marking failed", async () => {
  const { readFile } = await import("node:fs/promises");
  const source = await readFile(new URL("../supabase/functions/eduken-api/index.ts", import.meta.url), "utf8");
  const checks = [
    ['if (path === "/api/wallet/deposit/initialize"', 'if (path === "/api/wallet/deposit/verify"', "WALLET_DEPOSIT_INITIALIZATION_UNCERTAIN"],
    ['if (path === "/api/payments/initialize-guest"', 'if (path === "/api/payments/verify-guest"', "PAYMENT_INITIALIZATION_UNCERTAIN"],
    ['if (path === "/api/payments/initialize"', 'if (path === "/api/payments/verify"', "PAYMENT_INITIALIZATION_UNCERTAIN"],
  ];
  for (const [start, end, code] of checks) {
    const route = source.slice(source.indexOf(start), source.indexOf(end));
    assert.notEqual(route.indexOf("getPaystackInitializationFailureDisposition"), -1, start);
    const guard = route.indexOf("getPaystackInitializationFailureDisposition");
    const failUpdate = route.indexOf('update({ status: "Failed" }');
    assert.ok(failUpdate === -1 || guard < failUpdate, start + " must classify ambiguity before marking failed");
    assert.ok(route.includes(code), start + " must return an uncertain state code");
  }
});



test("guest payment callback recovery is rate-limited and verifies provider evidence before settlement", async () => {
  const { readFile } = await import("node:fs/promises");
  const api = await readFile(new URL("../supabase/functions/eduken-api/index.ts", import.meta.url), "utf8");
  const routeStart = api.indexOf('if (path === "/api/payments/recover-guest"');
  const routeEnd = api.indexOf('if (path === "/api/payments/verify-guest"', routeStart);
  assert.ok(routeStart >= 0 && routeEnd > routeStart, "recovery route must be registered before session-bound verification");
  const route = api.slice(routeStart, routeEnd);
  assert.match(route, /consumeEmailAlertRateLimit\(req, "guest-payment-recovery"\)/);
  assert.match(route, /\^EDK-PAY-\[A-Z0-9\]\{18\}\$/);
  assert.match(route, /transaction\/verify\//);
  assert.match(route, /String\(transaction\.reference \|\| ""\) !== reference/);
  assert.match(route, /different payment reference/);
  assert.match(route, /matchesStoredPaystackPayment\(transaction, \{ amount: existingPayment\.amount, currency: existingPayment\.currency, reference \}\)/);
  assert.match(route, /\.in\("status", \["Pending", "Failed"\]\)/);
  assert.match(route, /sendPaymentNotifications\(/);
  // Recovery must not trust a stored Paid flag without fresh provider evidence.
  const providerVerification = route.indexOf('fetch("https://api.paystack.co/transaction/verify/"');
  const storedPaidShortcut = route.indexOf('if (existingPayment.status === "Paid")');
  assert.ok(providerVerification >= 0, "recovery must verify with Paystack");
  assert.equal(storedPaidShortcut, -1, "stored Paid state must not bypass provider verification");
  assert.match(route, /existingPayment\.status === "Paid" && !paid/);
  assert.match(route, /stored payment status conflicts with the provider response/);
  assert.match(route, /if \(payment\) \{[\s\S]*?await sendPaymentNotifications/);
  const app = await readFile(new URL("../src/App.tsx", import.meta.url), "utf8");
  assert.match(app, /api\.post\('\/api\/payments\/recover-guest', \{ reference: returnedReference \}\)/);
  assert.match(app, /Checkout session not found in this browser\. Checking the payment reference securely/);
});
