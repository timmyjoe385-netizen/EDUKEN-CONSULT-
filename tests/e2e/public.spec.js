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

test('opportunity deep links open the matching article from the URL fragment', async ({ page }) => {
  await page.route('**/functions/v1/eduken-api/public-content', route =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        opportunities: [{
          id: 'playwright-opportunity',
          slug: 'playwright-deep-link-check',
          title: 'Playwright Deep Link Check',
          category: 'Scholarship',
          description: 'A safe test-only opportunity fixture.',
          content: 'This fixture verifies direct article links.',
          deadline: 'See details',
          is_published: true,
        }],
        admissions: [],
        updates: [],
        faqs: [],
        services: [],
      }),
    }),
  );

  await page.goto('/#opportunity/playwright-deep-link-check', {
    waitUntil: 'domcontentloaded',
  });

  await expect(page.getByRole('heading', {
    level: 1,
    name: 'Playwright Deep Link Check',
  })).toBeVisible();
  await expect(page.locator('.article-page')).toContainText(
    'A safe test-only opportunity fixture.',
  );
  await page.getByRole('button', { name: /Back to Opportunity Hub/i }).click();
  await expect(page).toHaveURL(/#opportunities$/);
});

test('service request dialog validates required fields without sending a request', async ({ page }) => {
  await page.route('**/functions/v1/eduken-api/public-content', route =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        opportunities: [],
        admissions: [],
        updates: [],
        faqs: [],
        services: [{
          id: 'playwright-service-request-check',
          name: 'Playwright Service Request Check',
          category: 'Test fixture',
          description: 'A safe fixture for form validation coverage.',
          price: null,
          is_published: true,
        }],
      }),
    }),
  );

  const submittedRequests = [];
  page.on('request', request => {
    if (
      request.method() === 'POST' &&
      request.url().includes('/api/service-requests')
    ) submittedRequests.push(request.url());
  });

  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: /Request this service/i }).click();

  const dialog = page.getByRole('dialog', {
    name: 'Playwright Service Request Check',
  });
  await expect(dialog).toBeVisible();
  for (const name of ['Full name', 'WhatsApp number', 'Request details']) {
    await expect(dialog.getByRole('textbox', { name })).toHaveAttribute('required', '');
    expect(await dialog.getByRole('textbox', { name }).evaluate(element => element.checkValidity())).toBe(false);
  }

  await dialog.getByRole('button', { name: 'Send service request' }).click();
  await expect(dialog).toBeVisible();
  expect(submittedRequests, 'an empty required form must not call the API').toEqual([]);

  await dialog.getByRole('button', { name: 'Cancel' }).click();
  await expect(dialog).toHaveCount(0);
  expect(submittedRequests, 'closing the dialog must not submit a request').toEqual([]);
});

test('preview safety mode blocks email alert subscriptions without sending a request', async ({ page }) => {
  await page.route('**/functions/v1/eduken-api/public-content', route =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        opportunities: [], admissions: [], updates: [], faqs: [], services: [],
      }),
    }),
  );

  let requestReachedApi = false;
  await page.route('**/functions/v1/eduken-api/api/email-alerts/subscribe', async route => {
    requestReachedApi = true;
    await route.fulfill({
      status: 202,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Mock subscription accepted.' }),
    });
  });

  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.getByLabel('Email address').fill('playwright@example.com');
  await page.getByLabel('Scholarships & grants').uncheck();
  await page.getByLabel('Jobs & internships').uncheck();
  await page.getByLabel('Remote opportunities').check();
  await page.getByRole('button', { name: /Subscribe to free email alerts/i }).click();

  await expect(page.getByRole('status')).toContainText(
    'Preview safety mode: saving is disabled until a separate test database is connected.',
  );
  expect(requestReachedApi, 'preview safety must stop writes before the API request').toBe(false);
});

