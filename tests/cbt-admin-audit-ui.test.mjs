import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

test("CBT question bank admin exposes the stored review audit and paginates the complete bank", () => {
  const source = readFileSync("src/CbtQuestionBankAdmin.tsx", "utf8");
  const api = readFileSync("supabase/functions/eduken-api/index.ts", "utf8");
  for (const field of [
    "created_by", "created_at", "reviewed_by", "reviewed_at",
    "approved_by", "approved_at", "published_by", "published_at",
  ]) {
    assert.ok(source.includes(field), `Admin question type should include ${field}.`);
  }
  assert.match(source, /Review audit/);
  assert.match(source, /Reviewed: \\{auditActor\\(q\\.reviewed_by\\)\\}/);
  assert.match(source, /Approved: \\{auditActor\\(q\\.approved_by\\)\\}/);
  assert.match(source, /Published: \\{auditActor\\(q\\.published_by\\)\\}/);
  assert.match(source, /pageSize: String\\(pageSize\\)/);
  assert.match(source, /params\\.set\\('q', search\\.trim\\(\\)\\)/);
  assert.match(source, /setTotal\\(Number\\(result\\.data\\?\\.total/);
  assert.match(source, /Page \\{page\\} of \\{totalPages\\}/);
  assert.match(source, /Previous/);
  assert.match(source, /Next/);
  assert.match(api, /select\\("\\*", \\{ count: "exact" \\}\\)/);
  assert.match(api, /query\\.range\\(start, start \\+ pageSize - 1\\)/);
  assert.match(api, /total: count \\?\\? 0, page, pageSize/);
});
