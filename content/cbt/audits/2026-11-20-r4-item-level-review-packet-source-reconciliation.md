# R4 Item-Level Review Packet — Source Reconciliation

**Date:** 20 November 2026  
**Branch:** `work/cbt-r4-next-replacement-drafts-20261112`  
**Packet:** `2026-11-20-r4-item-level-review-packet-32-candidates.csv`

## Result

The 32 candidate records in the item-level review packet were reconciled against their cited source audit reports and the authoritative 45-target inventory.

- 31 unique provisional draft questions.
- 1 existing DUP-147 burette draft re-screened, counted once.
- 32 candidate records in total.
- 32 exact held-target/candidate mappings.
- 32 reviewer assignments.
- 0 item-level approvals recorded.
- 0 import authorizations.

The question stems, four options, answer keys and explanations were checked against the cited audit drafts. Local `R4Q-` registry aliases identify candidates whose source reports did not supply a formal draft ID; they are not immutable content hashes. The reviewers must still confirm the exact version they inspect.

## Important competing-draft clarification

DUP-108 has multiple proposals in the source history:
- Selected lead: Code of Conduct Tribunal adjudication, from the 11 November first-five draft report.
- Not selected: red-tapism, from the 12 November batch 3 report.
- Not selected: ombudsman/public complaints commission, from the 20 November batches 12–13 report.

The review packet correctly contains the selected Code of Conduct Tribunal question. The later ombudsman report is an alternative proposal, not a correction to the selected lead. This was the apparent discrepancy identified during the first pass.

Other selected alternatives are also traceable to the authoritative inventory:
- DUP-133: public-good characteristics; circular-flow alternative not selected.
- DUP-176: euphemism; epiphany alternative not selected.
- DUP-165: phagocytosis; AB blood-group alternative not selected.
- DUP-169: escape velocity; principle-of-moments alternative not selected.
- DUP-95: average gas-production rate; gamma-radiation alternative not selected.
- DUP-175: amniotic egg adaptation; swim-bladder alternative not selected.
- DUP-41: vestigial structures at held location batch 40, row 13; fossil alternative assigned to DUP-151.

## Source-to-packet coverage

The 32 candidate records map to these audit reports:
- `2026-11-11-r4-first-five-uncovered-replacement-drafts.md`
- `2026-11-12-r4-replacement-draft-batch-2.md`
- `2026-11-12-r4-replacement-draft-batch-3.md`
- `2026-11-12-r4-replacement-draft-batch-4.md`
- `2026-11-13-r4-replacement-draft-batch-6.md`
- `2026-11-20-r4-replacement-draft-batch-7.md`
- `2026-11-20-r4-replacement-draft-batches-8-and-9.md`
- `2026-11-20-r4-replacement-draft-batches-10-and-11.md`
- `2026-11-20-r4-replacement-draft-batches-12-and-13.md`
- `2026-11-20-r4-replacement-draft-batches-14-and-15.md`
- `2026-11-20-r4-replacement-draft-batches-16-and-17.md`
- `2026-11-20-r4-replacement-draft-batches-18-and-19.md`
- `2026-11-20-r4-replacement-draft-batches-20-and-21.md`
- `2026-11-20-r4-replacement-draft-batches-22-and-23.md`
- `2026-11-20-r4-replacement-draft-batches-28-and-29.md`
- `2026-11-20-r4-replacement-draft-batches-30-and-31.md`
- `2026-11-20-r4-replacement-draft-batches-32-and-33.md`
- `2026-11-20-r4-replacement-draft-batches-34-and-35.md`
- `2026-11-20-r4-replacement-draft-batches-36-and-37.md`
- `2026-11-20-r4-replacement-draft-batches-38-and-39.md`
- `2026-11-20-r4-replacement-draft-batches-40-and-41.md`
- `2026-11-20-r4-replacement-draft-batches-44-and-45.md`

Some queue reports contain held/rejected candidates rather than a retained replacement; those held locations are not included as approved questions. The authoritative inventory remains the routing source for the 32 candidate-bearing targets.

## Manual action required

The assigned reviewers must now inspect each candidate individually and return:
- exact candidate ID and reviewed version;
- APPROVED, APPROVED WITH REQUIRED EDITS, REJECTED or HOLD;
- any exact correction or reason;
- reviewer name and review date.

A subject-level “approved all” decision is not a substitute for these item-level decisions.

## Release boundary

This reconciliation is documentation-only. It does not approve any candidate, change the canonical 116-proposal inventory, modify R4 question CSVs, write to a database, import or publish questions, merge a pull request, deploy a Worker or change production.
