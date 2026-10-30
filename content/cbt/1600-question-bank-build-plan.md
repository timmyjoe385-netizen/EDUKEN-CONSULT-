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

Thirty-three original CSV batches now exist in the current PR branch: 1,320 draft questions total, with 165 draft questions per supported subject. Batch 28 was rebuilt after structural validation exposed malformed CSV cells and exact cross-batch duplicates. Batch 29 repeated stems found by the permanent cross-batch test were replaced with distinct questions, including periodic trends, demand schedule, store of value, progressive taxation and an aside in drama. Batches 30, 31, 32 and 33 each add 40 original questions, five per subject, across additional syllabus areas. The batch files are repository drafts only. Structural validity and automated duplicate checks are not academic approval; semantic similarity, syllabus coverage, answer accuracy and explanations still require subject-expert review before any publication.

Batch 25 was individually scanned after creation and contains 40 valid rows (five per subject), the exact 18-column header, valid answer keys, four distinct options, meaningful explanations, and draft status. Targeted normalized-stem checks across batches 02, 08, 16, 17 and 18 found five repeated stems (covering angle of incidence, GDP measurement, osmosis, kidney filtration and opportunity cost); those items were rewritten in batches 16–18. A separate exact normalized-stem scan of batches 13–25 found one duplicate apostrophe question in batches 24 and 25; the batch 25 item was replaced with an elegy-versus-ode question. The full structural scan across batches 01–25 confirmed 40 rows per batch, the exact 18-column header, five questions per subject, valid answer keys, four distinct options, explanations meeting the importer’s five-character minimum, and draft status. Exact duplicate checks within batches 01–12 and within batches 13–25 had no remaining matches after the batch 25 correction. Batch 26 was individually checked: 40 rows, five per subject, 18 columns, valid keys, distinct options, explanations, and draft status. A cross-range exact scan and full semantic/academic review are still required; do not treat structural validity as proof of academic correctness, and do not import or publish these repository CSV drafts automatically.

## Recent CBT implementation checks

The reconciled branch now uses shared server-side helpers for the 180-question blueprint and option-order remapping. Unit tests cover the 60 + 40 + 40 + 40 full-mock distribution, shorter mixed-mock distribution, all 24 possible answer-option permutations, and invalid option mappings. These tests are part of the current branch validation; they do not establish that the question bank is sufficiently populated for a full mock.

## Current verified baseline (isolated test project only)

The isolated test project `wpktzogarfqrgkirzdpy` remains active and separate from production. Its latest read-only subject/status query reports 73 rows: 65 drafts and 8 published, with one published row in each of the eight supported subjects (Use of English has 9 drafts; each other subject has 8 drafts). This is not a completed bank and does not support a full 180-question mock. The API must reject an underfilled full mock clearly.

No production database or production question records are to be modified as part of this plan.

## Latest repository verification

- PR #194 remains open and in draft state; it has not been merged.
- At head `6fa51fe0bfca85af2b22756899402e0897db9bb7`, the website build and full validation/security regression workflow passed. The validation job reported 109 tests passed, zero failed, including the permanent cross-batch question-bank test across all 28 existing numbered CSV files (1,120 structurally valid draft questions, 140 per subject).
- The isolated wallet/CBT SQL integration workflow also passed on this head.
- Playwright browser checks and the Cloudflare preview deployment were still running when this note was prepared; their results must be checked against the latest branch head before being reported.
- Production deployment remains excluded. A successful build or preview is not a production release.
- The isolated full-mock bank remains underfilled. Authenticated admin import-to-publish testing and academic review remain outstanding.
- Batch 28 was rebuilt after validation exposed malformed CSV cells and two exact cross-batch duplicates (catalyst and monopoly stems). Batch 27 also had exact duplicate stems involving pressure groups and naturalisation; both were replaced with distinct original questions. The permanent duplicate test was not changed or bypassed.
