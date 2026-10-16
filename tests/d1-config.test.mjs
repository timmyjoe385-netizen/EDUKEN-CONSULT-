import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const config = JSON.parse(readFileSync(new URL("../wrangler.jsonc", import.meta.url), "utf8"));

test("production analytics binding points to the verified production D1 database", () => {
  assert.deepEqual(config.d1_databases, [{
    binding: "ANALYTICS_DB",
    database_name: "eduken-analytics-production",
    database_id: "fb684d86-f289-4cee-aa34-5767f8c08094",
  }]);
});

test("Worker previews use the separate preview D1 database", () => {
  assert.deepEqual(config.previews.d1_databases, [{
    binding: "ANALYTICS_DB",
    database_name: "eduken-analytics-preview",
    database_id: "ec1f170c-c00d-4975-a6ca-bb35958772f6",
  }]);
  assert.notEqual(config.d1_databases[0].database_id, config.previews.d1_databases[0].database_id);
});
