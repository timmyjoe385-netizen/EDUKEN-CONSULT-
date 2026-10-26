import test from "node:test";
import assert from "node:assert/strict";
import { parseFlutterwaveVirtualAccount } from "../supabase/functions/eduken-api/flutterwave-virtual-account.mjs";

test("accepts a valid dynamic NGN virtual account and transfer amount", () => {
  assert.deepEqual(parseFlutterwaveVirtualAccount({
    status: "success",
    data: { response_code: "02", account_number: "9519802749", bank_name: "Flutterwave MFB", account_name: "EDUKEN CONSULT", amount: "102.00", expiry_date: "2026-10-25 10:00:00" },
  }), {
    accountNumber: "9519802749",
    bankName: "Flutterwave MFB",
    accountName: "EDUKEN CONSULT",
    transferAmount: 102,
    expiresAt: new Date("2026-10-25 10:00:00").toISOString(),
  });
});

test("rejects missing, malformed, or unsuccessful virtual account responses", () => {
  assert.equal(parseFlutterwaveVirtualAccount(null), null);
  assert.equal(parseFlutterwaveVirtualAccount({ status: "error", data: {} }), null);
  assert.equal(parseFlutterwaveVirtualAccount({ status: "success", data: { response_code: "02", account_number: "ABC123", bank_name: "Bank", amount: 100 } }), null);
  assert.equal(parseFlutterwaveVirtualAccount({ status: "success", data: { response_code: "01", account_number: "1234567890", bank_name: "Bank", amount: 100 } }), null);
  assert.equal(parseFlutterwaveVirtualAccount({ status: "success", data: { response_code: "02", account_number: "1234567890", bank_name: "Bank", amount: "NaN" } }), null);
  assert.equal(parseFlutterwaveVirtualAccount({ status: "success", data: { response_code: "02", account_number: "1234567890", bank_name: "Bank", amount: 100, expiry_date: "not a date" } }), null);
});
