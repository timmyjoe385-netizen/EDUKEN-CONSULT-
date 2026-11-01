# EDUKEN CBT question-bank staging — 1 November 2026

## Reconciled count
- 1,600 source question rows across all 40 original batches.
- 47 confirmed duplicate relationships in the controlled disposition register.
- 47 unique duplicate rows held back.
- 1,553 questions provisionally retained.
- Reconciliation: 1,553 + 47 = 1,600.

## Files
- `retained-batches-*.csv`: provisionally retained rows grouped into four 10-batch windows. Each includes original batch and CSV-row provenance, followed by all 18 original question fields.
- `held-duplicates-*.csv`: all held rows, with pair ID and retained/held source locations.
- `manifest.json`: per-batch counts, provenance classification and release gates.

## Important release status
This is a staging export, not approval to publish. The original 40 batch CSVs remain unchanged. The 1,553 retained questions are not yet academically approved or deployment-ready.

The register has 47 confirmed duplicate relationships: 39 classified as prior replacement/review provenance and 8 as original-draft overlap. One retained row is referenced by two relationships in a three-question Government duplicate cluster; the held-location count remains 47.

There are 47 replacement targets. Existing drafts cover 38; 9 additional drafts are still required. Of the existing 38 drafts, 5 are blocked by existing-bank overlap, 7 need subject review, and 26 are only provisionally syllabus-mapped. No replacement draft has been inserted into the original bank.

No Supabase import, publication, PR merge or production deployment is authorised by this staging export.
