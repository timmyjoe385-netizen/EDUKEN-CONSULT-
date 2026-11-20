import assert from "node:assert/strict";
import { chromium } from "playwright";

const url = String(process.env.CBT_PREVIEW_URL || "https://eduken-consult-preview.timmyjoe385.workers.dev/cbt");
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.setExtraHTTPHeaders({ "Cache-Control": "no-cache", Pragma: "no-cache" });
  const questionsResponsePromise = page.waitForResponse(
    response => response.request().method() === "GET" &&
      response.url().includes("/functions/v1/eduken-api/api/cbt/questions"),
    { timeout: 25_000 },
  );

  const smokeUrl = new URL(url);
  smokeUrl.searchParams.set("__arena_smoke", String(Date.now()));
  await page.goto(smokeUrl.toString(), { waitUntil: "domcontentloaded", timeout: 45_000 });
  const questionsResponse = await questionsResponsePromise;
  assert.equal(questionsResponse.status(), 200, "The deployed preview must load published CBT questions from the isolated API.");
  const payload = await questionsResponse.json();
  assert.ok(Array.isArray(payload.items) && payload.items.length > 0, "Published questions must be available in the preview.");

  for (const question of payload.items) {
    assert.equal(Object.hasOwn(question, "correct_option"), false, "The live browser API must not expose the answer key.");
    assert.equal(Object.hasOwn(question, "correctOption"), false, "The live browser API must not expose the answer key.");
    assert.equal(Object.hasOwn(question, "explanation"), false, "Explanations must remain hidden before submission.");
  }

  await page.waitForFunction(() => !document.body.innerText.includes("The published question service is not available in this preview yet."));
  const subjectSelectors = page.locator(".cbt-mock-subject-slot select");
  assert.equal(await subjectSelectors.count(), 3, "The mock selector must use exactly three additional-subject dropdowns.");
  const initialSubjects = await subjectSelectors.evaluateAll(selects => selects.map(select => select.value));
  assert.equal(new Set(initialSubjects).size, 3, "The three additional subjects must be unique.");
  assert.ok(await page.getByText("Use of English").count(), "Use of English must be displayed as automatically included.");
  await subjectSelectors.nth(0).selectOption("Mathematics");
  assert.equal(await subjectSelectors.nth(1).locator('option[value="Mathematics"]').count(), 0, "A selected subject must be unavailable in the other slots.");
  assert.equal(await subjectSelectors.nth(2).locator('option[value="Mathematics"]').count(), 0, "Duplicate subjects must be prevented across all slots.");
  await subjectSelectors.nth(0).selectOption(initialSubjects[0]);
  const mockCount = page.locator("#cbt-mock-count");
  assert.deepEqual(await mockCount.locator("option").evaluateAll(options => options.map(option => option.value)), ["20", "40", "60", "100", "180"], "Mock counts must expose the five agreed choices.");
  await mockCount.selectOption("20");
  const mockStartResponsePromise = page.waitForResponse(response =>
    response.request().method() === "POST" && response.url().includes("/api/cbt/start"),
    { timeout: 25_000 },
  );
  await page.locator(".cbt-mock-banner button.cbt-primary-button:not([disabled])").click();
  const mockStartResponse = await mockStartResponsePromise;
  if (mockStartResponse.status() === 201) {
    await page.locator(".cbt-question-card").waitFor({ timeout: 20_000 });
    assert.match(await page.locator(".cbt-question-meta").innerText(), /Question 1 of 20/, "Selecting 8 must start a session containing exactly eight questions.");
    for (let index = 0; index < 20; index++) {
      assert.match(await page.locator(".cbt-question-meta").innerText(), new RegExp("Question " + (index + 1) + " of 20"), "The question navigator must advance through all eight questions.");
      await page.locator(".cbt-options .cbt-option").first().click();
      if (index < 19) await page.locator(".cbt-question-actions .cbt-primary-button").click();
    }
    await page.locator(".cbt-submit-wide").click();
    await page.locator(".cbt-result-hero").waitFor({ timeout: 25_000 });
    assert.match(await page.locator(".cbt-result-hero").innerText(), /20 questions/, "Submitting the eight-question mock must show an eight-question result.");
    assert.equal(await page.locator(".cbt-review-item").count(), 20, "Answer review must contain all twenty submitted questions.");
    await page.locator(".cbt-result-hero button.cbt-secondary-button").click();
  } else {
    assert.equal(mockStartResponse.status(), 409, "If the real preview bank cannot supply twenty questions, the API must reject the request as a clear availability conflict.");
    await page.locator('[role="alert"]').waitFor({ timeout: 10_000 });
    const availabilityMessage = await page.locator('[role="alert"]').innerText();
    assert.match(availabilityMessage, /only .* published questions|currently has only|choose a smaller set/i, "The student must receive a clear question-availability message instead of a shortened test.");
    assert.equal(await page.locator(".cbt-question-card").count(), 0, "An undersupplied question bank must never start a shortened mock.");
  }
  await page.locator("#cbt-subject-select").waitFor({ timeout: 10_000 });
  const subjectSelect = page.locator("#cbt-subject-select");
  assert.ok(await subjectSelect.count(), "Subject practice must use its separate dropdown.");
  await subjectSelect.selectOption("Economics");
  assert.equal(await subjectSelect.inputValue(), "Economics", "The practice subject selector must update its selected value.");
  await subjectSelect.selectOption("Use of English");
  assert.deepEqual(await page.locator("#cbt-practice-count option").evaluateAll(options => options.map(option => option.value)), ["20", "40", "60", "100", "180"], "Practice counts must expose all supported values.");
  console.log("Live CBT preview browser smoke passed: real question fetch, hidden answer key, three unique subject dropdowns, the five agreed counts, exact-count start or explicit insufficient-bank rejection, and subject switching.");
} finally {
  await browser.close();
}
