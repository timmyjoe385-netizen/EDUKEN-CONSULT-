import assert from "node:assert/strict";
import { chromium } from "playwright";

const url = String(process.env.CBT_PREVIEW_URL || "https://eduken-consult-preview.timmyjoe385.workers.dev/cbt");
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  // Bypass any stale shared-preview HTML/asset cache so this test exercises the bundle built from the current PR commit.
  await page.setExtraHTTPHeaders({ "Cache-Control": "no-cache", Pragma: "no-cache" });
  const questionsResponsePromise = page.waitForResponse(
    response => response.request().method() === "GET" &&
      response.url().includes("/functions/v1/eduken-api/api/cbt/questions"),
    { timeout: 25_000 },
  );

  const smokeUrl = new URL(url);
  smokeUrl.searchParams.set("__cbt_smoke", String(Date.now()));
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
  const subjectSelect = page.locator("#cbt-subject-select");
  assert.ok(await subjectSelect.count(), "Subject practice must use its separate dropdown.");

  // The isolated preview has one published sample per subject. The default
  // ten-question mixed mock requires more than one question in each selected
  // subject, so the API must reject it before creating an attempt.
  assert.equal(await page.locator(".cbt-mock-subject-option input:checked").count(), 4,
    "The mixed mock must include required English plus exactly three additional subjects.");
  await page.locator("#cbt-mock-count").selectOption("10");
  const mixedMockButton = page.getByRole("button", { name: /start mixed mock/i });
  await mixedMockButton.waitFor({ state: "visible", timeout: 5_000 });
  assert.equal(await mixedMockButton.isDisabled(), false, "The mixed-mock launch button must be enabled for this test.");

  // Match the intended mock request explicitly. A practice-start response must
  // never satisfy this assertion (the preview auto-adjusts practice to one sample).
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
  assert.equal(actualStartRequest?.mode, "mock", "The preview button must send a mixed-mock request, not a practice request.");
  assert.deepEqual(actualStartRequest?.subjectCombination, ["Biology", "Chemistry", "Physics"], "The mock request must include the three selected subjects.");
  assert.equal(startResponse.status(), 409,
    "The preview must reject a mixed mock when any selected published subject pool is insufficient.");
  const startPayload = await startResponse.json();
  assert.match(String(startPayload.error || ""), /only 1 published questions; .* are required/i);
  await page.getByRole("alert").filter({ hasText: /only 1 published questions/i }).waitFor({ timeout: 5_000 });
  assert.equal(await page.locator(".cbt-question-card").count(), 0,
    "An insufficient question bank must not launch a partial mock session.");

  console.log("Live CBT preview smoke passed: real question fetch, hidden answer key, required subject selection and safe insufficient-bank rejection.");
} finally {
  await browser.close();
}
