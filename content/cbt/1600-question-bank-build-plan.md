# EDUKEN CBT 1,600-Question Bank Build Plan

## Locked target

Prepare 200 reviewed, publishable questions for each of the eight supported subjects (1,600 total):

- Use of English — 200
- Mathematics — 200
- Biology — 200
- Chemistry — 200
- Physics — 200
- Economics — 200
- Government — 200
- Literature in English — 200

## Content workflow

1. Reconcile existing database rows and CSV/source packs before importing. Never blindly re-import existing records.
2. Draft original questions in manageable batches, distributed across the subject syllabus and topics.
3. Validate every row for required fields, exactly four options, a valid correct option, a meaningful explanation, a stable fingerprint, and duplicate fingerprints.
4. Review academic accuracy, ambiguity, difficulty, syllabus coverage, and answer/explanation alignment. Check semantic duplicates too; matching fingerprints alone cannot detect paraphrased duplicates.
5. Keep new questions in draft until reviewed. Only authorized review/publish workflow may make them student-visible.
6. Track counts by subject and status; report 200 as complete only when 200 distinct questions in that subject have passed review and are published.

## CBT requirements

- Practice question counts must never exceed the selected subject's available published count.
- Random selection must avoid duplicate questions within one attempt.
- Option shuffling must remap the correct answer before grading and answer review.
- A full JAMB-style mock requires 60 Use of English questions plus 40 questions from each of three selected additional subjects (180 total); reject the attempt clearly if any selected bank is short.
- Keep question content separate from code and never place draft or unreviewed questions in the student-facing published feed.

## Drafting progress (repository content only)

Forty original CSV batches exist in the current PR branch: 1,600 draft questions total, 200 per supported subject. Each file contains 40 questions, five per subject, with the exact 18-column schema. All 40 files were fetched from the current verified branch head and independently checked for 18 columns and 40 data rows. The permanent build test also enforces sequential batch numbering, five questions per subject per file, valid answer keys, four distinct options, explanations, original-authorship/provenance/licensing fields, draft-only status, and no exact normalized duplicate stems.

The repository CSVs are drafts only. Structural validity and automated duplicate checks are not academic approval. No automatic import or publication is permitted. Academic accuracy, ambiguity, syllabus coverage, difficulty, correct-answer validity, explanation alignment, and semantic overlap still require review before publication.

## Similarity screening — preliminary, not an approval

A preliminary stem-similarity screen was run over four separate 10-batch windows (batches 01–10, 11–20, 21–30, and 31–40). It flagged 118 candidate pairs within those windows for manual review. This is a noisy lexical screen: it can flag unrelated calculation questions that share generic wording, and it can miss paraphrases with different vocabulary. It did not compare pairs across the four windows, and it did not validate answer keys or explanations. Treat the flagged pairs as review leads, not as 118 confirmed duplicates. Several strong paraphrase candidates appeared (for example, repeated definitions of perfect competition, isotope terminology, rhyme scheme, narrator reliability, organelle function, and political-party manifesto). These must be checked against the complete question, options, answer, explanation, and topic before any row is changed. Do not automatically rewrite questions based on this heuristic.

A manual content-level review of five strong repeat clusters confirmed repeated question templates/concepts: catalyst action (three batches), isotope definition, poem rhyme scheme, unreliable narrator definition, and Golgi apparatus function. Six redundant draft rows were replaced across batches 08, 10, 13, 16, 17 and 30 with distinct questions on electrolysis, equilibrium pressure, poetic forms/caesura, alkene addition, and nephron filtration. The replacements preserve the 40-row batch size, five-per-subject balance, original-authorship metadata, and draft status. The lexical screen must be rerun on the new head, and the remaining candidates still require manual review. One unique hyperbole question was retained; it was not part of the confirmed repeat cluster.

## Recent CBT implementation checks

The reconciled branch uses shared server-side helpers for the 180-question blueprint and option-order remapping. Unit tests cover the 60 + 40 + 40 + 40 full-mock distribution, shorter mixed-mock distribution, all 24 possible answer-option permutations, and invalid option mappings. The latest verified CI run on commit 7054c480adb5aedaeb48753ff3e2d5e5b04b022c passed the build, cross-batch structural/duplicate validation, wallet SQL integration, browser checks, and isolated preview deployment. The production deploy job was intentionally skipped. The guest payment recovery smoke test was also skipped; it was not a passing test.

## Current verified baseline (isolated test project only)

The isolated test project `wpktzogarfqrgkirzdpy` remains active and separate from production. A fresh read-only query reports 73 CBT rows: 65 drafts and 8 published, with one published row in each of the eight supported subjects (Use of English has 9 drafts; each other subject has 8 drafts). This is not a completed bank and does not support a full 180-question mock. The API must reject an underfilled full mock clearly. The repository's 1,600 CSV drafts have not been imported into this database.

## Admin workflow and release gates

Authenticated admin CSV import-to-review-to-publish UI testing remains outstanding. Unauthenticated access assertions are covered by the automated tests, but they do not prove that an authorized administrator can complete the entire workflow safely. Do not claim that the admin workflow is fully verified until an authenticated end-to-end test is completed.

Before a student-facing production release:
- complete and document the semantic-overlap review across all 1,600 questions;
- have subject-competent reviewers verify academic accuracy, answer keys, explanations, ambiguity, and syllabus coverage;
- test the authenticated admin import, review, approval, and publish workflow in isolation;
- import only reviewed material into the isolated project and confirm that enough published questions exist for the requested exam combinations;
- rerun all CI, browser, API, and preview checks against the final commit;
- obtain explicit release approval before any production merge, production database change, or production deployment.

## Latest repository verification

- PR #194 is open, unmerged, and still marked draft. Latest verified head at the time of this update: `7054c480adb5aedaeb48753ff3e2d5e5b04b022c`.
- The latest build check, wallet migration SQL integration, Playwright browser suite, and isolated preview Worker deployment all completed successfully on that head.
- The production deployment job was skipped intentionally; no production release was performed.
- The guest payment recovery smoke test was skipped, not passed.
- The isolated test database has only 73 questions (65 drafts, 8 published) and is insufficient for the 180-question mock.
- Authenticated admin import-to-publish testing and full academic/semantic review remain outstanding.
- Production database and production question records remain untouched.
