import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { isAllowedServiceRequestStatus, validateServiceRequestBody } from '../../supabase/functions/eduken-api/service-request-validation.mjs';

test('admin date editor parses ISO and human-readable deadlines for the native picker', () => {
  const app = readFileSync(new URL('../../src/App.tsx', import.meta.url), 'utf8');
  expect(app).toContain('raw.match(/^(\\d{4}-\\d{2}-\\d{2})/)');
  expect(app).toContain('raw.match(/\\b(\\d{1,2})(?:st|nd|rd|th)?\\s+([A-Za-z]+)\\s+(\\d{4})\\b/i)');
  expect(app).not.toContain('raw.match(/^(\\\\d{4}-\\\\d{2}-\\\\d{2})/)');
  expect(app).not.toContain('raw.match(/\\\\b(\\\\d{1,2})(?:st|nd|rd|th)?\\\\s+([A-Za-z]+)\\\\s+(\\\\d{4})\\\\b/i)');
});

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

test('opportunity WhatsApp sharing uses a category heading, bold title, saved location and branded read-more link', () => {
  const app = readFileSync(new URL('../../src/App.tsx', import.meta.url), 'utf8');
  const shareStart = app.indexOf('const shareOpportunityOnWhatsApp = (item: Item) => {');
  const shareEnd = app.indexOf('const shareUpdateOnWhatsApp = (item: Item) => {', shareStart);
  expect(shareStart).toBeGreaterThanOrEqual(0);
  expect(shareEnd).toBeGreaterThan(shareStart);
  const share = app.slice(shareStart, shareEnd);
  expect(share).toContain("const category = String(item.category || '').trim()");
  expect(share).toContain("'💼 *JOB OPPORTUNITIES*'");
  expect(share).toContain("'🎓 *SCHOLARSHIPS & GRANTS*'");
  expect(share).toContain("'🎓 *ADMISSION OPPORTUNITIES*'");
  expect(share).toContain("'🌍 *REMOTE OPPORTUNITIES*'");
  expect(share).toContain("'📢 *' + title + '*'");
  expect(share).toContain("const location = String(item.location || '')");
  expect(share).toContain("'📍 Location: ' + location");
  expect(share).toContain("'🔗 *READ FULL DETAILS & APPLY 👇*'");
  expect(share).toContain("'🎓 *EDUKEN CONSULT*'");
  expect(app).toContain("      'location',");
});

test('isolated preview uses test service catalogue while preserving live public education content', () => {
  const app = readFileSync(new URL('../../src/App.tsx', import.meta.url), 'utf8');
  const apiClient = readFileSync(new URL('../../src/lib/api.ts', import.meta.url), 'utf8');

  expect(apiClient).toContain('export const usesIsolatedTestBackend = ALLOW_TEST_WRITES;');
  expect(app).toContain('if (usesIsolatedTestBackend)');
  expect(app).toContain("const testContent = await api.get('/public-content');");
  expect(app).toContain('const previewTestService');
  expect(app).toContain('live.services = [previewTestService];');
  expect(app).toContain('the checkout API still validates');
  expect(app).toContain('const testServices = Array.isArray(testContent.data?.services) ? testContent.data.services : [];');
  expect(app).toContain('service visible if public catalogue loading fails');
});

test('wallet callback keeps its reference available for verification after sign-in', () => {
  const app = readFileSync(new URL('../../src/App.tsx', import.meta.url), 'utf8');
  const hub = readFileSync(new URL('../../src/PlatformHub.tsx', import.meta.url), 'utf8');

  expect(app).toContain("eduken_pending_wallet_deposit_reference");
  expect(app).toContain("window.sessionStorage.setItem(pendingWalletDepositKey, returnedReference)");
  expect(hub).toContain("eduken_pending_wallet_deposit_reference");
  expect(hub).toContain("api.post('/api/wallet/deposit/verify', { reference: pendingReference })");
  expect(hub).toContain("window.sessionStorage.removeItem(pendingWalletDepositKey)");
});

test('wallet notification retries repair missing outbox rows without resetting delivered rows', () => {
  const handler = readFileSync('supabase/functions/eduken-api/index.ts', 'utf8');
  const webhookWallet = handler.slice(
    handler.indexOf('if (existingPayment.payment_type === "wallet_deposit")'),
    handler.indexOf('if (existingPayment.status === "Paid")', handler.indexOf('if (existingPayment.payment_type === "wallet_deposit")')),
  );
  const walletVerify = handler.slice(
    handler.indexOf('if (path === "/api/wallet/deposit/verify" && req.method === "POST")'),
    handler.indexOf('if (path === "/api/wallet/pay-service" && req.method === "POST")'),
  );
  const walletPay = handler.slice(
    handler.indexOf('if (path === "/api/wallet/pay-service" && req.method === "POST")'),
    handler.indexOf('if (path === "/api/payments/initialize-guest" && req.method === "POST")'),
  );
  const walletRefund = handler.slice(
    handler.indexOf('if (path === "/api/admin/wallet/refund" && req.method === "POST")'),
    handler.indexOf('if (path === "/api/admin/system-settings")'),
  );

  expect(webhookWallet).toContain('await sendPaymentNotifications(existingPayment.user_id, reference, Number(existingPayment.amount), "deposit")');
  expect(walletVerify).toContain('await sendPaymentNotifications(user.id, reference, Number(payment.amount), "deposit")');
  expect(walletPay).toContain('await sendPaymentNotifications(user.id, String(result?.payment_reference || paymentReference), Number(result?.amount || 0), "service_payment")');
  expect(walletRefund).toContain('await sendPaymentNotifications(');
  expect(walletPay).not.toContain('result?.reused !== true');
  expect(walletRefund).not.toContain('refund?.reused !== true');
});

