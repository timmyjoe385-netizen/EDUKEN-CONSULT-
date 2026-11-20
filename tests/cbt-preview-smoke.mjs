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
  const mockSubjectOptions = page.locator(".cbt-mock-subject-option input[type=\"checkbox\"]");
  assert.equal(await mockSubjectOptions.count(), 8, "The mock selector must show Use of English plus seven additional subjects.");
  assert.equal(await mockSubjectOptions.evaluateAll(inputs => inputs.filter(input => input.checked).length), 4, "Exactly four unique subjects must be selected, including required Use of English.");
  assert.equal(await page.locator(".cbt-mock-subject-required input").isDisabled(), true, "Use of English must remain selected and locked.");
  const additionalSubjects = mockSubjectOptions.nth(1);
  assert.equal(await additionalSubjects.isChecked(), true, "The default mock combination must preselect three additional subjects.");
  assert.equal(await mockSubjectOptions.nth(4).isDisabled(), true, "Unselected fourth subject must be disabled when three additional subjects are selected.");
  await additionalSubjects.uncheck();
  assert.equal(await mockSubjectOptions.nth(4).isDisabled(), false, "Another subject must become selectable after removing one.");
  await mockSubjectOptions.nth(4).check();
  assert.equal(await mockSubjectOptions.evaluateAll(inputs => inputs.filter(input => input.checked).length), 4, "Changing the combination must preserve exactly four selected subjects.");
  const mockCount = page.locator("#cbt-mock-count");
  assert.deepEqual(await mockCount.locator("option").evaluateAll(options => options.map(option => option.value)), ["10", "20", "40", "100", "180"], "Server-backed mock counts must match the supported choices.");
  const subjectSelect = page.locator("#cbt-subject-select");
  assert.ok(await subjectSelect.count(), "Subject practice must use its separate dropdown.");
  await subjectSelect.selectOption("Economics");
  assert.equal(await subjectSelect.inputValue(), "Economics", "The practice subject selector must update its selected value.");
  await subjectSelect.selectOption("Use of English");
  assert.deepEqual(await page.locator("#cbt-practice-count option").evaluateAll(options => options.map(option => option.value)), ["1", "5", "10", "20", "40", "50"], "Practice counts must expose all supported values.");
  await page.locator("#cbt-practice-count").selectOption("1");
  const subjectButton = page.locator(".cbt-subject-picker button:not([disabled])");
  await subjectButton.click();
  await page.locator(".cbt-question-card").waitFor({ timeout: 15_000 });
  await page.locator(".cbt-options .cbt-option").first().click();
  await page.locator(".cbt-submit-wide").click();
  await page.locator(".cbt-result-hero").waitFor({ timeout: 20_000 });
  const resultText = await page.locator(".cbt-result-hero").innerText();
  assert.match(resultText, /PRACTICE COMPLETE/i, "A real preview attempt should submit and display results.");
  await page.locator(".cbt-review-card").waitFor({ timeout: 5_000 });
  console.log("Live CBT preview browser smoke passed: real question fetch, hidden answer key, practice submission and result review.");
} finally {
  await browser.close();
}
