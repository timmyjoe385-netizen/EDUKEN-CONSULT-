import assert from 'node:assert/strict';
import test from 'node:test';
import { shouldBlockWrite } from '../src/lib/api-safety.js';

test('canonical production origin permits write methods', () => {
  for (const method of ['POST', 'PUT', 'PATCH', 'DELETE']) {
    assert.equal(shouldBlockWrite('https://eduken-consult.timmyjoe385.workers.dev', method), false, method);
  }
});

test('legacy worker hostname is not treated as production', () => {
  for (const method of ['POST', 'PUT', 'PATCH', 'DELETE']) {
    assert.equal(shouldBlockWrite('https://eduken-consult.workers.dev', method), true, method);
  }
});

test('non-production origins cannot write even if hostname resembles production', () => {
  for (const origin of [
    'http://eduken-consult.workers.dev',
    'https://eduken-consult.timmyjoe385.workers.dev:8443',
    'https://eduken-consult.timmyjoe385.workers.dev.example.com',
    'http://localhost:5173',
  ]) {
    assert.equal(shouldBlockWrite(origin, 'POST'), true, origin);
  }
});

test('read-only methods remain allowed on preview origins', () => {
  for (const method of ['GET', 'HEAD', 'OPTIONS', 'get', 'head', 'options']) {
    assert.equal(
      shouldBlockWrite('https://eduken-consult.timmyjoe385.workers.dev', method),
      false,
      method,
    );
  }
});

test('preview writes require explicit opt-in and a separate Supabase backend', () => {
  const preview = 'https://feat-customer-wallet-system-20261016-eduken-consult.timmyjoe385.workers.dev';
  const testBackend = 'https://wpktzogarfqrgkirzdpy.supabase.co';
  const productionBackend = 'https://pphxltbkwygqjtjgkhxu.supabase.co';

  assert.equal(
    shouldBlockWrite(preview, 'POST', { supabaseUrl: testBackend, allowTestWrites: true }),
    false,
    'configured test backend may accept preview writes',
  );
  assert.equal(
    shouldBlockWrite(preview, 'POST', { supabaseUrl: testBackend, allowTestWrites: false }),
    true,
    'preview writes remain blocked without explicit opt-in',
  );
  assert.equal(
    shouldBlockWrite(preview, 'POST', { supabaseUrl: productionBackend, allowTestWrites: true }),
    true,
    'preview can never write to production even if opt-in is set',
  );
  assert.equal(
    shouldBlockWrite('https://eduken-consult.timmyjoe385.workers.dev', 'POST', {
      supabaseUrl: testBackend,
      allowTestWrites: true,
    }),
    true,
    'production origin can never write to the test backend',
  );
});

test('preview public-content and analytics auth use only the isolated Supabase project', async () => {
  const { readFile } = await import('node:fs/promises');
  const { resolve } = await import('node:path');
  const app = await readFile(resolve(process.cwd(), 'src/App.tsx'), 'utf8');
  const worker = await readFile(resolve(process.cwd(), 'worker/index.js'), 'utf8');
  const wrangler = JSON.parse(await readFile(resolve(process.cwd(), 'wrangler.jsonc'), 'utf8'));

  assert.match(app, /api\\.get\\(['"]\\/public-content['"]\\)/);
  assert.doesNotMatch(app, /pphxltbkwygqjtjgkhxu\\.supabase\\.co/);
  assert.match(worker, /env\\.EDUKEN_ENV === ["']preview["']/);
  assert.match(worker, /getSupabaseConfig\\(env\\)/);
  assert.doesNotMatch(worker, /https:\\/\\/pphxltbkwygqjtjgkhxu\\.supabase\\.co\\/functions\\/v1\\/eduken-api\\/public-content/);

  assert.equal(wrangler.env.preview.vars.EDUKEN_ENV, 'preview');
  assert.equal(wrangler.env.preview.vars.SUPABASE_URL, 'https://wpktzogarfqrgkirzdpy.supabase.co');
  assert.match(wrangler.env.preview.vars.SUPABASE_PUBLISHABLE_KEY, /^sb_publishable_/);
});
