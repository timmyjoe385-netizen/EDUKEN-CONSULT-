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

test('admission deep links scroll directly to the matching published admission post', async ({ page }) => {
  await page.route('**/functions/v1/eduken-api/public-content', route =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        opportunities: [],
        admissions: [{
          id: 'admission-deep-link-check',
          school: 'Playwright Admission Deep Link Check',
          course: 'Linguistics',
          type: 'Undergraduate admission',
          details: 'A safe test-only admission post.',
          deadline: '31 October 2026',
          is_published: true,
        }],
        updates: [],
        faqs: [],
        services: [],
      }),
    }),
  );

  await page.goto('/#admission/admission-deep-link-check', {
    waitUntil: 'domcontentloaded',
  });

  const card = page.locator('#admission-admission-deep-link-check');
  await expect(card).toBeVisible();
  await expect(card).toContainText('Playwright Admission Deep Link Check');
  await expect(card).toContainText('Linguistics');
  await expect(card).toContainText('31 October 2026');
  await expect(page).toHaveURL(/#admission\\/admission-deep-link-check$/);
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

test('O’Level readiness counts distinct subjects rather than duplicate entries', async ({ page }) => {
  await page.goto('/aggregate-calculator', { waitUntil: 'domcontentloaded' });

  const addSubject = page.getByRole('button', { name: '+ Add O’Level subject' });
  for (let index = 0; index < 5; index += 1) await addSubject.click();

  const rows = page.locator('.aggregate-extra-grade-row');
  for (let index = 0; index < 5; index += 1) {
    await rows.nth(index).getByLabel(new RegExp(`Subject ${index + 1}`)).fill(index < 5 ? 'English Language' : 'Mathematics');
    await rows.nth(index).getByLabel('Grade').selectOption('C6');
  }

  await expect(page.locator('.aggregate-assessment-stat').filter({ hasText: 'Credit grades entered' }).locator('strong')).toHaveText('1');
  await expect(page.getByText('Five credit grades not yet recorded')).toBeVisible();
  await expect(page.getByText('English Language credit recorded')).toBeVisible();
  await expect(page.getByText('Mathematics credit not confirmed')).toBeVisible();
  await expect(page.getByText(/duplicate subject entries were found/i)).toBeVisible();
});

test('O’Level readiness normalizes English and Mathematics aliases before deduplicating', async ({ page }) => {
  await page.goto('/aggregate-calculator', { waitUntil: 'domcontentloaded' });

  const addSubject = page.getByRole('button', { name: '+ Add O’Level subject' });
  for (let index = 0; index < 5; index += 1) await addSubject.click();

  const rows = page.locator('.aggregate-extra-grade-row');
  const entries = [
    ['English', 'C6'],
    ['English Language', 'C5'],
    ['Math', 'C6'],
    ['Maths', 'B3'],
    ['Biology', 'A1'],
  ];

  for (const [index, [subject, grade]] of entries.entries()) {
    await rows.nth(index).getByLabel(new RegExp(`Subject ${index + 1}`)).fill(subject);
    await rows.nth(index).getByLabel('Grade').selectOption(grade);
  }

  await expect(page.locator('.aggregate-assessment-stat').filter({ hasText: 'Credit grades entered' }).locator('strong')).toHaveText('3');
  await expect(page.getByText('English Language credit recorded')).toBeVisible();
  await expect(page.getByText('Mathematics credit recorded')).toBeVisible();
  await expect(page.getByText('Five credit grades not yet recorded')).toBeVisible();
  await expect(page.getByText(/2 duplicate subject entries were found/i)).toBeVisible();
});

test('O’Level duplicate subject keeps the best grade without inflating the distinct-subject count', async ({ page }) => {
  await page.goto('/aggregate-calculator', { waitUntil: 'domcontentloaded' });
  const addSubject = page.getByRole('button', { name: '+ Add O’Level subject' });
  for (let index = 0; index < 6; index += 1) await addSubject.click();

  const rows = page.locator('.aggregate-extra-grade-row');
  const entries = [
    ['English', 'D7'],
    ['English Language', 'C6'],
    ['Mathematics', 'C6'],
    ['Biology', 'C6'],
    ['Chemistry', 'C6'],
    ['Physics', 'C6'],
  ];
  for (const [index, [subject, grade]] of entries.entries()) {
    await rows.nth(index).getByLabel(new RegExp(`Subject ${index + 1}`)).fill(subject);
    await rows.nth(index).getByLabel('Grade').selectOption(grade);
  }

  await expect(page.locator('.aggregate-assessment-stat').filter({ hasText: 'Credit grades entered' }).locator('strong')).toHaveText('5');
  await expect(page.getByText('Five or more credit grades entered')).toBeVisible();
  await expect(page.getByText('English Language credit recorded')).toBeVisible();
  await expect(page.getByText(/1 duplicate subject entry was found/i)).toBeVisible();
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

test('admin service request status changes are guarded and payment-confirmed status is read-only', async () => {
  const handler = readFileSync('supabase/functions/eduken-api/index.ts', 'utf8');
  const adminStart = handler.indexOf('const adminRequests = path.match(');
  const adminEnd = handler.indexOf('if (path === "/api/admin/payments" && req.method === "GET")', adminStart);
  expect(adminStart).toBeGreaterThanOrEqual(0);
  expect(adminEnd).toBeGreaterThan(adminStart);

  const adminRoute = handler.slice(adminStart, adminEnd);
  const requireAdminAt = adminRoute.indexOf('await requireAdmin(req)');
  const listAt = adminRoute.indexOf('db.from("service_requests").select');
  const statusValidationAt = adminRoute.indexOf('isAllowedServiceRequestStatus(b.status)');
  const paidGuardAt = adminRoute.indexOf('existing.status === "Paid"');
  const paidWriteGuardAt = adminRoute.indexOf('.neq("status", "Paid")');
  const updateAt = adminRoute.indexOf('.update({ status: b.status })');
  expect(requireAdminAt).toBeGreaterThanOrEqual(0);
  expect(listAt).toBeGreaterThan(requireAdminAt);
  expect(statusValidationAt).toBeGreaterThan(requireAdminAt);
  expect(paidGuardAt).toBeGreaterThan(statusValidationAt);
  expect(updateAt).toBeGreaterThan(paidGuardAt);
  expect(paidWriteGuardAt).toBeGreaterThan(updateAt);
  expect(adminRoute.slice(updateAt, updateAt + 80)).toContain('.update({ status: b.status })');
  expect(adminRoute).toContain('Payment-confirmed service requests cannot be changed through the status manager.');
  expect(adminRoute).toContain('return json({ error: "Service request status could not be updated." }, 409);');

  const validator = readFileSync('supabase/functions/eduken-api/service-request-validation.mjs', 'utf8');
  const app = readFileSync('src/App.tsx', 'utf8');
  expect(validator).toContain('"Completed",\n  "Cancelled"');
  expect(validator).not.toContain('"Paid"');
  expect(app).toContain('disabled={item.status === \'Paid\'}');
  expect(app).toContain('{item.status === \'Paid\' && <option value="Paid" disabled>Paid (payment confirmed)</option>}');
});
 
test('database hardening migration removes direct client access to consultation submissions', async () => {
  const migration = readFileSync(
    'supabase/migrations/20261014135746_harden_public_table_grants.sql',
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
    'supabase/migrations/20261014135746_harden_public_table_grants.sql',
    'utf8',
  );
  expect(migration).toContain('revoke all privileges on all tables in schema public from public, anon, authenticated;');
  expect(migration).toContain('revoke select (notify_on_publish) on table public.opportunities from public, anon, authenticated;');
  expect(migration).toContain('grant select (');
  expect(migration).not.toMatch(/^\\s*grant select on table\\b/im);
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
  expect(publicContent).not.toContain('db.from("opportunities").select("*")');
  expect(publicContent).not.toContain('db.from("admissions").select("*")');
  expect(publicContent).not.toContain('db.from("updates").select("*")');
  expect(publicContent).not.toContain('db.from("faqs").select("*")');
  expect(publicContent).not.toContain('db.from("services").select("*")');
});


test('aggregate calculator scores only the five FUHSI core subjects and clears extra grades', async ({ page }) => {
  await page.goto('/aggregate-calculator', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { name: 'EDUKEN Aggregate Calculator' })).toBeVisible();

  await page.getByLabel('Institution / formula').selectOption('fuhsi');
  await page.getByLabel('JAMB UTME score (out of 400)').fill('300');

  const coreGrades = ['A1', 'B2', 'B3', 'C4', 'C5'];
  for (const [index, grade] of coreGrades.entries()) {
    await page.locator('.aggregate-field').filter({ has: page.locator('span', { hasText: ['English Language', 'Mathematics', 'Physics', 'Chemistry', 'Biology'][index] }) })
      .locator('select').selectOption(grade);
  }

  await page.getByRole('button', { name: /Add another grade/i }).click();
  await page.locator('.aggregate-extra-grade-row input').fill('Economics');
  await page.locator('.aggregate-extra-grade-row select').selectOption('A1');
  await page.getByRole('button', { name: /Calculate aggregate/i }).click();

  const result = page.locator('.aggregate-result');
  await expect(result).toContainText('75.00');
  await expect(page.locator('.aggregate-extra-grades')).toContainText('Additional grades are kept temporarily');
  await expect(page.locator('.aggregate-extra-grade-row')).toHaveCount(1);

  await page.getByRole('button', { name: 'Clear', exact: true }).click();
  await expect(page.locator('.aggregate-extra-grade-row')).toHaveCount(0);
  await expect(page.locator('.aggregate-result')).toHaveCount(0);
  await expect(page.getByLabel('JAMB UTME score (out of 400)')).toHaveValue('');
});

test('aggregate calculator directory search and mobile layout work', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto('/aggregate-calculator', { waitUntil: 'domcontentloaded' });
  await page.getByRole('textbox', { name: 'Search university directory' }).fill('University of Benin');
  await expect(page.locator('.aggregate-directory-list')).toContainText('University of Benin (UNIBEN)');
  await expect(page.locator('.aggregate-directory-list')).not.toContainText('University of Lagos (UNILAG)');

  const dimensions = await page.evaluate(() => ({
    viewportWidth: document.documentElement.clientWidth,
    pageWidth: document.documentElement.scrollWidth,
  }));
  expect(
    dimensions.pageWidth,
    `aggregate calculator should not overflow horizontally on mobile: ${JSON.stringify(dimensions)}`,
  ).toBeLessThanOrEqual(dimensions.viewportWidth + 1);
});


test('aggregate calculator applies the added provisional school-specific formulas', async ({ page }) => {
  await page.goto('/aggregate-calculator', { waitUntil: 'domcontentloaded' });
  await page.getByLabel('Institution / formula').selectOption('unilag');
  await page.getByLabel('JAMB UTME score (out of 400)').fill('320');
  await page.getByLabel('Post-UTME score (out of 100)').fill('80');
  await page.getByLabel('O’Level contribution (out of 20)').fill('15');
  await page.getByRole('button', { name: /Calculate aggregate/i }).click();
  await expect(page.locator('.aggregate-result')).toContainText('79.00');
  await expect(page.locator('.aggregate-result')).toContainText('not confirmed as the university’s official 2026/2027 formula');

  await expect(page.getByLabel('Institution / formula').locator('option[value="ui-estimate"]')).toContainText('unverified estimate');
  await page.getByRole('textbox', { name: 'Search university directory' }).fill('University of Ibadan');
  await expect(page.locator('.aggregate-directory-list')).toContainText('aggregate formula and score conversion are not published on the page reviewed');

  await expect(page.getByLabel('Institution / formula').locator('option[value="oau-estimate"]')).toContainText('unverified estimate');
  await expect(page.getByLabel('Institution / formula')).toHaveValue('unilag');
  await expect(page.locator('.aggregate-result')).toContainText('79.00');

  await page.getByLabel('Institution / formula').selectOption('uniben');
  await page.getByLabel('JAMB UTME score (out of 400)').fill('320');
  await page.getByLabel('Post-UTME score (out of 100)').fill('80');
  await page.getByRole('button', { name: /Add O’Level subject/i }).click();
  await page.locator('.aggregate-extra-grade-row input').fill('Economics');
  await page.locator('.aggregate-extra-grade-row select').selectOption('A1');
  await page.getByRole('button', { name: /Calculate aggregate/i }).click();
  await expect(page.locator('.aggregate-result')).toContainText('80.00');

  await page.getByLabel('Institution / formula').selectOption('custom');
  await page.getByLabel('JAMB UTME score (out of 400)').fill('320');
  await page.getByLabel('Post-UTME score (out of 100)').fill('80');
  await page.locator('#aggregate-jw').fill('50');
  await page.locator('#aggregate-pw').fill('30');
  await page.locator('#aggregate-ow').fill('20');
  await page.getByLabel('O’Level score / contribution (out of 100)').fill('80');
  await page.getByRole('button', { name: /Calculate aggregate/i }).click();
  await expect(page.locator('.aggregate-result')).toContainText('80.00');
});

test('aggregate calculator rejects out-of-range scores and invalid custom weights', async ({ page }) => {
  await page.goto('/aggregate-calculator', { waitUntil: 'domcontentloaded' });
  const calculate = page.getByRole('button', { name: /Calculate aggregate/i });

  await page.getByLabel('JAMB UTME score (out of 400)').fill('401');
  await expect(page.getByRole('alert')).toContainText('whole-number UTME score from 0 to 400');
  await expect(calculate).toBeDisabled();
  await page.getByLabel('JAMB UTME score (out of 400)').fill('250.5');
  await expect(calculate).toBeDisabled();

  await page.getByLabel('JAMB UTME score (out of 400)').fill('320');
  await page.getByLabel('Institution / formula').selectOption('uniben');
  await page.getByLabel('Post-UTME score (out of 100)').fill('101');
  await expect(page.getByRole('alert')).toContainText('Post-UTME score from 0 to 100');
  await expect(calculate).toBeDisabled();

  await page.getByLabel('Institution / formula').selectOption('custom');
  await page.getByLabel('Post-UTME score (out of 100)').fill('80');
  await page.locator('#aggregate-jw').fill('0');
  await page.locator('#aggregate-pw').fill('0');
  await page.locator('#aggregate-ow').fill('0');
  await expect(page.getByRole('alert')).toContainText('combined total greater than zero');
  await expect(calculate).toBeDisabled();

  await page.locator('#aggregate-jw').fill('50');
  await page.locator('#aggregate-pw').fill('30');
  await page.locator('#aggregate-ow').fill('20');
  await page.getByLabel('O’Level score / contribution (out of 100)').fill('101');
  await expect(page.getByRole('alert')).toContainText('O’Level score from 0 to 100');
  await expect(calculate).toBeDisabled();

  await page.getByLabel('O’Level score / contribution (out of 100)').fill('80');
  await expect(calculate).toBeEnabled();
  await calculate.click();
  await expect(page.locator('.aggregate-result')).toContainText('80.00');
});


test('admission planner estimates the required Post-UTME score from the selected formula', async ({ page }) => {
  await page.goto('/aggregate-calculator', { waitUntil: 'domcontentloaded' });
  await page.getByLabel('Institution / formula').selectOption('unilorin');
  await page.getByLabel('JAMB UTME score (out of 400)').fill('320');
  await page.getByLabel('Post-UTME score (out of 100)').fill('60');
  await page.getByLabel('O’Level contribution (out of 20)').fill('15');
  await page.getByLabel('Intended course').fill('Linguistics');
  await page.getByLabel('State of origin (optional)').fill('Niger State');
  await page.getByLabel('Target aggregate (out of 100)').fill('75');
  await expect(page.locator('.aggregate-planner-result')).toContainText('Estimated Post-UTME score needed: 66.7 / 100');
  await expect(page.locator('.aggregate-planner-result')).toContainText('Linguistics');
  await expect(page.locator('.aggregate-planner-result')).toContainText('Niger State');

  await page.getByLabel('Target aggregate (out of 100)').fill('95');
  await expect(page.locator('.aggregate-planner-result')).toContainText('This target is not reachable');
  await page.getByLabel('Institution / formula').selectOption('fuhsi');
  await expect(page.locator('.aggregate-planner-result')).toContainText('not a Post-UTME component');
});


test('O’Level readiness checklist counts named credit grades and resets sitting choice', async ({ page }) => {
  await page.goto('/aggregate-calculator', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { name: 'Review your O’Level credits' })).toBeVisible();
  await page.getByLabel('Number of O’Level sittings').selectOption('2');
  await page.getByRole('button', { name: /Add O’Level subject/i }).click();
  const rows = page.locator('.aggregate-extra-grade-row');
  const entries = [
    ['English Language', 'C6'],
    ['Mathematics', 'B3'],
    ['Biology', 'A1'],
    ['Chemistry', 'C5'],
    ['Physics', 'D7'],
  ];
  for (const [index, [subject, grade]] of entries.entries()) {
    if (index > 0) await page.getByRole('button', { name: /Add O’Level subject/i }).click();
    await rows.nth(index).locator('input').fill(subject);
    await rows.nth(index).locator('select').selectOption(grade);
  }
  await expect(page.locator('.aggregate-assessment-stat strong')).toHaveText('4');
  await expect(page.locator('.aggregate-assessment-check')).toHaveCount(3);
  await expect(page.locator('.aggregate-assessment-check').nth(0)).toContainText('Five credit grades not yet recorded');
  await expect(page.locator('.aggregate-assessment-check').nth(1)).toContainText('English Language credit recorded');
  await expect(page.locator('.aggregate-assessment-check').nth(2)).toContainText('Mathematics credit recorded');
  await expect(page.locator('.aggregate-assessment-disclaimer')).toContainText('two sittings');
  await page.getByRole('button', { name: 'Clear', exact: true }).click();
  await expect(page.getByLabel('Number of O’Level sittings')).toHaveValue('1');
  await expect(page.locator('.aggregate-extra-grade-row')).toHaveCount(0);
});

