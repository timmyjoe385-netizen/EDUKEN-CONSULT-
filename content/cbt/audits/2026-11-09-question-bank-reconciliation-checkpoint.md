# EDUKEN CBT question-bank checkpoint — 9 November 2026

## Scope and safety

Non-destructive provisional reconciliation. A new 9 November staging revision was created from the 6 November snapshot; the original question CSVs and 6 November staging files remain unchanged. Only row membership between retained and held exports changed in the new revision, following the user-delegated duplicate/distinct screening decisions. Question wording, options and answer keys were not edited. This is not independent academic approval and does not authorize import, publication, merge or production deployment.

## 1. Staging inventory — reconciled by subject

The 6 November snapshot contained 1,476 provisionally retained + 124 held. Two non-destructive 9 November revisions were created. Revision r1 applied the first clear duplicate/distinct decisions (1,444 retained + 156 held); revision **r2** resolved the remaining 18 previously uncertain pair rows and applied a further eight retained-to-held moves and one held-to-retained move, producing **1,437 retained + 163 held**.

| Subject | Retained (r2) | Held (r2) | Source total |
|---|---:|---:|---:|
| Use of English | 185 | 15 | 200 |
| Mathematics | 193 | 7 | 200 |
| Biology | 169 | 31 | 200 |
| Chemistry | 179 | 21 | 200 |
| Physics | 185 | 15 | 200 |
| Economics | 172 | 28 | 200 |
| Government | 174 | 26 | 200 |
| Literature in English | 180 | 20 | 200 |
| **Total** | **1,437** | **163** | **1,600** |

All 1,600 source locations were rechecked between r1 and r2: zero missing locations, zero added locations, zero retained/held overlap, and zero changes to question text, options, correct answers or explanations. Every subject still totals exactly 200 source rows. The revisions are provisional; retained does not mean academically approved, and held does not automatically mean a question is invalid.

A fresh integrity check of the r2 exports independently counted 1,437 retained and 163 held rows (1,600 total), with 200 per subject. The 163 held source locations are unique and do not overlap the retained set. An exact normalized-stem scan of the 1,437 retained questions found zero duplicate stems within a subject; all retained rows have non-empty question text, four populated options and a valid A–D answer key. This is an exact-duplicate/structure check only, not a semantic uniqueness guarantee or academic approval.

## 2. Independent academic-review queue

The two 6 November subject-review worksheets contain 105 candidate rows in total:
- Baseline independent worksheet: 34 rows.
- Additional independent worksheet: 71 rows.

The two source worksheets remain unchanged and their own reviewer/approval fields are blank. A separate assistant-only screening ledger now covers all 105 worksheet candidates: 105 answer-key checks and 105 explanation checks are marked Correct; all 105 syllabus entries are marked likely in scope pending final subject sign-off. Provenance notes distinguish EDUKEN-authored drafts from official past-paper claims. Reviewer names and dates remain blank, and no independent academic approval is recorded.

Candidate counts by subject across both worksheets:
- Mathematics: 17
- Government: 19
- Chemistry: 16
- Use of English: 6
- Biology: 17
- Physics: 10
- Economics: 12
- Literature in English: 8

The additional worksheet's existing review notes are explicitly AI-screening guidance, not reviewer approval. Do not convert those notes into human decisions.

## 3. Consolidated 109-pair qualified-review packet

The review packet contains 110 pair rows representing 109 distinct pair IDs. The additional row is a second target endpoint under cluster DUP-187, not an accidental duplicate row.

A delegated screening pass has populated the disposition field for all 110 rows:
- **78 D** — duplicate; retain one and hold the other for deduplication.
- **32 S** — distinct or related-skill variant; preserve both.
- **0 Q** — all 18 previously uncertain pair rows have now been screened.

