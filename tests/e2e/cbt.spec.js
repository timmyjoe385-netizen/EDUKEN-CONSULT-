import { test, expect } from '@playwright/test';

test('CBT falls back to original local practice when the published bank is empty', async ({ page }) => {
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
  await expect(page.getByText(/question bank is empty or unavailable.*local practice mode/i)).toBeVisible();
  await expect(page.getByRole('button', { name: /Start free practice/i })).toBeEnabled();
  await expect(page.getByRole('button', { name: /Start mixed mock/i })).toBeEnabled();
  await page.getByRole('button', { name: /Start free practice/i }).click();
  await expect(page.getByText('Question 1 of 2')).toBeVisible();

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

test('published CBT questions are graded by the server after submission', async ({ page }) => {
  await page.route('**/api/cbt/questions*', route =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        items: [{
          id: 'question-uuid-1',
          subject: 'Use of English',
          question_text: 'Choose the correct option.',
          options: { A: 'Wrong', B: 'Right', C: 'Also wrong', D: 'Not this one' },
        }],
      }),
    })
  );
  await page.route('**/api/cbt/start*', route =>
    route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({
        attemptToken: 'a'.repeat(64),
        durationSeconds: 900,
        questions: [{
          id: 'question-uuid-1',
          subject: 'Use of English',
          prompt: 'Choose the correct option.',
          options: ['Wrong', 'Right', 'Also wrong', 'Not this one'],
        }],
      }),
    })
  );
  await page.route('**/api/cbt/submit*', async route => {
    const payload = route.request().postDataJSON();
    expect(payload.attemptToken).toBe('a'.repeat(64));
    expect(payload.answers['question-uuid-1']).toBe(1);
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        score: 1,
        total: 1,
        percent: 100,
        submittedAt: '2026-10-29T06:00:00.000Z',
        review: [{
          id: 'question-uuid-1',
          subject: 'Use of English',
          prompt: 'Choose the correct option.',
          options: ['Wrong', 'Right', 'Also wrong', 'Not this one'],
          selectedOption: 'B',
          correctOption: 'B',
          explanation: 'The second option is correct.',
          isCorrect: true,
        }],
      }),
    });
  });

  await page.goto('/cbt', { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: /Start free practice/i }).click();
  await expect(page.getByText('Question 1 of 1')).toBeVisible();
  await page.getByRole('button', { name: /Right/ }).click();
  await page.getByRole('button', { name: /Submit practice/i }).click();
  await expect(page.getByRole('heading', { name: 'Good work. Keep building.' })).toBeVisible();
  await expect(page.getByText('Correct answer:')).toBeVisible();
  await expect(page.getByText('The second option is correct.')).toBeVisible();
});


test('timed-out CBT automatically retries a temporary submission failure', async ({ page }) => {
  await page.clock.install();
  await page.route('**/api/cbt/questions*', route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ items: [{
      id: 'question-timeout-1',
      subject: 'Use of English',
      question_text: 'Choose the correct option.',
      options: { A: 'Wrong', B: 'Right', C: 'Also wrong', D: 'Not this one' },
    }] }),
  }));
  await page.route('**/api/cbt/start*', route => route.fulfill({
    status: 201,
    contentType: 'application/json',
    body: JSON.stringify({
      attemptToken: 'b'.repeat(64),
      durationSeconds: 1,
      expiresAt: new Date(Date.now() + 16_000).toISOString(),
      questions: [{
        id: 'question-timeout-1',
        subject: 'Use of English',
        prompt: 'Choose the correct option.',
        options: ['Wrong', 'Right', 'Also wrong', 'Not this one'],
      }],
    }),
  }));

  let submissionCount = 0;
  await page.route('**/api/cbt/submit*', async route => {
    submissionCount += 1;
    if (submissionCount === 1) {
      await route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Temporary network/server failure.' }),
      });
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        score: 1,
        total: 1,
        percent: 100,
        submittedAt: new Date(Date.now()).toISOString(),
        review: [{
          id: 'question-timeout-1',
          subject: 'Use of English',
          prompt: 'Choose the correct option.',
          options: ['Wrong', 'Right', 'Also wrong', 'Not this one'],
          selectedOption: 'B',
          correctOption: 'B',
          explanation: 'The second option is correct.',
          isCorrect: true,
        }],
      }),
    });
  });

  await page.goto('/cbt', { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: /Start free practice/i }).click();
  await expect(page.getByText('Question 1 of 1')).toBeVisible();
  await page.getByRole('button', { name: /Right/ }).click();

  await page.clock.fastForward(1_000);
  await expect(page.getByText(/Temporary network\/server failure/i)).toBeVisible();
  await page.clock.fastForward(1_500);

  await expect(page.getByRole('heading', { name: 'Good work. Keep building.' })).toBeVisible();
  expect(submissionCount).toBe(2);
});


test('signed-in students can see personal progress before claiming an Arena username', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('eduken_auth_session', JSON.stringify({
      access_token: 'test-access-token',
      refresh_token: 'test-refresh-token',
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      user: { id: 'student-progress-user', email: 'student@example.test' },
    }));
  });
  await page.route('**/api/cbt/student-profile', route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ profile: null }),
  }));
  await page.route('**/api/cbt/attempts', route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ items: [
      { mode: 'practice', subject: 'Biology', score: 8, total: 10, submitted_at: '2026-11-20T08:00:00.000Z', duration_seconds: 300 },
      { mode: 'practice', subject: 'Mathematics', score: 6, total: 10, submitted_at: '2026-11-19T08:00:00.000Z', duration_seconds: 360 },
    ] }),
  }));

  await page.goto('/cbt', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { name: 'Create your free competition username' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Your progress so far' })).toBeVisible();
  await expect(page.getByText('2', { exact: true }).first()).toBeVisible();
  await expect(page.getByText('20', { exact: true }).first()).toBeVisible();
  await expect(page.getByText('70.0%')).toBeVisible();
  await expect(page.getByText('80.0%')).toBeVisible();
  await expect(page.getByText('Biology', { exact: true })).toBeVisible();
  await expect(page.getByText('Mathematics', { exact: true })).toBeVisible();
});