test('aggregate calculator compares the result with a user-entered departmental cut-off', async ({ page }) => {
  await page.goto('/aggregate-calculator', { waitUntil: 'domcontentloaded' });
  await page.getByLabel('Institution / formula').selectOption('fuhsi');
  await page.getByLabel('JAMB UTME score (out of 400)').fill('300');

  const coreGrades = ['A1', 'B2', 'B3', 'C4', 'C5'];
  for (const [index, grade] of coreGrades.entries()) {
    await page.locator('.aggregate-field').filter({ has: page.locator('span', { hasText: ['English Language', 'Mathematics', 'Physics', 'Chemistry', 'Biology'][index] }) })
      .locator('select').selectOption(grade);
  }

  const cutoff = page.getByLabel('Departmental cut-off mark (optional, out of 100)');
  await expect(cutoff).toBeVisible();
  await cutoff.fill('70');
  await page.getByRole('button', { name: /Calculate aggregate/i }).click();
  await expect(page.locator('.aggregate-result')).toContainText('At or above the cut-off entered');
  await expect(page.locator('.aggregate-result')).toContainText('5.00 point(s) above');
  await expect(page.locator('.aggregate-result')).toContainText('not a guarantee of admission');

  await cutoff.fill('101');
  await expect(page.getByRole('alert')).toContainText('departmental cut-off from 0 to 100');
  await expect(page.getByRole('button', { name: /Calculate aggregate/i })).toBeDisabled();

  await page.getByRole('button', { name: 'Clear', exact: true }).click();
  await expect(cutoff).toHaveValue('');
  await expect(page.locator('.aggregate-result')).toHaveCount(0);
});


