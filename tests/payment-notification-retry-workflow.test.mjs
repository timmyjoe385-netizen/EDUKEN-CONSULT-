import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

test("payment notification retry scheduler is pinned to the isolated test processor", async () => {
  const here = dirname(fileURLToPath(import.meta.url));
  const workflow = await readFile(resolve(here, "../.github/workflows/payment-notification-retry.yml"), "utf8");

  for (const required of [
    'cron: "*/15 * * * *"',
    "workflow_dispatch:",
    "secrets.EDUKEN_PAYMENT_NOTIFICATIONS_PROCESS_URL",
    "secrets.EDUKEN_PAYMENT_NOTIFICATIONS_CRON_SECRET",
    'expected_host = "wpktzogarfqrgkirzdpy.supabase.co"',
    'expected_path = "/functions/v1/eduken-api/api/internal/payment-notifications/process"',
    'url.scheme != "https"',
    "url.hostname != expected_host",
    "url.port is not None",
    "url.username is not None",
    "url.password is not None",
    'url.path.rstrip("/") != expected_path',
    "url.query",
    "url.fragment",
    'if [ "${#CRON_SECRET}" -lt 32 ]',
    'echo "configured=true" >> "$GITHUB_OUTPUT"',
    "if: steps.config.outputs.configured == 'true'",
    '--request POST "$PROCESS_URL"',
    '--header "Authorization: Bearer $CRON_SECRET"',
    "--data '{}'",
  ]) {
    assert.ok(workflow.includes(required), `Missing payment notification scheduler safeguard: ${required}`);
  }

  assert.doesNotMatch(workflow, /pphxltbkwygqjtjgkhxu\.supabase\.co/);
  assert.doesNotMatch(workflow, /(?:sk_live_|sk_test_|re_[A-Za-z0-9]{20,})/);
});


test("production payment notification retry is pinned to production and uses a dedicated secret", async () => {
  const here = dirname(fileURLToPath(import.meta.url));
  const workflow = await readFile(resolve(here, "../.github/workflows/payment-notification-retry-production.yml"), "utf8");

  for (const required of [
    'cron: "*/15 * * * *"',
    "workflow_dispatch:",
    "secrets.EDUKEN_PRODUCTION_PAYMENT_NOTIFICATIONS_CRON_SECRET",
    'https://pphxltbkwygqjtjgkhxu.supabase.co/functions/v1/eduken-api/api/internal/payment-notifications/process',
    'if [ "${#CRON_SECRET}" -lt 32 ]',
    "if: steps.config.outputs.configured == 'true'",
    '--request POST "https://pphxltbkwygqjtjgkhxu.supabase.co/functions/v1/eduken-api/api/internal/payment-notifications/process"',
    '--header "Authorization: Bearer $CRON_SECRET"',
    "--data '{}'",
  ]) {
    assert.ok(workflow.includes(required), `Missing production payment notification safeguard: ${required}`);
  }

  assert.doesNotMatch(workflow, /wpktzogarfqrgkirzdpy\.supabase\.co/);
  assert.doesNotMatch(workflow, /(?:sk_live_|sk_test_|re_[A-Za-z0-9]{20,})/);
});
