import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { isAllowedServiceRequestStatus, validateServiceRequestBody } from '../../supabase/functions/eduken-api/service-request-validation.mjs';

const publicContentUrl =
  'https://pphxltbkwygqjtjgkhxu.supabase.co/functions/v1/eduken-api/public-content';

test('live homepage loads and renders EDUKEN content', async ({ page }) => {
  const uncaughtErrors = [];
  page.on('pageerror', error => uncaughtErrors.push(error.message));

  const response = await page.goto('/', { waitUntil: 'domcontentloaded' });
  expect(response, 'homepage should return a document response').not.toBeNull();
  expect(response.status(), 'homepage should return HTTP 200').toBe(200);
  await expect(page).toHaveTitle(/EDUKEN CONSULT/i);
  await expect(page.locator('#root')).not.toBeEmpty();
  await expect(page.locator('body')).toContainText(/EDUKEN/i);
  expect(uncaughtErrors, 'page should not throw uncaught JavaScript errors').toEqual([]);
});

test('public content API returns the expected data structure', async ({ request }) => {
  const response = await request.get(publicContentUrl, {
    headers: { apikey: 'sb_publishable__qH331oDMJzmjqlOig3C0Q_EIHRa24p' },
    timeout: 20_000,
  });

  expect(response.status(), 'public content API should return HTTP 200').toBe(200);
  const content = await response.json();
  for (const key of ['opportunities', 'admissions', 'updates', 'faqs', 'services']) {
    expect(content, `API response should include ${key}`).toHaveProperty(key);
    expect(Array.isArray(content[key]), `${key} should be an array`).toBe(true);
  }
});

test('homepage remains usable at a mobile viewport', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  const response = await page.goto('/', { waitUntil: 'domcontentloaded' });
  expect(response?.status()).toBe(200);
  await expect(page.locator('#root')).not.toBeEmpty();
  await expect(page.locator('body')).toContainText(/EDUKEN/i);

  const dimensions = await page.evaluate(() => ({
    viewportWidth: document.documentElement.clientWidth,
    pageWidth: document.documentElement.scrollWidth,
  }));
  expect(
    dimensions.pageWidth,
    `mobile page should not overflow horizontally: ${JSON.stringify(dimensions)}`,
  ).toBeLessThanOrEqual(dimensions.viewportWidth + 1);
});

test('admin APIs reject unauthenticated reads and writes', async ({ request }) => {
  const base = 'https://pphxltbkwygqjtjgkhxu.supabase.co/functions/v1/eduken-api';
  const headers = { apikey: 'sb_publishable__qH331oDMJzmjqlOig3C0Q_EIHRa24p' };

  // These requests intentionally omit a user session. The API must reject
  // them before any database read/write can occur.
  const checks = [
    ['GET', '/api/admin/content/opportunities'],
    ['POST', '/api/admin/content/opportunities'],
    ['PUT', '/api/admin/content/opportunities/playwright-unauthenticated-test'],
    ['DELETE', '/api/admin/content/opportunities/playwright-unauthenticated-test'],
    ['GET', '/api/admin/consultations'],
    ['PUT', '/api/admin/consultations/playwright-unauthenticated-test'],
  ];

  for (const [method, path] of checks) {
    const response = await request.fetch(base + path, {
      method,
      headers: { ...headers, 'content-type': 'application/json' },
      data: method === 'POST' || method === 'PUT' ? { title: 'Playwright unauthenticated test' } : undefined,
      timeout: 20_000,
    });
    expect(
      response.status(),
      `${method} ${path} should reject requests without an authenticated admin session`,
    ).toBe(401);
  }
});


test('service request API rejects malformed and oversized submissions safely', async ({ request }) => {
  const base = 'https://pphxltbkwygqjtjgkhxu.supabase.co/functions/v1/eduken-api';
  const headers = {
    apikey: 'sb_publishable__qH331oDMJzmjqlOig3C0Q_EIHRa24p',
    'content-type': 'application/json',
  };
  // Only send blank submissions to the live API: these are guaranteed to be rejected
  // before inserts even if the currently deployed Edge Function lags behind this PR.
  const invalidPayloads = [
    {},
    { customerName: '   ', whatsapp: '08000000000', details: 'Test request' },
    { customerName: 'Test user', whatsapp: '   ', details: 'Test request' },
    { customerName: 'Test user', whatsapp: '08000000000', details: '   ' },
  ];

  for (const payload of invalidPayloads) {
    const response = await request.post(base + '/api/service-requests', {
      headers,
      data: payload,
      timeout: 20_000,
    });
    const responseBody = await response.text();
    expect(response.status(), `invalid request should return 400; payload=${JSON.stringify(payload)}; response=${responseBody.slice(0, 300)}`).toBe(400);
  }

  const privateRead = await request.get(base + '/api/service-requests', {
    headers: { apikey: headers.apikey },
    timeout: 20_000,
  });
  expect(privateRead.status(), 'customer request history must require sign-in').toBe(401);

  const adminList = await request.get(base + '/api/admin/service-requests', {
    headers: { apikey: headers.apikey },
    timeout: 20_000,
  });
  expect(adminList.status(), 'service request administration must require an authorized admin').toBe(401);

  const adminUpdate = await request.put(base + '/api/admin/service-requests/00000000-0000-0000-0000-000000000000', {
    headers,
    data: { status: 'Completed' },
    timeout: 20_000,
  });
  expect(adminUpdate.status(), 'service request status changes must require an authorized admin').toBe(401);
});