test('FUHSI official course and catchment cut-offs populate the comparison safely', async ({ page }) => {
  await page.goto('/aggregate-calculator', { waitUntil: 'domcontentloaded' });
  await page.getByLabel('Institution / formula').selectOption('fuhsi');
  await page.getByLabel('JAMB UTME score (out of 400)').fill('300');

  const coreGrades = ['A1', 'B2', 'B3', 'C4', 'C5'];
  for (const [index, grade] of coreGrades.entries()) {
    await page.locator('.aggregate-field').filter({ has: page.locator('span', { hasText: ['English Language', 'Mathematics', 'Physics', 'Chemistry', 'Biology'][index] }) })
      .locator('select').selectOption(grade);
  }

  await page.getByLabel('FUHSI course (2026/2027 official cut-off)').selectOption('Medicine and Surgery (MBBS)');
  const cutoff = page.getByLabel('Departmental cut-off mark (optional, out of 100)');
  await expect(cutoff).toHaveValue('81.3');

  await page.getByLabel('Admission category').selectOption('Lagos');
  await expect(cutoff).toHaveValue('72.2');
  await page.getByRole('button', { name: /Calculate aggregate/i }).click();
  await expect(page.locator('.aggregate-result')).toContainText('2.80 point(s) above');

  await page.getByLabel('Admission category').selectOption('Merit');
  await expect(cutoff).toHaveValue('81.3');
  await page.getByRole('button', { name: /Calculate aggregate/i }).click();
  await expect(page.locator('.aggregate-result')).toContainText('Below the cut-off entered');
  await expect(page.locator('.aggregate-result')).toContainText('6.30 point(s) below');

  await page.getByRole('button', { name: 'Clear', exact: true }).click();
  await expect(page.getByLabel('FUHSI course (2026/2027 official cut-off)')).toHaveValue('');
  await expect(cutoff).toHaveValue('');
});


