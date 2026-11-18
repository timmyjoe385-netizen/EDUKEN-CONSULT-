import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

test("draft CBT preview is admin-only and hard-gated to the isolated Supabase project", async () => {
  const api = await readFile(new URL("../supabase/functions/eduken-api/index.ts", import.meta.url), "utf8");
  assert.match(api, /const IS_ISOLATED_CBT_PREVIEW = url === "https:\/\/wpktzogarfqrgkirzdpy\.supabase\.co"/);
  assert.match(api, /path === "\/api\/admin\/cbt\/preview\/availability"[\s\S]*?await requireAdmin\(req\)[\s\S]*?if \(!IS_ISOLATED_CBT_PREVIEW\)/);
  assert.match(api, /const previewDrafts = body\.previewDrafts === true;[\s\S]*?await requireAdmin\(req\)[\s\S]*?if \(!IS_ISOLATED_CBT_PREVIEW\)/);
  assert.match(api, /const questionStatus = previewDrafts \? "draft" : "published"/);
  assert.match(api, /\.eq\("status", questionStatus\)/);
});

test("student-facing CBT continues to use published questions unless an isolated admin preview is active", async () => {
  const page = await readFile(new URL("../src/CbtPage.tsx", import.meta.url), "utf8");
  assert.match(page, /usesIsolatedTestBackend &&[\s\S]*?auth\.getUser\(\).*timmyjoe385@gmail\.com/);
  assert.match(page, /api\.get\('\/api\/admin\/cbt\/preview\/availability'\)/);
  assert.match(page, /previewDrafts: usesIsolatedTestBackend/);
  assert.match(page, /ADMIN PREVIEW ONLY/);
});
