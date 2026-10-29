const OPTION_KEYS = ["A", "B", "C", "D"];

const isRecord = (value) => value !== null && typeof value === "object" && !Array.isArray(value);

export function gradeCbtAttempt(questionSnapshot, rawAnswers) {
  const errors = [];
  if (!Array.isArray(questionSnapshot) || questionSnapshot.length === 0) {
    return { valid: false, errors: ["Attempt has no questions."] };
  }
  if (!isRecord(rawAnswers)) {
    return { valid: false, errors: ["Answers must be an object keyed by question ID."] };
  }

  const questionsById = new Map();
  for (const question of questionSnapshot) {
    const id = String(question?.id ?? "");
    const correct = String(question?.correct_option ?? "").toUpperCase();
    if (!id || !OPTION_KEYS.includes(correct) || !isRecord(question?.options)) {
      return { valid: false, errors: ["Attempt question snapshot is invalid."] };
    }
    questionsById.set(id, question);
  }

  for (const key of Object.keys(rawAnswers)) {
    if (!questionsById.has(key)) errors.push("Answer contains a question that is not part of this attempt.");
  }
  if (errors.length) return { valid: false, errors };

  const normalizedAnswers = {};
  const review = [];
  let score = 0;

  for (const question of questionSnapshot) {
    const id = String(question.id);
    const raw = rawAnswers[id];
    let selectedOption = null;
    if (raw !== undefined && raw !== null && raw !== "") {
      if (Number.isInteger(raw) && raw >= 0 && raw < OPTION_KEYS.length) {
        selectedOption = OPTION_KEYS[raw];
      } else if (typeof raw === "string" && OPTION_KEYS.includes(raw.trim().toUpperCase())) {
        selectedOption = raw.trim().toUpperCase();
      } else {
        errors.push("Each answer must be A, B, C, D, or an option index from 0 to 3.");
      }
    }
    const correctOption = String(question.correct_option).toUpperCase();
    const options = OPTION_KEYS.map((key) => String(question.options[key] ?? ""));
    const isCorrect = selectedOption !== null && selectedOption === correctOption;
    if (isCorrect) score += 1;
    normalizedAnswers[id] = selectedOption;
    review.push({
      id,
      subject: String(question.subject ?? ""),
      prompt: String(question.prompt ?? question.question_text ?? ""),
      options,
      selectedOption,
      correctOption,
      explanation: String(question.explanation ?? ""),
      isCorrect,
    });
  }

  if (errors.length) return { valid: false, errors };
  return {
    valid: true,
    errors: [],
    normalizedAnswers,
    score,
    total: questionSnapshot.length,
    percent: Math.round((score / questionSnapshot.length) * 100),
    review,
  };
}
