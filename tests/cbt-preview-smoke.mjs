import assert from "node:assert/strict";
import { chromium } from "playwright";

const url = String(process.env.CBT_PREVIEW_URL || "https://eduken-consult-preview.timmyjoe385.workers.dev/cbt");
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const apiNetworkEvents = [];
  page.on("request", request => {
    if (request.url().includes("/functions/v1/eduken-api/")) apiNetworkEvents.push("request " + request.method() + " " + request.url());
  });
  page.on("requestfailed", request => {
    if (request.url().includes("/functions/v1/eduken-api/")) apiNetworkEvents.push("requestfailed " + request.method() + " " + request.url() + " :: " + (request.failure()?.errorText || "unknown"));
  });
  page.on("console", message => {
    if (message.type() === "error") apiNetworkEvents.push("console error " + message.text());
  });
  page.on("pageerror", error => apiNetworkEvents.push("pageerror " + error.message));
  page.on("response", response => {
    if (response.url().includes("/functions/v1/eduken-api/")) apiNetworkEvents.push("response " + response.status() + " " + response.url());
  });
  const questionsResponsePromise = page.waitForResponse(
    response => response.request().method() === "GET" &&
      response.url().includes("/functions/v1/eduken-api/api/cbt/questions"),
    { timeout: 25_000 },
  );

  const smokeUrl = new URL(url);
  smokeUrl.searchParams.set("__arena_smoke", String(Date.now()));
  const apiUrl = "https://wpktzogarfqrgkirzdpy.supabase.co/functions/v1/eduken-api/api/cbt/questions";
  const preflight = await fetch(apiUrl, {
    method: "OPTIONS",
    headers: {
      Origin: smokeUrl.origin,
      "Access-Control-Request-Method": "GET",
      "Access-Control-Request-Headers": "apikey,content-type",
    },
  });
  const corsHeaders = Object.fromEntries(preflight.headers.entries());
  console.log("Isolated API CORS preflight:", preflight.status, JSON.stringify({
    origin: corsHeaders["access-control-allow-origin"],
    methods: corsHeaders["access-control-allow-methods"],
    headers: corsHeaders["access-control-allow-headers"],
  }));
  assert.equal(preflight.status, 200, "The isolated API must answer browser CORS preflight.");
  assert.equal(corsHeaders["access-control-allow-origin"], "*", "The isolated API must allow the preview origin.");
  assert.match(corsHeaders["access-control-allow-methods"] || "", /GET/i, "The isolated API must allow GET requests.");
  assert.match(corsHeaders["access-control-allow-headers"] || "", /apikey/i, "The isolated API must allow the Supabase API key header.");
  assert.match(corsHeaders["access-control-allow-headers"] || "", /content-type/i, "The isolated API must allow JSON content type.");
  await page.goto(smokeUrl.toString(), { waitUntil: "domcontentloaded", timeout: 45_000 });
  const arena = page.locator(".student-arena");
  await arena.waitFor({ state: "visible", timeout: 20_000 });
  assert.match(await arena.innerText(), /EDUKEN STUDENT ARENA/i, "The deployed CBT page must visibly render Student Arena.");
  const arenaPosition = await arena.evaluate(element => element.compareDocumentPosition(document.querySelector(".cbt-how-section")) & Node.DOCUMENT_POSITION_FOLLOWING);
  assert.ok(arenaPosition, "Student Arena must appear after the mixed mock and before the practice routine section.");
  let questionsResponse;
  try {
    questionsResponse = await questionsResponsePromise;
  } catch (error) {
    throw new Error(String(error) + "\nCBT API network events:\n" + apiNetworkEvents.join("\n"));
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
  const selectedAdditionalIndex = await mockSubjectOptions.evaluateAll(inputs => inputs.findIndex((input, index) => index > 0 && input.checked));
  assert.ok(selectedAdditionalIndex > 0, "At least one additional mock subject must be selected by default.");
  const disabledAdditionalIndex = await mockSubjectOptions.evaluateAll(inputs => inputs.findIndex((input, index) => index > 0 && input.disabled));
  assert.ok(disabledAdditionalIndex > 0, "Unselected fourth subject must be disabled when three additional subjects are selected.");
  await mockSubjectOptions.nth(selectedAdditionalIndex).uncheck();
  assert.equal(await mockSubjectOptions.nth(disabledAdditionalIndex).isDisabled(), false, "Another subject must become selectable after removing one.");
  await mockSubjectOptions.nth(disabledAdditionalIndex).check();
  assert.equal(await mockSubjectOptions.evaluateAll(inputs => inputs.filter(input => input.checked).length), 4, "Changing the combination must preserve exactly four selected subjects.");
  const mockCount = page.locator("#cbt-mock-count");
  assert.deepEqual(await mockCount.locator("option").evaluateAll(options => options.map(option => option.value)), ["8", "10", "20", "40", "100", "180"], "Server-backed mock counts must include the working eight-question option.");
  await mockCount.selectOption("8");
  const mockStartResponsePromise = page.waitForResponse(response =>
    response.request().method() === "POST" && response.url().includes("/api/cbt/start"),
    { timeout: 25_000 },
  );
  await page.locator(".cbt-mock-banner button.cbt-primary-button:not([disabled])").click();
  const mockStartResponse = await mockStartResponsePromise;
  if (mockStartResponse.status() === 201) {
    await page.locator(".cbt-question-card").waitFor({ timeout: 20_000 });
    assert.match(await page.locator(".cbt-question-meta").innerText(), /Question 1 of 8/, "Selecting 8 must start a session containing exactly eight questions.");
    for (let index = 0; index < 8; index++) {
      assert.match(await page.locator(".cbt-question-meta").innerText(), new RegExp("Question " + (index + 1) + " of 8"), "The question navigator must advance through all eight questions.");
      await page.locator(".cbt-options .cbt-option").first().click();
      if (index < 7) await page.locator(".cbt-question-actions .cbt-primary-button").click();
    }
    await page.locator(".cbt-submit-wide").click();
    await page.locator(".cbt-result-hero").waitFor({ timeout: 25_000 });
    assert.match(await page.locator(".cbt-result-hero").innerText(), /8 questions/, "Submitting the eight-question mock must show an eight-question result.");
    assert.equal(await page.locator(".cbt-review-item").count(), 8, "Answer review must contain all eight submitted questions.");
    await page.locator(".cbt-result-hero button.cbt-secondary-button").click();
  } else {
    assert.equal(mockStartResponse.status(), 409, "If the real preview bank cannot supply eight questions, the API must reject the request as a clear availability conflict.");
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
  assert.deepEqual(await page.locator("#cbt-practice-count option").evaluateAll(options => options.map(option => option.value)), ["1", "5", "10", "20", "40", "50"], "Practice counts must expose all supported values.");
  console.log("Live CBT preview browser smoke passed: real question fetch, hidden answer key, count selector options, exact-count start or explicit insufficient-bank rejection, and subject switching.");
} finally {
  await browser.close();
}
