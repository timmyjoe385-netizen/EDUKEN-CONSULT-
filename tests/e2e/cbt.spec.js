import { test, expect } from '@playwright/test';

const questionRows = (prefix, subject, count = 20, questionText = 'Practice question?', options = { A: 'A', B: 'B', C: 'C', D: 'D' }) =>
  Array.from({ length: count }, (_, index) => ({ id: `${prefix}-${index + 1}`, subject, question_text: questionText, options: typeof options === 'function' ? options(index) : options }));
const attemptRows = (prefix, subject, count = 20, prompt = 'Practice question?', options = ['A', 'B', 'C', 'D']) =>
  Array.from({ length: count }, (_, index) => ({ id: `${prefix}-${index + 1}`, subject, prompt, options: typeof options === 'function' ? options(index) : options }));
const reviewRows = (prefix, subject, count = 20, prompt = 'Practice question?', options = ['A', 'B', 'C', 'D'], correctOption = 'A', explanation = 'Explanation.') =>
  Array.from({ length: count }, (_, index) => ({ id: `${prefix}-${index + 1}`, subject, prompt, options: typeof options === 'function' ? options(index) : options, correctOption, explanation }));

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('eduken_auth_session', JSON.stringify({
      access_token: 'playwright-student-session',
      refresh_token: 'playwright-refresh-token',
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      user: { id: 'playwright-student-id', email: 'student@example.test' },
    }));
  });
  await page.route('**/api/cbt/student-profile', route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ profile: { username: 'PlaywrightStudent', created_at: '2026-11-20T00:00:00.000Z' } }),
  }));
  await page.route('**/api/cbt/questions*', route => route.fulfill({
    status: 200, contentType: 'application/json',
    body: JSON.stringify({ items: questionRows('default-question', 'Use of English') }),
  }));
});

test('guest students can start a server-graded practice session without signing in', async ({ page }) => {
    await page.route('**/api/cbt/start*', route => route.fulfill({
    status: 201,
    contentType: 'application/json',
    body: JSON.stringify({
      attemptToken: 'a'.repeat(64),
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      durationSeconds: 15 * 60,
      mode: 'practice',
      subject: 'Use of English',
      questions: attemptRows('guest', 'Use of English'),
    }),
  }));
  await page.goto('/cbt', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => { localStorage.removeItem('eduken_auth_session'); window.dispatchEvent(new Event('eduken-auth-changed')); });
  await expect(page.getByText(/You can practise freely without signing in/i)).toBeVisible();
  await expect(page.getByRole('button', { name: /Start free practice/i })).toBeEnabled();
  await page.getByRole('button', { name: /Start free practice/i }).click();
  await expect(page.getByText('Question 1 of 20')).toBeVisible();
  await expect(page.getByText('GUEST PRACTICE').first()).toBeVisible();
});

