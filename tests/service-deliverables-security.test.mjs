import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync("supabase/functions/eduken-api/index.ts", "utf8");
const app = readFileSync("src/App.tsx", "utf8");
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
  const end = source.indexOf("const adminRequests = path.match(", start);
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
  assert.match(route, /signedUpload\.signedUrl/);
  assert.match(route, /signedUpload\.token/);
  assert.match(route, /fileSizeBytes/);
  assert.match(route, /15728640|15 \* 1024 \* 1024/);
  assert.match(route, /actualSize !== size/);
  assert.match(route, /payment|Paid|In Progress|Completed/i);
  assert.equal((route.match(/from\(["']payments["']\)/g) || []).length, 2, "both upload preparation and publication must query confirmed payments");
  assert.equal((route.match(/eq\(["']service_request_id["'], request\.id\)/g) || []).length, 2, "payment must match the exact service request");
  assert.equal((route.match(/eq\(["']status["'], ["']Paid["']\)/g) || []).length, 2, "payment status must be confirmed as Paid");
});

test("browser uploads directly to the token-bearing signed URL with PUT and only registers metadata after upload succeeds", () => {
  const start = app.indexOf("const uploadServiceDeliverable = async");
  const end = app.indexOf("const submitServiceRequest = async", start);
  assert.ok(start >= 0 && end > start, "admin upload handler must exist");
  const handler = app.slice(start, end);
  assert.match(handler, /prepared\.data\?\.uploadUrl/);
  assert.match(handler, /fetch\(uploadUrl,\s*\{\s*method:\s*'PUT'/);
  assert.match(handler, /'Content-Type': file\.type/);
  assert.match(handler, /if \(!uploaded\.ok\)/);
  assert.ok(handler.indexOf("if (!uploaded.ok)") < handler.indexOf("api.post('/api/admin/service-deliverables'"), "metadata must not be registered before the storage upload succeeds");
});

test("database migration keeps deliverables private with student ownership RLS and an allowlisted private bucket", () => {
  assert.match(migration, /enable row level security/i);
  assert.match(migration, /user_id = \(select auth\.uid\(\)\) and published_at is not null/i);
  assert.match(migration, /revoke all on public\.service_deliverables from anon/i);
  assert.match(migration, /'eduken-service-deliverables',[\s\S]*?false,[\s\S]*?15728640/);
  assert.match(migration, /application\/pdf/);
});


test("selected service requests require a customer account while general enquiries remain available to guests", () => {
  const start = source.indexOf('if (path === "/api/service-requests" && req.method === "POST")');
  const end = source.indexOf('if (path === "/api/service-requests" && req.method === "GET")', start);
  assert.ok(start >= 0 && end > start, "service request route must exist");
  const route = source.slice(start, end);
  assert.match(route, /const user = serviceId \? await requireUser\(req\) : await currentUser\(req\)/);
  assert.match(app, /if \(!auth\.isSignedIn\(\)\)[\s\S]*setCustomerSignInRequest\(current => current \+ 1\)/);
  assert.match(app, /customerSignInRequest=\{customerSignInRequest\}/);
  const hub = readFileSync("src/PlatformHub.tsx", "utf8");
  assert.match(hub, /auth\.signUpWithPassword\(customerEmail, customerPassword\)/);
  assert.match(hub, /New here\? Create an account/);
  assert.match(hub, /Check your email to confirm your account/);
});
