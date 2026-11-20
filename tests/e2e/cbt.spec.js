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
  await page.locator('#cbt-practice-count').selectOption('2');
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
  await page.locator('#cbt-practice-count').selectOption('2');
  await page.getByRole('button', { name: /Start free practice/i }).click();
  await expect(page.getByText('Question 1 of 2')).toBeVisible();

  await page.getByRole('button', { name: /Review later/i }).click();
  await expect(page.getByRole('button', { name: /Flagged/i })).toBeVisible();
  await page.getByRole('button', { name: /Next question/i }).click();
  await expect(page.getByText('Question 2 of 2')).toBeVisible();
  page.once('dialog', dialog => dialog.accept());
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
  await page.locator('#cbt-practice-count').selectOption('1');
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
  await page.locator('#cbt-practice-count').selectOption('1');
  await page.getByRole('button', { name: /Start free practice/i }).click();
  await expect(page.getByText('Question 1 of 1')).toBeVisible();
  await page.getByRole('button', { name: /Right/ }).click();

  await page.clock.fastForward(1_000);
  await expect(page.getByText(/Temporary network\/server failure/i)).toBeVisible();
  await page.clock.fastForward(1_500);

  await expect(page.getByRole('heading', { name: 'Good work. Keep building.' })).toBeVisible();
  expect(submissionCount).toBe(2);
});


test('hero timed-mock button sends the displayed default question count', async ({ page }) => {
  await page.route('**/api/cbt/questions*', route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ items: [{
      id: 'mock-question-1', subject: 'Use of English', question_text: 'Mock question?',
      options: { A: 'A', B: 'B', C: 'C', D: 'D' },
    }] }),
  }));
  let startPayload;
  await page.route('**/api/cbt/start*', async route => {
    startPayload = route.request().postDataJSON();
    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({
        attemptToken: 'c'.repeat(64), durationSeconds: 1800,
        questions: Array.from({ length: startPayload.questionCount }, (_, index) => ({ id: 'mock-question-' + index, subject: 'Use of English', prompt: 'Mock question ' + index + '?', options: ['A', 'B', 'C', 'D'] })),
      }),
    });
  });
  await page.goto('/cbt', { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: /Try a timed mock/i }).click();
  await expect(page.getByText('Question 1 of 10')).toBeVisible();
  expect(startPayload).toMatchObject({ mode: 'mock', questionCount: 10 });
});


test('manual CBT submission warns before submitting unanswered questions', async ({ page }) => {
  await page.route('**/api/cbt/questions*', route => route.fulfill({
    status: 200, contentType: 'application/json',
    body: JSON.stringify({ items: [{ id: 'unanswered-1', subject: 'Use of English', question_text: 'Question one?', options: { A: 'A', B: 'B', C: 'C', D: 'D' } }] }),
  }));
  let submitCalls = 0;
  await page.route('**/api/cbt/start*', route => route.fulfill({
    status: 201, contentType: 'application/json',
    body: JSON.stringify({ attemptToken: 'd'.repeat(64), durationSeconds: 900, questions: [{ id: 'unanswered-1', subject: 'Use of English', prompt: 'Question one?', options: ['A', 'B', 'C', 'D'] }] }),
  }));
  await page.route('**/api/cbt/submit*', async route => {
    submitCalls += 1;
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ score: 0, total: 1, percent: 0, review: [{ id: 'unanswered-1', subject: 'Use of English', prompt: 'Question one?', options: ['A', 'B', 'C', 'D'], correctOption: 'A', explanation: 'Explanation.' }] }) });
  });
  await page.goto('/cbt', { waitUntil: 'domcontentloaded' });
  await page.locator('#cbt-practice-count').selectOption('1');
  await page.getByRole('button', { name: /Start free practice/i }).click();
  await expect(page.getByText('Question 1 of 1')).toBeVisible();
  page.once('dialog', dialog => dialog.dismiss());
  await page.getByRole('button', { name: /Submit practice/i }).click();
  await expect(page.getByText('Question 1 of 1')).toBeVisible();
  expect(submitCalls).toBe(0);
  page.once('dialog', dialog => dialog.accept());
  await page.getByRole('button', { name: /Submit practice/i }).click();
  await expect(page.getByRole('heading', { name: 'Answer review' })).toBeVisible();
  expect(submitCalls).toBe(1);
});