test('payment notification delivery retries durable pending rows with stable idempotency keys', () => {
  const handler = readFileSync('supabase/functions/eduken-api/index.ts', 'utf8');
  const start = handler.indexOf('async function deliverPendingPaymentNotifications(');
  const end = handler.indexOf('async function sendPaymentNotifications(', start);
  expect(start).toBeGreaterThanOrEqual(0);
  expect(end).toBeGreaterThan(start);
  const delivery = handler.slice(start, end);
  const enqueueStart = end;
  const enqueueEnd = handler.indexOf('async function sendServicePaymentNotifications(', enqueueStart);
  expect(enqueueEnd).toBeGreaterThan(enqueueStart);
  const enqueue = handler.slice(enqueueStart, enqueueEnd);
  expect(delivery).toContain('for (let attempt = 1; attempt <= attemptsThisInvocation; attempt++)');
  expect(delivery).toContain('attempt * 500');
  expect(handler).toContain('async function paymentNotificationIdempotencyKey(');
  expect(handler).toContain('recipient.trim().toLowerCase()');
  expect(handler).toContain('const identity = [reference, kind, role, recipient.trim().toLowerCase()]');
  expect(enqueue).toContain('await paymentNotificationIdempotencyKey(reference, kind, message.role, message.to)');
  expect(delivery).toContain('if (!messageId) throw new Error("Transactional email provider returned no message ID.")');
  expect(delivery).toContain('after bounded retries');
  expect(delivery).toContain('if (!delivered)');
  expect(delivery).toContain('.eq("status", "pending")');
  expect(delivery).toContain('.lt("attempt_count", 9)');
  expect(delivery).toContain('.eq("attempt_count", attemptsAlreadyUsed + attempt - 1)');
  expect(delivery).toContain('.select("id").maybeSingle()');
  expect(delivery).toContain('if (!claimedAttempt)');
  expect(delivery).toContain("capped at nine total");
  expect(delivery).toContain("const attemptsRemaining = Math.max(0, 9 - attemptsAlreadyUsed)");
  expect(delivery).toContain("const attemptsThisInvocation = Math.min(3, attemptsRemaining)");
  expect(delivery).toContain('.lt("attempt_count", 9)');
  expect(enqueue).toContain('onConflict: "idempotency_key", ignoreDuplicates: true');
  expect(handler).toContain('payment_notification_deliveries');
});

test('scheduled payment notification processor is secret-protected and retries only pending rows', () => {
  const handler = readFileSync('supabase/functions/eduken-api/index.ts', 'utf8');
  const start = handler.indexOf('if (path === "/api/internal/payment-notifications/process" && req.method === "POST")');
  const end = handler.indexOf('if (path === "/api/payments/webhook" && req.method === "POST")', start);
  expect(start).toBeGreaterThanOrEqual(0);
  expect(end).toBeGreaterThan(start);
  const route = handler.slice(start, end);
  expect(route).toContain('Deno.env.get("PAYMENT_NOTIFICATIONS_CRON_SECRET")');
  expect(route).toContain('cronSecret.length < 32');
  expect(route).toContain('req.headers.get("Authorization") !== "Bearer " + cronSecret');
  expect(route).toContain('.from("payment_notification_deliveries")');
  expect(route).toContain('.eq("status", "pending")');
  expect(route).toContain('.limit(25)');
  expect(route).toContain('batch.size < 3');
  expect(route).toContain('await deliverPendingPaymentNotifications(reference, kind)');
  expect(route).toContain('pending_remaining');
});

test('scheduled payment notification retry workflow is dormant without secrets and validates its endpoint', () => {
  const workflow = readFileSync('.github/workflows/payment-notification-retry.yml', 'utf8');
  expect(workflow).toContain('cron: "*/15 * * * *"');
  expect(workflow).toContain('secrets.EDUKEN_PAYMENT_NOTIFICATIONS_PROCESS_URL');
  expect(workflow).toContain('secrets.EDUKEN_PAYMENT_NOTIFICATIONS_CRON_SECRET');
  expect(workflow).toContain('configured=false');
  expect(workflow).toContain('https');
  expect(workflow).toContain('expected_host = "wpktzogarfqrgkirzdpy.supabase.co"');
  expect(workflow).not.toContain('expected_host = "pphxltbkwygqjtjgkhxu.supabase.co"');
  expect(workflow).toContain('/functions/v1/eduken-api/api/internal/payment-notifications/process');
  expect(workflow).toContain('CRON_SECRET must be at least 32 characters');
  expect(workflow).toContain('Authorization: Bearer $CRON_SECRET');
  expect(workflow).toContain('curl --fail-with-body');
});

test('settled service verification retries repair missing outbox rows without duplicating delivered receipts', () => {
  const handler = readFileSync('supabase/functions/eduken-api/index.ts', 'utf8');
  const guest = handler.slice(
    handler.indexOf('if (path === "/api/payments/verify-guest" && req.method === "POST")'),
    handler.indexOf('if (path === "/api/payments/verify" && req.method === "POST")'),
  );
  const authenticated = handler.slice(
    handler.indexOf('if (path === "/api/payments/verify" && req.method === "POST")'),
    handler.indexOf('if (path === "/api/payments" && req.method === "GET")'),
  );

  const guestAlreadyPaid = guest.slice(
    guest.indexOf('if (existingPayment.status === "Paid")'),
    guest.indexOf('const secret = Deno.env.get("PAYSTACK_SECRET_KEY")'),
  );
  const authenticatedAlreadyPaid = authenticated.slice(
    authenticated.indexOf('if (existingPayment.status === "Paid")'),
    authenticated.indexOf('const response = await fetch("https://api.paystack.co/transaction/verify/"'),
  );

  expect(guestAlreadyPaid).toContain('await sendPaymentNotifications(request.user_id || existingPayment.user_id || null, reference, Number(existingPayment.amount), "service_payment", request.email || null)');
  expect(authenticatedAlreadyPaid).toContain('await sendServicePaymentNotifications(existingPayment)');
  expect(guestAlreadyPaid).not.toContain('sendEmailAlertMessage');
  expect(authenticatedAlreadyPaid).not.toContain('sendEmailAlertMessage');
  expect(guestAlreadyPaid).toContain('update({ status: "Paid" })');
  expect(authenticatedAlreadyPaid).toContain('update({ status: "Paid" })');
  expect(guest).toContain('await sendPaymentNotifications(request.user_id || existingPayment.user_id || null, reference, Number(existingPayment.amount), "service_payment", request.email || null)');
  expect(authenticated).toContain('await sendServicePaymentNotifications(existingPayment)');
  expect(guest).not.toContain('if (payment) await sendPaymentNotifications(');
  expect(authenticated).not.toContain('if (payment) await sendServicePaymentNotifications(existingPayment)');
});

test('service payment webhook retries repair missing outbox rows without duplicating delivered receipts', () => {
  const handler = readFileSync('supabase/functions/eduken-api/index.ts', 'utf8');
  const webhook = handler.slice(
    handler.indexOf('if (path === "/api/payments/webhook" && req.method === "POST")'),
    handler.indexOf('if (req.method === "GET" && (path === "/public-content"'),
  );
  const alreadyPaid = webhook.slice(
    webhook.indexOf('if (existingPayment.status === "Paid")'),
    webhook.indexOf('const { data: payment, error: updateError }'),
  );
  const firstSettlement = webhook.slice(
    webhook.indexOf('const { data: payment, error: updateError }'),
    webhook.indexOf('return json({ ok: true, paid: true, reused: !payment });'),
  );

  expect(alreadyPaid).toContain('await sendServicePaymentNotifications(existingPayment)');
  expect(alreadyPaid).not.toContain('sendEmailAlertMessage');
  expect(firstSettlement).toContain('await sendServicePaymentNotifications(existingPayment)');
  expect(firstSettlement).not.toContain('if (payment) await sendServicePaymentNotifications(existingPayment)');
});

