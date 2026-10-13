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

test('admin content and consultation APIs reject unauthenticated access', async ({ request }) => {
  const adminContent = await request.get(
    'https://pphxltbkwygqjtjgkhxu.supabase.co/functions/v1/eduken-api/api/admin/content/opportunities',
    { headers: { apikey: 'sb_publishable__qH331oDMJzmjqlOig3C0Q_EIHRa24p' }, timeout: 20_000 },
  );
  expect(adminContent.status(), 'admin content must require an authenticated administrator').toBe(401);

  const adminConsultations = await request.get(
    'https://pphxltbkwygqjtjgkhxu.supabase.co/functions/v1/eduken-api/api/admin/consultations',
    { headers: { apikey: 'sb_publishable__qH331oDMJzmjqlOig3C0Q_EIHRa24p' }, timeout: 20_000 },
  );
  expect(adminConsultations.status(), 'consultation records must require an authenticated administrator').toBe(401);
});

test('public page exposes the admin sign-in entry without opening an authenticated session', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('button', { name: /admin/i })).toBeVisible();
});
