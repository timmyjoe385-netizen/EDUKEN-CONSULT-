# R4 Uncovered Queue Reconciliation — 14 November 2026

**Branch:** `feat/cbt-subject-combination-reconciled`  
**Pull request:** #194 (draft; open; unmerged)  
**Scope:** Documentation and audit reconciliation only.

## Verified source state

- The R4 queue dated 11 November lists 45 uncovered held locations.
- The canonical replacement inventory contains 116 items, 116 unique `target_id` values, and reports `drafts_missing: 0` for its own earlier confirmed-target register.
- Comparing the queue's 45 target IDs literally with the canonical inventory's 116 `target_id` values finds only one exact ID overlap (`DUP-41`). This demonstrates that the canonical inventory's zero-missing count does **not** close the separate R4 queue; the two registers use different target populations/identifiers.
- The 14 November supplement contains two candidate drafts for queue targets `DUP-128` and `DUP-96`. They are separate from, and have not been merged into, the canonical inventory.
- The remaining 43 queue targets have no candidate proposal evidenced by the two source files reconciled here. This count is not a claim that no proposal exists elsewhere; it is limited to these registers and must be checked against any other supplements before release.

## Corrected progress accounting

| Measure | Verified result |
|---|---:|
| R4 uncovered queue targets | 45 |
| Exact target IDs found in canonical 116-item inventory | 1 |
| Separate queue-target drafts in 14 Nov supplement | 2 |
| Queue targets evidenced as drafted by the reconciled sources | 2 |
| Queue targets not evidenced as drafted by these sources | 43 |
| Qualified independent academic approvals | 0 evidenced |

The earlier informal progress statement that counted five older draft candidates plus two new drafts as 7/45 is **not supported by exact target-ID reconciliation** and must not be used as a release metric. Do not infer that an older draft covers a queue target without a verified mapping to its exact held location.

## Required next reconciliation

1. Search every R4 supplement and review note for an exact held-location mapping to each of the 45 queue entries.
2. Record candidate ID, held batch/row, subject, and source document for every verified match.
3. Screen genuinely uncovered targets against the complete same-subject bank and all applicable proposals; retain the existing 0.42 screening threshold.
4. Keep all candidates draft-only until a qualified independent subject reviewer records identity, qualification, date, and item-level decision.
5. Do not import, approve, publish, merge, deploy, or change production as part of this audit.

## Safety record

No source CSV, canonical inventory, database, application code, production resource, or question publication was changed by this reconciliation. This document is an audit note only.