test('customer workspace exposes the optional EDUKEN wallet without replacing public education content', async ({ page }) => {
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

  await page.goto('/', { waitUntil: 'domcontentloaded' });
  const workspace = page.locator('#eduken-platform');
  await expect(workspace.getByRole('heading', { name: 'Your student workspace.' })).toBeVisible();
  await expect(workspace.getByRole('heading', { name: 'EDUKEN Wallet' })).toBeVisible();
  await expect(workspace.getByRole('button', { name: /Sign in to get a wallet/i })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Navigate admissions with clarity.' })).toBeVisible();
});

test('homepage exposes the aggregate calculator from the primary navigation and hero', async ({ page }) => {
  await page.route(publicContentUrl, route =>
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

  await page.goto('/', { waitUntil: 'domcontentloaded' });

  const navigationLink = page.locator('#primary-navigation a[href="/aggregate-calculator"]');
  const heroLink = page.locator('.hero-actions a[href="/aggregate-calculator"]');
  await expect(navigationLink).toContainText('Aggregate Calculator');
  await expect(navigationLink).toBeVisible();
  await expect(heroLink).toContainText('Calculate Aggregate');
  await expect(heroLink).toBeVisible();
});

test('verified admission and update cards display the prominent EDUKEN badge', async ({ page }) => {
  await page.route('**/functions/v1/eduken-api/public-content', route =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        opportunities: [],
        admissions: [{
          id: 'verified-admission-fixture',
          school: 'Verified Admission Fixture',
          programme: 'Test programme',
          category: 'Admission',
          deadline: 'See details',
          is_published: true,
          verified: true,
        }],
        updates: [{
          id: 'verified-update-fixture',
          title: 'Verified Update Fixture',
          category: 'Education',
          content: 'A safe fixture to verify badge rendering.',
          created_at: '2026-10-15T00:00:00.000Z',
          is_published: true,
          verified: true,
        }],
        faqs: [],
        services: [],
      }),
    }),
  );

  await page.goto('/', { waitUntil: 'domcontentloaded' });

  const admissionBadge = page.locator('#admission-verified-admission-fixture .verified-pill');
  await expect(admissionBadge).toContainText('Verified by EDUKEN');
  await expect(admissionBadge.locator('svg')).toBeVisible();

  const updateCard = page.locator('.newsroom-card').filter({
    has: page.getByRole('heading', { name: 'Verified Update Fixture' }),
  });
  const updateBadge = updateCard.locator('.verified-pill');
  await expect(updateBadge).toContainText('Verified by EDUKEN');
  await expect(updateBadge.locator('svg')).toBeVisible();

  const badgeStyle = await admissionBadge.evaluate(element => {
    const style = window.getComputedStyle(element);
    return { fontWeight: Number(style.fontWeight), borderWidth: style.borderTopWidth };
  });
  expect(badgeStyle.fontWeight, 'verification label should be bold').toBeGreaterThanOrEqual(700);
  expect(badgeStyle.borderWidth, 'verification badge should have a thick visible border').toBe('2px');
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
  await expect(page).toHaveURL(/#admission\/admission-deep-link-check$/);
});

test('malformed admission deep links do not crash public page rendering', async ({ page }) => {
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));

  await page.goto('/#admission/%E0%A4%A', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('body')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Navigate admissions with clarity.' })).toBeVisible();
  expect(pageErrors, 'malformed URL fragments must not throw during hash parsing').toEqual([]);
});

test('JAMB catalogue setup warning waits for a successful content load', async ({ page }) => {
  let markRequestStarted;
  const requestStarted = new Promise(resolve => { markRequestStarted = resolve; });
  let releaseResponse;
  const delayedResponse = new Promise(resolve => { releaseResponse = resolve; });

  await page.route('**/functions/v1/eduken-api/public-content', async route => {
    markRequestStarted();
    await delayedResponse;
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        opportunities: [],
        admissions: [],
        updates: [],
        faqs: [],
        services: [],
      }),
    });
  });

  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await requestStarted;
  await expect(page.locator('.jamb-catalogue-empty')).toHaveCount(0);

  releaseResponse();
  await expect(page.locator('.jamb-catalogue-empty')).toContainText(
    'The JAMB catalogue has not been set up yet.',
  );
});

