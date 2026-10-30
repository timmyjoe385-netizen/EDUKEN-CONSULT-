import test from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const directory = join(process.cwd(), "content", "cbt");
const files = readdirSync(directory)
  .filter(name => /^original-batch-\d+-40-questions\.csv$/.test(name))
  .sort((a, b) => Number(a.match(/batch-(\d+)/)[1]) - Number(b.match(/batch-(\d+)/)[1]));
const expectedHeader = [
  "subject", "topic", "subtopic", "question_text",
  "option_a", "option_b", "option_c", "option_d",
  "correct_option", "explanation", "difficulty", "exam_type",
  "source_type", "source_name", "source_year", "provenance_notes",
  "licensing_notes", "status",
];
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

function normalizeStem(value) {
  return String(value || "").normalize("NFKC").toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
}

test("all original CBT batches are structurally valid and remain draft-only", () => {
  assert.ok(files.length > 0, "At least one original question batch must exist.");
  const numbers = files.map(name => Number(name.match(/batch-(\d+)/)[1]));
  assert.deepEqual(numbers, Array.from({ length: files.length }, (_, i) => i + 1), "Batch numbering must be sequential without gaps.");
  const seenStems = new Map();
  let totalRows = 0;

  for (const file of files) {
    const rows = parseCsv(readFileSync(join(directory, file), "utf8"));
    const header = rows.shift();
    assert.deepEqual(header, expectedHeader, file + ": expected exact 18-column CSV header.");
    assert.equal(rows.length, 40, file + ": each batch must contain exactly 40 questions.");
    const counts = Object.fromEntries(subjects.map(subject => [subject, 0]));

    rows.forEach((row, index) => {
      const location = file + ":row " + (index + 2);
      assert.equal(row.length, 18, location + ": every row must contain exactly 18 columns.");
      const [subject, topic, subtopic, stem, optionA, optionB, optionC, optionD, answer, explanation, difficulty, examType, sourceType, sourceName, sourceYear, provenance, licensing, status] = row;
      assert.ok(Object.hasOwn(counts, subject), location + ": unsupported subject.");
      counts[subject]++;
      assert.ok(topic.trim(), location + ": topic is required.");
      assert.ok(stem.trim().length >= 5, location + ": question stem is required.");
      const options = [optionA, optionB, optionC, optionD].map(value => value.normalize("NFKC").toLowerCase().replace(/\s+/g, " ").trim());
      assert.ok(options.every(Boolean), location + ": all four options are required.");
      assert.equal(new Set(options).size, 4, location + ": options must be distinct.");
      assert.ok(["A", "B", "C", "D"].includes(answer), location + ": answer key must be A, B, C or D.");
      assert.ok(explanation.trim().length >= 5, location + ": explanation must meet the importer minimum.");
      assert.ok(["easy", "medium", "hard"].includes(difficulty), location + ": difficulty must be valid.");
      assert.equal(examType, "JAMB", location + ": exam type must be JAMB.");
      assert.equal(sourceType, "original", location + ": these batches must be original-authored content.");
      assert.ok(sourceName === "" || sourceName === "EDUKEN CONSULT" || sourceName === "EDUKEN CONSULT original draft", location + ": source name must be blank or identify EDUKEN as the author, never a third-party past-paper source.");
      assert.equal(sourceYear, "", location + ": original questions must not invent a past-paper year.");
      assert.ok(provenance.trim(), location + ": provenance notes are required.");
      assert.ok(licensing.trim(), location + ": licensing notes are required.");
      assert.equal(status, "draft", location + ": repository batches must remain draft-only.");

      const normalized = normalizeStem(stem);
      const previous = seenStems.get(normalized);
      assert.ok(!previous, location + ": exact normalized stem duplicates " + JSON.stringify(previous));
      seenStems.set(normalized, location);
      totalRows++;
    });

    for (const subject of subjects) {
      assert.equal(counts[subject], 5, file + ": expected exactly five " + subject + " questions.");
    }
  }

  assert.equal(totalRows, files.length * 40);
});
