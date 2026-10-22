import test from "node:test";
import assert from "node:assert/strict";
import { runContentSaveSideEffects } from "../supabase/functions/eduken-api/content-save-side-effects.mjs";

test("a failed post-save notification returns a warning instead of throwing", async () => {
  const warnings = await runContentSaveSideEffects([{
    run: async () => { throw new Error("simulated notification failure"); },
    errorLabel: "test task failed",
    warning: "Notification failed.",
  }]);
  assert.deepEqual(warnings, ["Notification failed."]);
});

test("a failed post-save task does not prevent later tasks from running", async () => {
  let laterTaskRan = false;
  const warnings = await runContentSaveSideEffects([
    { run: async () => { throw new Error("simulated failure"); }, errorLabel: "test failure", warning: "First task failed." },
    { run: async () => { laterTaskRan = true; }, errorLabel: "unused", warning: "unused" },
  ]);
  assert.equal(laterTaskRan, true);
  assert.deepEqual(warnings, ["First task failed."]);
});

test("successful post-save tasks return no warnings", async () => {
  const warnings = await runContentSaveSideEffects([
    { run: async () => undefined, errorLabel: "unused", warning: "unused" },
  ]);
  assert.deepEqual(warnings, []);
});