test('service request validator rejects invalid payloads before database writes', async () => {
  const valid = { customerName: '  Ada Example  ', whatsapp: '  08012345678 ', details: '  Please advise  ', email: ' ada@example.com ' };
  const result = validateServiceRequestBody(valid);
  expect(result.error).toBeUndefined();
  expect(result.data).toEqual({
    customerName: 'Ada Example',
    whatsapp: '08012345678',
    details: 'Please advise',
    email: 'ada@example.com',
    serviceId: null,
  });

  for (const payload of [
    null,
    [],
    {},
    { customerName: 42, whatsapp: '08012345678', details: 'Request' },
    { customerName: 'Ada', whatsapp: false, details: 'Request' },
    { customerName: 'Ada', whatsapp: '08012345678', details: ['Request'] },
    { customerName: '   ', whatsapp: '08012345678', details: 'Request' },
    { customerName: 'Ada', whatsapp: '08012345678', details: '   ' },
    { customerName: 'A'.repeat(121), whatsapp: '08012345678', details: 'Request' },
    { customerName: 'Ada', whatsapp: '0'.repeat(41), details: 'Request' },
    { customerName: 'Ada', whatsapp: '08012345678', details: 'D'.repeat(4001) },
    { customerName: 'Ada', whatsapp: '08012345678', details: 'Request', email: 'x'.repeat(201) + '@example.com' },
    { customerName: 'Ada', whatsapp: '08012345678', details: 'Request', email: 'not-an-email' },
    { customerName: 'Ada', whatsapp: '08012345678', details: 'Request', serviceId: 123 },
  ]) {
    expect(validateServiceRequestBody(payload).error, 'payload must be rejected: ' + JSON.stringify(payload).slice(0, 120)).toBeTruthy();
  }
});

test('service request statuses use an explicit allowlist', async () => {
  for (const status of ['New Requests', 'Contacted', 'In Progress', 'Completed', 'Cancelled']) {
    expect(isAllowedServiceRequestStatus(status)).toBe(true);
  }
  for (const status of ['Paid', 'Admin', 'anything', '', null, 7, {}]) {
    expect(isAllowedServiceRequestStatus(status)).toBe(false);
  }
});

test('service request route validates before inserting into the database', async () => {
  const source = readFileSync('supabase/functions/eduken-api/index.ts', 'utf8');
  const routeStart = source.indexOf('if (path === "/api/service-requests" && req.method === "POST")');
  const validationAt = source.indexOf('validateServiceRequestBody(b)', routeStart);
  const insertAt = source.indexOf('.from("service_requests").insert({', routeStart);
  expect(routeStart).toBeGreaterThanOrEqual(0);
  expect(validationAt).toBeGreaterThan(routeStart);
  expect(insertAt).toBeGreaterThan(validationAt);
  expect(source).toContain('isAllowedServiceRequestStatus(b.status)');
});

test('homepage Admin button starts the Google OAuth flow', async ({ page }) => {
  const authorizeEndpoint = 'https://pphxltbkwygqjtjgkhxu.supabase.co/auth/v1/authorize';

  // Stub the OAuth navigation so CI verifies the hand-off without logging in
  // or opening a real Google account.
  await page.route(authorizeEndpoint + '**', route =>
    route.fulfill({
      status: 200,
      contentType: 'text/html',
      body: '<!doctype html><title>OAuth hand-off intercepted by Playwright</title>',
    }),
  );

  await page.goto('/', { waitUntil: 'domcontentloaded' });
  const siteOrigin = new URL(page.url()).origin;
  const authNavigation = page.waitForRequest(
    request => request.isNavigationRequest() && request.url().startsWith(authorizeEndpoint),
  );
  await page.getByRole('button', { name: /admin/i }).click();
  const request = await authNavigation;
  const authUrl = new URL(request.url());

  expect(authUrl.searchParams.get('provider')).toBe('google');
  expect(authUrl.searchParams.get('redirect_to')).toBe(siteOrigin + '/');
});