test('CBT question selectors never offer fewer than 20 questions', async ({ page }) => {
  await page.goto('/cbt', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#cbt-practice-count')).toHaveValue('20');
  await expect(page.locator('#cbt-practice-count option').evaluateAll(options => options.map(option => Number(option.value)))).resolves.toEqual([20, 40, 50]);
  await expect(page.locator('#cbt-mock-count option').evaluateAll(options => options.map(option => Number(option.value)))).resolves.toEqual([20, 40, 60, 100, 180]);
});

test('Student Arena identity is optional for guest practice and refreshes after OAuth', async ({ page }) => {
  await page.goto('/cbt', { waitUntil: 'domcontentloaded' });
  await expect(page.getByText(/Signed in as @PlaywrightStudent/i)).toBeVisible();
  await page.evaluate(() => {
    localStorage.removeItem('eduken_auth_session');
    window.dispatchEvent(new Event('eduken-auth-changed'));
  });
  await expect(page.getByRole('button', { name: /Sign in to join the leaderboard/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /Start free practice/i })).toBeEnabled();
  await expect(page.getByText(/You can practise freely without signing in/i)).toBeVisible();
  await page.evaluate(() => {
    localStorage.setItem('eduken_auth_session', JSON.stringify({
      access_token: 'oauth-completed-session',
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      user: { id: 'oauth-student-id', email: 'student@example.test' },
    }));
    window.dispatchEvent(new Event('eduken-auth-changed'));
  });
  await expect(page.getByText(/Signed in as @PlaywrightStudent/i)).toBeVisible();
  await expect(page.getByRole('button', { name: /Start free practice/i })).toBeEnabled();
});

test('CBT blocks local fallback when it cannot supply the 20-question minimum', async ({ page }) => {
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
  await expect(page.getByRole('button', { name: /Start free practice/i })).toBeDisabled();
  await expect(page.getByRole('button', { name: /Start mixed mock/i })).toBeDisabled();
  await expect(page.locator('#cbt-practice-count')).toHaveValue('20');

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

test('CBT practice fallback does not start an undersized sample set', async ({ page }) => {
  await page.route('**/functions/v1/eduken-api/api/cbt/questions*', route => route.abort());
  await page.goto('/cbt', { waitUntil: 'domcontentloaded' });

  await expect(page.getByText(/original starter samples are being used/i)).toBeVisible();
  await expect(page.locator('#cbt-practice-count')).toHaveValue('20');
  await expect(page.getByRole('button', { name: /Start free practice/i })).toBeDisabled();
});

test('published CBT questions are graded by the server after submission', async ({ page }) => {
  await page.route('**/api/cbt/questions*', route =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        items: questionRows('question-uuid', 'Use of English', 20, 'Choose the correct option.', index => index === 0
      ? { A: 'Wrong', B: 'Right', C: 'Also wrong', D: 'Not this one' }
      : { A: 'Choice A', B: 'Choice B', C: 'Choice C', D: 'Choice D' }),
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
        questions: attemptRows('question-uuid', 'Use of English', 20, 'Choose the correct option.', index => index === 0
      ? ['Wrong', 'Right', 'Also wrong', 'Not this one']
      : ['Choice A', 'Choice B', 'Choice C', 'Choice D']),
      }),
    })
  );
  await page.route('**/api/cbt/submit*', async route => {
    const payload = route.request().postDataJSON();
    expect(payload.attemptToken).toBe('a'.repeat(64));
    expect(Object.values(payload.answers)).toContain(1);
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        score: 1, total: 20, percent: 5, submittedAt: '2026-10-29T06:00:00.000Z',
        review: reviewRows('question-uuid', 'Use of English', 20, 'Choose the correct option.', index => index === 0
      ? ['Wrong', 'Right', 'Also wrong', 'Not this one']
      : ['Choice A', 'Choice B', 'Choice C', 'Choice D'], 'B', 'The second option is correct.'),
      }),
    });
  });

  await page.goto('/cbt', { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: /Start free practice/i }).click();
  await expect(page.getByText('Question 1 of 20')).toBeVisible();
  await page.locator('.cbt-option').nth(1).click();
  for (let i = 0; i < 19; i += 1) await page.getByRole('button', { name: /Next question/i }).click();
  await expect(page.getByText('Question 20 of 20')).toBeVisible();
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
    body: JSON.stringify({ items: questionRows('question-timeout', 'Use of English', 20, 'Choose the correct option.', { A: 'Wrong', B: 'Right', C: 'Also wrong', D: 'Not this one' }) }),
  }));
  await page.route('**/api/cbt/start*', route => route.fulfill({
    status: 201,
    contentType: 'application/json',
    body: JSON.stringify({
      attemptToken: 'b'.repeat(64),
      durationSeconds: 1,
      questions: attemptRows('question-timeout', 'Use of English', 20, 'Choose the correct option.', ['Wrong', 'Right', 'Also wrong', 'Not this one']),
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
        score: 1, total: 20, percent: 5, submittedAt: new Date(Date.now()).toISOString(),
        review: reviewRows('question-timeout', 'Use of English', 20, 'Choose the correct option.', ['Wrong', 'Right', 'Also wrong', 'Not this one'], 'B', 'The second option is correct.'),
      }),
    });
  });

  await page.goto('/cbt', { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: /Start free practice/i }).click();
  await expect(page.getByText('Question 1 of 20')).toBeVisible();
  await page.getByRole('button', { name: /Right/ }).click();

  await page.clock.runFor(2_000);
  await expect(page.getByText(/Temporary network\/server failure/i)).toBeVisible();
  await page.clock.runFor(2_500);

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
  await expect(page.getByText('Question 1 of 20')).toBeVisible();
  expect(startPayload).toMatchObject({ mode: 'mock', questionCount: 20 });
});