test('failed public-content load does not falsely report an unconfigured JAMB catalogue', async ({ page }) => {
  await page.route('**/functions/v1/eduken-api/public-content', route =>
    route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ error: 'temporary test failure' }) }),
  );

  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.jamb-catalogue-empty')).toHaveCount(0);
  await expect(page.getByText('Unable to load live content. Please refresh.')).toBeVisible();
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
  const serviceCard = page.locator('.service-row').filter({
    has: page.getByText('Playwright Service Request Check', { exact: true }),
  });
  await expect(serviceCard).toHaveCount(1);
  await serviceCard.getByRole('button', { name: 'Request this service', exact: true }).click();

  const dialog = page.getByRole('dialog', {
    name: 'Playwright Service Request Check',
  });
  await expect(dialog).toBeVisible();
  for (const name of ['Full name', 'WhatsApp number', 'Additional notes (required)']) {
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

test('wallet reads and spending require customer auth; refunds require admin auth', () => {
  const handler = readFileSync('supabase/functions/eduken-api/index.ts', 'utf8');
  const routeBlock = (start, end) => handler.slice(handler.indexOf(start), handler.indexOf(end));

  const walletRead = routeBlock(
    'if (path === "/api/wallet" && req.method === "GET")',
    'if (path === "/api/wallet/deposit/initialize" && req.method === "POST")',
  );
  expect(walletRead.indexOf('await requireUser(req)')).toBeGreaterThanOrEqual(0);
  expect(walletRead.indexOf('await requireUser(req)')).toBeLessThan(walletRead.indexOf('db.from("customer_wallets")'));

  const walletSpend = routeBlock(
    'if (path === "/api/wallet/pay-service" && req.method === "POST")',
    'if (path === "/api/payments/initialize-guest" && req.method === "POST")',
  );
  expect(walletSpend.indexOf('await requireUser(req)')).toBeGreaterThanOrEqual(0);
  expect(walletSpend.indexOf('await requireUser(req)')).toBeLessThan(walletSpend.indexOf('db.rpc("pay_service_from_customer_wallet"'));

  const refund = routeBlock(
    'if (path === "/api/admin/wallet/refund" && req.method === "POST")',
    'if (path === "/api/admin/system-settings")',
  );
  expect(refund.indexOf('await requireAdmin(req)')).toBeGreaterThanOrEqual(0);
  expect(refund.indexOf('await requireAdmin(req)')).toBeLessThan(refund.indexOf('req.json()'));
  expect(refund.indexOf('await requireAdmin(req)')).toBeLessThan(refund.indexOf('db.from("payments")'));
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
    quantity: 1,
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
 
test('authenticated payment initialization uses saved quantity and refuses already-paid requests', async () => {
  const source = readFileSync('supabase/functions/eduken-api/index.ts', 'utf8');
  const routeStart = source.indexOf('if (path === "/api/payments/initialize" && req.method === "POST")');
  const routeEnd = source.indexOf('if (path === "/api/payments/verify" && req.method === "POST")', routeStart);
  expect(routeStart).toBeGreaterThanOrEqual(0);
  expect(routeEnd).toBeGreaterThan(routeStart);
  const route = source.slice(routeStart, routeEnd);
  expect(route).toContain('status,quantity,services(name,price,is_published,is_available,is_catalog_item)');
  expect(route).toContain('request.status === "Paid"');
  expect(route).toContain('.eq("service_request_id", request.id).eq("status", "Paid").maybeSingle()');
  expect(route).toContain('Number(service?.price) * quantity');
  expect(route).toContain('quantity > 1 && service?.is_catalog_item !== true');
  expect(route).toContain('.eq("service_request_id", request.id).eq("status", "Pending").maybeSingle()');
  expect(route).not.toContain('.eq("service_request_id", request.id).eq("user_id", user.id).eq("status", "Pending")');
});

test('guest payment initialization validates saved quantity and catalogue eligibility', async () => {
  const source = readFileSync('supabase/functions/eduken-api/index.ts', 'utf8');
  const routeStart = source.indexOf('if (path === "/api/payments/initialize-guest" && req.method === "POST")');
  const routeEnd = source.indexOf('if (path === "/api/payments/verify-guest" && req.method === "POST")', routeStart);
  expect(routeStart).toBeGreaterThanOrEqual(0);
  expect(routeEnd).toBeGreaterThan(routeStart);
  const route = source.slice(routeStart, routeEnd);
  expect(route).toContain('services(name,price,is_published,is_available,is_catalog_item)');
  expect(route).toContain('request.status === "Paid"');
  expect(route).toContain('Number.isInteger(quantity)');
  expect(route).toContain('quantity < 1 || quantity > 100');
  expect(route).toContain('quantity > 1 && service?.is_catalog_item !== true');
  expect(route).toContain('Number(service?.price) * quantity');
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

test('public header exposes customer wallet access but not admin access', async ({ page }) => {
  const authorizeEndpoint = 'https://pphxltbkwygqjtjgkhxu.supabase.co/auth/v1/authorize';

  // Customer wallet access is intentionally visible; admin access must remain private.
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('link', { name: 'Go to EDUKEN Wallet and customer account' })).toBeVisible();
  await expect(page.locator('a[href="/admin"]')).toHaveCount(0);

  // Intercept the OAuth hand-off so this test never signs into a real account.
  await page.route(authorizeEndpoint + '**', route =>
    route.fulfill({
      status: 200,
      contentType: 'text/html',
      body: '<!doctype html><title>OAuth hand-off intercepted by Playwright</title>',
    }),
  );

  // Direct access shows only the private admin sign-in screen, not the public website.
  await page.goto('/admin', { waitUntil: 'domcontentloaded' });
  await expect(page).toHaveURL(/\/admin\/?$/);
  await expect(page.getByRole('dialog', { name: /Admin sign in/i })).toBeVisible();
  await expect(page.locator('.site')).toHaveCount(0);
  await expect(page.locator('.admin-shell')).toHaveCount(0);

  const siteOrigin = new URL(page.url()).origin;
  const authNavigation = page.waitForRequest(
    request => request.isNavigationRequest() && request.url().startsWith(authorizeEndpoint),
  );
  await page.getByRole('button', { name: /Continue with Google/i }).click();
  const authUrl = new URL((await authNavigation).url());
  expect(authUrl.searchParams.get('provider')).toBe('google');
  expect(authUrl.searchParams.get('redirect_to')).toBe(siteOrigin + '/admin');
});



test('customer Google sign-in on the public homepage never opens the admin dashboard', async ({ page }) => {
  await page.route('**/auth/v1/user', route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ id: 'test-admin-user', email: 'timmyjoe385@gmail.com', app_metadata: { provider: 'google' } }),
  }));
  await page.route('**/functions/v1/eduken-api/public-content', route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ opportunities: [], admissions: [], updates: [], faqs: [], services: [] }),
  }));
  await page.route('**/functions/v1/eduken-api/api/admin/session', route => {
    throw new Error('Public customer OAuth must not request the admin session endpoint.');
  });
  await page.route('**/functions/v1/eduken-api/api/me', route => route.fulfill({
    status: 200, contentType: 'application/json', body: JSON.stringify({ user: { email: 'timmyjoe385@gmail.com' } }),
  }));
  await page.addInitScript(() => {
    localStorage.removeItem('eduken_auth_session');
  });
  await page.goto('/#access_token=synthetic-customer-token&refresh_token=synthetic-refresh-token&expires_in=3600&token_type=bearer', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.site')).toBeVisible();
  await expect(page.locator('.admin-shell')).toHaveCount(0);
  await expect(page.getByRole('dialog', { name: /Admin sign in/i })).toHaveCount(0);
});

test('public header does not expose generic sign-in while customer wallet sign-in remains available', async ({ page }) => {
  await page.route('**/functions/v1/eduken-api/public-content', route =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        opportunities: [], admissions: [], updates: [], faqs: [], services: [],
      }),
    }),
  );

  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('link', { name: 'Go to EDUKEN Wallet and customer account' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Sign in', exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: /Sign in to get a wallet/i })).toBeVisible();
});

