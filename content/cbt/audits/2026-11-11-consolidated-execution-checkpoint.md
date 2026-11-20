# EDUKEN JAMB CBT — consolidated execution checkpoint (11 November 2026)

**Branch:** `feat/cbt-subject-combination-reconciled`  
**Purpose:** Current status snapshot to prevent older R3/115-draft figures and historical rank counters from being mistaken for current state. This document is additive; historical audit evidence is preserved.

## 1. Source bank and R4 staging

Authoritative staging revision: `content/cbt/staging/2026-11-10-r4/`.

- Source rows: **1,600** across eight UTME subjects (200 each).
- Provisionally retained: **1,439**.
- Held locations: **161**.
- R4 changes one additional Use of English row to held under DUP-245; R3 remains unchanged.
- Structural/membership verification: 1,439 retained and 161 held rows each have four distinct options, valid A–D key, explanation and required question fields; 1,600 unique source identities; zero retained/held overlap; zero duplicate held locations; zero missing retained anchors; zero cycles; zero duplicate normalized same-subject stems in retained.
- These checks are structural, not academic approval. The one R4 staging row movement is recorded; no original source CSV or production data was changed.

Per-subject retained/held counts:

| Subject | Retained | Held |
|---|---:|---:|
| Use of English | 185 | 15 |
| Mathematics | 193 | 7 |
| Biology | 169 | 31 |
| Chemistry | 179 | 21 |
| Physics | 185 | 15 |
| Economics | 173 | 27 |
| Government | 175 | 25 |
| Literature in English | 180 | 20 |
| **Total** | **1,439** | **161** |

## 2. Replacement inventory and review status

The canonical replacement inventory contains **116 unique proposals** (no duplicate target IDs). All 116 have four distinct non-empty options, valid A–D keys and review-required status.

- Bank-wide lexical screen at threshold 0.42: 12 flags and 104 below threshold. A lexical score is only a screening signal, not a duplicate decision or quality approval.
- Target-specific coverage: **104 of 161 held locations**. **55 confirmed-duplicate targets** still lack a target-specific draft; **2 related-skill targets** remain for qualified review.
- Assistant content QA reports added 11 November identify six question-construction defects (Economics DUP-228/DUP-109; Government DUP-102/DUP-221/DUP-104/DUP-123), a Literature epithet overlap (DUP-59/DUP-232), and several syllabus/jurisdiction/wording checks. Draft revisions are suggestions only; the canonical inventory was not modified.
- Exact ID comparison: 90 of the current 116 proposals match the original Order 1 set for which the project owner previously reported reviewer approval. The repository lacks signed item-level evidence and reviewer credentials; this is user-reported, not documentary-verified. The other **26** are outside the original 90 and must receive their own attributable reviewer disposition.
- The separate 26-item worksheet is blank; no approvals have been fabricated or pre-filled.
- Qualified academic approval recorded in the repository: **0**. No replacement is imported or published.

## 3. Cross-window duplicate-review reconciliation

- Total candidate pairs: **1,304**.
- Persisted tail-review rank coverage for ranks **287–1,304 is complete**: 1,018 unique rank IDs have explicit pairwise dispositions across the tail-review records.
- Exact endpoint crosswalk maps 184 existing register pairs to 184 unique ranks; 75 are in ranks 1–286 and 109 are in ranks 287–1,304.
- The 49-item high-similarity shortlist maps exactly to 49 ranks; 16 overlap the 184 register-pair ranks.
- The combined exact crosswalk represents 108 unique ranks in the 1–286 band, leaving 178 baseline-band ranks not represented by these pair crosswalks.
- The earlier baseline figure of 286 is not supported by a complete exact rank-ID crosswalk. The additional targeted-review figure of 237 has no exact rank list in the inspected records.
- Part63's persisted cumulative counter is 1,007 versus 1,003 from the explicit pre-addendum rank derivation; the four-record difference is unresolved. Legacy register fields also conflict (472 vs 237; 685 vs 717).
- **Final unique reviewed and remaining totals stay null/unverified.** Do not infer rank IDs from arithmetic complements or similarity-score order.

## 4. Platform engineering

Relevant PRs remain open and draft; production deploy is skipped.

- PR #195: all recorded CI/build/preview/public-browser/wallet checks passed.
- PR #197: all recorded CI/build/preview/public-browser/wallet checks passed.
- PR #199: all recorded CI/build/preview/public-browser/wallet checks passed.
- PR #194 current head at checkpoint: `21e75378114129c7a86266b3dc62cbbdd64768b4`. Build and wallet SQL checks passed; preview deployment was pending and public website browser checks were in progress at the latest poll. Recheck before reporting completion.
- Automated PR #199 administrator tests use mocked authentication/API. They do not replace the authenticated isolated-preview acceptance checklist or a real administrator/non-admin authorization walkthrough.
- No merge, production deployment, production import, question publication, payment/auth change or real-student-data test was performed.