The 20 decisions for DUP-91–99 and DUP-101–111 were explicitly supplied or confirmed by the user. Further exact endpoint matches from the addendum crosswalk resolved 13 Q rows as D and one as S. A full assistant comparison of the remaining 18 pairs resolved 15 as D and three as S. Three cluster anchor directions were reversed to preserve explicit S decisions while still holding the redundant alternatives. These are screening dispositions only, not independent subject-expert approval, answer-key verification, syllabus sign-off, or publication authorization. No reviewer name or review date has been invented. The two independent subject-review worksheets still require academic checks.

## 3a. New addendum disposition ledger

The 6 November addendum contains 34 target records: 17 exact retained/held endpoint pairs already present in the 109-pair register, plus 17 unique additional endpoint pairs. The 17 overlaps were merged into their canonical existing register rows (16 D, one S) and are listed in `2026-11-09-addendum-overlap-crosswalk.csv` to prevent double-counting. The separate addendum ledger now contains only the 17 unique additional pairs: **6 D** and **11 S**. The high-overlap numerical near-duplicate is D because the contextual audit recommends keeping one and holding the other pending Mathematics review. These remain user-delegated assistant screening dispositions only; independent subject, answer-key and syllabus sign-off is pending. No reviewer name/date is invented. The 9 November r1 and r2 provisional staging revisions together apply 53 retained-to-held and 14 held-to-retained moves; no question content was deleted or edited, and nothing was imported or published.

## 4. Cross-window rank reconciliation

- The cross-window candidate set contains 1,304 ranks.
- Persisted tail-review records contain explicit pairwise dispositions for all 1,018 ranks from 287 through 1,304.
- The separate high-similarity shortlist maps 49 ranks by exact source endpoints.
- A new exact endpoint crosswalk maps all **184 existing cross-window duplicate-disposition pairs** to 184 unique candidate ranks: 75 are in ranks 1–286 and 109 are in the 287–1,304 tail. The 49-item high-similarity shortlist overlaps those 184 mappings at 16 ranks; together they identify 108 unique ranks in the 1–286 baseline band, leaving 178 ranks in that band unrepresented by these pair crosswalks. This is an exact endpoint mapping, not proof that all 286 reported baseline reviews were completed.
- The reported 286 baseline reviews are not yet supported by a complete individual rank crosswalk. A prior audit commit assigned ranks 1–286 from score order alone; the subsequent correction explicitly withdrew that inference. Do not treat ranks 1–286 as proven reviewed records.
- The reported 237 additional targeted reviews still lack exact rank IDs.
- The historical cumulative counter 1,007 differs by four from the rank-derived checkpoint 1,003. Other stale register fields conflict (472 vs 237 additional targeted reviews; 685 vs 717 earlier tail rank IDs).
- Final aggregate reviewed/remaining totals remain null/unverified until source-level review records and counter lineage are reconciled.

## 5. Within-window reconciliation

The 38-candidate count difference is explained by comparing two similarity thresholds: 390 candidates at Dice 0.42 versus 352 at Dice 0.43. The 0.42 reconstruction gives a 40/350 same-topic/different-topic split, while the original summary reports 41/349. One category-boundary classification remains unresolved. The old 279-pending figure is not a verified current queue and must not be reused.

## 6. Remaining work — no repeated completed checks

1. The assistant-only technical screen is complete for all 105 worksheet candidates and the 18 previously uncertain duplicate pairs. The remaining academic gate is qualified subject/syllabus sign-off; do not label assistant screening as independent approval or invent reviewer names/dates.
2. Resolve the cross-window baseline source-record-to-rank mapping and the four-count counter discrepancy; reconcile stale register fields without inferring rank IDs from score order.
3. Complete the one-pair within-window category-boundary check; do not rerun the already reconciled 0.42/0.43 threshold comparison.
4. After the remaining academic checks, reconcile the 9 November provisional staging revision and draft replacements only where required; preserve distinct related-skill variants.
5. Run refreshed bank-wide uniqueness and per-subject counts after approved dispositions and replacement drafting.
6. Only after independent academic approval, validate the final 200 publishable questions per subject and prepare an isolated import/test plan.

## Release status

Not academically approved; not ready for production import or publication. Production question bank remains empty per the last verified operational report. No production changes were made.