test('manual CBT submission warns before submitting unanswered questions', async ({ page }) => {
  await page.route('**/api/cbt/questions*', route => route.fulfill({
    status: 200, contentType: 'application/json',
    body: JSON.stringify({ items: questionRows('unanswered', 'Use of English', 20, 'Question one?') }),
  }));
  let submitCalls = 0;
  await page.route('**/api/cbt/start*', route => route.fulfill({
    status: 201, contentType: 'application/json',
    body: JSON.stringify({ attemptToken: 'd'.repeat(64), durationSeconds: 900, questions: attemptRows('unanswered', 'Use of English', 20, 'Question one?') }),
  }));
  await page.route('**/api/cbt/submit*', async route => {
    submitCalls += 1;
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ score: 0, total: 20, percent: 0, review: reviewRows('unanswered', 'Use of English', 20, 'Question one?') }) });
  });
  await page.goto('/cbt', { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: /Start free practice/i }).click();
  await expect(page.getByText('Question 1 of 20')).toBeVisible();
  for (let i = 0; i < 19; i += 1) await page.getByRole('button', { name: /Next question/i }).click();
  await expect(page.getByText('Question 20 of 20')).toBeVisible();
  page.once('dialog', dialog => dialog.dismiss());
  await page.getByRole('button', { name: /Submit practice/i }).click();
  await expect(page.getByText('Question 20 of 20')).toBeVisible();
  expect(submitCalls).toBe(0);
  page.once('dialog', dialog => dialog.accept());
  await page.getByRole('button', { name: /Submit practice/i }).click();
  await expect(page.getByRole('heading', { name: 'Answer review' })).toBeVisible();
  expect(submitCalls).toBe(1);
});


test('Try again preserves the selected timed-mock question count', async ({ page }) => {
  await page.route('**/api/cbt/questions*', route => route.fulfill({
    status: 200, contentType: 'application/json',
    body: JSON.stringify({ items: [{ id: 'timed-q1', subject: 'Use of English', question_text: 'Question?', options: { A: 'A', B: 'B', C: 'C', D: 'D' } }] }),
  }));
  const requestedCounts = [];
  await page.route('**/api/cbt/start*', async route => {
    const count = route.request().postDataJSON().questionCount;
    requestedCounts.push(count);
    await route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({
      attemptToken: 'e'.repeat(64), durationSeconds: 1800,
      questions: Array.from({ length: count }, (_, index) => ({ id: 'timed-q-' + index, subject: 'Use of English', prompt: 'Mock question ' + index + '?', options: ['A', 'B', 'C', 'D'] })),
    }) });
  });
  await page.route('**/api/cbt/submit*', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({
    score: 0, total: 20, percent: 0,
    review: Array.from({ length: 20 }, (_, index) => ({ id: 'timed-q-' + index, subject: 'Use of English', prompt: 'Mock question ' + index + '?', options: ['A', 'B', 'C', 'D'], correctOption: 'A', explanation: 'A is correct.' })),
  }) }));
  await page.goto('/cbt', { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: /Try a timed mock/i }).click();
  await expect(page.getByText('Question 1 of 20')).toBeVisible();
  for (let i = 0; i < 19; i += 1) await page.getByRole('button', { name: /Next question/i }).click();
  await expect(page.getByText('Question 20 of 20')).toBeVisible();
  page.once('dialog', dialog => dialog.accept());
  await page.getByRole('button', { name: /Submit practice/i }).click();
  await expect(page.getByRole('heading', { name: 'Answer review' })).toBeVisible();
  await page.getByRole('button', { name: /Try again/i }).click();
  await expect(page.getByText('Question 1 of 20')).toBeVisible();
  expect(requestedCounts).toEqual([20, 20]);
});

