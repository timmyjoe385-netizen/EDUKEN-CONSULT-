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
