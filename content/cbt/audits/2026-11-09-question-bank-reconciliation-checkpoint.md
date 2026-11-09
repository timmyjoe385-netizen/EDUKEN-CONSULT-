# EDUKEN CBT question-bank checkpoint — 9 November 2026

## Scope and safety

Read-only reconciliation of the existing 6 November staging and audit records. This checkpoint does not change original question CSVs, retained/held staging rows, question wording, answer keys, reviewer decisions, database records, or publication state. It does not authorize imports, publication, merge, or production deployment.

## 1. Staging inventory — reconciled by subject

The 6 November staging manifest accounts for all 1,600 source rows: 1,476 provisionally retained + 124 held. A fresh count of the four retained and four held CSV exports gives:

| Subject | Retained (provisional) | Held | Source total |
|---|---:|---:|---:|
| Use of English | 187 | 13 | 200 |
| Mathematics | 190 | 10 | 200 |
| Biology | 179 | 21 | 200 |
| Chemistry | 182 | 18 | 200 |
| Physics | 186 | 14 | 200 |
| Economics | 179 | 21 | 200 |
| Government | 190 | 10 | 200 |
| Literature in English | 183 | 17 | 200 |
| **Total** | **1,476** | **124** | **1,600** |

The subject counts reconcile exactly to 200 original source rows per subject. Retained rows are provisional, not academically approved. Held rows are not all confirmed duplicates; do not replace or discard them until qualified review determines whether each is a true duplicate or a distinct/related-skill variant.

## 2. Independent academic-review queue

The two 6 November subject-review worksheets contain 105 candidate rows in total:
- Baseline independent worksheet: 34 rows.
- Additional independent worksheet: 71 rows.

All 105 rows still have blank review decisions, academic-accuracy checks, answer-key verification, syllabus-fit decisions, reviewer names, and review dates. No independent academic approval is recorded in either worksheet.

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
- **63 D** — duplicate recommended; retain one and hold the other for deduplication.
- **29 S** — distinct or related-skill variant; preserve both.
- **18 Q** — still not conclusively classified; leave pending and do not move or discard.

The 20 decisions for DUP-91–99 and DUP-101–111 were explicitly supplied or confirmed by the user. Further exact endpoint matches from the addendum crosswalk resolved 13 additional Q rows as D and one Q row as S; three other addendum matches confirmed existing D decisions. The remaining 18 Q rows have no clear matching recommendation. These are screening dispositions only, not independent subject-expert approval, answer-key verification, syllabus sign-off, or publication authorization. No reviewer name or review date has been invented. The two independent subject-review worksheets still require academic checks.

## 3a. New addendum disposition ledger

The 6 November addendum contains 34 target records: 17 exact retained/held endpoint pairs already present in the 109-pair register, plus 17 unique additional endpoint pairs. The 17 overlaps were merged into their canonical existing register rows (16 D, one S) and are listed in `2026-11-09-addendum-overlap-crosswalk.csv` to prevent double-counting. The separate addendum ledger now contains only the 17 unique additional pairs: **6 D** and **11 S**. The high-overlap numerical near-duplicate is D because the contextual audit recommends keeping one and holding the other pending Mathematics review. These remain user-delegated assistant screening dispositions only; independent subject, answer-key and syllabus sign-off is pending. No reviewer name/date is invented. No staging row has been moved and no question has been deleted, imported or published.

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

1. Obtain qualified subject reviewers to complete the 105 independent worksheet rows and the 109-pair packet; capture reviewer names, dates, decisions, answer-key checks, syllabus fit, and notes.
2. Resolve the cross-window baseline source-record-to-rank mapping and the four-count counter discrepancy; reconcile stale register fields without inferring rank IDs from score order.
3. Complete the one-pair within-window category-boundary check; do not rerun the already reconciled 0.42/0.43 threshold comparison.
4. After qualified review, move only confirmed duplicates to held staging and draft replacements only where needed; preserve distinct related-skill variants.
5. Run refreshed bank-wide uniqueness and per-subject counts after approved dispositions and replacement drafting.
6. Only after independent academic approval, validate the final 200 publishable questions per subject and prepare an isolated import/test plan.

## Release status

Not academically approved; not ready for production import or publication. Production question bank remains empty per the last verified operational report. No production changes were made.
