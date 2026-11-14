const OPTION_KEYS = ["A", "B", "C", "D"];

export function getCbtSubjectQuestionCounts(requestedQuestionCount, additionalSubjects) {
  if (!Number.isInteger(requestedQuestionCount) || requestedQuestionCount < 1 || requestedQuestionCount > 180) {
    throw new RangeError("Question count must be a whole number from 1 to 180.");
  }
  if (!Array.isArray(additionalSubjects) || additionalSubjects.length !== 3 || new Set(additionalSubjects).size !== 3) {
    throw new TypeError("Exactly three different additional subjects are required.");
  }
  const counts = new Map();
  if (requestedQuestionCount === 180) {
    counts.set("Use of English", 60);
    additionalSubjects.forEach(subject => counts.set(subject, 40));
    return counts;
  }
  const englishCount = Math.max(1, Math.round(requestedQuestionCount / 3));
  counts.set("Use of English", englishCount);
  const otherTotal = requestedQuestionCount - englishCount;
  const each = Math.floor(otherTotal / 3);
  let remainder = otherTotal % 3;
  additionalSubjects.forEach(subject => {
    counts.set(subject, each + (remainder-- > 0 ? 1 : 0));
  });
  return counts;
}

export function remapCbtQuestionOptions(originalOptions, correctOption, shuffledKeys) {
  if (!shuffledKeys || shuffledKeys.length !== 4 || new Set(shuffledKeys).size !== 4 || shuffledKeys.some(key => !OPTION_KEYS.includes(key))) {
    throw new TypeError("Option order must contain A, B, C and D exactly once.");
  }
  const source = originalOptions && typeof originalOptions === "object" ? originalOptions : {};
  const originalCorrect = String(correctOption || "").toUpperCase();
  if (!OPTION_KEYS.includes(originalCorrect)) throw new TypeError("Original correct option must be A, B, C or D.");
  const options = Object.fromEntries(OPTION_KEYS.map((key, index) => [key, String(source[shuffledKeys[index]] || "")]));
  const correctIndex = shuffledKeys.indexOf(originalCorrect);
  return { options, correct_option: OPTION_KEYS[correctIndex] };
}