test('aggregate calculator restores the complete original institution list', async ({ page }) => {
  await page.goto('/aggregate-calculator', { waitUntil: 'domcontentloaded' });
  const institution = page.getByLabel('Institution / formula');
  const expected = [
    'University of Lagos (UNILAG)',
    'University of Ibadan (UI)',
    'Obafemi Awolowo University (OAU)',
    'University of Nigeria, Nsukka (UNN)',
    'Ahmadu Bello University (ABU)',
    'University of Ilorin (UNILORIN)',
    'University of Port Harcourt (UNIPORT)',
    'Federal University of Technology, Akure (FUTA)',
    'FUNAAB',
    'FUTMinna',
    'FUTO',
    'UNIZIK',
    'UNICAL',
    'UNIJOS',
    'BUK',
    'UNIMAID',
    'UDUSOK',
    'Lagos State University (LASU)',
    'DELSU',
    'EKSU',
    'RSU',
    'IMSU',
    'AAU',
    'OOU',
    'ESUT',
    'TASUED',
    'KWASU',
    'FUOYE',
    'ABSU',
    'BSU',
    'Yaba College of Technology (YABATECH)',
    'Federal Polytechnic, Ado-Ekiti',
    'Federal Polytechnic, Bauchi',
    'Federal Polytechnic, Bida',
    'Federal Polytechnic, Ilaro',
    'Federal Polytechnic, Nekede',
    'Federal Polytechnic, Offa',
    'Federal Polytechnic, Oko',
    'Kaduna Polytechnic',
    'Auchi Polytechnic',
    'Lagos State Polytechnic / LASPOTECH',
    'Moshood Abiola Polytechnic (MAPOLY)',
    'The Polytechnic, Ibadan',
    'Kwara State Polytechnic',
    'Delta State Polytechnic'
  ];
  for (const label of expected) {
    await expect(institution.locator('option').filter({ hasText: label }).first()).toBeAttached();
    await expect(institution.locator('option').filter({ hasText: label }).first()).not.toBeDisabled();
  }
  await institution.selectOption('fedpolyado');
  await expect(page.getByText(/uses editable general weights only/i)).toBeVisible();
  await expect(page.getByLabel('JAMB UTME score (out of 400)')).toBeVisible();
  await expect(page.getByLabel('Post-UTME score (out of 100)')).toBeVisible();
  await expect(page.getByRole('spinbutton', { name: 'UTME weight (%)', exact: true })).toBeVisible();
});