test('opening an email verification link requires an explicit user confirmation', async ({ page }) => {
  const token = 'a'.repeat(64);
  let requestReachedApi = false;
  await page.route('**/functions/v1/eduken-api/api/email-alerts/verify', async route => {
    requestReachedApi = true;
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Mock verification accepted.' }),
    });
  });

  await page.goto('/?email_alert_verify=' + token + '#admissions', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('dialog')).toContainText('Confirm your email alerts?');
  expect(requestReachedApi, 'opening a link alone must not verify a subscription').toBe(false);
  expect(page.url()).not.toContain('email_alert_verify');
  expect(page.url()).not.toContain(token);
  expect(page.url()).toMatch(/#admissions$/);

  await page.getByRole('button', { name: 'Confirm email alerts' }).click();
  await expect(page.getByRole('status')).toContainText(
    'Preview safety mode: saving is disabled until a separate test database is connected.',
  );
  expect(requestReachedApi, 'preview safety must stop writes before the API request').toBe(false);
});

test('opening an email unsubscribe link requires an explicit user confirmation', async ({ page }) => {
  const token = 'b'.repeat(64);
  let requestReachedApi = false;
  await page.route('**/functions/v1/eduken-api/api/email-alerts/unsubscribe', async route => {
    requestReachedApi = true;
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Mock unsubscribe accepted.' }),
    });
  });

  await page.goto('/?email_alert_unsubscribe=' + token + '#admissions', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('dialog')).toContainText('Unsubscribe from email alerts?');
  expect(requestReachedApi, 'opening a link alone must not unsubscribe a subscriber').toBe(false);
  expect(page.url()).not.toContain('email_alert_unsubscribe');
  expect(page.url()).not.toContain(token);
  expect(page.url()).toMatch(/#admissions$/);

  await page.getByRole('button', { name: 'Yes, unsubscribe' }).click();
  await expect(page.getByRole('status')).toContainText(
    'Preview safety mode: saving is disabled until a separate test database is connected.',
  );
  expect(requestReachedApi, 'preview safety must stop writes before the API request').toBe(false);
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

test('mobile navigation opens and closes accessibly', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  const toggle = page.getByRole('button', { name: 'Open navigation' });
  await expect(toggle).toBeVisible();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await toggle.click();
  await expect(page.getByRole('button', { name: 'Close navigation' })).toHaveAttribute('aria-expanded', 'true');

  const navigation = page.locator('#primary-navigation');
  await expect(navigation).toBeVisible();
  await navigation.getByRole('link', { name: 'Admissions' }).click();
  await expect(page).toHaveURL(/#admissions$/);
  await expect(page.getByRole('button', { name: 'Open navigation' })).toHaveAttribute('aria-expanded', 'false');
});

test('global search results can be cleared accessibly', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  const search = page.getByRole('textbox', { name: 'Search all EDUKEN content' });
  await expect(search).toBeVisible();
  await search.fill('playwright-no-match-check');

  await expect(page.getByRole('region', { name: 'Search results' })).toBeVisible();
  const clear = page.getByRole('button', { name: 'Clear search' });
  await expect(clear).toBeVisible();
  await clear.click();

  await expect(search).toHaveValue('');
  await expect(page.getByRole('region', { name: 'Search results' })).toHaveCount(0);
});

test('global search excludes placeholder updates but keeps real updates searchable', async ({ page }) => {
  await page.route('**/functions/v1/eduken-api/public-content', route =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        opportunities: [],
        admissions: [],
        updates: [
          {
            id: 'placeholder-update-search-check',
            title: 'Updates will appear here',
            body: 'Use the EDUKEN admin dashboard to publish clear, useful updates.',
            category: 'Placeholder',
            date: '2026-10-14',
            is_published: true,
          },
          {
            id: 'playwright-real-update-search-check',
            title: 'Playwright Searchable Update',
            body: 'A safe published update fixture for global-search regression coverage.',
            category: 'Test fixture',
            date: '2026-10-14',
            is_published: true,
          },
        ],
        faqs: [],
        services: [],
      }),
    }),
  );

  await page.goto('/', { waitUntil: 'domcontentloaded' });
  const search = page.getByRole('textbox', { name: 'Search all EDUKEN content' });
  const results = page.getByRole('region', { name: 'Search results' });

  await search.fill('will appear here');
  await expect(results).toBeVisible();
  await expect(results).not.toContainText('Updates will appear here');

  await search.fill('Playwright Searchable Update');
  await expect(results).toContainText('Playwright Searchable Update');
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


