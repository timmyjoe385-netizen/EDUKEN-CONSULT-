export const CBT_OPTIONAL_SUBJECTS = Object.freeze([
  "Mathematics",
  "Biology",
  "Chemistry",
  "Physics",
  "Government",
  "Economics",
  "Literature in English",
  "Christian Religious Studies",
  "Commerce",
  "Principles of Accounts",
]);

export function validateCbtSubjectCombination(values) {
  if (!Array.isArray(values) || values.length !== 3 || new Set(values).size !== 3 ||
      values.some(value => typeof value !== "string" || !CBT_OPTIONAL_SUBJECTS.includes(value))) {
    return {
      valid: false,
      error: "Choose exactly three different additional subjects for a mixed mock.",
    };
  }
  return { valid: true };
}
