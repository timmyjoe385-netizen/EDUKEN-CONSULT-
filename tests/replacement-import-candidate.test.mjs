import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parseQuestionImportRows, validateQuestionInput } from "../supabase/functions/eduken-api/question-bank-validation.mjs";

const root = process.cwd();
const candidatePath = join(root, "content/cbt/staging/2026-11-02/replacement-import-candidates-90.csv");
const stagingRoot = join(root, "content/cbt/staging/2026-11-01");
const subjects = [
  "Use of English", "Mathematics", "Biology", "Chemistry",
  "Physics", "Economics", "Government", "Literature in English",
];

function parseCsv(source) {
  const rows = [];
  let row = [], cell = "", quoted = false;
  for (let i = 0; i < source.length; i++) {
    const char = source[i];
    if (quoted) {
      if (char === '"' && source[i + 1] === '"') { cell += '"'; i++; }
      else if (char === '"') quoted = false;
      else cell += char;
    } else if (char === '"') quoted = true;
    else if (char === ",") { row.push(cell); cell = ""; }
    else if (char === "\n") {
      row.push(cell);
      if (row.some(value => value.trim())) rows.push(row);
      row = []; cell = "";
    } else if (char !== "\r") cell += char;
  }
  if (quoted) throw new Error("CSV ends inside a quoted field.");
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows;
}

function records(path) {
  const rows = parseCsv(readFileSync(path, "utf8"));
  const headers = rows.shift();
  return rows.map(values => Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""])));
}

function toImportRow(item) {
  return {
    exam_type: item.exam_type || "JAMB",
    subject: item.subject,
    topic: item.topic,
    subtopic: item.subtopic,
    question_text: item.question_text,
    options: {
      A: item.option_a || item.a,
      B: item.option_b || item.b,
      C: item.option_c || item.c,
      D: item.option_d || item.d,
    },
    correct_option: item.correct_option,
    explanation: item.explanation,
    difficulty: item.difficulty || "medium",
    source_type: item.source_type || "original",
    source_name: item.source_name,
    source_year: item.source_year,
    provenance_notes: item.provenance_notes,
    licensing_notes: item.licensing_notes,
  };
}

const candidates = records(candidatePath);
const retained = [1, 2, 3, 4].flatMap((window) =>
  records(join(stagingRoot, "retained-batches-" + ["01-10", "11-20", "21-30", "31-40"][window - 1] + ".csv"))
);
const held = [1, 2, 3, 4].flatMap((window) =>
  records(join(stagingRoot, "held-duplicates-" + ["01-10", "11-20", "21-30", "31-40"][window - 1] + ".csv"))
);

test("90 replacement import candidates map one-to-one to the 90 held rows and restore 200 per subject", () => {
  assert.equal(candidates.length, 90);
  const candidateIds = candidates.map(row => row.target_id);
  const heldIds = held.map(row => row.pair_id);
  assert.equal(new Set(candidateIds).size, 90, "Candidate target IDs must be unique.");
  assert.deepEqual([...candidateIds].sort(), [...heldIds].sort(), "Every held duplicate must have exactly one replacement candidate.");
  for (const candidate of candidates) {
    const target = held.find(row => row.pair_id === candidate.target_id);
    assert.ok(target, candidate.target_id + ": held duplicate target must exist.");
    assert.equal(candidate.subject, target.subject, candidate.target_id + ": replacement subject must match held subject.");
    assert.ok(candidate.provenance_notes.includes(candidate.target_id), candidate.target_id + ": target mapping must survive CSV parsing through the persisted provenance field.");
  }

  const retainedCounts = Object.fromEntries(subjects.map(subject => [subject, 0]));
  const replacementCounts = Object.fromEntries(subjects.map(subject => [subject, 0]));
  for (const row of retained) retainedCounts[row.subject]++;
  for (const row of candidates) replacementCounts[row.subject]++;
  for (const subject of subjects) {
    assert.equal(retainedCounts[subject] + replacementCounts[subject], 200, subject + ": projected bank must contain 200 questions.");
  }
});

test("all 90 replacement candidates pass the real server import validator and have no exact bank collisions", () => {
  const imported = candidates.map(toImportRow);
  const parsed = parseQuestionImportRows(imported);
  assert.equal(parsed.totalRows, 90);
  assert.equal(parsed.errors.length, 0, JSON.stringify(parsed.errors));
  assert.equal(parsed.valid.length, 90);

  const bank = [...retained, ...held].map(row => validateQuestionInput({
    exam_type: row.exam_type,
    subject: row.subject,
    topic: row.topic,
    subtopic: row.subtopic,
    question_text: row.question_text,
    options: { A: row.option_a, B: row.option_b, C: row.option_c, D: row.option_d },
    correct_option: row.correct_option,
    explanation: row.explanation,
    difficulty: row.difficulty,
    source_type: row.source_type,
    source_name: row.source_name,
    source_year: row.source_year,
    provenance_notes: row.provenance_notes,
    licensing_notes: row.licensing_notes,
  }).question);

  const bankFingerprints = new Set(bank.map(question => question.question_fingerprint));
  const candidateFingerprints = parsed.valid.map(item => item.question.question_fingerprint);
  assert.equal(new Set(candidateFingerprints).size, 90, "Candidate fingerprints must be unique.");
  assert.equal(candidateFingerprints.filter(value => bankFingerprints.has(value)).length, 0, "No candidate may exactly match a retained or held source question.");

  const normalizeStem = value => String(value || "").normalize("NFKC").toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
  const bankStems = new Set(bank.map(question => question.subject + "|" + normalizeStem(question.question_text)));
  const exactStemMatches = parsed.valid.filter(item =>
    bankStems.has(item.question.subject + "|" + normalizeStem(item.question.question_text))
  );
  assert.equal(exactStemMatches.length, 0, "No replacement may reuse an exact same-subject source stem.");
});

test("replacement CSV omits status so the server importer keeps every inserted row in draft", () => {
  const header = parseCsv(readFileSync(candidatePath, "utf8"))[0];
  assert.ok(!header.includes("status"), "Candidate CSV must not request an approval or publication status.");
  for (const item of candidates) {
    assert.equal(validateQuestionInput(toImportRow(item)).question.status, "draft");
  }
});
