import test from "node:test";
import assert from "node:assert/strict";
import { runContentSaveSideEffects } from "../supabase/functions/eduken-api/content-save-side-effects.mjs";

test("returns no warnings when post-save tasks succeed", async () => {
  const ran = [];
  const warnings = await runContentSaveSideEffects([
    { run: async () => { ran.push("first"); }, errorLabel: "first failed", warning: "first warning" },
    { run: async () => { ran.push("second"); }, errorLabel: "second failed", warning: "second warning" },
  ]);
  assert.deepEqual(ran, ["first", "second"]);
  assert.deepEqual(warnings, []);
});

test("continues remaining tasks and reports safe warnings after a failure", async () => {
  const ran = [];
  const warnings = await runContentSaveSideEffects([
    { run: async () => { ran.push("first"); throw new Error("private provider detail"); }, errorLabel: "first failed", warning: "first warning" },
    { run: async () => { ran.push("second"); }, errorLabel: "second failed", warning: "second warning" },
  ]);
  assert.deepEqual(ran, ["first", "second"]);
  assert.deepEqual(warnings, ["first warning"]);
});
