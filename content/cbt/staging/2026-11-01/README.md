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
- `../audits/replacement-draft-bankwide-screen-2026-11-01-v2.json`: refreshed character-trigram screen of all 59 replacement proposals against all 1,600 original source rows, including retained and held rows. Lexical flags are review prompts, not duplicate verdicts or academic approval.

## Replacement status
There are 90 confirmed duplicate targets. Existing draft proposals now cover 59 targets, including DUP-48 through DUP-59. Thirty-one targets (DUP-60 to DUP-90) still have no replacement draft and remain held. DUP-50 was revised away from ABO inheritance after a related existing bank item was identified. A refreshed lexical screen now covers all 59 proposals against all 1,600 source rows; lexical flags still require contextual review and are not duplicate verdicts. Across the 59 proposals, 26 are provisionally syllabus-mapped, 16 require subject review, and 5 are blocked by existing-bank overlap; 12 recent proposals (DUP-48 to DUP-57) have preliminary AI-assisted answer/concept checks recorded, but independent subject review and contextual bank-wide clearance remain outstanding. No replacement draft has been inserted into the original bank.

## Semantic-review status
- Within-window reconstruction: 390 candidate pairs at the reproduced 0.42 threshold; all 390 have explicit review statuses. This includes 350 different-topic/subtopic candidates contextually reviewed and 40 same-topic/subtopic candidates carried forward as previously reviewed.
- The original within-window report states a 41/349 category split, while reconstruction gives 40/350. The total of 390 is reproduced at 0.42, not the method text's stated 0.43. A one-pair category-boundary discrepancy remains documented; no reconstructed candidate remains unreviewed.
- Cross-window screening: 1,304 candidates; all 286 scoring at or above 0.65 were manually reviewed. The 1,018 lower-scoring candidates were not manually reviewed because they fall below the review threshold.
- Similarity candidates are not duplicates by themselves. Confirmed duplicate decisions are recorded separately in the 90-pair disposition register.

## Important
This is a staging export, not approval to publish. The original 40 batch CSVs remain unchanged. The 1,510 retained questions are not yet academically approved or deployment-ready. All replacement proposals require validation of syllabus fit, question clarity, options, answer key, explanation and bank-wide uniqueness.

No Supabase import, publication, PR merge or production deployment is authorised by this staging export.
