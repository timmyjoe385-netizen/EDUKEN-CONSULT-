import { test, expect } from '@playwright/test';

test('CBT page safely explains when no questions have been published', async ({ page }) => {
  await page.route('**/functions/v1/eduken-api/api/cbt/questions*', route =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ items: [] }),
    })
  );

  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/cbt', { waitUntil: 'domcontentloaded' });

  await expect(page.getByRole('heading', { name: /Prepare with purpose/i })).toBeVisible();
  await expect(page.getByText(/No questions have been published yet/i)).toBeVisible();
  await expect(page.getByRole('button', { name: /Start free practice/i })).toBeDisabled();
  await expect(page.getByRole('button', { name: /Start mixed mock/i })).toBeDisabled();

  const dimensions = await page.evaluate(() => ({
    viewport: window.innerWidth,
    document: document.documentElement.scrollWidth,
    body: document.body.scrollWidth,
  }));
  expect(
    Math.max(dimensions.document, dimensions.body),
    `CBT page should not overflow horizontally on mobile: ${JSON.stringify(dimensions)}`
  ).toBeLessThanOrEqual(dimensions.viewport + 1);
});

test('CBT practice fallback supports navigation, flagging and answer review', async ({ page }) => {
  await page.route('**/functions/v1/eduken-api/api/cbt/questions*', route => route.abort());
  await page.goto('/cbt', { waitUntil: 'domcontentloaded' });

  await expect(page.getByText(/original starter samples are being used/i)).toBeVisible();
  await page.getByRole('button', { name: /Start free practice/i }).click();
  await expect(page.getByText('Question 1 of 2')).toBeVisible();

  await page.getByRole('button', { name: /Review later/i }).click();
  await expect(page.getByRole('button', { name: /Flagged/i })).toBeVisible();
  await page.getByRole('button', { name: /Next question/i }).click();
  await expect(page.getByText('Question 2 of 2')).toBeVisible();
  await page.getByRole('button', { name: /Submit practice/i }).click();
  await expect(page.getByRole('heading', { name: 'Answer review' })).toBeVisible();
});
