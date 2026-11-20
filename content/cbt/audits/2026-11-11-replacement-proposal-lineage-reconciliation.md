# Replacement proposal lineage reconciliation — 11 November 2026

**Branch:** `feat/cbt-subject-combination-reconciled`  
**Authoritative current inventory:** `content/cbt/audits/duplicate-replacement-drafts-2026-11-01.json`  
**Historical approval context:** `content/cbt/audits/order-1-independent-review-handoff-2026-11-02.md`

## Reconciled result

The current replacement inventory contains **116** proposal records. The historical Order 1 handoff identifies **90** proposals for which the project owner reported that an independent reviewer had approved all 90. Exact ID reconciliation confirms that all 90 historical IDs are present in the current 116-item inventory.

Therefore:
- **90/116** current proposals match the historically user-reported reviewer-approved set.
- **26/116** are additional proposals not included in that original 90-ID handoff.
- The historical 90/90 approval is user-reported; the repository does not contain signed item-level reviewer decisions, reviewer identity or credentials. It must not be described as documentary-verified.
- The 26 additional proposals must not inherit the earlier 90-item approval by association. They need their own attributable reviewer disposition.
- The assistant QA findings in the 11 November reports are not independent academic approvals.

## Additional 26 proposal IDs

| Subject | Additional IDs | Count |
|---|---|---:|
| Mathematics | DUP-217, DUP-98 | 2 |
| Chemistry | DUP-216, DUP-174, DUP-219, DUP-121 | 4 |
| Physics | DUP-114 | 1 |
| Biology | DUP-210 | 1 |
| Literature in English | DUP-232, DUP-164 | 2 |
| Economics | DUP-19-ADD-2026-11-09, DUP-101, DUP-228, DUP-109 | 4 |
| Government | DUP-47-ADD-2026-11-09, DUP-126, DUP-240, DUP-107, DUP-193, DUP-102, DUP-221, DUP-104, DUP-123 | 9 |
| Use of English | DUP-129, DUP-200, DUP-245 | 3 |
| **Total** | | **26** |

## Implications for the 11 November QA

The 11 November assistant QA pass reviewed all 116 proposals. Its review of the original 90 is a supplementary assistant QA layer; it does not revoke or replace the project owner's earlier report that the independent reviewer approved those 90.

The 26 additional proposals are the newly unambiguously identified review gap. Of these, the current assistant QA has flagged:
- Economics DUP-228 and DUP-109: definition statements repeat the answer in the option set; draft question revisions are proposed.
- Government DUP-102, DUP-221, DUP-104 and DUP-123: definition statements repeat the answer; draft question revisions are proposed.
- Literature DUP-232: overlaps with original-set DUP-59 on epithet; retain for reviewer disposition rather than assuming both should be used.

Other additional proposals received assistant-level answer/explanation checks and still require attributable academic disposition, syllabus mapping and bank-level uniqueness review.

## Release rule

Do not mark the 26 additional proposals as reviewer-approved until an attributable subject reviewer decision is recorded. Keep all proposals in draft state until the relevant review and release gates are satisfied. This reconciliation changes no source CSV, staging row, database record or production question.
