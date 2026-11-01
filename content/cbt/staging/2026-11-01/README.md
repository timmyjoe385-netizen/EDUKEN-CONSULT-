# EDUKEN CBT question-bank staging — 1 November 2026

## Reconciled count
- 1,600 source question rows across all 40 original batches.
- 47 confirmed duplicate relationships.
- 47 unique duplicate rows held back.
- 1,553 questions provisionally retained.
- Reconciliation: 1,553 + 47 = 1,600.

## Files
- `retained-batches-*.csv`: provisionally retained rows grouped into four 10-batch windows. Each includes original batch and CSV-row provenance, followed by all 18 original question fields.
- `held-duplicates-*.csv`: all held rows, with pair ID and retained/held source locations.
- `manifest.json`: per-batch counts, provenance classification and release gates.

## Replacement status
All 47 held targets now have draft proposals. The 38 earlier proposals remain as recorded; nine new proposals (DUP-39 to DUP-47) have been added. The nine new drafts were selected after checking the retained bank for obvious term/topic collisions, but they still require contextual review and subject-expert validation.

Current mapping: 26 provisionally syllabus-mapped, 16 requiring subject review, and 5 blocked by existing-bank overlap. No replacement draft has been inserted into the original question bank.

## Important
This is a staging export, not approval to publish. The original 40 batch CSVs remain unchanged. The 1,553 retained questions are not yet academically approved or deployment-ready. All replacement proposals require validation of syllabus fit, question clarity, options, answer key, explanation and bank-wide uniqueness.

No Supabase import, publication, PR merge or production deployment is authorised by this staging export.
