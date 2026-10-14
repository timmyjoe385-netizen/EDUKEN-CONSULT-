import test from "node:test";
import assert from "node:assert/strict";
import {
  validateServiceRequestBody,
  isAllowedServiceRequestStatus,
  isPublishedService,
} from "../supabase/functions/eduken-api/service-request-validation.mjs";

test("accepts and normalizes a valid service request", () => {
  assert.deepEqual(validateServiceRequestBody({
    customerName: "  Ada Example ",
    whatsapp: "  +234 800 000 0000 ",
    details: "  Please contact me about admission support. ",
    email: "  ada@example.com ",
    serviceId: "550e8400-e29b-41d4-a716-446655440000",
  }), {
    data: {
      customerName: "Ada Example",
      whatsapp: "+234 800 000 0000",
      details: "Please contact me about admission support.",
      email: "ada@example.com",
      serviceId: "550e8400-e29b-41d4-a716-446655440000",
    },
  });
});

test("rejects malformed objects and wrong-typed fields without throwing", () => {
  for (const body of [
    null,
    [],
    "text",
    42,
    { customerName: 7, whatsapp: "+2348000000000", details: "Help" },
    { customerName: "Ada", whatsapp: {}, details: "Help" },
    { customerName: "Ada", whatsapp: "+2348000000000", details: [] },
    { customerName: "Ada", whatsapp: "+2348000000000", details: "Help", email: {} },
    { customerName: "Ada", whatsapp: "+2348000000000", details: "Help", serviceId: 7 },
    { customerName: "Ada", whatsapp: "+2348000000000", details: "Help", serviceId: "not-a-uuid" },
  ]) {
    assert.doesNotThrow(() => validateServiceRequestBody(body));
    assert.ok(validateServiceRequestBody(body).error, JSON.stringify(body));
  }
});

test("rejects empty required values, excessive lengths and malformed email", () => {
  const valid = { customerName: "Ada", whatsapp: "+2348000000000", details: "Help" };
  for (const body of [
    { ...valid, customerName: "  " },
    { ...valid, whatsapp: "" },
    { ...valid, details: " " },
    { ...valid, customerName: "x".repeat(121) },
    { ...valid, whatsapp: "x".repeat(41) },
    { ...valid, details: "x".repeat(4001) },
    { ...valid, email: "x".repeat(201) },
    { ...valid, email: "not-an-email" },
  ]) {
    assert.ok(validateServiceRequestBody(body).error, "Expected rejection for " + Object.keys(body).filter(k => body[k] !== valid[k]).join(","));
  }
});

test("service request statuses use a strict allowlist", () => {
  for (const status of ["New Requests", "Contacted", "In Progress", "Completed", "Cancelled"]) {
    assert.equal(isAllowedServiceRequestStatus(status), true);
  }
  for (const status of ["admin", "pending", "", null, 7]) {
    assert.equal(isAllowedServiceRequestStatus(status), false);
  }
});


test("published service guard accepts only an existing explicitly published service", () => {
  assert.equal(isPublishedService({ id: "service-1", is_published: true }), true);
  assert.equal(isPublishedService({ id: "service-1", is_published: false }), false);
  assert.equal(isPublishedService({ id: "service-1", is_published: null }), false);
  assert.equal(isPublishedService({ id: "service-1", is_published: "true" }), false);
  assert.equal(isPublishedService(null), false);
  assert.equal(isPublishedService(undefined), false);
});
