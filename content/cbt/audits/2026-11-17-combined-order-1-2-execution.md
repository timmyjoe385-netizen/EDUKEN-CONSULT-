# EDUKEN CBT — combined Order 1 & Order 2 execution update (17 November 2026)

## Order 1 — question-bank and academic-review reconciliation

### Reviewer disposition
The project owner reported that the subject reviewer checked all 19 proposals in the R4 uncovered-target progress checkpoint and confirmed all 19 were correct. This is recorded in `2026-11-17-reviewer-disposition-19-of-19.md` as user-reported reviewer disposition. Reviewer identity, credentials and signed item-level worksheet were not supplied, so documentary verification is not claimed.

- Reviewed proposals reported: 19/19 accepted.
- Remaining uncovered target drafts in the 14 November checkpoint: 26.
- The 19 decisions do not extend to those 26 targets, the entire 1,600-question bank, or other review queues.
- No questions were imported or published as part of this Order 1 update.

### Isolated database read-only integrity check
The isolated Supabase project `wpktzogarfqrgkirzdpy` was inspected read-only.

- Rows: **1,512** total; **1,504 draft** and **8 published**.
- All 1,512 have unique fingerprints.
- Zero blank question stems, malformed/missing A–D options, invalid answer keys, or blank explanations in the inspected rows.
- Each of the eight subjects has one published row. These eight rows are explicitly labelled `EDUKEN original preview sample`, with provenance stating they were authored for isolated preview testing and are not official JAMB past questions. Their `approved_by`, `published_by`, approval/publish timestamps and import batch IDs are null. They are pre-existing preview fixtures, not evidence that the R4 bank or the 19 reviewed proposals were imported/published.
- Remaining database rows are drafts; subject-level totals are uneven and do not constitute the final 200-per-subject bank.

No database rows or statuses were changed.

## Order 2 — engineering and regression verification

The current feature-branch head at verification time was `4f425b0c3ac5e8dbc3f7cf3a14a47dda7083904f`.

Four GitHub Actions runs attached to this exact head completed successfully:

| Check | Result |
|---|---|
| Build check | Passed |
| Build + isolated preview deployment | Passed |
| Playwright public-site/browser checks | Passed |
| Wallet migration SQL integration | Passed |

The build workflow's production deploy job was **skipped**. The Playwright job completed its API input validation, real CBT API check against isolated Supabase, and local branch browser checks. This confirms the automated workflow, not a manual authenticated admin acceptance session or a real-student-device/slow-network acceptance test.

The subject-filter feature commits and their checks are therefore verified at CI level. No production Worker or production Supabase project was touched.

## Release and merge boundary

PR #194 remains **open and draft**. GitHub reports it mergeable, but its current comparison contains **337 changed files and 63,702 additions**. Mergeability alone is not a review approval. It remains unmerged; no production deployment, production question import, question publication, payment/auth configuration change or real-student-data test was performed.

## Remaining work

1. Complete the 26 uncovered-target drafts with full-bank screening and record any subsequent qualified reviewer decisions separately.
2. Reconcile the remaining source-evidence gaps in the 1,304 cross-window candidate review and the four-count counter discrepancy; do not infer missing rank IDs.
3. Finish authenticated isolated-preview admin acceptance, student flow, mobile and slow-network checks.
4. Review and reduce/split the oversized PR comparison before any merge decision.
5. Keep production deployment and production import/publication blocked until the owner explicitly authorizes release after all review gates.

This checkpoint records completed checks and outstanding gates; it does not authorize a release.


## Follow-up reconciliation — 18 November 2026

A second read-only inspection of the isolated Supabase project reconciled the import history that was not itemized in the 17 November checkpoint above:

- Three import batches named `r4-retained-draft-batch-1-of-3.csv`, `-2-of-3.csv`, and `-3-of-3.csv` contain 500, 500 and 439 rows respectively: **1,439 retained-bank questions imported as drafts**.
- All 1,439 linked question rows remain `draft`; none was published by these batches. The three import records have zero duplicate and invalid rows.
- These batches are the retained R4 source-bank import, not the 19 target-specific replacement proposals. The 19 target-specific proposals remain separately documented as reviewer-checked and owner-approved according to the project owner's report; they are not evidenced as imported in these batches. Do not conflate two other 26-item queues: (a) 26 held source locations in the 45-target uncovered queue were screened against the retained bank, and the 15 November collision screen did not justify new replacement drafts for them; they remain held unless a qualified reviewer identifies a distinct learning outcome; (b) a separate worksheet contains 26 additional canonical replacement proposals outside the historical 90-item set, with 0/26 item-level decisions recorded. The reported 19/19 approval does not extend to that separate worksheet.
- The three import records have null `imported_by`; their 1,439 linked rows have null `created_by` and `updated_by`. The admin audit UI should therefore show “Not recorded” for those actors rather than inventing an identity. This is an import-provenance limitation, not evidence of a named reviewer or approver.
- The database still contains 1,512 rows: 1,504 drafts and 8 published preview fixtures. The eight published fixtures remain labelled “EDUKEN original preview sample” and have no recorded approval/publisher IDs or timestamps. They are not part of the 1,439 retained-draft batches.
- Across all 1,512 rows, fingerprints are unique; the read-only structural checks found zero blank stems, malformed A–D option sets, invalid answer keys or blank explanations.
- Subject totals remain uneven and do not establish the final 200-per-subject target.

No database rows or statuses were changed during this follow-up. The PR #194 head `358ada3c3c776b400fcd5000f30195d76cdb9165` has now completed build, isolated preview deployment, public browser checks, wallet/CBT SQL integration and security regression workflows successfully; its production deployment job was skipped. PR #194 remains open and draft. The authenticated admin pagination/search/audit walkthrough, mobile/slow-network acceptance, full-bank source reconciliation and review of the oversized branch comparison remain release gates. No production deployment, import or publication was performed.


### Subject distribution of the 1,439 retained R4 draft imports

| Subject | Imported draft rows | Shortfall from 200 |
|---|---:|---:|
| Biology | 169 | 31 |
| Chemistry | 179 | 21 |
| Economics | 173 | 27 |
| Government | 175 | 25 |
| Literature in English | 180 | 20 |
| Mathematics | 193 | 7 |
| Physics | 185 | 15 |
| Use of English | 185 | 15 |
| **Total** | **1,439** | **161** |

The 161 shortfall is the count of held source rows, not a statement that every held row should be replaced with a new question. Any additional question intended to reach 200 unique items per subject must provide defensible syllabus coverage and pass the duplicate/collision screen and qualified academic review.
