import test from "node:test";
import assert from "node:assert/strict";
import { isUnisolatedPreviewOrigin, PRODUCTION_ORIGIN } from "../src/lib/api-origin-guard.mjs";

test("allows writes only from the exact canonical production origin", () => {
  assert.equal(PRODUCTION_ORIGIN, "https://eduken-consult.timmyjoe385.workers.dev");
  assert.equal(isUnisolatedPreviewOrigin(PRODUCTION_ORIGIN), false);
});

test("blocks writes from previews, legacy hostnames, HTTP, ports, and lookalike origins", () => {
  for (const origin of [
    "https://eduken-consult.workers.dev",
    "https://fix-payments.workers.dev",
    "http://eduken-consult.timmyjoe385.workers.dev",
    "https://eduken-consult.timmyjoe385.workers.dev:8443",
    "https://eduken-consult.timmyjoe385.workers.dev.example.com",
    "http://localhost:5173",
  ]) {
    assert.equal(isUnisolatedPreviewOrigin(origin), true, origin);
  }
});
