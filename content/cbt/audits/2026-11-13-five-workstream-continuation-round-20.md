# EDUKEN CBT — five-workstream continuation round 20
Date: 13 November 2026

## Scope and current-state verification
Round 20 continued from the Round 19 checkpoint. The active audit branch remained separate from main. Platform integration was applied to the existing PR #194 draft branch, not to production:
- PR #194: `feat/cbt-subject-combination-reconciled`, latest head `2b2038878d33d4c19e750da8bfe7435c3042d941`, open, draft, unmerged.
- PR #195: `fix/cbt-practice-available-counts`, retained as an unmerged reference branch; its local sample fallback policy was not ported.
- PR #194's production deploy job was skipped. Its isolated preview Worker deployment succeeded. The isolated Supabase project `wpktzogarfqrgkirzdpy` received only the `eduken-api` Edge Function code deployment (version 48); production Supabase was not changed.

## Workstream 1 — replacement coverage
The last source-grounded R4 coverage remains 116 unique proposal targets matching 116 distinct held locations out of 161. Forty-five held locations remain without a canonical proposal target. No replacement question was added, promoted, imported or published in this round.

## Workstream 2 — question quality
The seven previously identified construction/concept-variety flags remain open: Economics DUP-228 and DUP-109; Government DUP-102, DUP-221, DUP-104 and DUP-123; Literature DUP-59/DUP-232. No qualified academic reviewer is available to the owner. Assistant checks remain supplemental; qualified academic approvals remain 0.

## Workstream 3 — question-bank coverage and uniqueness
The verified R4 source bank remains 1,600 rows, exactly 200 per subject, provisionally split into 1,439 retained and 161 held. Canonical replacement proposals remain at 116. No source CSV, retained/held staging row, canonical question inventory or production question bank was changed. No unreviewed question was published.

## Workstream 4 — disposition, provenance and rank
The reconciled disposition register remains 199 relationship records: 90 confirmed semantic-duplicate records; 77 confirmed semantic-duplicate records pending qualified review; 27 assistant-contextual confirmations pending qualified review; 4 cluster extensions pending qualified review; and 1 related-skill variant pending qualified review. These are relationship records, not unique held rows.
The exact crosswalk remains at 217 unique mapped ranks across the 184 register mappings and 49-row shortlist (16 overlaps). There are still 178 baseline ranks in 1–286 without exact pair-crosswalk representation; 237 targeted reviews lack exact rank IDs; 1,007/1,003 and legacy 472/237 and 685/717 counter conflicts remain unresolved. Final aggregate totals remain null.

## Workstream 5 — platform integration and release readiness

### Code integration applied to PR #194
The existing published-only safety model was preserved:
- Empty or unavailable published question API continues to disable student attempts.
- No local sample questions are shown or used as a fallback.
- Practice counts and mixed-mock sizes are derived from the actual published question inventory for the selected subjects.
- A four-question mixed starter is offered only when at least one published question exists in each of Use of English and the three selected additional subjects.
- The server uses the same four-subject allocation and enforces a four-minute timer for the four-question starter.
- The full 180-question mock retains its 60 English + 40 per additional subject allocation and 120-minute timer.
- The 10-question default remains, but it is only offered when the selected published inventory can satisfy the 3/3/2/2 allocation.
- Regression fixtures now seed the exact inventory required for the 10- and 180-question options, and include insufficient-inventory and four-question starter tests.
- The real-preview smoke test now checks the four-question starter against the isolated published sample bank.

Files changed on the PR #194 branch: `src/CbtPage.tsx`, `src/lib/cbt-mock-config.mjs`, `tests/cbt-mock-config.test.mjs`, `package.json`, `supabase/functions/eduken-api/index.ts`, `tests/e2e/cbt.spec.js`, and `tests/cbt-preview-smoke.mjs`.

### Verified test and preview results
On PR #194 commit `57a7e7a1218e4aba0d2678064ad8d52473618008`:
- Website build and `npm run test:validation`: passed.
- Edge Function type-check and API input-validation checks: passed.
- Real CBT API integration against isolated Supabase: passed.
- Local Playwright browser checks: passed.
- Wallet SQL integration: passed.
- Isolated preview Worker deployment: passed.
- Real Chromium preview smoke: passed, including published question fetch, hidden answer keys, four-subject selection, four-question starter and server-enforced 240-second timer.
- Isolated guest payment recovery smoke: passed with safe 404 for a nonexistent reference; no payment was initiated.
- Production Worker deployment job: skipped.

Two intermediate failures were diagnosed and corrected rather than hidden:
1. The first preview smoke still expected a 10-question option even though the isolated bank had only one published question per selected subject. The smoke was updated to expect the four-question starter.
2. The next preview run showed the deployed isolated Edge Function was still on version 47 and returned 1,800 seconds. The current PR #194 Edge Function source was deployed to the isolated test project only; version 48 was verified to contain the 240-second branch. The preview smoke was rerun and passed.

The final PR #194 head `2b2038878d33d4c19e750da8bfe7435c3042d941` changes only the smoke-test success message after the functional test was corrected. On this final head, build and validation/security tests passed, wallet SQL integration passed, Edge Function type-check and real isolated CBT API integration passed, and the isolated preview Worker deployment plus real Chromium smoke passed with the accurate four-question/240-second success message. The final local Playwright browser suite is still running; no failure has been reported.

### Data and release boundary
The real-preview smoke created a synthetic four-question test attempt in the isolated test database; it did not use real student data. No production database, auth, payment settings, Worker, Edge Function, source question bank or student record was changed. No PR was merged, no production deployment occurred, and no question was imported or published.

## Round result
The PR #194/#195 integration blocker is resolved at code level on the PR #194 draft branch, and the isolated backend was synchronized so the live preview exercises the same timer logic as the source. The 4-question starter and published-inventory gating passed the real isolated preview smoke. All four content/review workstreams remain held at their last verified state. The project is still not release-approved: PR #194 is draft/unmerged, academic approvals are 0, and the 45 replacement targets and rank/provenance discrepancies remain open.
