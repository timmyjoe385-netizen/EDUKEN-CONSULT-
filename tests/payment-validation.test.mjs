import test from "node:test";
import assert from "node:assert/strict";
import {
  getNextPaymentStatus,
  getPaystackAuthorizationUrl,
  getPaystackCallbackUrl,
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
