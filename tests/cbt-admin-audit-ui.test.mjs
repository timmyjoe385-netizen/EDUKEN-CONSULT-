import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

test("CBT question bank admin exposes the stored review and publication audit trail", () => {
  const source = readFileSync("src/CbtQuestionBankAdmin.tsx", "utf8");
  for (const field of [
    "created_by", "created_at", "reviewed_by", "reviewed_at",
    "approved_by", "approved_at", "published_by", "published_at",
  ]) {
    assert.ok(source.includes(field), `Admin question type should include ${field}.`);
  }
  assert.match(source, /Review audit/);
  assert.match(source, /Reviewed: \{auditActor\(q\.reviewed_by\)\}/);
  assert.match(source, /Approved: \{auditActor\(q\.approved_by\)\}/);
  assert.match(source, /Published: \{auditActor\(q\.published_by\)\}/);
});
