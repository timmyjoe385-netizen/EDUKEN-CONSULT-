# EDUKEN CBT question-bank staging — 1 November 2026

This folder contains a non-destructive staging export of the existing 1,600-question bank.

## Result
- 1,600 source question rows accounted for across 40 batches.
- 1,562 rows provisionally retained.
- 38 designated duplicate rows held back (one per confirmed duplicate pair).
- Reconciliation: 1,562 + 38 = 1,600.

## Files
- `retained-batches-*.csv`: provisionally retained questions, grouped by original 10-batch windows. The original 18 columns are preserved after two source-location columns.
- `held-duplicates-*.csv`: the 38 held rows, with duplicate-pair ID and both retained/held source locations.
- `manifest.json`: per-batch counts and release limitations.

## Important
This is staging, not publication approval. The original 40 source CSV files are unchanged. The retained 1,562 are not yet academically approved or deployment-ready. They still require subject review for accuracy, answer keys, explanations, clarity and syllabus coverage. The 38 replacement drafts are not ready for insertion: 26 are provisionally mapped, 7 require subject review, and 5 overlap with existing bank content. No Supabase import, publication, PR merge or production deployment is authorised by these files.