test('CBT Try again preserves the selected mixed-mock question count', async ({ page }) => {
  await page.route('**/api/cbt/questions*', route => route.fulfill({
    status: 200, contentType: 'application/json',
    body: JSON.stringify({ items: [{ id: 'retry-q1', subject: 'Use of English', question_text: 'Choose one.', options: { A: 'A', B: 'B', C: 'C', D: 'D' } }] }),
  }));
  const payloads = [];
  await page.route('**/api/cbt/start*', async route => {
    payloads.push(route.request().postDataJSON());
    const count = payloads[payloads.length - 1].questionCount;
    await route.fulfill({
      status: 201, contentType: 'application/json',
      body: JSON.stringify({ attemptToken: String(payloads.length).repeat(64), durationSeconds: 1800,
        questions: Array.from({ length: count }, (_, index) => ({ id: 'retry-q' + index, subject: 'Use of English', prompt: 'Choose one ' + index + '?', options: ['A', 'B', 'C', 'D'] })) }),
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
  for (let i = 0; i < 19; i += 1) await page.getByRole('button', { name: /Next question/i }).click();
  await expect(page.getByText('Question 20 of 20')).toBeVisible();
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
    status: 200, contentType: 'application/json', body: JSON.stringify({ items: [{
      id: 'available-question', subject: 'Use of English', question_text: 'Available question?',
      options: { A: 'A', B: 'B', C: 'C', D: 'D' },
    }] }),
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
  for (const count of [20, 40, 60, 100, 180]) {
    await selector.selectOption(String(count));
    await expect(selector).toHaveValue(String(count));
    await start.click();
    await expect(page.getByText('Question 1 of ' + count)).toBeVisible();
    await page.once('dialog', dialog => dialog.accept());
    await page.getByRole('button', { name: /Exit/i }).click();
    await expect(selector).toBeVisible();
  }
  expect(requestedCounts).toEqual([20, 40, 60, 100, 180]);
});

test('subject practice selector starts the exact number of questions selected', async ({ page }) => {
  const requestedCounts = [];
  await page.route('**/api/cbt/questions*', route => route.fulfill({
    status: 200, contentType: 'application/json', body: JSON.stringify({ items: [{
      id: 'available-practice-question', subject: 'Use of English', question_text: 'Available practice question?',
      options: { A: 'A', B: 'B', C: 'C', D: 'D' },
    }] }),
  }));
  await page.route('**/api/cbt/start*', async route => {
    const payload = route.request().postDataJSON();
    requestedCounts.push(payload.questionCount);
    const questions = Array.from({ length: payload.questionCount }, (_, index) => ({
      id: 'practice-count-' + payload.questionCount + '-' + index,
      subject: payload.subject,
      prompt: 'Practice question ' + (index + 1) + '?',
      options: ['A', 'B', 'C', 'D'],
    }));
    await route.fulfill({
      status: 201, contentType: 'application/json',
      body: JSON.stringify({ attemptToken: 'b'.repeat(64), durationSeconds: 900, questions }),
    });
  });
  await page.goto('/cbt', { waitUntil: 'domcontentloaded' });
  const selector = page.locator('#cbt-practice-count');
  const start = page.locator('.cbt-subject-picker button:not([disabled])');
  for (const count of [20, 40, 50]) {
    await selector.selectOption(String(count));
    await expect(selector).toHaveValue(String(count));
    await start.click();
    await expect(page.getByText('Question 1 of ' + count)).toBeVisible();
    await page.once('dialog', dialog => dialog.accept());
    await page.getByRole('button', { name: /Exit/i }).click();
    await expect(selector).toBeVisible();
  }
  expect(requestedCounts).toEqual([20, 40, 50]);
});

test('CBT calculator performs basic arithmetic and closes', async ({ page }) => {
  await page.route('**/api/cbt/questions*', route => route.fulfill({
    status: 200, contentType: 'application/json',
    body: JSON.stringify({ items: questionRows('calc-q', 'Mathematics', 20, 'Calculate.', { A: '1', B: '2', C: '3', D: '4' }) }),
  }));
  await page.route('**/api/cbt/start*', route => route.fulfill({
    status: 201, contentType: 'application/json',
    body: JSON.stringify({ attemptToken: 'd'.repeat(64), durationSeconds: 900,
      questions: attemptRows('calc-q', 'Mathematics', 20, 'Calculate.', ['1', '2', '3', '4']) }),
  }));
  await page.goto('/cbt', { waitUntil: 'domcontentloaded' });
  await page.locator('#cbt-subject-select').selectOption('Mathematics');
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
    body: JSON.stringify({ items: questionRows('finish-unanswered', 'Use of English', 20, 'Question?') }),
  }));
  let submitCalls = 0;
  await page.route('**/api/cbt/start*', route => route.fulfill({
    status: 201, contentType: 'application/json',
    body: JSON.stringify({ attemptToken: 'f'.repeat(64), durationSeconds: 900, questions: attemptRows('finish-unanswered', 'Use of English', 20, 'Question?') }),
  }));
  await page.route('**/api/cbt/submit*', async route => {
    submitCalls += 1;
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ score: 0, total: 20, percent: 0, review: reviewRows('finish-unanswered', 'Use of English', 20, 'Question?') }) });
  });
  await page.goto('/cbt', { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: /Start free practice/i }).click();
  await expect(page.getByText('Question 1 of 20')).toBeVisible();
  page.once('dialog', dialog => dialog.dismiss());
  await page.getByRole('button', { name: /Finish and see results/i }).click();
  await expect(page.getByText('Question 1 of 20')).toBeVisible();
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
      questions: attemptRows('english-from-server', 'Use of English', 20, 'English question?'),
    }) });
  });
  await page.goto('/cbt', { waitUntil: 'domcontentloaded' });
  const startButton = page.getByRole('button', { name: /Start free practice/i });
  await expect(startButton).toBeEnabled();
  await startButton.click();
  await expect(page.getByText('Question 1 of 20')).toBeVisible();
  expect(startPayload).toMatchObject({ mode: 'practice', subject: 'Use of English' });
});

