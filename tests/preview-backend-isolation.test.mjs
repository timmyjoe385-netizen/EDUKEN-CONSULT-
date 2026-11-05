import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';

test('preview frontend content reads use the configured isolated API client', async () => {
  const app = await readFile(new URL('../src/App.tsx', import.meta.url), 'utf8');
  assert.match(app, /api\.get\(['"]\/public-content['"]\)/);
  assert.doesNotMatch(app, /pphxltbkwygqjtjgkhxu\.supabase\.co/);
});

test('preview Worker Supabase requests fail closed and use preview environment bindings', async () => {
  const worker = await readFile(new URL('../worker/index.js', import.meta.url), 'utf8');
  const config = JSON.parse(await readFile(new URL('../wrangler.jsonc', import.meta.url), 'utf8'));
  assert.match(worker, /env\.EDUKEN_ENV === ["']preview["']/);
  assert.match(worker, /if \(isPreview\)[\s\S]*?return null/);
  assert.match(worker, /getLiveContent\(env\)/);
  assert.match(worker, /isAnalyticsAdmin\(request, env\)/);
  assert.doesNotMatch(worker, /https:\/\/pphxltbkwygqjtjgkhxu\.supabase\.co\/functions\/v1\/eduken-api\/public-content/);
  assert.equal(config.env.preview.vars.EDUKEN_ENV, 'preview');
  assert.equal(config.env.preview.vars.SUPABASE_URL, 'https://wpktzogarfqrgkirzdpy.supabase.co');
  assert.match(config.env.preview.vars.SUPABASE_PUBLISHABLE_KEY, /^sb_publishable_/);
});
