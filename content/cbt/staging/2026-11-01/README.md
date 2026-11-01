# EDUKEN CBT question-bank staging — 1 November 2026

## Current disposition
- 1,600 source question rows across all 40 original batches.
- 90 confirmed duplicate relationships.
- 90 unique duplicate rows held back.
- 1,510 questions provisionally retained.
- Reconciliation: 1,510 + 90 = 1,600.

## Provenance
- 47 duplicate relationships have commit-backed prior-replacement history.
- 14 further pairs contain later replacement-created content confirmed against the original batch snapshots; exact introducing commit SHAs still need normalization.
- 28 are original-draft overlaps.
- One pair (DUP-34) still has unresolved provenance.
- Two three-question clusters have one retained row and two held rows: Government (batch 32 row 34 retained; batches 26 row 34 and 33 row 35 held) and Literature exposition (batch 11 row 37 retained; batches 19 row 38 and 31 row 37 held).

## Files
- `retained-batches-*.csv`: provisionally retained rows grouped into four 10-batch windows. Each includes original batch and CSV-row provenance, followed by all 18 original question fields.
- `held-duplicates-*.csv`: all held rows, with pair ID and retained/held source locations.
- `manifest.json`: per-batch counts, provenance classification and release gates.

## Replacement status
There are 90 confirmed duplicate targets. Existing draft proposals cover 47 targets (DUP-01 to DUP-47). Forty-three newly confirmed targets (DUP-48 to DUP-90) have no replacement draft yet and remain held. Of the existing 47 proposals, 26 are provisionally syllabus-mapped, 16 require subject review, and 5 are blocked by existing-bank overlap. No replacement draft has been inserted into the original bank.

## Semantic-review status
The 1,600-question bank has been screened. All 286 cross-window similarity candidates at or above the 0.65 review threshold have been manually reviewed; 1,018 lower-scoring candidates remain unreviewed. The original within-window report has 279 candidates pending, and its reported count differs from an independently reconstructed candidate set by 38 pairs. Therefore, the semantic audit is not complete.

## Important
This is a staging export, not approval to publish. The original 40 batch CSVs remain unchanged. The 1,510 retained questions are not yet academically approved or deployment-ready. All replacement proposals require validation of syllabus fit, question clarity, options, answer key, explanation and bank-wide uniqueness.

No Supabase import, publication, PR merge or production deployment is authorised by this staging export.
