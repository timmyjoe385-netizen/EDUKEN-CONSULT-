import { test, expect } from '@playwright/test';

test('CBT does not expose local samples when the published bank is empty', async ({ page }) => {
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
  await expect(page.getByText(/Student attempts are disabled until reviewed questions are published/i)).toBeVisible();
  await expect(page.locator('.cbt-hero-actions .cbt-primary-button')).toBeDisabled();
  await expect(page.locator('.cbt-hero-actions .cbt-secondary-button')).toBeDisabled();
  await expect(page.locator('.cbt-question-card')).toHaveCount(0);

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

test('CBT does not fall back to unpublished samples when the published API is unavailable', async ({ page }) => {
  await page.route('**/functions/v1/eduken-api/api/cbt/questions*', route => route.abort());
  await page.goto('/cbt', { waitUntil: 'domcontentloaded' });

  await expect(page.getByText(/Student attempts are disabled until reviewed questions are published/i)).toBeVisible();
  await expect(page.locator('.cbt-hero-actions .cbt-primary-button')).toBeDisabled();
  await expect(page.locator('.cbt-hero-actions .cbt-secondary-button')).toBeDisabled();
  await expect(page.locator('.cbt-question-card')).toHaveCount(0);
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
  await page.getByRole('button', { name: 'Choose another practice' }).click();
  await expect(page.locator('.cbt-hero-actions .cbt-primary-button')).toBeVisible();
});



test('mixed mock defaults to the same 10-question count shown in the selector', async ({ page }) => {
  await page.route('**/api/cbt/questions*', route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ items: [
      ...Array.from({ length: 3 }, (_, index) => ({ id: 'mock-default-eng-' + index, subject: 'Use of English' })),
      ...Array.from({ length: 3 }, (_, index) => ({ id: 'mock-default-bio-' + index, subject: 'Biology' })),
      ...Array.from({ length: 2 }, (_, index) => ({ id: 'mock-default-chem-' + index, subject: 'Chemistry' })),
      ...Array.from({ length: 2 }, (_, index) => ({ id: 'mock-default-phy-' + index, subject: 'Physics' })),
    ].map(question => ({
      ...question,
      question_text: 'Choose the correct option.',
      options: { A: 'One', B: 'Two', C: 'Three', D: 'Four' },
    })) }),
  }));
  let requestedCount = null;
  await page.route('**/api/cbt/start*', async route => {
    const payload = route.request().postDataJSON();
    requestedCount = payload.questionCount;
    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({
        attemptToken: 'c'.repeat(64),
        durationSeconds: 900,
        questions: Array.from({ length: 10 }, (_, index) => ({
          id: 'mock-default-' + index,
          subject: index < 3 ? ['Biology', 'Chemistry', 'Physics'][index] : 'Use of English',
          prompt: 'Mock question ' + (index + 1),
          options: ['A', 'B', 'C', 'D'],
        })),
      }),
    });
  });

  await page.goto('/cbt', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#cbt-mock-count')).toHaveValue('10');
  await page.getByRole('button', { name: /Start mixed mock/i }).click();
  await expect(page.getByText('Question 1 of 10')).toBeVisible();
  expect(requestedCount).toBe(10);
});

test('four-question starter mock is offered only with one published question per subject and uses four minutes', async ({ page }) => {
  await page.route('**/api/cbt/questions*', route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ items: ['Use of English', 'Biology', 'Chemistry', 'Physics'].map((subject, index) => ({
      id: 'starter-mock-' + index,
      subject,
      question_text: 'Choose the correct option.',
      options: { A: 'One', B: 'Two', C: 'Three', D: 'Four' },
    })) }),
  }));
  await page.route('**/api/cbt/start*', async route => {
    const payload = route.request().postDataJSON();
    expect(payload.questionCount).toBe(4);
    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({
        attemptToken: 'e'.repeat(64),
        durationSeconds: 240,
        questions: ['Use of English', 'Biology', 'Chemistry', 'Physics'].map((subject, index) => ({
          id: 'starter-mock-session-' + index,
          subject,
          prompt: 'Starter mock question ' + (index + 1),
          options: ['A', 'B', 'C', 'D'],
        })),
      }),
    });
  });

  await page.goto('/cbt', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#cbt-mock-count')).toHaveValue('4');
  await page.getByRole('button', { name: /Start mixed mock/i }).click();
  await expect(page.getByText('Question 1 of 4')).toBeVisible();
  await expect(page.locator('.cbt-timer')).toContainText('04:00');
});

test('180-question full mock uses a 120-minute fallback when the API omits duration', async ({ page }) => {
  await page.route('**/api/cbt/questions*', route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ items: [
      ...Array.from({ length: 60 }, (_, index) => ({ id: 'full-mock-eng-' + index, subject: 'Use of English' })),
      ...Array.from({ length: 40 }, (_, index) => ({ id: 'full-mock-bio-' + index, subject: 'Biology' })),
      ...Array.from({ length: 40 }, (_, index) => ({ id: 'full-mock-chem-' + index, subject: 'Chemistry' })),
      ...Array.from({ length: 40 }, (_, index) => ({ id: 'full-mock-phy-' + index, subject: 'Physics' })),
    ].map(question => ({
      ...question,
      question_text: 'Choose the correct option.',
      options: { A: 'One', B: 'Two', C: 'Three', D: 'Four' },
    })) }),
  }));
  await page.route('**/api/cbt/start*', async route => {
    const payload = route.request().postDataJSON();
    expect(payload.questionCount).toBe(180);
    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({
        attemptToken: 'd'.repeat(64),
        questions: Array.from({ length: 180 }, (_, index) => ({
          id: 'full-mock-' + index,
          subject: ['Use of English', 'Biology', 'Chemistry', 'Physics'][index % 4],
          prompt: 'Full mock question ' + (index + 1),
          options: ['A', 'B', 'C', 'D'],
        })),
      }),
    });
  });

  await page.goto('/cbt', { waitUntil: 'domcontentloaded' });
  await page.locator('#cbt-mock-count').selectOption('180');
  await page.getByRole('button', { name: /Start mixed mock/i }).click();
  await expect(page.getByText('Question 1 of 180')).toBeVisible();
  await expect(page.locator('.cbt-timer')).toContainText('120:00');
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