## 5. Next work in order

1. Recheck PR #194 preview deployment and public-browser checks; investigate only actual failures.
2. Continue source-evidence search for the 178 baseline-band ranks and four-count counter discrepancy; do not create inferred review decisions.
3. Complete target-specific drafts for the 55 uncovered confirmed-duplicate targets only after full-bank subject screening.
4. Obtain attributable qualified subject-review decisions for the 26 additional proposals and the remaining held/replacement queues.
5. Complete authenticated isolated-preview admin acceptance, then student flow, mobile and slow-network validation.

## Release boundary

All retained questions are provisional. No independent academic approvals are recorded for this release queue. Production remains isolated. Do not merge, deploy, import or publish without the explicit project release authorization and completed review gates.


---

## 6. Execution addendum — 11 November 2026, 17:10 UTC

This addendum supersedes the older PR #194 head/check status above where they conflict. It does not alter the release boundary.

### Replacement drafting

- The separate uncovered-target work queue identifies **45 held locations** without a target-specific proposal, after the 116 existing proposals were reconciled.
- Five first-pass draft proposals have been prepared in `content/cbt/audits/2026-11-11-r4-first-five-uncovered-replacement-drafts.md`: Government DUP-108, Economics DUP-133, Literature DUP-176, Biology DUP-165 and Physics DUP-169.
- Each was compared against all 1,600 R4 source questions and all 116 existing proposals using the character-trigram Dice screen (threshold 0.42). All five maximum source-bank and existing-proposal scores are below 0.42. Related-topic flags are still explicitly noted for the Economics circular-flow and Biology blood-group drafts.
- These five are **separate draft candidates only**. The canonical 116-item inventory and 45-location work queue have not been modified. Do not count these as qualified replacements or approvals until they are formally reconciled and reviewed.
- Qualified academic approvals remain **0**.

### PR #194 platform status

- Current PR #194 head: `e49b548821f5d94480aad04eb97711f793f5df33`.
- Build and wallet SQL checks passed on the immediately preceding tested head `60351d70bfaf3c46d05100506b193fc66276d849`; the PR #194 build and wallet checks also passed on that head.
- Isolated preview Worker deployment succeeded. The real Chromium smoke test failed twice on that tested head because it did not receive the expected `/functions/v1/eduken-api/api/cbt/questions` response within 25 seconds. The test currently does not establish whether the cause is page boot, network/DNS, frontend preview configuration or API reachability.
- A diagnostics-only change was committed to `tests/cbt-preview-smoke.mjs` at `e49b548821f5d94480aad04eb97711f793f5df33`. It records navigation status, final URL, page title/body text, browser console/page errors, failed asset/API requests and API response statuses if the expected request times out. This diagnostics commit has not yet had a new workflow run attached; do not describe the instrumented test as passed.
- The preview Worker is configured with the isolated Supabase URL/key, and Cloudflare reports its Workers subdomain enabled. An external live fetch resolved the preview homepage once but subsequent route fetches intermittently failed DNS resolution; this is inconclusive and is not treated as proof of the root cause.
- The guest payment-recovery smoke test was skipped because the preceding CBT browser smoke test failed.
- Production deployment remains skipped. No production Worker, production Supabase project, question import/publication, authentication or payment configuration was changed.

### Immediate next actions

1. Run the diagnostics-enabled browser smoke test on the current PR head and inspect the captured page/network evidence.
2. Fix only the demonstrated root cause; keep the assertions for real published-question retrieval, hidden answer keys, subject selection and safe underfilled-bank rejection.
3. Rerun preview deployment, Chromium smoke, guest recovery, build and wallet checks on the same current head.
4. Continue the remaining 40 uncovered-target drafts in small subject-balanced batches, screening each against the full source bank and the existing proposal set before it is added to the canonical inventory.
5. Preserve the authenticated admin acceptance and qualified academic review gates; no release action is authorized by these drafts or automated checks.


## 7. Hostname correction — 11 November 2026, 17:11 UTC

- Cloudflare account API confirms the exact Workers subdomain is `timmyjoe385`.
- Canonical production hostname: `https://eduken-consult.timmyjoe385.workers.dev`.
- Canonical preview hostname: `https://eduken-consult-preview.timmyjoe385.workers.dev`.
- The preview URL in `.github/workflows/deploy-cloudflare.yml` and the default in `tests/cbt-preview-smoke.mjs` already used the correct full subdomain.
- A stale shortened production-origin comparison was found in `src/lib/api.ts` and corrected in commit `0f38c016520d6f171d7d6a6af8e2e9f94c46eae5`.
- Live fetch of the canonical preview `/cbt` route returned HTTP 200 and EDUKEN CBT page HTML.
- New build, preview deploy, browser and wallet checks have been triggered against commit `0f38c016520d6f171d7d6a6af8e2e9f94c46eae5`; at checkpoint time, build/install was still running and browser checks were queued. No result is claimed yet.
