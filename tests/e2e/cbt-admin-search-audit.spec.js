import { test, expect } from '@playwright/test';

test('CBT admin pagination changes server page and search resets to page one with audit fields visible', async ({ page }) => {
  const questionRequests = [];
  const auditQuestion = {
    id: 'audit-question-1',
    exam_type: 'JAMB',
    subject: 'Biology',
    topic: 'Cell structure',
    subtopic: 'Organelles',
    question_text: 'Which organelle controls cell activities?',
    options: { A: 'Nucleus', B: 'Ribosome', C: 'Vacuole', D: 'Cell wall' },
    correct_option: 'A',
    explanation: 'The nucleus contains genetic material and coordinates cell activities.',
    difficulty: 'easy',
    source_type: 'original',
    source_name: '',
    source_year: null,
    provenance_notes: '',
    licensing_notes: '',
    status: 'reviewed',
    created_by: 'admin-created-id',
    created_at: '2026-11-08T08:00:00.000Z',
    reviewed_by: 'subject-reviewer-id',
    reviewed_at: '2026-11-08T09:00:00.000Z',
    approved_by: null,
    approved_at: null,
    published_by: null,
    published_at: null,
  };

  await page.route('**/auth/v1/user**', route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({
      id: '00000000-0000-4000-8000-000000000001',
      email: 'timmyjoe385@gmail.com',
      aud: 'authenticated',
      role: 'authenticated',
    }),
  }));

  await page.route('**/functions/v1/eduken-api/**', async route => {
    const request = route.request();
    const url = new URL(request.url());
    const marker = '/functions/v1/eduken-api';
    const path = url.pathname.slice(url.pathname.indexOf(marker) + marker.length);

    if (path === '/api/admin/session' && request.method() === 'GET') {
      return route.fulfill({ json: { admin: true } });
    }
    if (path === '/api/content' && request.method() === 'GET') {
      return route.fulfill({ json: { opportunities: [], admissions: [], updates: [], faqs: [], services: [] } });
    }
    if (path === '/api/admin/content/opportunities' && request.method() === 'GET') {
      return route.fulfill({ json: { items: [] } });
    }
    if (path === '/api/admin/system-settings' && request.method() === 'GET') {
      return route.fulfill({ json: { settings: {} } });
    }
    if (path === '/api/admin/cbt/imports' && request.method() === 'GET') {
      return route.fulfill({ json: { items: [] } });
    }
    if (path === '/api/admin/cbt/questions' && request.method() === 'GET') {
      const params = url.searchParams;
      const requestRecord = {
        q: params.get('q') || '',
        page: Number(params.get('page') || 1),
        pageSize: Number(params.get('pageSize') || 50),
        status: params.get('status') || 'all',
      };
      questionRequests.push(requestRecord);

      if (requestRecord.status === 'reviewed') {
        return route.fulfill({
          json: { items: [auditQuestion], total: 1, page: requestRecord.page, pageSize: requestRecord.pageSize },
        });
      }
      if (requestRecord.q.toLowerCase().includes('cell')) {
        return route.fulfill({
          json: { items: [auditQuestion], total: 1, page: requestRecord.page, pageSize: requestRecord.pageSize },
        });
      }
      return route.fulfill({
        json: { items: [], total: 120, page: requestRecord.page, pageSize: requestRecord.pageSize },
      });
    }

    return route.fulfill({ json: { items: [], ok: true } });
  });

  await page.goto('/admin#access_token=mock-admin-access-token&refresh_token=mock-admin-refresh-token&expires_in=3600', {
    waitUntil: 'domcontentloaded',
  });
  await expect(page.getByRole('button', { name: /CBT Question Bank/i })).toBeVisible();
  await page.getByRole('button', { name: /CBT Question Bank/i }).click();
  await expect(page.getByRole('heading', { name: 'CBT Question Bank', level: 1 })).toBeVisible();

  await expect(page.getByText(/Page 1 of 3/)).toBeVisible();
  await page.getByRole('button', { name: 'Next' }).click();
  await expect(page.getByText(/Page 2 of 3/)).toBeVisible();
  await expect.poll(() => questionRequests.at(-1)?.page).toBe(2);

  await page.getByLabel('Review state').selectOption('reviewed');
  await expect(page.getByText(/Page 1 of 1/)).toBeVisible();
  await expect.poll(() => questionRequests.at(-1)).toMatchObject({ status: 'reviewed', page: 1 });

  await page.getByLabel('Review state').selectOption('all');
  await expect(page.getByText(/Page 1 of 3/)).toBeVisible();
  await page.getByRole('button', { name: 'Next' }).click();
  await expect(page.getByText(/Page 2 of 3/)).toBeVisible();

  const search = page.getByPlaceholder('Question, subject or topic');
  await search.fill('cell');
  await expect(page.getByText('Which organelle controls cell activities?')).toBeVisible();
  await expect(page.getByText(/Page 1 of 1/)).toBeVisible();
  await expect.poll(() => questionRequests.at(-1)).toMatchObject({ q: 'cell', page: 1, pageSize: 50 });

  await expect(page.getByText('Created: admin-created-id')).toBeVisible();
  await expect(page.getByText('Reviewed: subject-reviewer-id')).toBeVisible();
  await expect(page.getByText(/Approved: Not recorded/)).toBeVisible();
  await expect(page.getByText(/Published: Not recorded/)).toBeVisible();
});
