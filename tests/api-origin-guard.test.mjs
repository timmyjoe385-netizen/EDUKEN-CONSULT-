import assert from 'node:assert/strict';
import test from 'node:test';
import { shouldBlockWrite } from '../src/lib/api-safety.js';

test('canonical production origin permits write methods', () => {
  for (const method of ['POST', 'PUT', 'PATCH', 'DELETE']) {
    assert.equal(shouldBlockWrite('https://eduken-consult.workers.dev', method), false, method);
  }
});

test('preview origin blocks write methods', () => {
  for (const method of ['POST', 'PUT', 'PATCH', 'DELETE']) {
    assert.equal(
      shouldBlockWrite('https://eduken-consult.timmyjoe385.workers.dev', method),
      true,
      method,
    );
  }
});

test('non-production origins cannot write even if hostname resembles production', () => {
  for (const origin of [
    'http://eduken-consult.workers.dev',
    'https://eduken-consult.workers.dev:8443',
    'https://eduken-consult.workers.dev.example.com',
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
