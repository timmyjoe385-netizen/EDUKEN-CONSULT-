# EDUKEN CBT question-bank staging — 1 November 2026

## Current disposition
- 1,600 source question rows across all 40 original batches.
- 90 confirmed duplicate relationships.
- 90 unique duplicate rows held back.
- 1,510 questions provisionally retained.
- Reconciliation: 1,510 + 90 = 1,600.

## Provenance
- 48 duplicate relationships have commit-backed prior-replacement history.
- 13 further pairs contain later replacement-created content confirmed against the original batch snapshots; exact introducing commit SHAs still need normalization.
- 28 are original-draft overlaps.
- One pair (DUP-34) still has unresolved provenance.
- Two three-question clusters have one retained row and two held rows: Government (batch 32 row 34 retained; batches 26 row 34 and 33 row 35 held) and Literature exposition (batch 11 row 37 retained; batches 19 row 38 and 31 row 37 held).

## Files
- `retained-batches-*.csv`: provisionally retained rows grouped into four 10-batch windows. Each includes original batch and CSV-row provenance, followed by all 18 original question fields.
- `held-duplicates-*.csv`: all held rows, with pair ID and retained/held source locations.
- `manifest.json`: per-batch counts, provenance classification and release gates.
- `../audits/replacement-draft-bankwide-screen-2026-11-01-v2.json`: version 10 lexical screen of all 63 replacement proposals against all 1,600 staged source rows. Lexical flags are review prompts, not duplicate verdicts or academic approval.
- `../audits/replacement-draft-subject-review-2026-11-01.json`: preliminary answer/concept checks for DUP-48 through DUP-63; not independent subject-expert approval.

## Replacement status
There are 90 confirmed duplicate targets. Separate draft proposals now cover 63 targets; 27 targets (DUP-64 to DUP-90) still need drafts. Five proposals remain blocked because they overlap existing bank questions. The other 58 proposals are not cleared for insertion. Sixteen recent proposals (DUP-48 to DUP-63) have preliminary AI-assisted answer/concept checks recorded, but independent subject review and contextual bank-wide clearance remain outstanding.

The version 10 lexical screen covers all 63 proposals against all 1,600 staged rows. Sixteen proposals meet or exceed the 0.42 review threshold; these are similarity prompts, not confirmed duplicates. Recent proposals include DUP-60 (Organ of Corti/hearing), DUP-61 (shoot phototropism), DUP-62 (enjambment) and DUP-63 (map-scale conversion). DUP-62's closest lexical match is a caesura definition (a distinct but related poetic technique); independent Literature review is required. DUP-63's syllabus coverage for map scales must be confirmed.

## Source-row indexing check
Register locations use physical CSV row numbers, including the header row. DUP-60 (batch 7 row 15; batch 16 row 15) and DUP-61 (batch 6 row 13; batch 28 row 16) were checked at those exact physical rows and match the staging holdout records. The original source CSVs remain unchanged.

## Semantic-review status
- Within-window reconstruction: 390 candidate pairs at the reproduced 0.42 threshold; all 390 have explicit review statuses. This includes 350 different-topic/subtopic candidates contextually reviewed and 40 same-topic/subtopic candidates carried forward as previously reviewed.
- The original within-window report states a 41/349 category split, while reconstruction gives 40/350. The total of 390 is reproduced at 0.42, not the method text's stated 0.43. A one-pair category-boundary discrepancy remains documented; no reconstructed candidate remains unreviewed.
- Cross-window screening: 1,304 candidates; all 286 scoring at or above 0.65 were manually reviewed. The 1,018 lower-scoring candidates were not manually reviewed because they fall below the review threshold.
- Similarity candidates are not duplicates by themselves. Confirmed duplicate decisions are recorded separately in the 90-pair disposition register.

## Important
This is a staging export, not approval to publish. The original 40 batch CSVs have not been modified. The 1,510 retained questions are not yet academically approved or deployment-ready. All replacement proposals require validation of syllabus fit, question clarity, options, answer key, explanation and bank-wide uniqueness.

No Supabase import, publication, PR merge or production deployment is authorised by this staging export.