test('customer password sign-in shows a safe error without exposing provider details', async ({ page }) => {
  await page.route('**/functions/v1/eduken-api/public-content', route =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ opportunities: [], admissions: [], updates: [], faqs: [], services: [] }),
    }),
  );
  await page.route(url =>
    url.hostname === 'pphxltbkwygqjtjgkhxu.supabase.co'
    && url.pathname === '/auth/v1/token'
    && url.searchParams.get('grant_type') === 'password',
  route => route.fulfill({
    status: 400,
    contentType: 'application/json',
    body: JSON.stringify({ error: 'invalid_grant', error_description: 'invalid login credentials' }),
  }));

  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: /Sign in to get a wallet/i }).click();
  const dialog = page.getByRole('dialog', { name: 'Sign in to EDUKEN Wallet' });
  await expect(dialog).toBeVisible();
  await dialog.getByLabel('Email address').fill('student@example.test');
  await dialog.getByLabel('Password').fill('not-a-real-password');
  await dialog.getByRole('button', { name: 'Sign in securely' }).click();
  await expect(dialog.getByRole('alert')).toHaveText(
    'Email or password was not accepted. Check your test account details and try again.',
  );
  await expect(dialog.getByRole('alert')).not.toContainText('invalid login credentials');
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
    'db.from("admissions").select("id, title, slug, school, programme, category, description, deadline, application_url, official_source, is_published, created_at, updated_at, verified, featured, urgent")',
  );
  expect(publicContent).toContain(
    'db.from("updates").select("id, title, slug, category, content, source, source_url, is_published, created_at, updated_at, verified, featured, urgent")',
  );
  expect(publicContent).toContain(
    'db.from("faqs").select("id, question, answer, category, created_at, updated_at")',
  );
  expect(publicContent).toContain(
    'db.from("services").select("id, name, category, description, requirements, price, is_available, is_catalog_item, is_published, created_at, updated_at")',
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

test('admin system settings are separate, persisted, and protected by backend authorization', () => {
  const handler = readFileSync('supabase/functions/eduken-api/index.ts', 'utf8');
  const app = readFileSync('src/App.tsx', 'utf8');
  const migration = readFileSync('supabase/migrations/20261015130931_admin_system_settings.sql', 'utf8');
  const start = handler.indexOf('if (path === "/api/admin/system-settings")');
  const end = handler.indexOf('const adminContent = path.match', start);
  const route = handler.slice(start, end);
  expect(start).toBeGreaterThan(-1);
  expect(route).toContain('await requireAdmin(req)');
  expect(route).toContain('.upsert({ id: "global", settings: incoming, updated_by: user.id');
  expect(route).toContain('typeof incoming[key] !== "boolean"');
  expect(route).not.toContain('update({ status: "cancelled" }).eq("status", "pending")');
  expect(handler).toContain('if (!systemSettings.deadlineEmailAlertsEnabled)');
  expect(handler).toContain('paused: true, processed: 0');
  expect(handler).toContain('status: "pending",\n              scheduled_for: new Date().toISOString()');
  expect(migration).toContain('alter table public.admin_system_settings enable row level security;');
  expect(migration).toContain('revoke all on table public.admin_system_settings from anon, authenticated;');
  expect(app).toContain("'system-settings'");
  expect(app).toContain("updateSystemSetting('subscriberNotificationsEnabled'");
  expect(app).toContain("updateSystemSetting('deadlineEmailAlertsEnabled'");
  expect(app).toContain("updateSystemSetting('defaultNotifyOnPublish'");
  expect(handler).toContain('error.code === "PGRST205"');
  expect(handler).toContain('deadlineEmailAlertsEnabled: false');
});


test('admissions and updates expose persisted opportunity-style admin controls', () => {
  const app = readFileSync('src/App.tsx', 'utf8');
  const handler = readFileSync('supabase/functions/eduken-api/index.ts', 'utf8');
  const migration = readFileSync(
    'supabase/migrations/20261015134000_add_admission_update_admin_controls.sql',
    'utf8',
  );
  for (const table of ['admissions', 'updates']) {
    const start = app.indexOf(`    ${table}: [`);
    const end = app.indexOf('\n    ],', start);
    expect(start, `${table} form fields should exist`).toBeGreaterThanOrEqual(0);
    expect(end).toBeGreaterThan(start);
    const fields = app.slice(start, end);
    for (const field of ['verified', 'slug', 'featured', 'urgent', 'notifyOnPublish']) {
      expect(fields, `${table} form should include ${field}`).toContain(`'${field}'`);
    }
  }
  expect(handler).toContain('db.from("admissions").select("id, title, slug, school, programme, category, description, deadline, application_url, official_source, is_published, created_at, updated_at, verified, featured, urgent")');
  expect(handler).toContain('db.from("updates").select("id, title, slug, category, content, source, source_url, is_published, created_at, updated_at, verified, featured, urgent")');
  // Public cards need persisted verification/feature flags, but notification preferences stay private.
  expect(handler).not.toContain('notify_on_publish, verified');
  expect(handler).toContain('if (x.notifyOnPublish !== undefined && x.notify_on_publish === undefined)');
  expect(handler).toContain('async function notifyEditorialSubscribers');
  expect(handler).not.toContain('// These controls are not columns in the updates table.');
  expect(migration).toContain('ALTER TABLE public.admissions');
  expect(migration).toContain('ALTER TABLE public.updates');
  for (const column of ['verified', 'slug', 'featured', 'urgent', 'notify_on_publish']) {
    expect(migration).toContain(column);
  }
});


test('JAMB service request dialog opens without a blank-screen runtime error', async ({ page }) => {
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));
  await page.route('**/functions/v1/eduken-api/public-content', route =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        opportunities: [], admissions: [], updates: [], faqs: [],
        services: [{
          id: '4d5e6f70-1234-4123-8123-123456789abc',
          name: 'JAMB e-PIN (UTME Without Mock)',
          category: 'JAMB Services',
          description: 'Test-only service fixture.',
          price: 7128,
          is_available: true,
          is_catalog_item: true,
          is_published: true,
        }],
      }),
    }),
  );
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  const serviceCard = page.locator('.jamb-service-card').filter({
    has: page.getByRole('heading', { name: 'JAMB e-PIN (UTME Without Mock)' }),
  });
  await expect(serviceCard).toBeVisible();
  await serviceCard.getByRole('button', { name: /Request this service/i }).click();
  const dialog = page.getByRole('dialog', { name: /JAMB e-PIN \(UTME Without Mock\)/i });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('spinbutton', { name: 'Number of candidates' })).toHaveValue('1');
  expect(pageErrors, 'opening the JAMB request dialog must not throw').toEqual([]);
});

test('admin workspace access is decided by server-side authorization, not a public email allowlist', () => {
  const app = readFileSync('src/App.tsx', 'utf8');
  const handler = readFileSync('supabase/functions/eduken-api/index.ts', 'utf8');
  const start = handler.indexOf('if (path === "/api/admin/session" && req.method === "GET")');
  const end = handler.indexOf('if (path === "/api/admin/payments" && req.method === "GET")', start);
  const route = handler.slice(start, end);
  expect(start).toBeGreaterThan(-1);
  expect(route).toContain('await requireAdmin(req)');
  expect(route).toContain('return json({ admin: true })');
  expect(app).toContain("api.get('/api/admin/session')");
  expect(app).not.toContain('timmyjoe385@gmail.com');
  expect(app).not.toContain('edukenconsult00@gmail.com');
});

test('admin sign-in stays off the public homepage and /admin remains available after sign-out', async ({ page }) => {
  await page.route('**/functions/v1/eduken-api/public-content', route =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ opportunities: [], admissions: [], updates: [], faqs: [], services: [] }),
    }),
  );
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('a[href="/admin"]')).toHaveCount(0);
  await expect(page.getByRole('dialog', { name: /Admin sign in/i })).toHaveCount(0);
  await expect(page.locator('.site')).toBeVisible();

  // Direct admin entrance must continue to work when signed out.
  await page.goto('/admin', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('dialog', { name: 'Admin sign in' })).toBeVisible();
  await expect(page.getByRole('button', { name: /Continue with Google/i })).toBeVisible();
  await expect(page.locator('.site')).toHaveCount(0);
  await expect(page.locator('.admin-shell')).toHaveCount(0);
});


