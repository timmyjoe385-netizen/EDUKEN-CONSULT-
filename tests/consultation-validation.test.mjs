import test from "node:test";
import assert from "node:assert/strict";
import { validateConsultationBody } from "../supabase/functions/eduken-api/consultation-validation.mjs";

test("accepts a valid consultation and normalizes optional fields", () => {
  const result = validateConsultationBody({
    name: "  Ada Lovelace ",
    whatsapp: " +234 800 000 0000 ",
    email: " ada@example.com ",
    state: " Lagos ",
    educationLevel: " Undergraduate ",
    interest: " Admissions ",
    schoolCourse: " Computer Science ",
    message: " Please help me choose a course. ",
  });
  assert.equal(result.error, undefined);
  assert.deepEqual(result.data, {
    name: "Ada Lovelace",
    whatsapp: "+234 800 000 0000",
    message: "Please help me choose a course.",
    email: "ada@example.com",
    state: "Lagos",
    educationLevel: "Undergraduate",
    interest: "Admissions",
    schoolCourse: "Computer Science",
  });
});

test("rejects non-object bodies and non-string required fields", () => {
  assert.ok(validateConsultationBody(null).error);
  assert.ok(validateConsultationBody([]).error);
  assert.ok(validateConsultationBody({ name: {}, whatsapp: "123", message: "Hi" }).error);
  assert.ok(validateConsultationBody({ name: "A", whatsapp: "123", message: 8 }).error);
});

test("rejects invalid optional field types and malformed email", () => {
  assert.ok(validateConsultationBody({
    name: "A", whatsapp: "123", message: "Hi", state: { unexpected: true },
  }).error);
  assert.ok(validateConsultationBody({
    name: "A", whatsapp: "123", message: "Hi", education_level: { unexpected: true },
  }).error);
  assert.ok(validateConsultationBody({
    name: "A", whatsapp: "123", message: "Hi", school_course: 17,
  }).error);
  assert.ok(validateConsultationBody({
    name: "A", whatsapp: "123", message: "Hi", email: "not-an-email",
  }).error);
});

test("rejects oversized fields before database writes", () => {
  assert.ok(validateConsultationBody({
    name: "A".repeat(121), whatsapp: "123", message: "Hi",
  }).error);
  assert.ok(validateConsultationBody({
    name: "A", whatsapp: "123", message: "M".repeat(4001),
  }).error);
  assert.ok(validateConsultationBody({
    name: "A", whatsapp: "123", message: "Hi", schoolCourse: "C".repeat(201),
  }).error);
});
