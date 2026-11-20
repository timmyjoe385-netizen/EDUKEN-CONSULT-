export const CBT_QUESTION_COUNTS = Object.freeze([20, 40, 60, 100, 180]);

export function parseCbtQuestionCount(value, mode) {
  const fallback = mode === "mock" ? 180 : 20;
  const count = value === undefined ? fallback : Number(value);
  if (!Number.isInteger(count) || !CBT_QUESTION_COUNTS.includes(count)) {
    return {
      valid: false,
      error: "Choose 20, 40, 60, 100, or 180 questions.",
    };
  }
  return { valid: true, value: count };
}