test('service request form clearly labels and outlines customer detail fields', async ({ page }) => {
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
          id: 'service-request-form-fixture',
          name: 'Service Request Form Fixture',
          category: 'Consultation',
          description: 'A safe fixture for checking customer request fields.',
          price: 2500,
          is_published: true,
          is_available: true,
          is_catalog_item: false,
          status: 'PUBLISHED',
        }],
      }),
    }),
  );

  await page.goto('/', { waitUntil: 'domcontentloaded' });
  const requestButton = page.getByRole('button', { name: /Request this service/i }).last();
  await expect(requestButton).toBeVisible();
  await requestButton.click();

  const dialog = page.getByRole('dialog', { name: /Service Request Form Fixture/i });
  await expect(dialog.getByLabel('Full name *')).toBeVisible();
  await expect(dialog.getByLabel('WhatsApp number *')).toBeVisible();
  await expect(dialog.getByLabel('Email address (optional)')).toBeVisible();
  await expect(dialog.getByLabel('Additional notes (required)')).toBeVisible();

  const nameInput = dialog.locator('#service-request-customer-name');
  const fieldStyle = await nameInput.evaluate(element => {
    const style = window.getComputedStyle(element);
    return {
      borderStyle: style.borderStyle,
      borderWidth: style.borderTopWidth,
      borderColor: style.borderTopColor,
      minHeight: style.minHeight,
    };
  });
  expect(fieldStyle.borderStyle).toBe('solid');
  expect(fieldStyle.borderWidth).toBe('2px');
  expect(fieldStyle.minHeight).toBe('48px');
  expect(fieldStyle.borderColor).not.toBe('rgba(0, 0, 0, 0)');
  await expect(dialog).toContainText(/continue to secure checkout for priced services/i);
});


test('Make Payments page shows the request summary without exposing its checkout token in the URL', async ({ page }) => {
  await page.addInitScript(() => {
    window.sessionStorage.setItem('eduken_guest_checkout', JSON.stringify({
      requestId: '123e4567-e89b-42d3-a456-426614174000',
      checkoutToken: 'a'.repeat(64),
      referenceNumber: 'EDK-20261016-AB12CD34',
      serviceName: 'Admission Consultation',
      amount: 2500,
      email: 'student@example.com',
      paymentStatus: 'Not paid',
    }));
  });

  await page.goto('/make-payments', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { name: 'Make Payments' })).toBeVisible();
  await expect(page.getByText('Admission Consultation')).toBeVisible();
  await expect(page.getByText('EDK-20261016-AB12CD34')).toBeVisible();
  await expect(page.getByText('₦2,500')).toBeVisible();
  await expect(page.getByLabel(/Receipt email/)).toHaveValue('student@example.com');
  await expect(page.getByText(/check your Spam or Junk folder/i)).toBeVisible();
  await expect(page.getByText(/payment status.*verified payment records/i)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Continue to Paystack' })).toBeVisible();
  expect(page.url()).not.toContain('a'.repeat(64));
});

test('public navigation hides Admin Login while direct /admin keeps the OAuth return path', async ({ page }) => {
  const authorizeEndpoint = 'https://pphxltbkwygqjtjgkhxu.supabase.co/auth/v1/authorize';

  // Public navigation must not advertise the admin route.
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('link', { name: 'Admin Login' })).toHaveCount(0);

  // Intercept the OAuth hand-off so this test never signs into a real account.
  await page.route(authorizeEndpoint + '**', route =>
    route.fulfill({
      status: 200,
      contentType: 'text/html',
      body: '<!doctype html><title>OAuth hand-off intercepted by Playwright</title>',
    }),
  );

  // Direct access to the admin sign-in route remains available.
  await page.goto('/admin', { waitUntil: 'domcontentloaded' });
  await expect(page).toHaveURL(/\/admin\/?$/);
  await expect(page.getByRole('dialog', { name: /Admin sign in/i })).toBeVisible();

  const siteOrigin = new URL(page.url()).origin;
  const authNavigation = page.waitForRequest(
    request => request.isNavigationRequest() && request.url().startsWith(authorizeEndpoint),
  );
  await page.getByRole('button', { name: /Continue with Google/i }).click();
  const authUrl = new URL((await authNavigation).url());
  expect(authUrl.searchParams.get('provider')).toBe('google');
  expect(authUrl.searchParams.get('redirect_to')).toBe(siteOrigin + '/admin');
});

test('appearance preference persists and System mode follows operating-system changes', async ({ page }) => {
  await page.addInitScript(() => {
    // Clear the saved preference only on the first document; keep it during reload assertions.
    if (window.sessionStorage.getItem('__eduken_theme_test_initialized') !== '1') {
      window.localStorage.removeItem('eduken-theme');
      window.sessionStorage.setItem('__eduken_theme_test_initialized', '1');
    }
  });
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  const root = page.locator('html');
  const toggle = page.locator('.theme-toggle').first();
  await expect(toggle).toBeVisible();
  await expect(toggle).toHaveAttribute('aria-label', 'Appearance is light mode. Change appearance');
  await expect(toggle).toHaveAttribute('title', 'Appearance: light mode');
  await expect(root).toHaveAttribute('data-theme', 'light');
  await expect(root).toHaveCSS('color-scheme', 'light');

  await toggle.click();
  await expect(toggle).toBeFocused();
  await expect(toggle).toHaveAttribute('aria-label', 'Appearance is dark mode. Change appearance');
  await expect(toggle).toHaveAttribute('title', 'Appearance: dark mode');
  await expect(root).toHaveAttribute('data-theme', 'dark');
  await expect(root).toHaveCSS('color-scheme', 'dark');
  await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(7, 20, 38)');
  await expect(page.locator('.platform-card').first()).toHaveCSS('background-color', 'rgb(13, 32, 56)');
  await expect.poll(() => page.evaluate(() => window.localStorage.getItem('eduken-theme'))).toBe('dark');

  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-label', 'Appearance is System default. Change appearance');
  await expect(toggle).toHaveAttribute('title', 'Appearance: System default');
  await expect(toggle).toContainText('System');
  await expect.poll(() => page.evaluate(() => window.localStorage.getItem('eduken-theme'))).toBe('system');
  await page.emulateMedia({ colorScheme: 'light' });
  await expect(root).toHaveAttribute('data-theme', 'light');
  await expect(root).toHaveCSS('color-scheme', 'light');
  await page.emulateMedia({ colorScheme: 'dark' });
  await expect(root).toHaveAttribute('data-theme', 'dark');
  await expect(root).toHaveCSS('color-scheme', 'dark');
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(toggle).toContainText('System');
  await expect(root).toHaveAttribute('data-theme', 'dark');
  await expect.poll(() => page.evaluate(() => window.localStorage.getItem('eduken-theme'))).toBe('system');

  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-label', 'Appearance is light mode. Change appearance');
  await expect(root).toHaveAttribute('data-theme', 'light');
  await expect.poll(() => page.evaluate(() => window.localStorage.getItem('eduken-theme'))).toBe('light');
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(root).toHaveAttribute('data-theme', 'light');
});