test('Try again preserves the selected timed-mock question count', async ({ page }) => {
  await page.route('**/api/cbt/questions*', route => route.fulfill({
    status: 200, contentType: 'application/json',
    body: JSON.stringify({ items: [{ id: 'retry-mock-q', subject: 'Use of English', question_text: 'Mock question?', options: { A: 'A', B: 'B', C: 'C', D: 'D' } }] }),
  }));
  const requestedCounts = [];
  await page.route('**/api/cbt/start*', async route => {
    requestedCounts.push(route.request().postDataJSON().questionCount);
    const count = route.request().postDataJSON().questionCount;
    await route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ attemptToken: 'e'.repeat(64), durationSeconds: 1800, questions: Array.from({ length: count }, (_, index) => ({ id: 'retry-mock-q-' + index, subject: 'Use of English', prompt: 'Mock question ' + index + '?', options: ['A', 'B', 'C', 'D'] })) }) });
  });
  await page.route('**/api/cbt/submit*', async route => {
    const body = route.request().postDataJSON();
    const review = Object.keys(body.answers).map((id, index) => ({ id, subject: 'Use of English', prompt: 'Mock question ' + index + '?', options: ['A', 'B', 'C', 'D'], correctOption: 'A', explanation: 'Explanation.' }));
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ score: 0, total: review.length, percent: 0, review }) });
  });
  await page.goto('/cbt', { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: /Try a timed mock/i }).click();
  await expect(page.getByText('Question 1 of 10')).toBeVisible();
  page.once('dialog', dialog => dialog.accept());
  await page.getByRole('button', { name: /Submit practice/i }).click();
  await expect(page.getByRole('heading', { name: 'Answer review' })).toBeVisible();
  await page.getByRole('button', { name: /Try again/i }).click();
  await expect(page.getByText('Question 1 of 10')).toBeVisible();
  expect(requestedCounts).toEqual([10, 10]);
});


test('CBT Try again preserves the selected mixed-mock question count', async ({ page }) => {
  await page.route('**/api/cbt/questions*', route => route.fulfill({
    status: 200, contentType: 'application/json',
    body: JSON.stringify({ items: [{ id: 'retry-q1', subject: 'Use of English', question_text: 'Choose one.', options: { A: 'A', B: 'B', C: 'C', D: 'D' } }] }),
  }));
  const payloads = [];
  await page.route('**/api/cbt/start*', async route => {
    payloads.push(route.request().postDataJSON());
    await route.fulfill({
      status: 201, contentType: 'application/json',
      body: JSON.stringify({ attemptToken: String(payloads.length).repeat(64), durationSeconds: 1800,
        questions: Array.from({ length: payloads[payloads.length - 1].questionCount }, (_, index) => ({ id: 'retry-q' + index, subject: 'Use of English', prompt: 'Choose one ' + index + '?', options: ['A', 'B', 'C', 'D'] })) }),
    });
  });
  await page.route('**/api/cbt/submit*', route => route.fulfill({
    status: 200, contentType: 'application/json',
    body: JSON.stringify({ score: 0, total: 20, percent: 0, review: Array.from({ length: 20 }, (_, index) => ({ id: 'retry-q' + index, subject: 'Use of English', prompt: 'Choose one ' + index + '?', options: ['A', 'B', 'C', 'D'], correctOption: 'A', explanation: 'A is correct.' })) }),
  }));
  await page.goto('/cbt', { waitUntil: 'domcontentloaded' });
  await page.locator('#cbt-mock-count').selectOption('20');
  await page.getByRole('button', { name: /Start mixed mock/i }).click();
  await expect(page.getByText('Question 1 of 20')).toBeVisible();
  page.once('dialog', dialog => dialog.accept());
  await page.getByRole('button', { name: /Submit practice/i }).click();
  await expect(page.getByRole('heading', { name: 'Answer review' })).toBeVisible();
  await page.getByRole('button', { name: /Try again/i }).click();
  await expect(page.getByText('Question 1 of 20')).toBeVisible();
  expect(payloads.map(item => item.questionCount)).toEqual([20, 20]);
});

test('mixed mock selector starts the exact number of questions selected', async ({ page }) => {
  const requestedCounts = [];
  await page.route('**/api/cbt/questions*', route => route.fulfill({
    status: 200, contentType: 'application/json', body: JSON.stringify({ items: [] }),
  }));
  await page.route('**/api/cbt/start*', async route => {
    const payload = route.request().postDataJSON();
    requestedCounts.push(payload.questionCount);
    const questions = Array.from({ length: payload.questionCount }, (_, index) => ({
      id: 'selected-count-' + payload.questionCount + '-' + index,
      subject: index === 0 ? 'Use of English' : payload.subjectCombination[(index - 1) % 3],
      prompt: 'Question ' + (index + 1) + '?',
      options: ['A', 'B', 'C', 'D'],
    }));
    await route.fulfill({
      status: 201, contentType: 'application/json',
      body: JSON.stringify({ attemptToken: 'a'.repeat(64), durationSeconds: 1800, questions }),
    });
  });
  await page.goto('/cbt', { waitUntil: 'domcontentloaded' });
  const selector = page.locator('#cbt-mock-count');
  const start = page.getByRole('button', { name: /Start mixed mock/i });
  for (const count of [8, 10, 20, 40, 100, 180]) {
    await selector.selectOption(String(count));
    await expect(selector).toHaveValue(String(count));
    await start.click();
    await expect(page.getByText('Question 1 of ' + count)).toBeVisible();
    await page.once('dialog', dialog => dialog.accept());
    await page.getByRole('button', { name: /Exit/i }).click();
    await expect(selector).toBeVisible();
  }
  expect(requestedCounts).toEqual([8, 10, 20, 40, 100, 180]);
});

