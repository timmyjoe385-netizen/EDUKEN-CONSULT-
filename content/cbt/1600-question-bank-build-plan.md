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

Twenty-four original CSV batches now exist in the current PR branch: 960 draft questions total, with 120 questions per supported subject. A fresh scan of batches 01–24 at the current branch head confirmed 40 data rows per file, the exact 18-column header, five questions per subject per batch, valid A/B/C/D answer keys, four distinct options, non-empty explanations meeting the import validator's five-character minimum, and draft status throughout. This is a structural/import-readiness check, not academic approval.

The cross-batch stem review has identified repeated or closely overlapping question families (including osmosis and the functional unit of the kidney). These must be deduplicated or rewritten before the bank is treated as a clean 960-question set. Exact stem matching alone is not enough: semantic duplicates and answer/explanation accuracy still require academic review. Do not import or publish these repository CSV drafts automatically.

## Recent CBT implementation checks

The reconciled branch now uses shared server-side helpers for the 180-question blueprint and option-order remapping. Unit tests cover the 60 + 40 + 40 + 40 full-mock distribution, shorter mixed-mock distribution, all 24 possible answer-option permutations, and invalid option mappings. These tests are part of the current branch validation; they do not establish that the question bank is sufficiently populated for a full mock.

## Current verified baseline (isolated test project only)

The isolated test project `wpktzogarfqrgkirzdpy` remains active and separate from production. Its latest read-only subject/status query reports 73 rows: 65 drafts and 8 published, with one published row in each of the eight supported subjects (Use of English has 9 drafts; each other subject has 8 drafts). This is not a completed bank and does not support a full 180-question mock. The API must reject an underfilled full mock clearly.

No production database or production question records are to be modified as part of this plan.

## Latest repository verification

- The successful workflow evidence cited below is for code head `c520714cf133330d56ec387cebbdf36936c5a89e`; this plan update is documentation-only.
- PR #194 remains open and in draft state; it has not been merged.
- On this exact head, the latest PR workflow runs for build check, wallet migration SQL integration, Playwright browser checks, and build/Cloudflare preview workflow all completed successfully.
- The successful build/Cloudflare workflow is a preview/PR workflow result, not permission or proof of a production release.
- The full-mock bank remains underfilled in the isolated database. Admin import-to-publish testing with an authenticated admin account and academic review remain outstanding.