test('standalone aggregate calculator applies saved light and dark theme with readable contrast', async ({ page }) => {
  await page.addInitScript(() => {
    // The init script runs again on reload. Set the initial dark preference only
    // once per test page so the later light-mode reload can exercise persistence.
    if (window.sessionStorage.getItem('eduken-theme-test-initialized') !== '1') {
      window.localStorage.setItem('eduken-theme', 'dark');
      window.sessionStorage.setItem('eduken-theme-test-initialized', '1');
    }
  });
  await page.goto('/aggregate-calculator', { waitUntil: 'domcontentloaded' });

  const root = page.locator('html');
  const card = page.locator('.aggregate-card').first();
  const heading = page.getByRole('heading', { name: 'EDUKEN Aggregate Calculator' });
  await expect(root).toHaveAttribute('data-theme', 'dark');
  await expect(root).toHaveAttribute('data-theme-preference', 'dark');
  await expect(root).toHaveCSS('color-scheme', 'dark');
  await expect(card).toHaveCSS('background-color', 'rgb(13, 32, 56)');
  await expect(heading).toHaveCSS('color', 'rgb(241, 247, 255)');

  await page.evaluate(() => window.localStorage.setItem('eduken-theme', 'light'));
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(root).toHaveAttribute('data-theme', 'light');
  await expect(root).toHaveAttribute('data-theme-preference', 'light');
  await expect(root).toHaveCSS('color-scheme', 'light');
  await expect(card).toHaveCSS('background-color', 'rgb(255, 255, 255)');
  await expect(heading).toHaveCSS('color', 'rgb(23, 63, 49)');
});

test('admin payment records require admin authorization and return only dashboard-safe fields', () => {
  const source = readFileSync('supabase/functions/eduken-api/index.ts', 'utf8');
  const routeStart = source.indexOf('if (path === "/api/admin/payments" && req.method === "GET")');
  const routeEnd = source.indexOf('if (path === "/api/admin/system-settings")', routeStart);
  expect(routeStart).toBeGreaterThanOrEqual(0);
  expect(routeEnd).toBeGreaterThan(routeStart);

  const route = source.slice(routeStart, routeEnd);
  const authAt = route.indexOf('await requireAdmin(req)');
  const queryAt = route.indexOf('db.from("payments").select(');
  expect(authAt).toBeGreaterThanOrEqual(0);
  expect(queryAt).toBeGreaterThan(authAt);
  expect(route).toContain('select("id,amount,currency,status,payment_reference,created_at,paid_at,service_requests(reference_number,customer_name)")');
  expect(route).not.toContain('select("*,');
  expect(route).not.toContain('authorization_url');

  const component = readFileSync('src/PaymentsAdmin.tsx', 'utf8');
  expect(component).toContain("api.get('/api/admin/payments')");
  expect(component).toContain('item.payment_reference');
  expect(component).toContain('item.paid_at');
  expect(component).not.toContain('authorization_url');
  expect(component).not.toContain('user_id');
});

test('system health endpoint is admin-protected and reports safe component statuses', () => {
  const handler = readFileSync('supabase/functions/eduken-api/index.ts', 'utf8');
  const routeStart = handler.indexOf('if (path === "/api/admin/system-health" && req.method === "GET")');
  const routeEnd = handler.indexOf('if (path === "/api/admin/system-settings")', routeStart);
  expect(routeStart).toBeGreaterThan(-1);
  expect(routeEnd).toBeGreaterThan(routeStart);
  const route = handler.slice(routeStart, routeEnd);
  expect(route).toContain('await requireAdmin(req)');
  expect(route).toContain('Public website');
  expect(route).toContain('Database and API');
  expect(route).toContain('Authentication service');
  expect(route).toContain('Transactional email provider');
  expect(route).toContain('Outage email alerts');
  expect(route).toContain('not_checked');
  expect(route).toContain('Payment safety configuration');
  expect(route).toContain('RESEND_API_KEY');
  expect(route).toContain('Deno.env.get("PAYSTACK_MODE")');
  expect(route).toContain('mode === "test" && /^sk_test_[A-Za-z0-9]+$/.test(secret)');
  expect(route).not.toContain('secret.startsWith("sk_test_")');
  expect(route).not.toContain('console.log');
});

test('scheduled health monitor supports recovery email independently of customer alerts', () => {
  const workflow = readFileSync('.github/workflows/health-check.yml', 'utf8');
  expect(workflow).toContain('cron: "*/15 * * * *"');
  expect(workflow).toContain('Detect recovery after a previous failed health check');
  expect(workflow).toContain('listJobsForWorkflowRun');
  expect(workflow).toContain('const recentRuns = runs.data.workflow_runs');
  expect(workflow).toContain('latestOutage');
  expect(workflow).toContain("step.name === 'Send recovery email' && step.conclusion === 'success'");
  expect(workflow).not.toContain('const previous = runs.data.workflow_runs');
  expect(workflow).toContain("step.conclusion === 'failure'");
  expect(workflow).not.toContain("previous?.conclusion === 'failure'");
  expect(workflow).not.toContain("github.event.inputs.test_email != 'true'");
  expect(workflow).toContain('RECOVERED: EDUKEN CONSULT health checks passed');
  expect(workflow).toContain('ALERT: EDUKEN CONSULT live health check failed');
  expect(workflow).toContain("dawidd6/action-send-mail@v22");
  expect(workflow).toContain("actions/github-script@v8");
  expect(workflow).not.toContain("actions/github-script@v7");
  expect(workflow).not.toContain("dawidd6/action-send-mail@v3");
  expect(workflow).toContain("runs-on: ubuntu-24.04");
  expect(workflow).toContain("This is a test run; no failed step is implied.");
  expect(workflow).toContain("Please open this run to see the failed step and logs:");
  expect(workflow).toContain('secrets.ALERT_EMAIL_TO');
  expect(workflow).not.toContain('/api/email-alerts/subscribe');
});

