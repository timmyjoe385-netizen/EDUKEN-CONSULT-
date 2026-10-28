import { test, expect } from '@playwright/test';

test('signed-out student documents panel stays private, visible and responsive across themes', async ({ page }) => {
  await page.addInitScript(() => {
    // Preserve the initial dark preference only on the first page load.
    // On reload, the test's explicit light preference must take effect.
    if (window.sessionStorage.getItem('eduken-deliverables-theme-initialized') !== '1') {
      window.localStorage.setItem('eduken-theme', 'dark');
      window.sessionStorage.setItem('eduken-deliverables-theme-initialized', '1');
    }
  });
  await page.route('**/functions/v1/eduken-api/public-content', route =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        opportunities: [],
        admissions: [],
        updates: [],
        faqs: [],
        services: [],
      }),
    }),
  );

  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  const panel = page.locator('.student-deliverables');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(panel).toBeVisible();
  await expect(panel.getByRole('heading', { name: 'Results and deliverables' })).toBeVisible();
  await expect(panel).toContainText('Only your own published files are shown.');
  await expect(panel.getByRole('status')).toContainText(
    'Sign in to view documents EDUKEN has published for your service requests.',
  );
  await expect(panel.locator('.student-deliverable-row')).toHaveCount(0);
  await expect(panel.getByRole('button', { name: 'Refresh' })).toBeVisible();
  await expect(panel.getByRole('button', { name: /download/i })).toHaveCount(0);

  const dimensions = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    panel: document.querySelector('.student-deliverables')?.getBoundingClientRect().width ?? 0,
  }));
  expect(dimensions.panel).toBeGreaterThan(0);
  expect(dimensions.panel).toBeLessThanOrEqual(dimensions.viewport);

  await page.evaluate(() => window.localStorage.setItem('eduken-theme', 'light'));
  await page.emulateMedia({ colorScheme: 'light' });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await expect(page.locator('.student-deliverables')).toBeVisible();
  await expect(page.locator('.student-deliverables [role="status"]')).toContainText(
    'Sign in to view documents EDUKEN has published for your service requests.',
  );
});
