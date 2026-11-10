# EDUKEN CBT — owner approval and replacement execution checkpoint

**Date:** 10 November 2026  
**Branch:** `work/cbt-owner-approved-replacement-execution-20261110`  
**Purpose:** Record the owner's explicit approval and establish a safe, non-destructive execution baseline for the replacement bank and bonus bank.

## 1. Explicit owner approval — authoritative instruction

The owner explicitly confirmed: **all 1,600 existing questions in the question bank, including their answer keys, are approved by the owner for EDUKEN CBT.** This is a direct owner decision covering the complete existing 1,600-question source bank, not merely permission to continue auditing it.

Record this as **OWNER-APPROVED: 1,600 QUESTIONS + ANSWER KEYS**.

This is the owner's approval for use/progression. It must not be misrepresented as independent subject-expert certification, nor as proof that every answer has been technically or independently verified. If an actual error or ambiguity is discovered during validation, flag it transparently and prepare a correction rather than knowingly retaining an error. Do not erase or overwrite the owner's approval record.

The approved handling is:

- Preserve all 1,600 original questions, answer keys and source evidence.
- Keep suitable, distinct questions in the scored main-bank candidate set.
- Keep duplicate and closely related questions in a separate bonus/revision set; do not include them in scored mock selection.
- Replace confirmed duplicate or unsuitable main-bank entries with suitable, distinct replacement candidates so the scored bank can reach its required unique-question count.
- Check each replacement's stem, four options, answer key, explanation, subject and syllabus fit; preserve uncertainty flags where evidence is insufficient.
- Maintain the distinction between owner-approved, assistant-screened, technically verified, syllabus-review-required and unresolved.

This approval does **not** authorize production import/publication, production deployment, merging an existing CBT PR, or changing authentication/payment behaviour. Those remain separate release actions.

## 2. Source evidence inspected on this branch

- The 9 November r3 manifest reports 1,600 source rows, 1,440 retained and 160 held, with 200 rows per subject; zero exact normalized same-subject duplicate stems in retained; zero structural issues; zero source-question content edits; zero production imports/publications/deployments.
- The 9 November checkpoint document describes r2 as 1,437 retained + 163 held. This conflicts with the r3 manifest's 1,440 + 160 and must be reconciled against the actual r3 retained/held exports before any final count is declared.
- The replacement draft file contains 115 draft records: 90 original target IDs plus 25 additional drafts. The 90-target syllabus map classifies 57 as provisionally aligned and 33 as requiring subject/syllabus review. These are draft-screening statuses, not approvals.
- The existing duplicate disposition register reports 199 original pair records plus later addendum work; its replacement plan reports 192 unique targets, incomplete retain/replace assignments, and 102 additional confirmed-pair replacement drafts still required. These totals must be reconciled to the current master register before insertion.
- Existing replacement drafts have not been inserted into the original question CSVs. Original source CSVs remain the immutable baseline.

## 3. Execution rules

1. Treat the owner's approval of all 1,600 original questions and answer keys as recorded and authoritative.
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
| Owner approval of all 1,600 questions and answer keys | RECORDED — EXPLICIT |
| Immutable source preservation | REQUIRED / IN FORCE |
| r2 versus r3 count reconciliation | BLOCKED |
| Unique master target ledger | IN PROGRESS |
| Replacement target assignments | INCOMPLETE |
| Existing 115 drafts | SCREENED AS DRAFTS; NOT INSERTED |
| 33 syllabus-review-required items | AWAITING RESOLUTION |
| Bonus bank export | NOT STARTED |
| Production import/publication/deployment | NOT AUTHORIZED |

**Release statement:** This checkpoint records explicit owner approval of the complete existing 1,600-question bank and answer keys, and authorization to continue non-production replacement and bonus-bank preparation. It does not certify the final scored bank as complete or authorize a production release.

## 6. Fresh reconciliation against the current PR #194 checkpoint (10 November)

A fresh read of PR #194's current body provides a later r3 checkpoint and supersedes the older r2/90-target figures above where they conflict:

- r3: **1,600 total; 1,440 provisionally retained; 160 held; 200 per subject**.
- r3 structural checks: zero unresolved anchor references, zero cycles, zero duplicate source-row identities, zero exact normalized same-subject duplicate stems in retained rows, and zero structural issues.
- Replacement drafts: **103** in the current PR checkpoint; coverage is reported for **103 of 160 held rows**.
- Remaining target work: **55 D targets still need drafts; 2 S rows await qualified review**.
- Qualified academic approvals recorded in that checkpoint: **0**. The owner's explicit approval recorded in this document is a separate owner decision and does not rewrite historical independent-review records.
- PR #194 remains **open, draft, unmerged**. Its latest checkpoint says no workflow runs were returned for the latest audit/data commit; older CI results must not be represented as current-head passes.
- PR #199 also remains open and draft; its own description says its browser coverage uses mocked auth/API and is not authenticated acceptance.

The older audit files on this branch still contain 90-target / 115-draft / 33-syllabus-review-required snapshots. Those are retained as historical evidence, not treated as current totals. Before creating or inserting new replacements, the 103-draft current PR checkpoint must be joined to the actual target ledger and current r3 exports. Do not add 55 drafts blindly: first prove their unique target IDs and source-row endpoints, and screen each candidate against all 1,600 questions and all existing drafts.

**Current decision:** proceed with non-production question-bank work under the owner's explicit approval of all 1,600 original questions and answer keys. Preserve all original content; move confirmed duplicate/related entries out of scored selection into the bonus/revision set and create distinct replacements where required. Do not change any original CSV or mark an unresolved target complete until the latest target-to-source mapping and r3 export join are verified.