test('legacy JAMB service rows remain visible without being made available for checkout', async ({ page }) => {
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
          id: 'legacy-jamb-epin-fixture',
          name: 'JAMB e-PIN (UTME Without Mock)',
          category: 'JAMB Services',
          description: 'Legacy service row fixture.',
          requirements: 'Test fixture only.',
          price: 7128,
          // Simulate a legacy database row that predates availability/catalogue flags.
          is_catalog_item: false,
          is_published: true,
        }],
      }),
    }),
  );

  await page.goto('/#jamb-services', { waitUntil: 'domcontentloaded' });

  const card = page.locator('.jamb-service-card').filter({
    has: page.getByRole('heading', { name: 'JAMB e-PIN (UTME Without Mock)' }),
  });
  await expect(card).toBeVisible();
  await expect(card).toContainText('Unavailable');
  await expect(card.getByRole('button', { name: 'Currently unavailable' })).toBeDisabled();
  await expect(page.locator('.jamb-catalogue-empty')).toHaveCount(0);
});



test('isolated payment webhook fails closed against a forged success event', async ({ request }) => {
  const response = await request.post(
    'https://wpktzogarfqrgkirzdpy.supabase.co/functions/v1/eduken-api/api/payments/webhook',
    {
      headers: {
        'content-type': 'application/json',
        'x-paystack-signature': 'invalid-test-signature',
      },
      data: {
        event: 'charge.success',
        data: {
          reference: 'EDK-PAY-19CC6E47E2824EB2BC',
          amount: 10000,
          currency: 'NGN',
          status: 'success',
        },
      },
      timeout: 20_000,
    },
  );

  // Report which guard actually rejected the request: 401 verifies the
  // signature guard; 503 confirms the endpoint is disabled by configuration.
  const body = await response.json();
  console.log(
    `Isolated forged-webhook result: HTTP ${response.status()} — ${String(body.code || body.error || 'no error code')}`,
  );
  expect([401, 503], 'forged webhook must never be accepted').toContain(response.status());
  if (response.status() === 401) {
    expect(body.error).toMatch(/signature/i);
  } else {
    expect(body.code).toBe('PAYSTACK_TEST_MODE_REQUIRED');
  }
});

test('public opportunity hub hides expired deadlines but keeps current opportunities', async ({ page }) => {
  await page.route('**/functions/v1/eduken-api/public-content', route =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        opportunities: [
          {
            id: 'expired-opportunity-fixture',
            title: 'Expired Opportunity Fixture',
            category: 'Scholarship',
            description: 'A test-only opportunity whose deadline has passed.',
            deadline: '15 October 2026',
            is_published: true,
          },
          {
            id: 'current-opportunity-fixture',
            title: 'Current Opportunity Fixture',
            category: 'Scholarship',
            description: 'A test-only opportunity that remains open.',
            deadline: '30 October 2026',
            is_published: true,
          },
        ],
        admissions: [],
        updates: [],
        faqs: [],
        services: [],
      }),
    }),
  );

  await page.goto('/#opportunities', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.opp-card h3', { hasText: 'Expired Opportunity Fixture' })).toHaveCount(0);
  await expect(page.locator('.opp-card h3', { hasText: 'Current Opportunity Fixture' })).toBeVisible();
});

test('admin content deadline validation and calendar picker are wired for create and edit', async () => {
  const source = readFileSync('supabase/functions/eduken-api/index.ts', 'utf8');
  const app = readFileSync('src/App.tsx', 'utf8');
  expect(source).toContain('function normalizeContentDeadline(value: unknown)');
  expect(source).toContain('(st|nd|rd|th)');
  expect(source).toContain('Enter a valid deadline date, for example 2026-10-21, or leave it blank.');
  expect(source.split('normalizeContentDeadline(b.deadline)')).toHaveLength(3);
  expect(app).toContain('/(^|_)(date|deadline|expires_at|scheduled_at|start_date|end_date|publish_at)(_|$)/i.test(field)');
  expect(app).toContain("'datetime-local' : 'date'");
  expect(app).toContain("aria-label={field.replace(/_/g, ' ') + ' (optional)'}");
});


test('opportunity WhatsApp share includes dynamic category, location, deadline, benefits, application guidance and EDUKEN CTA', () => {
  const app = readFileSync('src/App.tsx', 'utf8');
  const shareStart = app.indexOf('const shareOpportunityOnWhatsApp = (item: Item) =>');
  const shareEnd = app.indexOf('const shareUpdateOnWhatsApp = (item: Item) =>', shareStart);
  expect(shareStart).toBeGreaterThanOrEqual(0);
  expect(shareEnd).toBeGreaterThan(shareStart);
  const share = app.slice(shareStart, shareEnd);
  expect(share).toContain('💼 *JOB OPPORTUNITIES*');
  expect(share).toContain('📍 Location: ');
  expect(share).toContain('📅 Deadline: ');
  expect(share).toContain('💼 Salary / Benefits: ');
  expect(share).toContain('📝 *HOW TO APPLY*');
  expect(share).toContain('🔗 *READ FULL DETAILS & APPLY 👇*');
  expect(share).toContain("'Your Trusted Plug for Educational Updates, Admissions & Opportunities.'");
  expect(share).not.toContain('Visit EDUKEN CONSULT for more information and full application details.');
  expect(app).toContain("'location',");
});

test('production checkout clearly blocks Paystack while Flutterwave is available and selected', () => {
  const app = readFileSync(new URL('../../src/App.tsx', import.meta.url), 'utf8');
  const liveProviderStart = app.indexOf(") : isFlutterwaveLiveUiEnabled ? (");
  const liveProviderEnd = app.indexOf(") : (", liveProviderStart);
  expect(liveProviderStart).toBeGreaterThanOrEqual(0);
  expect(liveProviderEnd).toBeGreaterThan(liveProviderStart);
  const liveProvider = app.slice(liveProviderStart, liveProviderEnd);
  expect(liveProvider).toContain('Paystack — TEMPORARILY UNAVAILABLE');
  expect(liveProvider).toContain('awaiting account approval');
  expect(liveProvider).toContain('payment-provider-warning');
  expect(liveProvider).toContain("setPaymentProvider('flutterwave')");
  expect(liveProvider).not.toContain("setPaymentProvider('paystack')");
  expect(app).toContain("(usesIsolatedTestBackend || isFlutterwaveLiveUiEnabled) ? 'flutterwave' : 'paystack'");
});

test('JAMB candidate quantity has visible increment/decrement controls and bounded entry', () => {
  const app = readFileSync(new URL('../../src/App.tsx', import.meta.url), 'utf8');
  const css = readFileSync(new URL('../../src/index.css', import.meta.url), 'utf8');
  expect(app).toContain('candidate-quantity-control');
  expect(app).toContain('aria-label="Decrease number of candidates"');
  expect(app).toContain('aria-label="Increase number of candidates"');
  expect(app).toContain('min="1" max="100" step="1"');
  expect(app).toContain('candidate-quantity-total');
  expect(css).toContain('.candidate-quantity-control');
  expect(css).toContain('.candidate-quantity-button:focus-visible');
});
