import { test, expect } from '@playwright/test';

const fixture = {
  opportunities: [{
    id: 'navigation-audit-opportunity',
    title: 'Navigation Audit Scholarship',
    slug: 'navigation-audit-scholarship',
    category: 'Scholarship',
    description: 'A published scholarship fixture for navigation checks.',
    eligibility: 'Open to eligible students.',
    deadline: '30 December 2026',
    sourceUrl: 'https://example.org/scholarship',
    link: 'https://example.org/apply',
    is_published: true,
    featured: true,
    verified: true,
  }],
  admissions: [{
    id: 'navigation-audit-admission',
    school: 'Navigation Audit University',
    type: 'Post-UTME',
    course: 'Computer Science',
    details: 'Admission screening fixture.',
    deadline: '30 December 2026',
    link: 'https://example.org/admissions',
    is_published: true,
    verified: true,
  }],
  updates: [{
    id: 'navigation-audit-update',
    title: 'Navigation Audit Education Update',
    category: 'Educational News',
    body: 'A published education update fixture.',
    date: '25 November 2026',
    sourceUrl: 'https://example.org/news',
    is_published: true,
    verified: true,
  }],
  faqs: [],
  services: [],
};

async function mockPublicContent(page) {
  await page.route('**/functions/v1/eduken-api/public-content', route =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(fixture) }),
  );
}

test('student-facing public destinations load the intended page, not the homepage fallback', async ({ page }) => {
  await mockPublicContent(page);
  const destinations = [
    ['/', /Welcome to/i],
    ['/opportunities', /Find opportunities that move you forward/i],
    ['/admissions', /Find your next admission opportunity/i],
    ['/newsroom', /Stay informed\. Stay ahead/i],
    ['/services', /Educational support, made easier/i],
    ['/jamb-news', /JAMB News & Examination Updates/i],
    ['/scholarships', /Scholarships & Grants/i],
    ['/education-news', /Educational News/i],
    ['/school-updates', /School & Institution Updates/i],
    ['/jobs-internships', /Internships & Jobs/i],
    ['/cbt', /EDUKEN CBT|CBT Practice|Create your free student identity/i],
    ['/my-eduken', /Your effort|Results and deliverables|Saved Opportunities|My EDUKEN/i],
    ['/aggregate-calculator', /EDUKEN Aggregate Calculator/i],
  ];

  for (const [path, expected] of destinations) {
    await page.goto(path, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('body'), path + ' should render its intended destination').toContainText(expected);
    if (path !== '/') {
      await expect(page.locator('body')).not.toContainText('Welcome to EDUKEN CONSULT.');
    }
  }
});

test('homepage aggregate calculator card and hero CTA open the real calculator on the first click', async ({ page }) => {
  await mockPublicContent(page);
  await page.goto('/');
  await page.getByRole('link', { name: /Calculate Aggregate/i }).click();
  await expect(page).toHaveURL(/\/aggregate-calculator$/);
  await expect(page.getByRole('heading', { name: 'EDUKEN Aggregate Calculator' })).toBeVisible();

  await page.goto('/');
  await page.locator('.discovery-card').filter({ has: page.getByText('Aggregate Score Calculator', { exact: true }) }).click();
  await expect(page).toHaveURL(/\/aggregate-calculator$/);
  await expect(page.getByRole('heading', { name: 'EDUKEN Aggregate Calculator' })).toBeVisible();
});

test('homepage discovery cards lead to their advertised sections and pages', async ({ page }) => {
  await mockPublicContent(page);
  await page.goto('/');
  const checks = [
    ['CBT Practice', '/cbt', /EDUKEN CBT|CBT Practice|Create your free student identity/i],
    ['Admission Guidance', '/admissions', /Find your next admission opportunity/i],
    ['Scholarships & Grants', '/scholarships', /Scholarships & Grants/i],
    ['Educational News', '/education-news', /Educational News/i],
    ['School Updates', '/school-updates', /School & Institution Updates/i],
    ['Internships & Jobs', '/jobs-internships', /Internships & Jobs/i],
    ['Skills & Training', '/opportunities', /Find opportunities that move you forward/i],
    ['More Services', '/services', /Educational support, made easier/i],
  ];
  for (const [label, url, heading] of checks) {
    await page.goto('/');
    await page.locator('.discovery-card').filter({ has: page.getByText(label, { exact: true }) }).click();
    await expect(page).toHaveURL(new RegExp(url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$'));
    await expect(page.locator('body')).toContainText(heading);
  }

  await page.goto('/');
  await page.locator('.discovery-card').filter({ has: page.getByText('JAMB Services', { exact: true }) }).click();
  await expect(page).toHaveURL(/#jamb-services$/);
  await expect(page.locator('#jamb-services h2')).toHaveText('JAMB Services');

  await page.goto('/');
  await page.locator('.discovery-card').filter({ has: page.getByText('Educational Consultation', { exact: true }) }).click();
  await expect(page).toHaveURL(/#contact$/);
  await expect(page.locator('#contact h2')).toContainText('your next move');
});

test('category quick links and breadcrumb return to the correct destination', async ({ page }) => {
  await mockPublicContent(page);
  await page.goto('/scholarships');
  await page.getByRole('navigation', { name: 'More EDUKEN categories' }).getByRole('link', { name: 'Educational News' }).click();
  await expect(page).toHaveURL(/\/education-news$/);
  await expect(page.getByRole('heading', { name: 'Educational News' })).toBeVisible();
  await page.getByRole('link', { name: 'Home', exact: true }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator('.hero h1')).toBeVisible();
});

test('all student-facing internal links have a non-empty destination and no placeholder href', async ({ page }) => {
  await mockPublicContent(page);
  for (const path of ['/', '/opportunities', '/admissions', '/newsroom', '/services', '/jamb-news', '/scholarships', '/education-news', '/school-updates', '/jobs-internships', '/cbt', '/my-eduken', '/aggregate-calculator']) {
    await page.goto(path, { waitUntil: 'domcontentloaded' });
    const invalid = await page.locator('a:visible').evaluateAll(links => links
      .map(link => ({ text: (link.innerText || link.getAttribute('aria-label') || '').trim(), href: link.getAttribute('href') }))
      .filter(link => !link.href || link.href.trim() === '' || link.href.trim() === '#' || /^javascript:/i.test(link.href)));
    expect(invalid, 'invalid visible links on ' + path).toEqual([]);
  }
});

test('student navigation menu opens and a chosen destination loads on the first click at mobile and desktop-mode widths', async ({ page }) => {
  await mockPublicContent(page);
  for (const width of [390, 900, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    const menuButton = page.getByRole('button', { name: 'Open navigation' });
    if (await menuButton.isVisible()) {
      await menuButton.click();
      await expect(page.locator('#primary-navigation')).toBeVisible();
    }
    const link = page.locator('#primary-navigation').getByRole('link', { name: 'Admissions', exact: true });
    await link.click();
    await expect(page).toHaveURL(/\/admissions$/);
    await expect(page.getByRole('heading', { name: 'Find your next admission opportunity.' })).toBeVisible();
  }
});
