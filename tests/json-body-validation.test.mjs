import test from "node:test";
import assert from "node:assert/strict";
import { parseJsonObjectBody } from "../supabase/functions/eduken-api/json-body-validation.mjs";

test("accepts JSON object request bodies", () => {
  assert.deepEqual(parseJsonObjectBody('{"status":"completed"}'), {
    valid: true,
    value: { status: "completed" },
  });
  assert.deepEqual(parseJsonObjectBody("{}"), { valid: true, value: {} });
});

test("rejects malformed JSON with a client-error message", () => {
  assert.deepEqual(parseJsonObjectBody('{"status":'), {
    valid: false,
    error: "A valid JSON request body is required.",
  });
});

test("rejects JSON primitives, null, and arrays as request bodies", () => {
  for (const body of ["null", "true", "42", '"text"', "[]"]) {
    assert.deepEqual(parseJsonObjectBody(body), {
      valid: false,
      error: "A JSON object request body is required.",
    }, body);
  }
});
