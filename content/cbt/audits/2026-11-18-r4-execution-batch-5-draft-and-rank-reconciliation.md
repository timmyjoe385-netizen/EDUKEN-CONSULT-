# R4 Execution Batch 5 — Replacement Draft and Rank Reconciliation

Date: 18 November 2026
Branch: feat/cbt-subject-combination-reconciled

## New draft proposal

**Held target:** DUP-147 — batch 34 row 18 (Chemistry)  
**Held concept:** Acid-base indicators  
**Draft topic:** Acids and bases / Acid-base titration  
**Subtopic:** Equivalence point  
**Difficulty:** Medium

**Question:** During an acid-base titration, the equivalence point is reached when the acid and base have reacted in:

A. the exact stoichiometric proportions shown by the balanced equation.  
B. equal volumes, regardless of their concentrations.  
C. the same physical state.  
D. a ratio determined only by the colour of the indicator.

**Correct answer:** A

**Explanation:** At the equivalence point, the acid and base have reacted in the mole ratio given by the balanced chemical equation. An indicator's colour change is used to estimate the endpoint, which should be close to the equivalence point.

**Screening results:**
- Same-subject R4 source bank: all 200 Chemistry rows checked; highest padded character-trigram Dice score **0.3571** (batch 19 row 19, dynamic chemical equilibrium).
- Canonical replacement inventory: all **116** proposals checked; highest score **0.3011** (DUP-02, salt bridge).
- Earlier supplemental draft reports: **28 stem-like lines** extracted from the 10 previously documented supplemental draft reports; highest stem-only score **0.2587**. No earlier supplemental draft report contained the terms “equivalence point” or “acid-base titration”.
- All reported maxima are below the 0.42 lexical screening threshold.

The closest source-bank question concerns equal forward and reverse reaction rates at dynamic equilibrium, not the stoichiometric completion of an acid-base titration. The candidate therefore appears lexically distinct. This screen does not prove semantic uniqueness, factual correctness or syllabus fit. A qualified Chemistry reviewer must verify the titration terminology, distinction between equivalence point and indicator endpoint, answer key, distractors and current UTME syllabus alignment.

**Status:** Assistant-authored draft only. Not added to the canonical 116-item inventory; not independently approved, imported or published.

## Rank reconciliation — verified evidence

The 9 November endpoint-to-rank crosswalk records 184 existing cross-window disposition pairs matched uniquely to candidate ranks and 49 high-similarity shortlist pairs matched uniquely. Sixteen ranks overlap between those sets, leaving 217 combined unique mapped ranks. Of these, 108 lie in the 1–286 score-threshold band; **178 ranks in that band are not represented by those pair crosswalks**.

The 8 November corrected baseline crosswalk explicitly withdraws the earlier inference that ranks 1–286 were all individually reviewed. The 286 figure is the number of candidates meeting the score cutoff, not itemized proof of completed reviews. The reported additional 237 targeted reviews also lack an exact source-record-to-rank list. The 1,007 versus 1,003 cumulative-count discrepancy and the historical 472/237 and 685/717 conflicts remain unresolved. No missing rank IDs have been inferred.

## Cumulative replacement coverage

- Previously documented uncovered-target drafts: 23 of 45.
- New draft in this batch: 1.
- Documented draft coverage after this batch: **24 of 45**.
- Remaining uncovered targets without a documented draft: **21**.
- Qualified independent approvals created: 0.

## Safeguards

- R4 source CSVs and staging rows changed: 0.
- Canonical 116-item proposal inventory changed: 0.
- Question imports or status transitions: 0.
- Publications: 0.
- Production database or Worker changes: 0.
- PR merge or production deployment: 0.

## Evidence files

- `content/cbt/staging/2026-11-10-r4/retained-batches-01-10.csv`
- `content/cbt/staging/2026-11-10-r4/retained-batches-11-20.csv`
- `content/cbt/staging/2026-11-10-r4/retained-batches-21-30.csv`
- `content/cbt/staging/2026-11-10-r4/retained-batches-31-40.csv`
- `content/cbt/staging/2026-11-10-r4/held-duplicates-01-10.csv`
- `content/cbt/staging/2026-11-10-r4/held-duplicates-11-20.csv`
- `content/cbt/staging/2026-11-10-r4/held-duplicates-21-30.csv`
- `content/cbt/staging/2026-11-10-r4/held-duplicates-31-40.csv`
- `content/cbt/audits/duplicate-replacement-drafts-2026-11-01.json`
- `content/cbt/audits/2026-11-08-cross-window-baseline-rank-crosswalk-r2.json`
- `content/cbt/audits/2026-11-09-cross-window-register-rank-crosswalk.json`