test('service request API keeps private endpoints protected without creating records', async ({ request }) => {
  const base = 'https://pphxltbkwygqjtjgkhxu.supabase.co/functions/v1/eduken-api';
  const headers = {
    apikey: 'sb_publishable__qH331oDMJzmjqlOig3C0Q_EIHRa24p',
    'content-type': 'application/json',
  };

  // Keep live production checks read-only or unauthorized. Payload validation
  // is covered locally by the pure validator tests below; never send malformed
  // service-request submissions to the production Edge Function.
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

test('email delivery rechecks current subscription consent immediately before sending', async () => {
  const source = readFileSync('supabase/functions/eduken-api/index.ts', 'utf8');
  const workerStart = source.indexOf('if (path === "/api/internal/email-alerts/process" && req.method === "POST")');
  const consentRecheckAt = source.indexOf('const { data: latestSubscription, error: latestSubscriptionError }', workerStart);
  const sendAt = source.indexOf('const providerMessageId = await sendEmailAlertMessage(', workerStart);
  expect(workerStart).toBeGreaterThanOrEqual(0);
  expect(consentRecheckAt).toBeGreaterThan(workerStart);
  expect(sendAt).toBeGreaterThan(consentRecheckAt);
  const recheck = source.slice(consentRecheckAt, sendAt);
  expect(recheck).toContain('latestSubscription.is_active');
  expect(recheck).toContain('latestSubscription.verified_at');
  expect(recheck).toContain('latestSubscription.topics.includes(topic)');
  expect(recheck).toContain('status: "cancelled"');
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

test('database hardening migration removes direct client access to consultation submissions', async () => {
  const migration = readFileSync(
    'supabase/migrations/20261013150000_harden_public_table_grants.sql',
    'utf8',
  );
  expect(migration).toContain('revoke all privileges on all tables in schema public from public, anon, authenticated;');
  expect(migration).toContain('drop policy if exists "Anyone can submit a consultation" on public.consultations;');
  expect(migration).toContain('do not grant direct client inserts');
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


test('public AI assistant rejects oversized questions before provider work', async () => {
  const handler = readFileSync('supabase/functions/eduken-api/index.ts', 'utf8');
  expect(handler).toContain('typeof b?.question !== "string"');
  expect(handler).toContain('if (question.length > 2000)');
  expect(handler).toContain('Question must be 2000 characters or fewer.');
  expect(handler).toContain('A valid JSON request body is required.');
  expect(
    handler.indexOf('if (question.length > 2000)'),
    'length guard must run before the AI provider call',
  ).toBeLessThan(handler.indexOf('return json({ answer: await aiAnswer(question) });'));
});


test('published admission placeholders stay hidden while real admissions remain visible', async ({ page }) => {
  await page.route('**/functions/v1/eduken-api/public-content', route =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        opportunities: [],
        admissions: [
          {
            id: 'placeholder-universities',
            title: 'Nigerian Universities',
            school: 'Nigerian Universities',
            programme: 'Admission information',
            category: 'University',
            description: '',
            application_url: null,
            deadline: null,
            is_published: true,
          },
          {
            id: 'placeholder-polytechnics',
            title: 'Polytechnics',
            school: 'Polytechnics',
            programme: 'Application information',
            category: 'Polytechnic',
            description: '',
            application_url: null,
            deadline: null,
            is_published: true,
          },
          {
            id: 'placeholder-colleges',
            title: 'Colleges of Education',
            school: 'Colleges of Education',
            programme: 'Programme information',
            category: 'College of Education',
            description: '',
            application_url: null,
            deadline: null,
            is_published: true,
          },
          {
            id: 'specific-admission-without-link-yet',
            title: 'Nigerian Universities',
            school: 'Nigerian Universities',
            programme: 'Computer Science',
            category: 'University',
            description: 'Specific Computer Science admission details are available, but the official application link has not been published yet.',
            application_url: null,
            deadline: null,
            is_published: true,
          },
          {
            id: 'playwright-real-admission',
            title: 'Playwright Test University',
            school: 'Playwright Test University',
            programme: 'Computer Science',
            category: 'University',
            description: 'A clearly identified test-only admission record.',
            application_url: 'https://example.com/apply',
            deadline: '2026-12-31',
            is_published: true,
          },
        ],
        updates: [],
        faqs: [],
        services: [],
      }),
    }),
  );

  await page.goto('/#admissions', { waitUntil: 'domcontentloaded' });
  const admissions = page.locator('#admissions');
  await expect(admissions.getByRole('heading', { name: 'Playwright Test University' })).toBeVisible();
  const specificAdmission = admissions.getByRole('heading', { name: 'Nigerian Universities', exact: true });
  await expect(specificAdmission).toBeVisible();
  await expect(specificAdmission).toHaveCount(1);

  await expect(admissions).not.toContainText('Polytechnics');
  await expect(admissions).not.toContainText('Colleges of Education');
  await expect(admissions).not.toContainText('No matching published admission records yet');
});

test('public opportunity content omits internal notification preferences', () => {
  const handler = readFileSync('supabase/functions/eduken-api/index.ts', 'utf8');
  const publicContent = handler.slice(
    handler.indexOf('async function publicContent()'),
    handler.indexOf('async function scoped('),
  );
  expect(handler).toContain('const publicOpportunity =');
  expect(handler).toContain('key !== "notifyOnPublish"');
  expect(handler).toContain('key !== "notify_on_publish"');
  expect(publicContent).toContain('map(publicOpportunity)');
  expect(publicContent).not.toContain('map(toOpportunity)');
});

test('database hardening migration removes broad client grants and unsafe direct-submit policies', () => {
  const migration = readFileSync(
    'supabase/migrations/20261013150000_harden_public_table_grants.sql',
    'utf8',
  );
  expect(migration).toContain('revoke all privileges on all tables in schema public from public, anon, authenticated;');
  expect(migration).toContain('alter default privileges for role postgres in schema public');
  expect(migration).toContain('drop policy if exists "Anyone can submit a consultation" on public.consultations;');
  expect(migration).toContain('drop policy if exists "Users can create service requests" on public.service_requests;');
  expect(migration).toContain('supabase_admin');
  expect(migration).toContain('cannot alter that role\'s defaults');
});

test('public catalogue queries select only reviewed public fields', () => {
  const handler = readFileSync('supabase/functions/eduken-api/index.ts', 'utf8');
  const publicContent = handler.slice(
    handler.indexOf('async function publicContent()'),
    handler.indexOf('async function scoped('),
  );
  expect(publicContent).toContain(
    'db.from("opportunities").select("id, title, slug, category, description, organization, location, deadline, application_url, official_source, is_published, created_at, updated_at, verified, featured, urgent, content, eligibility, benefits, how_to_apply")',
  );
  expect(publicContent).toContain(
    'db.from("admissions").select("id, title, school, programme, category, description, deadline, application_url, official_source, is_published, created_at, updated_at")',
  );
  expect(publicContent).toContain(
    'db.from("updates").select("id, title, category, content, source, source_url, is_published, created_at, updated_at")',
  );
  expect(publicContent).toContain(
    'db.from("faqs").select("id, question, answer, category, created_at, updated_at")',
  );
  expect(publicContent).toContain(
    'db.from("services").select("id, name, category, description, price, is_published, created_at, updated_at")',
  );
  expect(publicContent).not.toMatch(/db\\.from\\("(?:opportunities|admissions|updates|faqs|services)"\\)\\.select\\("\*"\\)/);
});
