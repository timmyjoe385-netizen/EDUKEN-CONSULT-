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
  assert.equal(
    getFlutterwaveCheckoutUrl({ status: "success", data: { link: "https://checkout-v2.dev-flutterwave.com/pay/abc" } }),
    "https://checkout-v2.dev-flutterwave.com/pay/abc",
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

test("Flutterwave routes stay separate, test-only guarded, and provider-scoped", async () => {
  const { readFile } = await import("node:fs/promises");
  const source = await readFile(new URL("../supabase/functions/eduken-api/index.ts", import.meta.url), "utf8");
  for (const route of [
    'if (path === "/api/flutterwave/payments/webhook" && req.method === "POST")',
    'if (path === "/api/flutterwave/payments/initialize-guest" && req.method === "POST")',
    'if (path === "/api/flutterwave/payments/verify-guest" && req.method === "POST")',
    'if (path === "/api/flutterwave/payments/recover-guest" && req.method === "POST")',
  ]) assert.ok(source.includes(route), "missing Flutterwave route: " + route);
  assert.ok(source.includes('Deno.env.get("FLUTTERWAVE_MODE")'));
  assert.ok(source.includes('Deno.env.get("FLUTTERWAVE_WEBHOOK_HASH")'));
  assert.ok(source.includes('.eq("payment_provider", "flutterwave")'));
  assert.ok(source.includes('.eq("payment_provider", "paystack")'), "Paystack lookups must not settle Flutterwave records");
  assert.ok(source.includes('matchesStoredFlutterwavePayment(transaction'), "Flutterwave settlement must verify amount/currency/reference");
  assert.ok(source.includes('isValidFlutterwaveWebhookSignature(providedHash, webhookHash)'), "webhook signature must be checked before processing");
});

test("Flutterwave payment settlement and notification enqueue remain idempotent", async () => {
  const { readFile } = await import("node:fs/promises");
  const source = await readFile(new URL("../supabase/functions/eduken-api/index.ts", import.meta.url), "utf8");
  const outbox = await readFile(new URL("../supabase/migrations/20261019003835_payment_notification_outbox.sql", import.meta.url), "utf8");
  const walletFix = await readFile(new URL("../supabase/migrations/20261023180000_provider_aware_wallet_deposits.sql", import.meta.url), "utf8");
  const terminalNotificationMigration = await readFile(new URL("../supabase/migrations/20261023190000_terminal_notification_failures.sql", import.meta.url), "utf8");
  const legacyWalletMigration = await readFile(new URL("../supabase/migrations/20261023200000_wallet_deposit_legacy_idempotency.sql", import.meta.url), "utf8");

  assert.match(source, /if \(existingPayment\.status === "Paid"\)/, "duplicate successful webhook must reuse the existing payment");
  assert.match(source, /\.in\("status", \["Pending", "Failed"\]\)/, "settlement updates must be conditional to prevent racing double settlement");
  assert.match(source, /matchesStoredFlutterwavePayment\(transaction/, "provider amount, currency and reference must be checked before settlement");
  assert.match(source, /settle_customer_wallet_deposit/, "wallet deposits must settle through the atomic database function");
  assert.match(source, /paymentNotificationIdempotencyKey/, "payment notifications must have deterministic idempotency keys");
  assert.match(outbox, /idempotency_key text not null unique/i, "notification outbox must enforce unique idempotency keys");
  assert.match(walletFix, /v_provider_prefix := v_payment\.payment_provider \|\| ':'/, "wallet deposit ledger keys must include the actual provider");
  assert.match(walletFix, /'Wallet deposit via ' \|\| v_provider_label/, "wallet deposit ledger descriptions must identify the actual provider");
  assert.match(source, /providerStatus >= 400 && providerStatus < 500 && providerStatus !== 429/, "permanent email 4xx failures must not be retried");
  assert.match(source, /status: permanentFailure \? "failed" : "pending"/, "permanent email provider failures must be marked terminal");
  assert.match(terminalNotificationMigration, /status in \('pending', 'delivered', 'failed'\)/, "outbox schema must permit terminal failures");
  assert.match(legacyWalletMigration, /idempotency_key in \(v_provider_prefix \|\| p_reference, 'paystack:' \|\| p_reference\)/, "already-settled legacy deposits must be recognized without double-crediting");
});

test("provider migration preserves Paystack as the default and constrains supported providers", async () => {
  const { readFile } = await import("node:fs/promises");
  const migration = await readFile(new URL("../supabase/migrations/20261023120000_add_payment_provider.sql", import.meta.url), "utf8");
  assert.match(migration, /add column if not exists payment_provider text not null default 'paystack'/);
  assert.match(migration, /check \(payment_provider in \('paystack', 'flutterwave'\)\)/);
});