test('signed-in students must claim a username before starting while still seeing personal progress', async ({ page }) => {
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
  await page.route('**/api/cbt/arena/summary', route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ summary: null }),
  }));

  await page.goto('/cbt', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { name: 'Join Student Arena (optional)' })).toBeVisible();
  await expect(page.locator('#cbt-student-username')).toBeVisible();
  await expect(page.getByRole('button', { name: /Start free practice/i })).toBeEnabled();
  await expect(page.getByText(/You can keep practising without a username/i)).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Your progress so far' })).toBeVisible();
  await expect(page.locator('.student-progress-recent-heading')).toContainText('2 subjects covered · 2 saved attempts');
  await expect(page.locator('.student-progress-metrics article').filter({ hasText: 'Questions attempted' }).getByText('20', { exact: true })).toBeVisible();
  await expect(page.locator('.student-progress-metrics article').filter({ hasText: 'Overall accuracy' }).getByText('70.0%', { exact: true })).toBeVisible();
  await expect(page.locator('.student-progress-metrics article').filter({ hasText: 'Best 180-question mock' }).getByText('—', { exact: true })).toBeVisible();
  await expect(page.locator('.student-progress-attempt').filter({ hasText: /^Biology/ })).toBeVisible();
  await expect(page.locator('.student-progress-attempt').filter({ hasText: /^Mathematics/ })).toBeVisible();
});


test('Student Arena displays the three public-safe weekly champion categories', async ({ page }) => {
  await page.route('**/api/cbt/arena/champions', route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ champions: [
      { category: 'top-performer', username: 'top_student', score: 170, total: 180, percentage: 94.44, detail: 'Highest qualifying mock score this week', attempts_count: 1 },
      { category: 'most-improved', username: 'rising_student', score: 150, total: 180, percentage: 83.33, detail: 'Improved 16.67 percentage points across this week', attempts_count: 2 },
      { category: 'most-consistent', username: 'steady_student', score: 146, total: 180, percentage: 81.11, detail: 'Average 80.83% across 2 qualifying mocks', attempts_count: 2 },
    ] }),
  }));
  await page.goto('/cbt', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { name: "This week's champions 🌟" })).toBeVisible();
  await expect(page.getByText('@top_student')).toBeVisible();
  await expect(page.getByText('@rising_student')).toBeVisible();
  await expect(page.getByText('@steady_student')).toBeVisible();
});
