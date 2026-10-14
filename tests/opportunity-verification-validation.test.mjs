import test from "node:test";
import assert from "node:assert/strict";
import { isOpportunityVerified, validateOpportunityVerification } from "../supabase/functions/eduken-api/opportunity-verification-validation.mjs";

test("unverified opportunities may be saved without an official source", () => {
  assert.deepEqual(validateOpportunityVerification({ verified: false }), { valid: true });
  assert.deepEqual(validateOpportunityVerification({}), { valid: true });
});

test("verified opportunities require an HTTP(S) official source URL", () => {
  assert.deepEqual(
    validateOpportunityVerification({ verified: true, official_source: "https://example.org/apply" }),
    { valid: true },
  );
  assert.deepEqual(
    validateOpportunityVerification({ verified: true, official_source: "http://example.org/source" }),
    { valid: true },
  );
  assert.equal(
    validateOpportunityVerification({ verified: "true", official_source: "" }).valid,
    false,
  );
});

test("verified opportunities reject missing, malformed, unsafe, or credentialed source URLs", () => {
  for (const official_source of ["", "not-a-url", "javascript:alert(1)", "ftp://example.org/file", "https://user:pass@example.org"]) {
    assert.equal(
      validateOpportunityVerification({ verified: true, official_source }).valid,
      false,
      `expected ${JSON.stringify(official_source)} to be rejected`,
    );
  }
});

test("public verified badge requires a valid official source", () => {
  assert.equal(isOpportunityVerified({ verified: true, official_source: "https://example.org/source" }), true);
  assert.equal(isOpportunityVerified({ verified: true, official_source: "" }), false);
  assert.equal(isOpportunityVerified({ verified: true, official_source: "javascript:alert(1)" }), false);
  assert.equal(isOpportunityVerified({ verified: false, official_source: "https://example.org/source" }), false);
});
