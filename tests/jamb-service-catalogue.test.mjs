import test from "node:test";
import assert from "node:assert/strict";
import { JAMB_SERVICE_TEMPLATES, isJambCatalogueService, jambServiceFieldsFor } from "../src/lib/jamb-service-catalogue.mjs";

test("catalogue contains the exact eleven services and initial prices supplied by the owner", () => {
  assert.equal(JAMB_SERVICE_TEMPLATES.length, 11);
  assert.deepEqual(JAMB_SERVICE_TEMPLATES.map(item => [item.name, item.price, item.is_available]), [
    ["JAMB e-PIN (UTME Without Mock)", 7128, false],
    ["JAMB e-PIN (UTME With Mock)", 8613, false],
    ["JAMB e-PIN (Direct Entry)", 5643, false],
    ["JAMB e-PIN (Trial-Testing Mock)", 3500, false],
    ["JAMB Original Result Printing", 2100, true],
    ["JAMB Admission Letter Printing", 1600, true],
    ["JAMB Reprinting", 500, true],
    ["Check JAMB Admission Status", 500, true],
    ["JAMB O'Level Result Screenshot", 500, true],
    ["JAMB Profile Code Retrieval", 500, true],
    ["JAMB Registration Number Retrieval", 500, true],
  ]);
  assert.ok(JAMB_SERVICE_TEMPLATES.every(item => item.is_catalog_item === true && item.category === "JAMB Services"));
});

test("catalogue filtering excludes unrelated service records", () => {
  assert.equal(isJambCatalogueService({ is_catalog_item: true }), true);
  assert.equal(isJambCatalogueService({ is_catalog_item: "true" }), true);
  assert.equal(isJambCatalogueService({ is_catalog_item: false }), false);
  assert.equal(isJambCatalogueService(null), false);
});

test("each catalogue service has its own required information fields", () => {
  const fields = name => jambServiceFieldsFor({ name }).map(item => item.name);
  assert.deepEqual(fields("JAMB e-PIN (UTME Without Mock)"), ["candidateFullName", "profileCode", "jambYear"]);
  assert.deepEqual(fields("JAMB Original Result Printing"), ["candidateFullName", "registrationNumber", "jambYear"]);
  assert.deepEqual(fields("JAMB Reprinting"), ["documentType", "candidateFullName", "registrationNumber", "jambYear"]);
  assert.deepEqual(fields("JAMB Profile Code Retrieval"), ["registrationNumberOrPhone", "jambYear"]);
  assert.deepEqual(fields("JAMB Registration Number Retrieval"), ["profileCodeOrPhone", "jambYear"]);
});
