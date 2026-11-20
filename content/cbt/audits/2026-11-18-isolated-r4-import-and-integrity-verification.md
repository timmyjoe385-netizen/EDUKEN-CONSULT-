# EDUKEN CBT — isolated R4 import and integrity verification
Date: 18 November 2026
Branch: `feat/cbt-subject-combination-reconciled`
PR: #194
Verification type: read-only inspection of isolated Supabase project and current GitHub checks

## Question-bank work status
- R4 source bank: 1,600 rows (1,439 provisionally retained + 161 held), 200 source rows per subject.
- Uncovered held-location queue: 45 targets.
- Documented target-specific draft proposals: 24/45 after execution batches 2, 3 and 5.
- Targets without documented drafts: 21/45.
- The 15 November retained-bank collision screen covered the 26 targets then lacking drafts. Subsequent 18 November work added five target-specific proposals: DUP-99, DUP-171, DUP-132, DUP-194 and DUP-147. The 18 November batch 4 candidate screen rejected nine alternatives and added no draft.
- The 19 earlier proposals have owner-reported reviewer acceptance, recorded as such in the repository. Reviewer identity, qualifications and signed item-level decisions are not present. This does not extend to the later five proposals or the other 21 uncovered targets.
- The five new proposals remain assistant-authored draft candidates; their lexical screens are not semantic or academic approval.

## Isolated database — read-only results
Project: `wpktzogarfqrgkirzdpy` (`ACTIVE_HEALTHY`).

- Total `cbt_questions`: 1,531.
- Draft: 1,523.
- Published: 8.
- Unique fingerprints: 1,531/1,531.
- Blank stems: 0.
- Invalid/missing A–D answer keys: 0.
- Blank explanations: 0.
- Malformed/missing A–D option objects: 0.
- Rows with reviewer or approval metadata: 0.
- All eight published rows are one per subject, with source name `EDUKEN original preview sample`, provenance stating they were authored for isolated preview testing and are not official JAMB past questions. All eight have null approved/published actor and timestamp fields.

## Import lineage
- Retained R4 imports: three completed batches of 500, 500 and 439 rows (1,439 total).
- Target-specific reviewed-proposal batch: `r4-uncovered-reviewed-proposals-19-draft-import.csv`.
- Batch ID: `9a6cc349-115c-40d7-8407-79a437e9332d`.
- Submitted/inserted: 19/19; duplicates/invalid: 0/0.
- Linked rows: 19; all 19 are draft; published: 0; reviewer/approval metadata: 0.
- These 19 imports are separate from the 1,439 retained-bank imports.

## Current-head automated checks
PR #194 head at verification: `e95ae36474f79af70df8ccdabee519a523df63a1`.
- Build check: passed.
- Wallet migration SQL integration: passed.
- Build + isolated preview deployment: passed; `deploy-preview` passed and production `deploy` was skipped.
- Public website Playwright/browser checks: passed.

## Release boundary and remaining gates
- PR #194 remains open and draft; 344 changed files and 64,185 additions at this snapshot. It is not approved for merge merely because CI passes.
- No production project was queried or modified.
- No production deployment, production import, question publication, source-bank status change or merge was performed by this verification.
- Remaining work includes screening the 21 uncovered targets where a distinct learning outcome can be defended, resolving cross-window rank evidence gaps (178 baseline-band ranks lack exact pair crosswalk representation; the reported 237 targeted reviews lack exact rank IDs; 1,007 vs 1,003 counter discrepancy remains), and completing authenticated admin/mobile/slow-network acceptance.
- No missing rank IDs, reviewer identities or academic approvals have been inferred.
