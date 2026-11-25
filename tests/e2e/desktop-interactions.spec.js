import { test, expect } from '@playwright/test';

const fixture = {
  opportunities: [{
    id: 'one-click-opportunity',
    title: 'One Click Scholarship Fixture',
    category: 'Scholarship',
    description: 'A concise preview. '.repeat(65),
    eligibility: 'Open to eligible Nigerian undergraduates.',
    deadline: '30 December 2026',
    sourceUrl: 'https://example.org/opportunity',
    is_published: true,
    featured: true,
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

test('featured opportunity View details opens the article on the first click', async ({ page }) => {
  await mockPublicContent(page);
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  const featuredCard = page.locator('.spotlight-card').filter({
    has: page.getByRole('heading', { name: 'One Click Scholarship Fixture' }),
  });
  await expect(featuredCard).toBeVisible();
  await featuredCard.getByRole('button', { name: 'View details' }).click();
  await expect(page).toHaveURL(new RegExp("#opportunity/one-click-scholarship-fixture$"));
  await expect(page.locator('.article-page h1').filter({ hasText: 'One Click Scholarship Fixture' })).toBeVisible();
  await expect(page.locator('.article-page')).toContainText('A concise preview.');
});

test('scholarship details expand on the first click and collapse on the next click', async ({ page }) => {
  await mockPublicContent(page);
  await page.goto('/scholarships', { waitUntil: 'domcontentloaded' });
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
  await card.getByRole('button', { name: 'Hide details' }).click();
  await expect(details).toHaveCount(0);
});

test('category page remains readable without horizontal overflow at mobile, desktop-mode and desktop widths', async ({ page }) => {
  await mockPublicContent(page);
  for (const width of [390, 900, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/scholarships', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: 'Scholarships & Grants' })).toBeVisible();
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
  await page.goto('/scholarships', { waitUntil: 'domcontentloaded' });
  await page.getByRole('navigation', { name: 'EDUKEN navigation' }).getByRole('link', { name: 'Admissions' }).click();
  await expect(page).toHaveURL(new RegExp("/admissions$"));
  await expect(page.getByRole('heading', { name: 'Find your next admission opportunity.' })).toBeVisible();
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

test('homepage hero remains readable in Android desktop mode and full desktop widths', async ({ page }) => {
  await mockPublicContent(page);
  for (const width of [390, 900, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const heroHeading = page.locator('.hero h1');
    await expect(heroHeading).toBeVisible();
    const dimensions = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      content: document.documentElement.scrollWidth,
    }));
    expect(dimensions.content, `homepage horizontal overflow at ${width}px viewport`).toBeLessThanOrEqual(dimensions.viewport + 1);
  }
});

test('services dropdown opens on the first click and its destination responds', async ({ page }) => {
  await mockPublicContent(page);
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  const trigger = page.getByRole('button', { name: 'Browse EDUKEN services' });
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  await trigger.click();
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  const menu = page.locator('#eduken-services-menu');
  await expect(menu).toBeVisible();
  await menu.getByRole('link', { name: /View all services/ }).click();
  await expect(page).toHaveURL(new RegExp("/services$"));
  await expect(page.getByRole('heading', { name: 'Educational support, made easier.' })).toBeVisible();
});

test('scholarship details disclosure is keyboard accessible', async ({ page }) => {
  await mockPublicContent(page);
  await page.goto('/scholarships', { waitUntil: 'domcontentloaded' });
  const card = page.locator('.content-category-card').filter({
    has: page.getByRole('heading', { name: 'One Click Scholarship Fixture' }),
  });
  const button = card.getByRole('button', { name: 'View details' });
  await button.focus();
  await page.keyboard.press('Enter');
  await expect(card.getByRole('region', { name: 'Full details for One Click Scholarship Fixture' })).toBeVisible();
});


function relativeLuminance(hex) {
  const channels = hex.match(/[a-f0-9]{2}/gi).map(value => parseInt(value, 16) / 255);
  const linear = channels.map(value => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}

function contrastRatio(foreground, background) {
  const luminances = [relativeLuminance(foreground), relativeLuminance(background)].sort((a, b) => b - a);
  return (luminances[0] + 0.05) / (luminances[1] + 0.05);
}

test('homepage trust statement has readable contrast in light and dark themes at phone, desktop-site and desktop widths', async ({ page }) => {
  await mockPublicContent(page);
  for (const width of [390, 900, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const trustLine = page.locator('.hero .eyebrow-text');
    await expect(trustLine).toBeVisible();

    for (const theme of ['light', 'dark']) {
      if (theme === 'dark') {
        await page.getByRole('button', { name: /Appearance is Light mode/ }).click();
        await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
      }
      const actual = await trustLine.evaluate(element => {
        const style = getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        return { color: style.color, width: rect.width, height: rect.height };
      });
      const rgb = actual.color.match(/\d+/g).slice(0, 3).map(Number);
      const foreground = '#' + rgb.map(value => value.toString(16).padStart(2, '0')).join('');
      const background = theme === 'dark' ? '#101b16' : '#fbfcfa';
      expect(actual.width, `trust statement width at ${width}px in ${theme} mode`).toBeGreaterThan(0);
      expect(actual.height, `trust statement height at ${width}px in ${theme} mode`).toBeGreaterThan(0);
      expect(contrastRatio(foreground, background), `trust statement contrast at ${width}px in ${theme} mode`).toBeGreaterThanOrEqual(4.5);
    }
    await page.evaluate(() => localStorage.setItem('eduken-theme', 'light'));
  }
});
