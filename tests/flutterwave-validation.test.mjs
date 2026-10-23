import test from "node:test";
import assert from "node:assert/strict";
import {
  getFlutterwaveCallbackUrl,
  getFlutterwaveCheckoutUrl,
  getNextFlutterwavePaymentStatus,
  isFinalFlutterwaveFailure,
  isFlutterwaveTestModeEnabled,
  isSuccessfulFlutterwaveTransaction,
  isValidFlutterwaveWebhookSignature,
  matchesStoredFlutterwavePayment,
  normalizeFlutterwaveStatus,
} from "../supabase/functions/eduken-api/flutterwave-validation.mjs";

test("normalizes Flutterwave transaction statuses and only settles successful transactions", () => {
  assert.equal(normalizeFlutterwaveStatus(" SUCCESSFUL "), "successful");
  assert.equal(normalizeFlutterwaveStatus(null), "");
  assert.equal(isSuccessfulFlutterwaveTransaction({ status: "successful" }), true);
  assert.equal(isSuccessfulFlutterwaveTransaction({ status: "success" }), false);
  for (const status of ["failed", "cancelled", "canceled", "expired"]) {
    assert.equal(isFinalFlutterwaveFailure({ status }), true);
    assert.equal(getNextFlutterwavePaymentStatus({ status }), "Failed");
  }
  for (const status of ["pending", "ongoing", "processing", "unknown", ""]) {
    assert.equal(getNextFlutterwavePaymentStatus({ status }), "Pending");
  }
  assert.equal(getNextFlutterwavePaymentStatus({ status: "successful" }), "Paid");
  assert.equal(getNextFlutterwavePaymentStatus(null), "Pending");
});

test("Flutterwave verification must match stored amount in naira, currency and tx_ref", () => {
  const expected = { amount: 1250, currency: "NGN", reference: "EDK-PAY-1234567890ABCDEF12" };
  assert.equal(matchesStoredFlutterwavePayment({ amount: 1250, currency: "NGN", tx_ref: expected.reference }, expected), true);
  assert.equal(matchesStoredFlutterwavePayment({ amount: 1250.004, currency: "ngn", tx_ref: expected.reference }, expected), true);
  assert.equal(matchesStoredFlutterwavePayment({ amount: 1249.99, currency: "NGN", tx_ref: expected.reference }, expected), false);
  assert.equal(matchesStoredFlutterwavePayment({ amount: 1250, currency: "USD", tx_ref: expected.reference }, expected), false);
  assert.equal(matchesStoredFlutterwavePayment({ amount: 1250, currency: "NGN", tx_ref: "OTHER" }, expected), false);
  assert.equal(matchesStoredFlutterwavePayment(null, expected), false);
  assert.equal(matchesStoredFlutterwavePayment({ amount: 1250, currency: "NGN", tx_ref: expected.reference }, { amount: 0, reference: expected.reference }), false);
});

test("only returns HTTPS Flutterwave-hosted checkout URLs", () => {
  assert.equal(
    getFlutterwaveCheckoutUrl({ status: "success", data: { link: "https://checkout.flutterwave.com/v3/hosted/pay/abc" } }),
    "https://checkout.flutterwave.com/v3/hosted/pay/abc",
  );
  for (const link of [
    "http://checkout.flutterwave.com/abc",
    "https://example.com/fake-checkout",
    "https://checkout.flutterwave.com.evil.example/abc",
    "https://user:pass@checkout.flutterwave.com/abc",
    "https://checkout.flutterwave.com:444/abc",
    "https://checkout.flutterwave.com/",
    "not a URL",
    "",
  ]) assert.equal(getFlutterwaveCheckoutUrl({ status: "success", data: { link } }), null, link);
  assert.equal(getFlutterwaveCheckoutUrl({ status: "error", data: { link: "https://checkout.flutterwave.com/abc" } }), null);
  assert.equal(getFlutterwaveCheckoutUrl(null), null);
});

test("Flutterwave webhook secret-hash header must match exactly", () => {
  assert.equal(isValidFlutterwaveWebhookSignature("my-secret-hash", "my-secret-hash"), true);
  assert.equal(isValidFlutterwaveWebhookSignature("my-secret-hash", "wrong-secret-hash"), false);
  assert.equal(isValidFlutterwaveWebhookSignature("my-secret-hash ", "my-secret-hash"), false);
  assert.equal(isValidFlutterwaveWebhookSignature("", "my-secret-hash"), false);
  assert.equal(isValidFlutterwaveWebhookSignature("my-secret-hash", ""), false);
  assert.equal(isValidFlutterwaveWebhookSignature(null, "my-secret-hash"), false);
});

test("Flutterwave initialization requires explicit test mode and a test secret key", () => {
  assert.equal(isFlutterwaveTestModeEnabled("test", "FLWSECK_TEST-0123456789abcdef"), true);
  assert.equal(isFlutterwaveTestModeEnabled(" TEST ", "FLWSECK_TEST-abc_DEF-123"), true);
  assert.equal(isFlutterwaveTestModeEnabled("live", "FLWSECK_TEST-0123456789abcdef"), false);
  assert.equal(isFlutterwaveTestModeEnabled("test", "FLWSECK-0123456789abcdef"), false);
  assert.equal(isFlutterwaveTestModeEnabled("test", "FLWSECK_LIVE-0123456789abcdef"), false);
  assert.equal(isFlutterwaveTestModeEnabled(undefined, "FLWSECK_TEST-0123456789abcdef"), false);
  assert.equal(isFlutterwaveTestModeEnabled("test", undefined), false);
});

test("Flutterwave callback URL requires a clean HTTPS origin and a valid EDUKEN reference", () => {
  const reference = "EDK-PAY-1234567890ABCDEF12";
  assert.equal(
    getFlutterwaveCallbackUrl("https://eduken-consult.example/", reference),
    "https://eduken-consult.example/make-payments?reference=EDK-PAY-1234567890ABCDEF12&provider=flutterwave",
  );
  for (const siteUrl of [undefined, "", "http://eduken-consult.example/", "https://user:pass@eduken-consult.example/", "https://eduken-consult.example/path", "https://eduken-consult.example/?next=https://evil.example", "https://eduken-consult.example/#fragment", "not a URL"]) {
    assert.equal(getFlutterwaveCallbackUrl(siteUrl, reference), null, String(siteUrl));
  }
  assert.equal(getFlutterwaveCallbackUrl("https://eduken-consult.example/", "invalid-reference"), null);
});
