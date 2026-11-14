# 2026-11-11 Replacement Inventory Coverage Reconciliation

## Purpose
This note corrects an easy-to-make counting error when comparing the replacement-draft inventory with the duplicate-disposition register. It is an audit-only artifact. It does not modify question content, canonical source CSVs, staging manifests, import records, or publication state.

## Files compared
- `content/cbt/audits/duplicate-disposition-register-2026-11-01.json`
- `content/cbt/audits/duplicate-replacement-drafts-2026-11-01.json`
- R4 staging held-row CSVs under `content/cbt/staging/2026-11-10-r4/`

## Verified counts
- The replacement-draft JSON contains 116 items and 116 distinct `target_id` values.
- The register contains 199 pair/relationship records.
- The register has 90 records whose decision is exactly `confirmed_semantic_duplicate`; these are the original confirmed-pair group.
- A further 109 records use other decision values, including contextual-review confirmations, cluster extensions, and related-skill variants. These records must not be added to the original 90 as though every record were a separate unique replacement row.
- Among those 109 later relationship records, 70 have `new_unique_targets_added > 0`; their counter values sum to 71. The counter sum is a relationship-level tally, not a verified count of distinct held source rows.
- Eight of those 70 relationship IDs have an exact matching proposal ID in the 116-item draft inventory. This exact-ID test is deliberately conservative: it does not prove that a proposal with another ID cannot cover the same held row or learning outcome.
- Several relationship records explicitly say that a target is already part of an existing cluster or that no new unique target was added. These must not generate additional replacement drafts.

## Important interpretation
The current 116-item draft inventory is not equivalent to a verified 116-row coverage of all held rows. Conversely, comparing proposal IDs alone and declaring every unmatched relationship a missing draft would overcount, because cluster relationships can point to the same held row or to rows already covered by another proposal.

The previously quoted “55 confirmed-duplicate targets still need drafts” figure is not revalidated by this exact-ID comparison. It must remain a historical checkpoint figure until a row-location-to-proposal crosswalk is rebuilt against all 1,600 source rows and all R4 held rows.

## Required next reconciliation
Build a location-level crosswalk with one row per unique held source location, including:
1. held batch and row;
2. subject and full source question;
3. canonical duplicate-cluster ID;
4. all register relationship IDs connected to that row;
5. all replacement proposal IDs that claim to cover it;
6. exact proposal question, options, key and explanation;
7. bank-wide duplicate-screen evidence and threshold;
8. independent subject-review disposition and reviewer evidence.

Only this location-level crosswalk can establish the true number of unique held rows that still lack a suitable, bank-screened replacement.

## Release and safety status
- No source question was changed.
- No R4 staging CSV was changed.
- No replacement was imported.
- No question was published.
- No production deployment or merge is authorized by this audit.
- All draft content remains subject to qualified independent subject and syllabus review. Assistant-level review is not a substitute.
