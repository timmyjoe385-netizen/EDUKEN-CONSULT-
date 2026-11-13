# EDUKEN CBT — five-workstream continuation round 17 (13 November 2026)

## Verification baseline
Continued on the isolated work branch `work/cbt-r4-next-replacement-drafts-20261112`. Re-fetched the canonical replacement inventory, grading helper, grading regression tests, subject-selection helper, current PR metadata and current-head workflow runs. This round did not touch `main`, production services or live student data.

## Workstream 1 — uncovered replacement coverage
- Current authoritative R4 baseline remains 1,439 provisionally retained + 161 held = 1,600, with 200 questions per subject.
- Explicit target-location coverage remains 116/161; 45 held locations remain without a canonical proposal target.
- The supplemental DUP-95 Chemistry draft remains separate from the canonical inventory and does not reduce the 45-location gap.
- No speculative replacement was added. The existing 12 candidate locations / 33 locations without a retained candidate remain the latest recorded candidate-coverage split; this round did not claim a fresh independent recount of the queue.

## Workstream 2 — canonical inventory integrity
Re-fetched and parsed `content/cbt/audits/duplicate-replacement-drafts-2026-11-01.json`.
- Declared draft_count: 116; actual item count: 116.
- Unique target IDs: 116; duplicate target IDs: 0.
- Missing question text, non-four-option records, blank options, repeated options or invalid A–D keys: 0.
- Subject counts: Mathematics 7, Chemistry 17, Physics 12, Biology 18, Literature in English 14, Economics 20, Government 14, Use of English 14.
- Descriptive metadata now correctly states 116 proposals / 90 original plus 26 additional target-specific drafts.
- All proposals remain provisional drafts; qualified academic approvals remain 0. Structural validity is not academic approval.

## Workstream 3 — CBT grading and subject-selection regression
Re-fetched the current work-branch source files:
- `supabase/functions/eduken-api/cbt-attempt-validation.mjs`
- `supabase/functions/eduken-api/cbt-question-selection.mjs`
- `tests/cbt-attempt-validation.test.mjs`

Ran the fetched helper logic and regression cases in a clean temporary Node.js v22.16.0 harness. Result: **10 tests passed, 0 failed**. Coverage included scoring, unanswered questions, unknown answer IDs, malformed snapshots/answers, duplicate question IDs, expiry grace, 180-question allocation, shorter mixed-mock allocation, all 24 answer-option permutations, and invalid option permutations.

**Test boundary:** this was an isolated harness built from the fetched source/test contents, not a checkout-based execution of the repository's full `npm run test:validation` command or a GitHub Actions run. Do not represent it as full repository CI. The API route separately validates exactly three unique additional subjects against the supported-subject allowlist before calling the allocation helper.

## Workstream 4 — rank and provenance reconciliation
The latest Round 16 evidence remains the governing record:
- 178 baseline ranks in 1–286 are not represented by exact pair crosswalks.
- 237 reported targeted reviews still lack exact rank IDs.
- The 1,007 vs 1,003 cumulative discrepancy and stale 472/237 and 685/717 counters remain unresolved.
- Final reviewed/remaining totals remain null/unverified. No rank complement, reviewer identity or approval was inferred.

## Workstream 5 — platform, preview and release safety
Re-fetched PR metadata and workflow runs for all four outstanding PRs:
- #194 `6ab3e4f018e9d21f95b3d306ea5720b9be5564e6`
- #195 `e58978c4e81d6bc9bfe39760881f2a53320db973`
- #197 `432048c1337cd3c70cda0483a1eb7e81f02adc11`
- #199 `aea774e0e90955e4425bca7a4edfe072a5a3ccf5`

All four PRs remain open, draft and unmerged. On each exact listed head, the four workflow groups (build, wallet SQL integration, Playwright browser checks, and build/Cloudflare deploy workflow) are completed successfully; preview deployment jobs succeeded and production deploy jobs were skipped. These PR-head runs do not validate the separate work-branch changes.

The admin Playwright checks still use mocked authentication/API. Real isolated-preview admin/non-admin acceptance, full 10/20/40/100/180 mock-size preview validation, and live AI-assistant POST remain outstanding. The latest recorded preview bank remains eight synthetic published samples; no fresh live preview status is claimed.

## Round result and safety
All five workstreams were handled together. The canonical inventory structure and grading/selection logic received fresh checks; the isolated regression harness passed 10/10; platform PR heads were freshly reverified. No canonical question content, source CSV, R4 staging row, database, Worker, auth/payment configuration, production resource or student data was changed. No merge, production deployment, question import or publication occurred. Qualified academic approvals remain 0.
