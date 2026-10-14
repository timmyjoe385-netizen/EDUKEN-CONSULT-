import test from "node:test";
import assert from "node:assert/strict";
import { isOpportunityVerified, validateOpportunityVerification } from "../supabase/functions/eduken-api/opportunity-verification-validation.mjs";

test("unverified opportunities may be saved without an official source", () => {
  assert.deepEqual(validateOpportunityVerification({ verified: false }), { valid: true });
  assert.deepEqual(validateOpportunityVerification({}), { valid: true });
});

test("editorially verified opportunities may omit an official source URL", () => {
  assert.deepEqual(validateOpportunityVerification({ verified: true, official_source: "" }), { valid: true });
  assert.deepEqual(validateOpportunityVerification({ verified: "true" }), { valid: true });
  assert.deepEqual(validateOpportunityVerification({ verified: true }), { valid: true });
});

test("verified opportunities accept valid HTTP(S) source URLs", () => {
  assert.deepEqual(
    validateOpportunityVerification({ verified: true, official_source: "https://example.org/apply" }),
    { valid: true },
  );
  assert.deepEqual(
    validateOpportunityVerification({ verified: true, official_source: "http://example.org/source" }),
    { valid: true },
  );
});

test("verified opportunities reject a supplied malformed, unsafe, or credentialed source URL", () => {
  for (const official_source of ["not-a-url", "javascript:alert(1)", "ftp://example.org/file", "https://user:pass@example.org"]) {
    assert.equal(
      validateOpportunityVerification({ verified: true, official_source }).valid,
      false,
      `expected ${JSON.stringify(official_source)} to be rejected`,
    );
  }
});

test("public verified badge follows the editorial flag, whether or not a source URL exists", () => {
  assert.equal(isOpportunityVerified({ verified: true, official_source: "https://example.org/source" }), true);
  assert.equal(isOpportunityVerified({ verified: true, official_source: "" }), true);
  assert.equal(isOpportunityVerified({ verified: true }), true);
  assert.equal(isOpportunityVerified({ verified: "yes" }), true);
  assert.equal(isOpportunityVerified({ verified: false, official_source: "https://example.org/source" }), false);
  assert.equal(isOpportunityVerified({ verified: "false", official_source: "" }), false);
});
