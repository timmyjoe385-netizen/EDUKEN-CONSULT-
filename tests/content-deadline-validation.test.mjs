import test from "node:test";
import assert from "node:assert/strict";
import { normalizeContentDeadline } from "../supabase/functions/eduken-api/content-deadline-validation.mjs";

test("accepts valid ISO date-only deadlines", () => {
  assert.equal(normalizeContentDeadline("2026-10-22"), "2026-10-22");
});

test("rejects impossible ISO calendar dates", () => {
  assert.equal(normalizeContentDeadline("2026-02-30"), undefined);
});

test("normalizes human-readable dates with ordinal suffixes", () => {
  assert.equal(normalizeContentDeadline("21st October 2026"), "2026-10-21");
});

test("ignores parenthetical deadline notes", () => {
  assert.equal(normalizeContentDeadline("21st October 2026 (tomorrow)"), "2026-10-21");
});

test("stores blank optional deadlines as null", () => {
  assert.equal(normalizeContentDeadline("   "), null);
});

test("rejects unparseable deadline text", () => {
  assert.equal(normalizeContentDeadline("not a real deadline"), undefined);
});
