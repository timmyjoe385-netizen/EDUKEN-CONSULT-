const ALLOWED_STATUSES = new Set(["draft", "reviewed", "approved", "published", "unpublished"]);
const ALLOWED_DIFFICULTIES = new Set(["easy", "medium", "hard"]);
const ALLOWED_SOURCE_TYPES = new Set(["original", "past_question", "licensed", "other"]);
const OPTION_KEYS = ["A", "B", "C", "D"];

export function normalizeQuestionInput(raw = {}) {
  const text = (value) => typeof value === "string" ? value.trim() : "";
  const optionsIn = raw.options && typeof raw.options === "object" && !Array.isArray(raw.options) ? raw.options : {};
  const options = Object.fromEntries(OPTION_KEYS.map((key) => [key, text(optionsIn[key])]));
  const correct = text(raw.correct_option ?? raw.correctOption).toUpperCase();
  const difficulty = text(raw.difficulty || "medium").toLowerCase();
  const sourceType = text(raw.source_type ?? raw.sourceType ?? "original").toLowerCase();
  const status = text(raw.status || "draft").toLowerCase();
  const yearRaw = raw.source_year ?? raw.sourceYear ?? "";
  const sourceYear = yearRaw === "" || yearRaw === null ? null : Number(yearRaw);
  return {
    exam_type: text(raw.exam_type ?? raw.examType ?? "JAMB"),
    subject: text(raw.subject),
    topic: text(raw.topic),
    subtopic: text(raw.subtopic),
    question_text: text(raw.question_text ?? raw.questionText),
    options,
    correct_option: correct,
    explanation: text(raw.explanation),
    difficulty,
    source_type: sourceType,
    source_name: text(raw.source_name ?? raw.sourceName),
    source_year: sourceYear,
    provenance_notes: text(raw.provenance_notes ?? raw.provenanceNotes),
    licensing_notes: text(raw.licensing_notes ?? raw.licensingNotes),
    status,
  };
}

export function fingerprintQuestion(question) {
  const canonical = [
    question.exam_type, question.subject, question.topic, question.subtopic,
    question.question_text,
    ...OPTION_KEYS.map((key) => question.options?.[key] || ""),
  ].map((value) => String(value || "").normalize("NFKC").toLowerCase().replace(/\s+/g, " ").trim()).join("|");
  // Stable non-cryptographic fingerprint for duplicate detection, not an auth token.
  let a = 0x811c9dc5;
  let b = 0x9e3779b9;
  for (let i = 0; i < canonical.length; i++) {
    const code = canonical.charCodeAt(i);
    a = Math.imul(a ^ code, 0x01000193) >>> 0;
    b = Math.imul(b ^ (code + i), 0x85ebca6b) >>> 0;
  }
  return "qfp-" + a.toString(16).padStart(8, "0") + b.toString(16).padStart(8, "0");
}

export function validateQuestionInput(raw, { allowStatus = false } = {}) {
  const question = normalizeQuestionInput(raw);
  const errors = [];
  if (!question.exam_type) errors.push("Exam type is required.");
  if (!question.subject) errors.push("Subject is required.");
  if (!question.topic) errors.push("Topic is required.");
  if (question.question_text.length < 5) errors.push("Question text must contain at least 5 characters.");
  if (question.question_text.length > 10000) errors.push("Question text must not exceed 10,000 characters.");
  for (const key of OPTION_KEYS) {
    if (!question.options[key]) errors.push("Option " + key + " is required.");
    if (question.options[key].length > 3000) errors.push("Option " + key + " must not exceed 3,000 characters.");
  }
  const normalizedOptions = OPTION_KEYS.map((key) => question.options[key].normalize("NFKC").toLowerCase().replace(/\s+/g, " ").trim()).filter(Boolean);
  if (new Set(normalizedOptions).size !== normalizedOptions.length) errors.push("All four answer options must be different.");
  if (!OPTION_KEYS.includes(question.correct_option)) errors.push("Correct answer must be A, B, C or D.");
  if (question.explanation.length < 5) errors.push("An explanation of at least 5 characters is required.");
  if (question.explanation.length > 5000) errors.push("Explanation must not exceed 5,000 characters.");
  if (!ALLOWED_DIFFICULTIES.has(question.difficulty)) errors.push("Difficulty must be easy, medium or hard.");
  if (!ALLOWED_SOURCE_TYPES.has(question.source_type)) errors.push("Source type is invalid.");
  if (question.source_year !== null && (!Number.isInteger(question.source_year) || question.source_year < 1960 || question.source_year > 2100)) errors.push("Source year must be a whole year from 1960 to 2100.");
  if (question.source_type === "past_question" && (!question.source_name || !question.source_year || !question.provenance_notes || !question.licensing_notes)) {
    errors.push("Past-question records require source name, year, provenance notes and licensing notes.");
  }
  if (question.source_type === "licensed" && (!question.source_name || !question.licensing_notes)) {
    errors.push("Licensed records require the licensor/source name and licensing notes.");
  }
  if (allowStatus && !ALLOWED_STATUSES.has(question.status)) errors.push("Question status is invalid.");
  if (!allowStatus) question.status = "draft";
  question.question_fingerprint = fingerprintQuestion(question);
  return { valid: errors.length === 0, errors, question };
}

export function validateStatusTransition(current, next) {
  const transitions = {
    draft: ["reviewed", "unpublished"],
    reviewed: ["draft", "approved", "unpublished"],
    approved: ["reviewed", "published", "unpublished"],
    published: ["approved", "unpublished"],
    unpublished: ["draft", "reviewed", "approved"],
  };
  if (!ALLOWED_STATUSES.has(current) || !ALLOWED_STATUSES.has(next)) return { valid: false, error: "Invalid question status." };
  if (current === next) return { valid: true };
  if (!transitions[current]?.includes(next)) return { valid: false, error: "Status cannot move from " + current + " to " + next + "." };
  return { valid: true };
}

export function parseQuestionImportRows(rows) {
  const errors = [];
  const valid = [];
  const seen = new Set();
  rows.forEach((raw, index) => {
    const rowNumber = index + 2;
    const result = validateQuestionInput(raw);
    if (!result.valid) {
      errors.push({ row: rowNumber, type: "invalid", errors: result.errors });
      return;
    }
    if (seen.has(result.question.question_fingerprint)) {
      errors.push({ row: rowNumber, type: "duplicate_in_file", errors: ["Duplicate question in this import file."] });
      return;
    }
    seen.add(result.question.question_fingerprint);
    valid.push({ row: rowNumber, question: result.question });
  });
  return { valid, errors, totalRows: rows.length };
}