test('aggregate calculator applies the official UNILORIN 50:30:20 arithmetic', async ({ page }) => {
  await page.goto('/aggregate-calculator', { waitUntil: 'domcontentloaded' });
  await page.getByLabel('JAMB UTME score (out of 400)').fill('320');
  await page.getByLabel('Post-UTME score (out of 100)').fill('80');
  await page.getByLabel(/O’Level contribution \(out of 20\)/).fill('15');
  await page.getByRole('button', { name: /Calculate aggregate/i }).click();
  await expect(page.locator('.aggregate-result')).toContainText('79.00');
});

test('aggregate calculator preloads KWASU official 70:30 weights without inventing grade conversion', async ({ page }) => {
  await page.goto('/aggregate-calculator', { waitUntil: 'domcontentloaded' });
  await page.getByLabel('Institution / formula').selectOption('kwasu');
  await expect(page.getByRole('spinbutton', { name: 'UTME weight (%)', exact: true })).toHaveValue('70');
  await expect(page.getByLabel('Post-UTME weight (%)')).toHaveValue('0');
  await expect(page.getByLabel('O’Level weight (%)')).toHaveValue('30');
  await expect(page.getByText(/KWASU’s official 2026\/2027 notice confirms 70% UTME\/DE/i)).toBeVisible();
});


