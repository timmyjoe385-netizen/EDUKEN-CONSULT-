# EDUKEN CBT — Final Execution Reconciliation
Date: 18 November 2026
Branch: `feat/cbt-subject-combination-reconciled`
PR: #194 (open, draft, unmerged)

## Purpose

Record the verified execution state after the 18 November technical checks and a read-only inspection of the isolated Supabase test project. This is an audit-only document. It does not authorize import, approval, publication, merge or production deployment.

## 1. Current technical verification

On PR #194 head `ed05e7588ac41fc4ae6259dd9c2edfdf228506ac`, the four workflow groups completed successfully:

- Build and validation: passed. The validation command reports 128 tests passed and 0 failed.
- Wallet and CBT SQL integration: passed in disposable PostgreSQL.
- Build and isolated Cloudflare preview deployment: passed; the production deploy job was skipped.
- Playwright/browser checks: passed, including isolated preview/API smoke checks.

The browser workflow's step list includes API input validation, real CBT API checks against the isolated Supabase project, local branch browser checks and evidence upload. These automated checks do not constitute a live authenticated administrator walkthrough or full mobile/slow-network acceptance.

The OAuth routing implementation was inspected in `src/lib/api.ts`, `src/App.tsx` and `src/PlatformHub.tsx`. Admin OAuth explicitly passes admin intent; customer OAuth uses the public/customer path and clears the admin session marker. The dedicated `tests/auth-oauth-intent.test.mjs` test is included in the 128-test validation command.

## 2. Isolated Supabase question-bank reconciliation

Project: `wpktzogarfqrgkirzdpy` (EDUKEN Wallet Test; ACTIVE_HEALTHY).

Read-only SQL returned 1,531 rows in `public.cbt_questions`:

| Source grouping | Rows |
|---|---:|
| R4 retained batch 1 | 500 |
| R4 retained batch 2 | 500 |
| R4 retained batch 3 | 439 |
| Additional R4 uncovered proposals import | 19 |
| Earlier unbatched original items (8 per subject) | 64 |
| Earlier admin-workflow draft fixture | 1 |
| **Draft total** | **1,523** |
| Synthetic published preview samples (one per subject) | 8 |
| **Database total** | **1,531** |

The three R4 retained imports each report completed with 500, 500 and 439 inserted rows, respectively, and zero duplicate/invalid rows. The 19-proposal import reports completed with 19 inserted rows and zero duplicate/invalid rows. Its source label says owner-reported reviewer-checked proposals; this label is not documentary evidence of independent approval.

The 64 unbatched original items are distributed evenly: eight draft rows for each of the eight subjects. They were created on 29 October 2026, before the R4 imports.

The eight published rows are synthetic preview samples, one per subject. They have no `published_by` or `published_at` metadata. They are not the academic R4 bank and must not be treated as qualified academic approvals.

A metadata count returned zero rows with reviewer/approval metadata and zero rows with publication metadata. The database status therefore does not establish academic sign-off. No rows were updated, deleted, imported or published during this inspection.

## 3. Replacement proposal reconciliation

The latest documented R4 uncovered-target proposal count is 24 of 45, leaving 21 targets without a documented target-specific draft. This count includes the two proposals in batch 2, two in batch 3 and one in batch 5, following the previously documented 19/45 checkpoint.

The 15 November complete retained-bank collision screen found no defensible new draft for the remaining 26 targets at that time. Subsequent batches added five target-specific proposals. The remaining targets must not be forced into paraphrased questions merely to increase the coverage count.

All proposals remain drafts. The 19 imported proposal rows remain in draft status. No qualified independent academic approval was recorded in this execution.

## 4. Cross-window rank reconciliation — unresolved

The candidate set contains 1,304 ranks. The explicit tail review covers every rank from 287 through 1,304 (1,018 ranks).

The 9 November exact endpoint crosswalk maps 184 register pairs to 184 unique ranks and 49 shortlist pairs to 49 unique ranks, with 16 overlapping ranks. The combined pair crosswalk represents 217 unique ranks, including 108 ranks in the 1–286 band. Thus 178 baseline-band ranks are not represented by those pair crosswalks.

The 8 November corrected baseline file explicitly withdraws the assumption that ranks 1–286 are proven individual manual reviews. It records no exact rank IDs for the reported 237 additional targeted reviews. The 1,007 versus 1,003 counter discrepancy (four records) remains unexplained. Historical register conflicts 472 versus 237 and 685 versus 717 also remain open.

No rank IDs or reviewer decisions have been inferred. Final reviewed and remaining totals stay null/unverified until original item-level evidence and counter lineage are recovered.

## 5. Release gates

Still outstanding:
- Recover or formally close the search for the original baseline review records, preserving the unresolved finding if they cannot be recovered.
- Obtain qualified, attributable subject, answer-key and syllabus approval. Assistant screening and owner-reported review labels are not substitutes.
- Complete authenticated administrator acceptance for the latest admin UI/API changes.
- Complete mobile and slow-network acceptance.
- Keep all draft proposals unpublished until their independent review decisions are recorded.

## 6. Safety and release boundary

- Production database and production Worker: untouched.
- Production question import/publication: none.
- Question status transitions during this inspection: none.
- PR #194: open, draft, unmerged.
- Production deployment: not run; CI production deploy job skipped.
- No approval, merge or release authorization is created by this audit.

**Disposition: TECHNICAL CHECKS PASS; ACADEMIC AND BASELINE EVIDENCE GATES OPEN; PRODUCTION RELEASE BLOCKED.**
