import assert from "node:assert/strict";
import { chromium } from "playwright";

const url = String(process.env.CBT_PREVIEW_URL || "https://eduken-consult-preview.timmyjoe385.workers.dev/cbt");
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const browserDiagnostics = { consoleErrors: [], pageErrors: [], failedRequests: [], apiResponses: [] };
  page.on("console", message => {
    if (message.type() === "error") browserDiagnostics.consoleErrors.push(message.text().slice(0, 500));
  });
  page.on("pageerror", error => browserDiagnostics.pageErrors.push(String(error?.stack || error).slice(0, 1000)));
  page.on("requestfailed", request => {
    const requestUrl = request.url();
    if (/workers\.dev|supabase\.co|\/assets\//i.test(requestUrl)) {
      browserDiagnostics.failedRequests.push({ url: requestUrl, error: request.failure()?.errorText || "unknown" });
    }
  });
  page.on("response", response => {
    if (/\/functions\/v1\/eduken-api\/api\/cbt\/questions/i.test(response.url())) {
      browserDiagnostics.apiResponses.push({ url: response.url(), status: response.status() });
    }
  });
  // Bypass any stale shared-preview HTML/asset cache so this test exercises the bundle built from the current PR commit.
  await page.setExtraHTTPHeaders({ "Cache-Control": "no-cache", Pragma: "no-cache" });
  const questionsResponsePromise = page.waitForResponse(
    response => response.request().method() === "GET" &&
      response.url().includes("/functions/v1/eduken-api/api/cbt/questions"),
    { timeout: 25_000 },
  );

  const smokeUrl = new URL(url);
  smokeUrl.searchParams.set("__cbt_smoke", String(Date.now()));
  const navigationResponse = await page.goto(smokeUrl.toString(), { waitUntil: "domcontentloaded", timeout: 45_000 });
  let questionsResponse;
  try {
    questionsResponse = await questionsResponsePromise;
  } catch (error) {
    const bodyText = await page.locator("body").innerText().catch(() => "");
    console.error("CBT preview browser diagnostics:", JSON.stringify({
      navigationStatus: navigationResponse?.status() ?? null,
      finalUrl: page.url(),
      title: await page.title().catch(() => ""),
      bodyText: bodyText.slice(0, 1400),
      ...browserDiagnostics,
    }));
    throw error;
  }
  assert.equal(questionsResponse.status(), 200, "The deployed preview must load published CBT questions from the isolated API.");
  const payload = await questionsResponse.json();
  assert.ok(Array.isArray(payload.items) && payload.items.length > 0, "Published questions must be available in the preview.");

  for (const question of payload.items) {
    assert.equal(Object.hasOwn(question, "correct_option"), false, "The live browser API must not expose the answer key.");
    assert.equal(Object.hasOwn(question, "correctOption"), false, "The live browser API must not expose the answer key.");
    assert.equal(Object.hasOwn(question, "explanation"), false, "Explanations must remain hidden before submission.");
  }

  await page.waitForFunction(() => !document.body.innerText.includes("The published question service is not available in this preview yet."));
  const mockSubjectOptions = page.locator(".cbt-mock-subject-option input[type=\"checkbox\"]");
  assert.equal(await mockSubjectOptions.count(), 8, "The mock selector must show Use of English plus seven additional subjects.");
  assert.equal(await mockSubjectOptions.evaluateAll(inputs => inputs.filter(input => input.checked).length), 4, "Exactly four unique subjects must be selected, including required Use of English.");
  assert.equal(await page.locator(".cbt-mock-subject-required input").isDisabled(), true, "Use of English must remain selected and locked.");
  const subjectSelect = page.locator("#cbt-subject-select");
  assert.ok(await subjectSelect.count(), "Subject practice must use its separate dropdown.");

  // The isolated preview has one published sample per subject. The four-question
  // starter is therefore available, while larger mock sizes must remain unavailable.
  const mockCountSelect = page.locator("#cbt-mock-count");
  assert.deepEqual(await mockCountSelect.locator("option").allTextContents(), ["4-question starter mock"],
    "Only the four-question starter should be offered for one published question per selected subject.");
  assert.equal(await mockCountSelect.inputValue(), "4");
  const mixedMockButton = page.getByRole("button", { name: /start mixed mock/i });
  await mixedMockButton.waitFor({ state: "visible", timeout: 5_000 });
  assert.equal(await mixedMockButton.isDisabled(), false, "The four-question starter must be launchable when each selected subject has one published question.");

  const startResponsePromise = page.waitForResponse(response => {
    if (response.request().method() !== "POST" ||
        !response.url().includes("/functions/v1/eduken-api/api/cbt/start")) return false;
    try {
      return response.request().postDataJSON()?.mode === "mock";
    } catch {
      return false;
    }
  }, { timeout: 25_000 });
  await mixedMockButton.click();
  const startResponse = await startResponsePromise;
  const actualStartRequest = startResponse.request().postDataJSON();
  assert.equal(actualStartRequest?.mode, "mock", "The preview button must send a mixed-mock request.");
  assert.deepEqual(actualStartRequest?.subjectCombination, ["Biology", "Chemistry", "Physics"],
    "The mock request must include the three selected subjects.");
  assert.equal(actualStartRequest?.questionCount, 4,
    "The one-question-per-subject preview inventory must start only the four-question starter.");
  assert.equal(startResponse.status(), 201, "The published-only four-question starter should start successfully.");
  const startPayload = await startResponse.json();
  assert.equal(startPayload.durationSeconds, 4 * 60, "The server must enforce the four-minute starter timer.");
  assert.equal(startPayload.questions?.length, 4, "The starter must contain exactly four published questions.");
  const startedSubjectCounts = startPayload.questions.reduce((counts, question) => {
    counts[question.subject] = (counts[question.subject] || 0) + 1;
    return counts;
  }, {});
  assert.deepEqual(startedSubjectCounts, {
    "Use of English": 1,
    Biology: 1,
    Chemistry: 1,
    Physics: 1,
  }, "The starter must include exactly one published question from each selected subject.");
  await page.getByText("Question 1 of 4").waitFor({ timeout: 5_000 });
  assert.equal(await page.locator(".cbt-timer").innerText(), "04:00",
    "The student-facing timer must match the server's four-minute duration.");

  console.log("Live CBT preview smoke passed: real question fetch, hidden answer key, availability-gated four-subject starter, server-enforced four-minute timer and isolated API.");
} finally {
  await browser.close();
}
