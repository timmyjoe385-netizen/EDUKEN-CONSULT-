# EDUKEN CBT — owner approval and replacement execution checkpoint

**Date:** 10 November 2026  
**Branch:** `work/cbt-owner-approved-replacement-execution-20261110`  
**Purpose:** Record the owner's approval and establish a safe, non-destructive execution baseline for the replacement bank and bonus bank.

## 1. Owner instruction recorded

The owner has approved proceeding with the question-bank work and confirmed trust in the assistant's answer/key checks. This is recorded as **owner approval to proceed**, not as independent subject-expert certification or a claim that every question has already been checked.

The approved handling is:

- Keep suitable, distinct questions in the scored main-bank candidate set.
- Keep duplicate and closely related questions in a separate bonus/revision set; do not include them in scored mock selection.
- Replace confirmed duplicate or unsuitable main-bank entries with suitable, distinct replacement candidates.
- Check each replacement's stem, four options, answer key, explanation, subject and syllabus fit; preserve uncertainty flags where evidence is insufficient.
- Preserve all original source rows and historical audit evidence.

This approval does **not** authorize production import/publication, production deployment, merging an existing CBT PR, or changing authentication/payment behaviour. Those remain separate release actions.

## 2. Source evidence inspected on this branch

- The 9 November r3 manifest reports 1,600 source rows, 1,440 retained and 160 held, with 200 rows per subject; zero exact normalized same-subject duplicate stems in retained; zero structural issues; zero source-question content edits; zero production imports/publications/deployments.
- The 9 November checkpoint document describes r2 as 1,437 retained + 163 held. This conflicts with the r3 manifest's 1,440 + 160 and must be reconciled against the actual r3 retained/held exports before any final count is declared.
- The replacement draft file contains 115 draft records: 90 original target IDs plus 25 additional drafts. The 90-target syllabus map classifies 57 as provisionally aligned and 33 as requiring subject/syllabus review. These are draft-screening statuses, not approvals.
- The existing duplicate disposition register reports 199 original pair records plus later addendum work; its replacement plan reports 192 unique targets, incomplete retain/replace assignments, and 102 additional confirmed-pair replacement drafts still required. These totals must be reconciled to the current master register before insertion.
- Existing replacement drafts have not been inserted into the original question CSVs. Original source CSVs remain the immutable baseline.

## 3. Execution rules

1. Treat the original 1,600 questions as immutable source evidence.
2. Build new, versioned staging outputs; never overwrite the original source CSVs or earlier r1/r2/r3 snapshots.
3. Maintain one authoritative target-to-source-to-replacement crosswalk. Every replacement must identify its target ID, held source row, retained anchor (where applicable), new question ID, subject, syllabus topic, answer and explanation.
4. Keep duplicate/related items in a separate bonus bank with stable source references and a clear non-scored status.
5. Run exact duplicate, normalized-stem, structural, answer-key and bankwide similarity checks against the complete source bank and all existing drafts before accepting a replacement.
6. Mark status truthfully: owner-approved, assistant-screened, technically verified, syllabus-review-required, or unresolved. Never label assistant work as independent expert review.
7. Do not import, publish, merge, or deploy to production as part of this work.

## 4. Immediate blockers to final bank completion

- Reconcile r2 checkpoint counts against r3 manifest and actual exports.
- Reconcile the 199-pair baseline, later 109-pair review packet, 6 November addendum and 192-target replacement plan into a single unique target ledger.
- Complete target-to-source-to-replacement assignments; the current register explicitly says assignments are incomplete.
- Resolve the 33 syllabus-review-required draft records by either producing a more clearly in-scope alternative or retaining a transparent review-required hold.
- Generate and validate a separate bonus/revision export without changing scored mock selection.

## 5. Current execution status

| Work item | Status |
|---|---|
| Owner approval to proceed | RECORDED |
| Immutable source preservation | REQUIRED / IN FORCE |
| r2 versus r3 count reconciliation | BLOCKED |
| Unique master target ledger | IN PROGRESS |
| Replacement target assignments | INCOMPLETE |
| Existing 115 drafts | SCREENED AS DRAFTS; NOT INSERTED |
| 33 syllabus-review-required items | AWAITING RESOLUTION |
| Bonus bank export | NOT STARTED |
| Production import/publication/deployment | NOT AUTHORIZED |

**Release statement:** This checkpoint records authorization to continue non-production replacement and bonus-bank preparation only. It does not certify the final 1,600-question bank as complete or authorize a production release.
