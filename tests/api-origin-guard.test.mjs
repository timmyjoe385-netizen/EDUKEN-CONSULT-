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
