import { test, expect } from '@playwright/test';

const fixture = {
  opportunities: [{
    id: 'one-click-opportunity',
    title: 'One Click Scholarship Fixture',
    category: 'Scholarship',
    description: 'A concise preview. '.repeat(65),
    eligibility: 'Open to eligible Nigerian undergraduates.',
    deadline: '30 December 2026',
    source_url: 'https://example.org/opportunity',
    is_published: true,
    verified: true,
  }],
  admissions: [],
  updates: [],
  faqs: [{ id: 'faq-one', question: 'How do I view an opportunity?', answer: 'Open the opportunity page and select View details once.' }],
  services: [],
};

async function mockPublicContent(page) {
  await page.route('**/functions/v1/eduken-api/public-content', route =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(fixture),
    }),
  );
}

test('opportunity details expand on the first click and collapse on the next click', async ({ page }) => {
  await mockPublicContent(page);
  await page.goto('/opportunities', { waitUntil: 'domcontentloaded' });

  const card = page.locator('.content-category-card').filter({
    has: page.getByRole('heading', { name: 'One Click Scholarship Fixture' }),
  });
  await expect(card).toBeVisible();

  const detailsButton = card.getByRole('button', { name: 'View details' });
  await expect(detailsButton).toHaveAttribute('aria-expanded', 'false');
  await detailsButton.click();

  const details = card.getByRole('region', { name: 'Full details for One Click Scholarship Fixture' });
  await expect(details).toBeVisible();
  await expect(details).toContainText('Open to eligible Nigerian undergraduates.');
  await expect(details).toContainText('30 December 2026');
  await expect(card.getByRole('button', { name: 'Hide details' })).toHaveAttribute('aria-expanded', 'true');

  await card.getByRole('button', { name: 'Hide details' }).click();
  await expect(details).toHaveCount(0);
});

test('category page text and cards remain readable without horizontal overflow at mobile, desktop-mode and desktop widths', async ({ page }) => {
  await mockPublicContent(page);

  for (const width of [390, 900, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/opportunities', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: 'Opportunities', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'One Click Scholarship Fixture' })).toBeVisible();
    const dimensions = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      content: document.documentElement.scrollWidth,
    }));
    expect(dimensions.content, `horizontal overflow at ${width}px viewport`).toBeLessThanOrEqual(dimensions.viewport + 1);
  }
});

test('category navigation responds to one click', async ({ page }) => {
  await mockPublicContent(page);
  await page.goto('/opportunities', { waitUntil: 'domcontentloaded' });
  await page.getByRole('navigation', { name: 'EDUKEN navigation' }).getByRole('link', { name: 'Admissions' }).click();
  await expect(page).toHaveURL(/\/admissions$/);
  await expect(page.getByRole('heading', { name: 'Admission Guidance & Updates' })).toBeVisible();
});

test('FAQ answer opens on the first click', async ({ page }) => {
  await mockPublicContent(page);
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  const faq = page.locator('.faq-row').filter({
    has: page.getByText('How do I view an opportunity?', { exact: true }),
  });
  const toggle = faq.getByRole('button');
  await expect(toggle).toBeVisible();
  await toggle.click();
  await expect(faq.getByText('Open the opportunity page and select View details once.')).toBeVisible();
});
