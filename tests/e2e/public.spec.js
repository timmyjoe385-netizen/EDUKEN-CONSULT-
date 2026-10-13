import { test, expect } from '@playwright/test';

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
  const authNavigation = page.waitForRequest(
    request => request.isNavigationRequest() && request.url().startsWith(authorizeEndpoint),
  );
  await page.getByRole('button', { name: /admin/i }).click();
  const request = await authNavigation;
  const authUrl = new URL(request.url());

  expect(authUrl.searchParams.get('provider')).toBe('google');
  expect(authUrl.searchParams.get('redirect_to')).toBe(new URL('/', page.url()).origin + '/');
});
