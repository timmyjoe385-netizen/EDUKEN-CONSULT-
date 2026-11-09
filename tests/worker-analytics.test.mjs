import test from "node:test";
import assert from "node:assert/strict";
import worker from "../worker/index.js";

function analyticsDb(calls) {
  return {
    prepare(sql) {
      return {
        bind(...values) {
          return {
            async run() {
              calls.push({ sql, values });
              return { success: true };
            },
          };
        },
        async run() {
          calls.push({ sql, values: [] });
          return { success: true };
        },
      };
    },
  };
}

function request(body, headers = {}) {
  return new Request("https://eduken.example/api/analytics/events", {
    method: "POST",
    headers: {
      Origin: "https://eduken.example",
      "Content-Type": "application/json",
      ...headers,
    },
    body: JSON.stringify(body),
  });
}

test("analytics event endpoint rejects cross-origin and unsupported requests", async () => {
  const env = { ANALYTICS_DB: analyticsDb([]), ASSETS: { fetch: async () => new Response("asset") } };
  const wrongOrigin = await worker.fetch(request({ eventName: "page_view", sessionId: "session_123" }, { Origin: "https://attacker.example" }), env);
  assert.equal(wrongOrigin.status, 403);

  const unsupported = await worker.fetch(request({ eventName: "made_up", sessionId: "session_123" }), env);
  assert.equal(unsupported.status, 400);

  const invalidSession = await worker.fetch(request({ eventName: "page_view", sessionId: "x" }), env);
  assert.equal(invalidSession.status, 400);

  const get = await worker.fetch(new Request("https://eduken.example/api/analytics/events"), env);
  assert.equal(get.status, 405);
});

test("analytics event endpoint stores sanitized first-party event data", async () => {
  const calls = [];
  const env = { ANALYTICS_DB: analyticsDb(calls), ASSETS: { fetch: async () => new Response("asset") } };
  const response = await worker.fetch(request({
    eventName: "page_view",
    sessionId: "session_123",
    path: "/?access_token=secret",
    pageTitle: "  Admissions\u0000 page  ",
    referrerHost: "school.example",
    source: "direct",
    device: "mobile",
    browser: "Chrome",
    target: "apply-button",
  }), env);

  assert.equal(response.status, 204);
  assert.equal(response.headers.get("cache-control"), "no-store");
  const insert = calls.find(call => call.sql.startsWith("INSERT INTO analytics_events"));
  assert.ok(insert, "A valid event should be inserted.");
  assert.equal(insert.values[0], "page_view");
  assert.equal(insert.values[1], "session_123");
  assert.equal(insert.values[2], "/", "Query strings and credentials must not be retained in paths.");
  assert.equal(insert.values[3], "Admissions  page");
  assert.equal(insert.values[8], "mobile");
  assert.equal(insert.values[9], "Chrome");
  assert.equal(insert.values[12], "apply-button");
});

test("analytics event endpoint rejects oversized payloads and missing storage", async () => {
  const env = { ANALYTICS_DB: analyticsDb([]), ASSETS: { fetch: async () => new Response("asset") } };
  const oversized = await worker.fetch(new Request("https://eduken.example/api/analytics/events", {
    method: "POST",
    headers: { Origin: "https://eduken.example", "Content-Type": "application/json" },
    body: JSON.stringify({ eventName: "page_view", sessionId: "session_123", padding: "x".repeat(5000) }),
  }), env);
  assert.equal(oversized.status, 413);

  const missingDb = await worker.fetch(request({ eventName: "page_view", sessionId: "session_123" }), { ASSETS: env.ASSETS });
  assert.equal(missingDb.status, 503);
});