test('JAMB-only divide-by-eight model reports a 50-point maximum consistently', async ({ page }) => {
  await page.goto('/aggregate-calculator', { waitUntil: 'domcontentloaded' });
  await page.getByLabel('Institution / formula').selectOption('jambonly');
  await expect(page.getByLabel('Target aggregate (out of 50)')).toHaveAttribute('max', '50');
  await expect(page.getByLabel('Departmental cut-off mark (optional, out of 50)')).toHaveAttribute('max', '50');
  await page.getByLabel('JAMB UTME score (out of 400)').fill('320');
  await page.getByRole('button', { name: /Calculate aggregate/i }).click();
  await expect(page.locator('.aggregate-result')).toContainText('40.00');
  await expect(page.locator('.aggregate-result')).toContainText('/ 50');
});


test('aggregate calculator clear preserves KWASU official weights', async ({ page }) => {
  await page.goto('/aggregate-calculator', { waitUntil: 'domcontentloaded' });
  await page.getByLabel('Institution / formula').selectOption('kwasu');
  await expect(page.getByRole('spinbutton', { name: 'UTME weight (%)', exact: true })).toHaveValue('70');
  await expect(page.getByLabel('O’Level weight (%)')).toHaveValue('30');
  await page.getByLabel('JAMB UTME score (out of 400)').fill('320');
  await page.getByLabel('O’Level score / contribution (out of 100)').fill('80');
  await page.getByRole('button', { name: 'Clear', exact: true }).click();
  await expect(page.getByRole('spinbutton', { name: 'UTME weight (%)', exact: true })).toHaveValue('70');
  await expect(page.getByLabel('Post-UTME weight (%)')).toHaveValue('0');
  await expect(page.getByLabel('O’Level weight (%)')).toHaveValue('30');
  await expect(page.getByLabel('O’Level score / contribution (out of 100)')).toHaveValue('');
  await page.getByLabel('JAMB UTME score (out of 400)').fill('320');
  await page.getByLabel('O’Level score / contribution (out of 100)').fill('80');
  await page.getByRole('button', { name: /Calculate aggregate/i }).click();
  await expect(page.locator('.aggregate-result')).toContainText('80.00');
});

test('JAMB-only calculator clear restores its 40-of-50 target and validates 50-point cut-offs', async ({ page }) => {
  await page.goto('/aggregate-calculator', { waitUntil: 'domcontentloaded' });
  await page.getByLabel('Institution / formula').selectOption('jambonly');

  const target = page.getByLabel('Target aggregate (out of 50)');
  const cutoff = page.getByLabel('Departmental cut-off mark (optional, out of 50)');
  await expect(target).toHaveValue('40');
  await expect(cutoff).toBeVisible();

  await target.fill('51');
  await expect(page.getByRole('alert')).toContainText('Enter a target from 0 to 50');
  await cutoff.fill('51');
  await expect(page.getByText('Enter a departmental cut-off from 0 to 50.', { exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'Clear', exact: true }).click();
  await expect(target).toHaveValue('40');
  await expect(cutoff).toHaveValue('');
  await expect(page.getByRole('alert')).toHaveCount(0);
});
