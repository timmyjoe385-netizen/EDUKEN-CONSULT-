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

Nine original CSV batches now contain 360 draft questions: 45 per subject across the eight supported subjects. These are content drafts, not reviewed or published bank records. A structural scan across all 360 rows confirmed the 18-column format, valid answer keys, and draft status, with 45 rows per subject. A cross-batch normalized-stem scan found no exact normalized-stem duplicates. This does not replace academic review or semantic-duplicate review.

## Recent CBT implementation checks

The reconciled branch now uses shared server-side helpers for the 180-question blueprint and option-order remapping. Unit tests cover the 60 + 40 + 40 + 40 full-mock distribution, shorter mixed-mock distribution, all 24 possible answer-option permutations, and invalid option mappings. These tests are part of the current branch validation; they do not establish that the question bank is sufficiently populated for a full mock.

## Current verified baseline (isolated test project only)

The isolated test database currently reports 73 rows: 65 draft and 8 published, with one published row in each supported subject. This is not a completed bank and does not support a full mock. Reconcile existing rows and provenance before adding/importing more content.

No production database or production question records are to be modified as part of this plan.