test('CBT calculator performs basic arithmetic and closes', async ({ page }) => {
  await page.route('**/api/cbt/questions*', route => route.fulfill({
    status: 200, contentType: 'application/json',
    body: JSON.stringify({ items: [{ id: 'calc-q1', subject: 'Mathematics', question_text: 'Calculate.', options: { A: '1', B: '2', C: '3', D: '4' } }] }),
  }));
  await page.route('**/api/cbt/start*', route => route.fulfill({
    status: 201, contentType: 'application/json',
    body: JSON.stringify({ attemptToken: 'd'.repeat(64), durationSeconds: 900,
      questions: [{ id: 'calc-q1', subject: 'Mathematics', prompt: 'Calculate.', options: ['1', '2', '3', '4'] }] }),
  }));
  await page.goto('/cbt', { waitUntil: 'domcontentloaded' });
  await page.locator('#cbt-subject-select').selectOption('Mathematics');
  await page.locator('#cbt-practice-count').selectOption('1');
  await page.getByRole('button', { name: /Start free practice/i }).click();
  await page.getByRole('button', { name: /Calculator/i }).click();
  const dialog = page.getByRole('dialog', { name: 'Practice calculator' });
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: '2', exact: true }).click();
  await dialog.getByRole('button', { name: '+', exact: true }).click();
  await dialog.getByRole('button', { name: '3', exact: true }).click();
  await dialog.getByRole('button', { name: '=', exact: true }).click();
  await expect(dialog.locator('.cbt-calculator-display')).toHaveText('5');
  await dialog.getByRole('button', { name: 'Close calculator' }).click();
  await expect(dialog).toBeHidden();
});


test('Finish and see results also warns about unanswered questions', async ({ page }) => {
  await page.route('**/api/cbt/questions*', route => route.fulfill({
    status: 200, contentType: 'application/json',
    body: JSON.stringify({ items: [{ id: 'finish-unanswered-1', subject: 'Use of English', question_text: 'Question?', options: { A: 'A', B: 'B', C: 'C', D: 'D' } }] }),
  }));
  let submitCalls = 0;
  await page.route('**/api/cbt/start*', route => route.fulfill({
    status: 201, contentType: 'application/json',
    body: JSON.stringify({ attemptToken: 'f'.repeat(64), durationSeconds: 900, questions: [{ id: 'finish-unanswered-1', subject: 'Use of English', prompt: 'Question?', options: ['A', 'B', 'C', 'D'] }] }),
  }));
  await page.route('**/api/cbt/submit*', async route => {
    submitCalls += 1;
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ score: 0, total: 1, percent: 0, review: [{ id: 'finish-unanswered-1', subject: 'Use of English', prompt: 'Question?', options: ['A', 'B', 'C', 'D'], correctOption: 'A', explanation: 'Explanation.' }] }) });
  });
  await page.goto('/cbt', { waitUntil: 'domcontentloaded' });
  await page.locator('#cbt-practice-count').selectOption('1');
  await page.getByRole('button', { name: /Start free practice/i }).click();
  await expect(page.getByText('Question 1 of 1')).toBeVisible();
  page.once('dialog', dialog => dialog.dismiss());
  await page.getByRole('button', { name: /Finish and see results/i }).click();
  await expect(page.getByText('Question 1 of 1')).toBeVisible();
  expect(submitCalls).toBe(0);
  page.once('dialog', dialog => dialog.accept());
  await page.getByRole('button', { name: /Finish and see results/i }).click();
  await expect(page.getByRole('heading', { name: 'Answer review' })).toBeVisible();
  expect(submitCalls).toBe(1);
});


test('subject practice remains available when the initial question list contains only another subject', async ({ page }) => {
  await page.route('**/api/cbt/questions*', route => route.fulfill({
    status: 200, contentType: 'application/json',
    body: JSON.stringify({ items: [{ id: 'biology-only', subject: 'Biology', question_text: 'Biology question?', options: { A: 'A', B: 'B', C: 'C', D: 'D' } }] }),
  }));
  let startPayload;
  await page.route('**/api/cbt/start*', async route => {
    startPayload = route.request().postDataJSON();
    await route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({
      attemptToken: 'g'.repeat(64), durationSeconds: 60,
      questions: [{ id: 'english-from-server', subject: 'Use of English', prompt: 'English question?', options: ['A', 'B', 'C', 'D'] }],
    }) });
  });
  await page.goto('/cbt', { waitUntil: 'domcontentloaded' });
  const startButton = page.getByRole('button', { name: /Start free practice/i });
  await expect(startButton).toBeEnabled();
  await page.locator('#cbt-practice-count').selectOption('1');
  await startButton.click();
  await expect(page.getByText('Question 1 of 1')).toBeVisible();
  expect(startPayload).toMatchObject({ mode: 'practice', subject: 'Use of English' });
});
