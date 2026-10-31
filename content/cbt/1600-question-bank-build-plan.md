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

Forty original CSV batches exist in the current PR branch: 1,600 draft questions total, 200 per supported subject. Each file contains 40 questions, five per subject, with the exact 18-column schema. The four 10-batch windows were fetched and checked for 18 columns, 40 data rows, and five questions per subject per batch. The permanent build test additionally enforces sequential batch numbering, valid answer keys, four distinct options, explanations, original-authorship/provenance/licensing fields, draft-only status, and zero exact normalized duplicate stems across all 40 files.

The repository CSVs are drafts only. Structural validity and automated duplicate checks are not academic approval. No automatic import or publication is permitted. Academic accuracy, ambiguity, syllabus coverage, difficulty, correct-answer validity, explanation alignment, and semantic overlap still require review before publication.

## Similarity screening — preliminary, not an approval

A fresh stem-similarity screen was run over four separate 10-batch windows (batches 01–10, 11–20, 21–30, and 31–40). It surfaced 32 same-subject candidate pairs at the screening threshold (11, 3, 6, and 12 per window respectively). This is a noisy lexical screen: it can flag related but distinct questions that share a template and can miss paraphrases with different vocabulary. It does not compare pairs across the four windows and is not a substitute for academic review.

The permanent global test has now passed on the latest tested branch head, confirming zero exact normalized duplicate stems across all 40 batches. Manual inspection of surfaced high-similarity examples found several related-but-distinct questions (for example, semicolon versus colon use, different vocabulary targets, and distinct formula/application questions). One repeated electromagnetic-induction concept was confirmed between batch 26 row 25 and batch 29 row 25. Batch 29 row 25 has been replaced with a distinct question about why a soft-iron core is inserted into a current-carrying solenoid.

Fourteen duplicate or redundant rows have been replaced across the original and continuation work. Earlier confirmed repeats included catalyst action, isotope definition, poem rhyme scheme, unreliable narrator definition, and Golgi apparatus function. Subsequent corrections include repeated question patterns involving a stanza definition, gradient calculation, sentence types, transpiration, natural selection, nephron filtration, coalition government, and electromagnetic induction. The replacements preserve the 40-row batch size, five-per-subject balance, original-authorship metadata, and draft status.

The remaining lexical candidates and all 1,600 questions still require content-level review of the complete stem, options, key, explanation, and topic. The lexical screen cannot validate answer keys or explanations and cannot certify academic quality. Do not automatically rewrite questions based on this heuristic.

## Recent CBT implementation checks

The reconciled branch uses shared server-side helpers for the 180-question blueprint and option-order remapping. Unit tests cover the 60 + 40 + 40 + 40 full-mock distribution, shorter mixed-mock distribution, all 24 possible answer-option permutations, and invalid option mappings.

The student CBT retrieves published questions only. Server-side attempt snapshots keep answer keys and explanations hidden until submission; grading and repeat-submission handling are server-side. The UI now disables attempts when the published question service is empty or unavailable instead of falling back to local sample questions. The results-page return-to-practice action was corrected and a browser assertion was added for that navigation.

## Current verified baseline (isolated test project only)

The isolated test project `wpktzogarfqrgkirzdpy` remains active and separate from production. A fresh read-only query reports 73 CBT rows: 65 drafts and 8 published, with one published row in each of the eight supported subjects (Use of English has 9 drafts; each other subject has 8 drafts). The import-history table has no rows. This is not a completed bank and does not support a full 180-question mock. The API must reject an underfilled full mock clearly. The repository's 1,600 CSV drafts have not been imported into this database.

## Admin workflow and release gates

Authenticated admin CSV import-to-review-to-publish UI testing remains outstanding. Unauthenticated access assertions are covered by automated tests, but they do not prove that an authorized administrator can complete the entire workflow safely. Do not claim that the admin workflow is fully verified until an authenticated end-to-end test is completed.

Before a student-facing production release:
- complete and document the semantic-overlap review across all 1,600 questions;
- have subject-competent reviewers verify academic accuracy, answer keys, explanations, ambiguity, and syllabus coverage;
- test the authenticated admin import, review, approval, and publish workflow in isolation;
- import only reviewed material into the isolated project and confirm that enough published questions exist for the requested exam combinations;
- rerun all CI, browser, API, and preview checks against the final commit;
- obtain explicit release approval before any production merge, production database change, or production deployment.

## Latest repository verification

- PR #194 is open, unmerged, and still marked draft.
- The latest tested branch head at the time of this update passed the build and validation/security regression checks, including the global exact-duplicate test across all 40 batches.
- Wallet migration SQL integration passed on that head.
- The isolated Cloudflare preview build completed; its Worker deployment and real-CBT Chromium smoke test were still in progress at the last check. The separate Playwright browser workflow was queued. Do not report those as passed until their runs complete.
- The production deployment job was skipped intentionally; no production release was performed.
- The guest payment recovery smoke test has been skipped on the preceding preview run; it was not a passing test.
- The isolated test database has only 73 questions (65 drafts, 8 published) and is insufficient for the 180-question mock.
- Authenticated admin import-to-publish testing and full academic/semantic review remain outstanding.
- Production database and production question records remain untouched.
