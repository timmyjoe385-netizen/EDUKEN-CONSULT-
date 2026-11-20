import assert from "node:assert/strict";
import { chromium } from "playwright";

const url = String(process.env.CBT_PREVIEW_URL || "https://eduken-consult-preview.timmyjoe385.workers.dev/cbt");
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const questionsResponsePromise = page.waitForResponse(
    response => response.request().method() === "GET" &&
      response.url().includes("/functions/v1/eduken-api/api/cbt/questions"),
    { timeout: 25_000 },
  );

  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45_000 });
  const arena = page.locator(".student-arena");
  await arena.waitFor({ state: "visible", timeout: 20_000 });
  assert.match(await arena.innerText(), /EDUKEN STUDENT ARENA/i, "The deployed CBT page must visibly render Student Arena.");
  const arenaPosition = await arena.evaluate(element => element.compareDocumentPosition(document.querySelector(".cbt-how-section")) & Node.DOCUMENT_POSITION_FOLLOWING);
  assert.ok(arenaPosition, "Student Arena must appear after the mixed mock and before the practice routine section.");
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
  const subjectSelect = page.locator("#cbt-subject-select");
  assert.ok(await subjectSelect.count(), "Subject practice must use its separate dropdown.");
  const subjectButton = page.locator(".cbt-subject-picker button:not([disabled])");
  await subjectButton.click();
  const requestedCount = Number(await page.locator("#cbt-practice-count").inputValue());
  const selectedSubject = await subjectSelect.inputValue();
  const availableSubjectQuestions = payload.items.filter(question => question.subject === selectedSubject).length;
  if (availableSubjectQuestions < requestedCount) {
    const startError = page.locator(".cbt-disclaimer[role='alert']");
    await startError.waitFor({ timeout: 15_000 });
    assert.match(await startError.innerText(), /only .*published questions|currently has only .*/i,
      "When the published bank is smaller than the selected practice size, the page must explain the shortfall instead of starting a broken attempt.");
    console.log("Live CBT preview browser smoke passed: published-question API, hidden answer key, subject selection and clear insufficient-bank handling.");
  } else {
    await page.locator(".cbt-question-card").waitFor({ timeout: 15_000 });
    await page.locator(".cbt-options .cbt-option").first().click();
    await page.locator(".cbt-submit-wide").click();
    await page.locator(".cbt-result-hero").waitFor({ timeout: 20_000 });
    const resultText = await page.locator(".cbt-result-hero").innerText();
    assert.match(resultText, /PRACTICE COMPLETE/i, "A real preview attempt should submit and display results.");
    await page.locator(".cbt-review-card").waitFor({ timeout: 5_000 });
    console.log("Live CBT preview browser smoke passed: real question fetch, hidden answer key, practice submission and result review.");
  }
} finally {
  await browser.close();
}
