import { test, expect } from '@playwright/test';

const fixture = {
  opportunities: [{
    id: 'readability-scholarship',
    title: 'EDUKEN Scholarship Test',
    category: 'Scholarship',
    description: 'A published scholarship announcement with clear details for eligible students.',
    eligibility: 'Open to eligible Nigerian undergraduates.',
    deadline: '30 December 2026',
    source_url: 'https://example.org/scholarship',
    is_published: true,
    featured: true,
    verified: true,
  }],
  admissions: [],
  updates: [],
  faqs: [],
  services: [],
};

async function mockPublicContent(page) {
  await page.route('**/functions/v1/eduken-api/public-content', route =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(fixture) }),
  );
}

test('scholarship details open on the first click and can be closed', async ({ page }) => {
  await mockPublicContent(page);
  await page.goto('/scholarships', { waitUntil: 'domcontentloaded' });
  const card = page.locator('.content-category-card').filter({
    has: page.getByRole('heading', { name: 'EDUKEN Scholarship Test' }),
  });
  await expect(card).toBeVisible();
  await card.getByRole('button', { name: 'View details' }).click();
  const details = card.getByRole('region', { name: 'Full details for EDUKEN Scholarship Test' });
  await expect(details).toBeVisible();
  await expect(details).toContainText('Open to eligible Nigerian undergraduates.');
  await card.getByRole('button', { name: 'Hide details' }).click();
  await expect(details).toHaveCount(0);
});

test('category search filters published information and clears on one click', async ({ page }) => {
  await mockPublicContent(page);
  await page.goto('/scholarships', { waitUntil: 'domcontentloaded' });
  const search = page.getByRole('searchbox', { name: 'Search this section' });
  await search.fill('no-such-scholarship');
  await expect(page.getByText('No matching information found. Try another search.')).toBeVisible();
  await page.getByRole('button', { name: 'Clear search' }).click();
  await expect(search).toHaveValue('');
  await expect(page.getByRole('heading', { name: 'EDUKEN Scholarship Test' })).toBeVisible();
});

test('homepage and category pages remain readable without horizontal overflow at phone, desktop-mode and desktop widths', async ({ page }) => {
  await mockPublicContent(page);
  for (const width of [390, 900, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('.hero')).toBeVisible();
    let dimensions = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      content: document.documentElement.scrollWidth,
    }));
    expect(dimensions.content, `homepage horizontal overflow at ${width}px`).toBeLessThanOrEqual(dimensions.viewport + 1);

    await page.goto('/scholarships', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: 'Scholarships & Grants' })).toBeVisible();
    dimensions = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      content: document.documentElement.scrollWidth,
    }));
    expect(dimensions.content, `category horizontal overflow at ${width}px`).toBeLessThanOrEqual(dimensions.viewport + 1);
  }
});

test('homepage discovery card opens Scholarships on the first click', async ({ page }) => {
  await mockPublicContent(page);
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.locator('.discovery-card').filter({ hasText: 'Scholarships & Grants' }).click();
  await expect(page).toHaveURL(/\/scholarships$/);
  await expect(page.getByRole('heading', { name: 'Scholarships & Grants' })).toBeVisible();
});
