import assert from "node:assert/strict";
import { chromium } from "playwright";

const url = String(process.env.CBT_PREVIEW_URL || "https://eduken-consult-preview.timmyjoe385.workers.dev/cbt");
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const apiNetworkEvents = [];
  page.on("request", request => {
    if (request.url().includes("/functions/v1/eduken-api/")) {
      const headers = request.headers();
      apiNetworkEvents.push("request " + request.method() + " " + request.url() +
        (request.method() === "OPTIONS" ? " :: origin=" + (headers.origin || "") +
          " requested=" + (headers["access-control-request-headers"] || "") +
          " method=" + (headers["access-control-request-method"] || "") : ""));
    }
  });
  page.on("requestfailed", request => {
    if (request.url().includes("/functions/v1/eduken-api/")) apiNetworkEvents.push("requestfailed " + request.method() + " " + request.url() + " :: " + (request.failure()?.errorText || "unknown"));
  });
  page.on("console", message => {
    if (message.type() === "error") apiNetworkEvents.push("console error " + message.text());
  });
  page.on("pageerror", error => apiNetworkEvents.push("pageerror " + error.message));
  page.on("response", async response => {
    if (response.url().includes("/functions/v1/eduken-api/")) {
      const headers = response.headers();
      apiNetworkEvents.push("response " + response.status() + " " + response.request().method() + " " + response.url() +
        (response.request().method() === "OPTIONS" ? " :: allow-origin=" + (headers["access-control-allow-origin"] || "") +
          " allow-headers=" + (headers["access-control-allow-headers"] || "") +
          " allow-methods=" + (headers["access-control-allow-methods"] || "") : ""));
    }
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
  const mockSubjectSelects = [1, 2, 3].map(index => page.locator(`#cbt-mock-subject-${index}`));
  for (const selector of mockSubjectSelects) {
    assert.equal(await selector.count(), 1, "The mixed mock must show exactly three separate subject dropdowns.");
    assert.ok(await selector.isVisible(), "Each additional subject dropdown must be visible on mobile.");
  }
  assert.equal(await page.locator(".cbt-mock-subjects input[type=\"checkbox\"]").count(), 0, "The old mixed-mock checkbox controls must be removed.");
  const selectedSubjects = await Promise.all(mockSubjectSelects.map(selector => selector.inputValue()));
  assert.equal(selectedSubjects.filter(Boolean).length, 3, "Exactly three additional subjects must be selected by default.");
  assert.equal(new Set(selectedSubjects).size, 3, "The three default additional subjects must be unique.");
  for (let index = 0; index < 3; index += 1) {
    const options = await mockSubjectSelects[index].locator("option").evaluateAll(items => items.map(option => ({ value: option.value, disabled: option.disabled })));
    for (const selected of selectedSubjects) {
      if (selected !== selectedSubjects[index]) {
        assert.equal(options.find(option => option.value === selected)?.disabled, true, "A subject selected in another dropdown must be disabled to prevent duplicates.");
      }
    }
  }
  await mockSubjectSelects[0].selectOption("Mathematics");
  assert.equal(await mockSubjectSelects[0].inputValue(), "Mathematics", "Each dropdown must allow changing its own subject.");
  assert.equal(await mockSubjectSelects[1].locator('option[value="Mathematics"]').isDisabled(), true, "A selected subject must not be selectable in another dropdown.");
  const mockCount = page.locator("#cbt-mock-count");
  assert.deepEqual(await mockCount.locator("option").evaluateAll(options => options.map(option => option.value)), ["20", "40", "60", "100", "180"], "Mixed mock counts must enforce the 20-question minimum.");
  await mockCount.selectOption("20");
  assert.match(await page.locator(".cbt-identity-gate").innerText(), /Create your free student identity|Continue with Google/i, "The preview must require a signed-in student identity.");
  assert.equal(await page.locator(".cbt-hero-actions button").evaluateAll(buttons => buttons.every(button => button.disabled)), true, "Guest students must not start practice or mocks.");
  assert.equal(await page.locator(".cbt-subject-picker button.cbt-primary-button").isDisabled(), true, "Subject practice must remain locked until a username is saved.");
  assert.equal(await page.locator(".cbt-mock-banner button.cbt-primary-button").isDisabled(), true, "Mixed mocks must remain locked until a username is saved.");
  await page.locator("#cbt-subject-select").waitFor({ timeout: 10_000 });
  const subjectSelect = page.locator("#cbt-subject-select");
  assert.ok(await subjectSelect.count(), "Subject practice must use its separate dropdown.");
  await subjectSelect.selectOption("Economics");
  assert.equal(await subjectSelect.inputValue(), "Economics", "The practice subject selector must update its selected value.");
  await subjectSelect.selectOption("Use of English");
  assert.deepEqual(await page.locator("#cbt-practice-count option").evaluateAll(options => options.map(option => option.value)), ["20", "40", "50"], "Practice counts must enforce the 20-question minimum.");
  console.log("Live CBT preview browser smoke passed: real question fetch, hidden answer key, mandatory identity gate, anonymous start prevention, count selector options and subject switching.");
} finally {
  await browser.close();
}
