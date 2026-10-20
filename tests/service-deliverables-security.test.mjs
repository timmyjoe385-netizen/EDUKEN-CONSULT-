import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync("supabase/functions/eduken-api/index.ts", "utf8");
const migration = readFileSync("supabase/migrations/20261020170000_student_service_deliverables.sql", "utf8");

test("student deliverables listing requires authentication and restricts rows to published files owned by the caller", () => {
  const start = source.indexOf('if (path === "/api/service-deliverables" && req.method === "GET")');
  const end = source.indexOf('if (path.startsWith("/api/service-deliverables/")', start);
  assert.ok(start >= 0 && end > start, "student listing route must exist");
  const route = source.slice(start, end);
  assert.match(route, /await requireUser\(req\)/);
  assert.match(route, /\.eq\("user_id", user\.id\)/);
  assert.match(route, /\.not\("published_at", "is", null\)/);
});

test("download route scopes lookup by user and published state and creates a short-lived signed URL", () => {
  const start = source.indexOf('if (path.startsWith("/api/service-deliverables/")');
  const end = source.indexOf('const adminRequests = path.match(', start);
  assert.ok(start >= 0 && end > start, "student download route must exist");
  const route = source.slice(start, end);
  assert.match(route, /await requireUser\(req\)/);
  assert.match(route, /\.eq\("user_id", user\.id\)/);
  assert.match(route, /\.not\("published_at", "is", null\)/);
  assert.match(route, /createSignedUrl\(item\.storage_path, 60/);
});

test("admin upload endpoints require admin authorization and enforce request/payment/file checks", () => {
  const start = source.indexOf('if (path === "/api/admin/service-deliverables/upload-url" && req.method === "POST")');
  const end = source.indexOf('if (path === "/api/service-deliverables" && req.method === "GET")', start);
  assert.ok(start >= 0 && end > start, "admin deliverable endpoints must exist");
  const route = source.slice(start, end);
  assert.match(route, /await requireAdmin\(req\)/);
  assert.match(route, /createSignedUploadUrl/);
  assert.match(route, /fileSizeBytes/);
  assert.match(route, /15728640|15 \* 1024 \* 1024/);
  assert.match(route, /actualSize !== size/);
  assert.match(route, /payment|Paid|In Progress|Completed/i);
});

test("database migration keeps deliverables private with student ownership RLS and an allowlisted private bucket", () => {
  assert.match(migration, /enable row level security/i);
  assert.match(migration, /user_id = \(select auth\.uid\(\)\) and published_at is not null/i);
  assert.match(migration, /revoke all on public\.service_deliverables from anon/i);
  assert.match(migration, /'eduken-service-deliverables',[\s\S]*?false,[\s\S]*?15728640/);
  assert.match(migration, /application\/pdf/);
});
