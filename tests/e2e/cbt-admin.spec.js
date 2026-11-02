import { test, expect } from '@playwright/test';

// This is a frontend workflow test only. It simulates the allowlisted OAuth
// callback and admin API responses; real Supabase authentication and database
// writes remain covered by separate isolated integration checks.
test('admin can import a CSV as drafts and move a question through review states', async ({ page }) => {
  const bank = [];
  const imports = [];
  let nextId = 1;

  await page.route('**/auth/v1/user', route => route.fulfill({
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
    const method = request.method();

    if (path === '/api/admin/session' && method === 'GET') {
      return route.fulfill({ json: { admin: true } });
    }
    if (path === '/api/content' && method === 'GET') {
      return route.fulfill({ json: { opportunities: [], admissions: [], updates: [], faqs: [], services: [] } });
    }
    if (path === '/api/admin/content/opportunities' && method === 'GET') {
      return route.fulfill({ json: { items: [] } });
    }
    if (path === '/api/admin/system-settings' && method === 'GET') {
      return route.fulfill({ json: { settings: {} } });
    }
    if (path === '/api/admin/cbt/questions' && method === 'GET') {
      return route.fulfill({ json: { items: bank, total: bank.length } });
    }
    if (path === '/api/admin/cbt/imports' && method === 'GET') {
      return route.fulfill({ json: { items: imports } });
    }
    if (path === '/api/admin/cbt/import' && method === 'POST') {
      const payload = request.postDataJSON();
      expect(payload.rows).toHaveLength(1);
      expect(payload.rows[0]).not.toHaveProperty('status');
      const question = {
        id: 'test-question-' + nextId++,
        ...payload.rows[0],
        status: 'draft',
      };
      bank.push(question);
      imports.unshift({
        id: 'test-import-' + imports.length,
        filename: payload.filename,
        source_label: payload.sourceLabel,
        total_rows: 1,
        inserted_rows: 1,
        duplicate_rows: 0,
        invalid_rows: 0,
        status: 'completed',
        created_at: new Date().toISOString(),
      });
      return route.fulfill({
        status: 201,
        json: { batch: imports[0], inserted: 1, duplicates: 0, invalid: 0, errors: [] },
      });
    }

    const transition = path.match(/^\/api\/admin\/cbt\/questions\/([^/]+)$/);
    if (transition && method === 'PUT') {
      const payload = request.postDataJSON();
      const question = bank.find(item => item.id === transition[1]);
      if (!question) return route.fulfill({ status: 404, json: { error: 'Question not found.' } });
      question.status = payload.status;
      return route.fulfill({ json: { question } });
    }

    return route.fulfill({ json: { items: [], ok: true } });
  });

  await page.goto('/admin#access_token=mock-admin-access-token&refresh_token=mock-admin-refresh-token&expires_in=3600', {
    waitUntil: 'domcontentloaded',
  });

  await expect(page.getByRole('button', { name: /CBT Question Bank/i })).toBeVisible();
  await page.getByRole('button', { name: /CBT Question Bank/i }).click();
  await expect(page.getByRole('heading', { name: 'CBT Question Bank' })).toBeVisible();

  await page.getByRole('button', { name: /Import CSV/i }).click();
  const csv = [
    'exam_type,subject,topic,subtopic,question_text,option_A,option_B,option_C,option_D,correct_option,explanation,difficulty,source_type,source_name,source_year,provenance_notes,licensing_notes',
    'JAMB,Use of English,Grammar,Nouns,"Which word names a quality?",quickly,happiness,blue,run,B,"Happiness names a quality.",easy,original,,,,',
  ].join('\n');
  await page.locator('input[type="file"]').setInputFiles({
    name: 'admin-ui-smoke.csv',
    mimeType: 'text/csv',
    buffer: Buffer.from(csv),
  });

  await expect(page.getByText('admin-ui-smoke.csv: 1 rows ready for validation and import.')).toBeVisible();
  await page.getByRole('button', { name: /Validate & import drafts/i }).click();
  await expect(page.getByText('Inserted: 1 · Duplicates: 0 · Invalid: 0')).toBeVisible();
  await expect(page.getByText('State: draft')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Mark reviewed' })).toBeVisible();

  await page.getByRole('button', { name: 'Mark reviewed' }).click();
  await expect(page.getByText('State: reviewed')).toBeVisible();
  await page.getByRole('button', { name: 'Approve' }).click();
  await expect(page.getByText('State: approved')).toBeVisible();
  await page.getByRole('button', { name: 'Publish' }).click();
  await expect(page.getByText('State: published')).toBeVisible();

  expect(bank).toHaveLength(1);
  expect(bank[0].status).toBe('published');
  expect(imports).toHaveLength(1);
  expect(imports[0].inserted_rows).toBe(1);
});
