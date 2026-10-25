import test from "node:test";
import assert from "node:assert/strict";
import { JAMB_SERVICE_TEMPLATES, isJambCatalogueService, jambServiceFieldsFor, jambServicePublicRequirements } from "../src/lib/jamb-service-catalogue.mjs";

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
  assert.deepEqual(fields("JAMB e-PIN (UTME Without Mock)"), ["candidateFullName", "profileCode"]);
  assert.deepEqual(fields("JAMB Original Result Printing"), ["candidateFullName", "registrationNumber", "jambYear"]);
  assert.deepEqual(fields("JAMB Reprinting"), ["documentType", "candidateFullName", "registrationNumber", "jambYear"]);
  assert.deepEqual(fields("JAMB Profile Code Retrieval"), ["registrationNumberOrPhone", "jambYear"]);
  assert.deepEqual(fields("JAMB Registration Number Retrieval"), ["profileCodeOrPhone", "jambYear"]);
  const profileYear = jambServiceFieldsFor({ name: "JAMB Profile Code Retrieval" }).find(item => item.name === "jambYear");
  const registrationYear = jambServiceFieldsFor({ name: "JAMB Registration Number Retrieval" }).find(item => item.name === "jambYear");
  assert.deepEqual(profileYear.options, ["2026", "2025", "2024", "2023", "2022", "2021"]);
  assert.equal(registrationYear.options.length, 10);
  assert.equal(registrationYear.options.at(-1), "2017");
});


test("public JAMB retrieval requirements never expose BuyCard wording, including legacy database rows", () => {
  const profile = jambServicePublicRequirements({
    name: "JAMB Profile Code Retrieval",
    requirements: "JAMB registration number OR the phone number used for JAMB registration; JAMB year (BuyCard lists 2021–2026). Never submit your NIN, OTP or password.",
  });
  const registration = jambServicePublicRequirements({
    name: "JAMB Registration Number Retrieval",
    requirements: "JAMB profile code OR the phone number used for registration; JAMB year (BuyCard lists 2017–2026). Never submit your NIN, OTP or password.",
  });
  assert.equal(profile, "JAMB registration number OR the phone number used for JAMB registration; JAMB year (2021–2026). Never submit your NIN, OTP or password.");
  assert.equal(registration, "JAMB profile code OR the phone number used for registration; JAMB year (2017–2026). Never submit your NIN, OTP or password.");
  assert.ok(!/buycard/i.test(profile + registration));
  assert.ok(JAMB_SERVICE_TEMPLATES.filter(item => /retrieval/i.test(item.name)).every(item => !/buycard/i.test(item.requirements)));
});
