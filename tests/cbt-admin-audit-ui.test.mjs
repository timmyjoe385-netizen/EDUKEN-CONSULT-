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
  for (const marker of [
    "Review audit",
    "Reviewed: {auditActor(q.reviewed_by)}",
    "Approved: {auditActor(q.approved_by)}",
    "Published: {auditActor(q.published_by)}",
    "pageSize: String(pageSize)",
    "params.set('q', search.trim())",
    "setTotal(Number(result.data?.total ?? nextItems.length))",
    "Page {page} of {totalPages}",
    "Previous",
    "Next",
  ]) {
    assert.ok(source.includes(marker), `Admin question-bank UI should include ${marker}.`);
  }
  for (const marker of [
    'select("*", { count: "exact" })',
    "query.range(start, start + pageSize - 1)",
    "total: count ?? 0, page, pageSize",
  ]) {
    assert.ok(api.includes(marker), `Admin question API should include ${marker}.`);
  }
});


test("subject filter is sent to the paginated admin API and applied server-side", () => {
  const source = readFileSync("src/CbtQuestionBankAdmin.tsx", "utf8");
  const api = readFileSync("supabase/functions/eduken-api/index.ts", "utf8");
  assert.ok(source.includes("const [subject,setSubject] = useState('all')"));
  assert.ok(source.includes("params.set('subject', subject)"));
  assert.ok(source.includes("[filter,subject,search,page]"));
  assert.ok(source.includes("All subjects"));
  for (const subject of ["Use of English", "Mathematics", "Biology", "Chemistry", "Physics", "Economics", "Government", "Literature in English"]) {
    assert.ok(source.includes(subject), `Subject dropdown should include ${subject}.`);
  }
  assert.ok(api.includes('const subject = (params.get("subject") || "").trim()'));
  assert.ok(api.includes('if (subject) query = query.eq("subject", subject)'));
  assert.ok(api.includes("query.range(start, start + pageSize - 1)"));
});

test("review workflow remains an explicit draft-to-reviewed-to-approved-to-published sequence", () => {
  const source = readFileSync("src/CbtQuestionBankAdmin.tsx", "utf8");
  assert.ok(source.includes("q.status==='draft'?<button"));
  assert.ok(source.includes("transition(q,'reviewed')"));
  assert.ok(source.includes("q.status==='reviewed'?<button"));
  assert.ok(source.includes("transition(q,'approved')"));
  assert.ok(source.includes("q.status==='approved'?<button"));
  assert.ok(source.includes("transition(q,'published')"));
  assert.ok(source.includes("All imported questions remain drafts"));
});
