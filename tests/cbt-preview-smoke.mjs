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

  // Only one published English sample exists in this isolated database, while the
  // student UI requests ten by default. The safe expected result is HTTP 409 and no
  // question screen—not a fabricated or partial practice session.
  const startResponsePromise = page.waitForResponse(
    response => response.request().method() === "POST" &&
      response.url().includes("/functions/v1/eduken-api/api/cbt/start"),
    { timeout: 25_000 },
  );
  await page.locator(".cbt-subject-picker button:not([disabled])").click();
  const startResponse = await startResponsePromise;
  assert.equal(startResponse.status(), 409, "The preview must reject a practice launch when the published question count is insufficient.");
  const startPayload = await startResponse.json();
  assert.match(String(startPayload.error || ""), /only 1 published questions; 10 are required/i);
  await page.getByRole("alert").filter({ hasText: /only 1 published questions/i }).waitFor({ timeout: 5_000 });
  assert.equal(await page.locator(".cbt-question-card").count(), 0, "An insufficient question bank must not launch a practice session.");

  console.log("Live CBT preview smoke passed: real question fetch, hidden answer key, required subject selection and safe insufficient-bank rejection.");
} finally {
  await browser.close();
}
