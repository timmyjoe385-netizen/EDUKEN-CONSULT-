# EDUKEN CBT — Order 1 independent-review handoff index
**Date:** 2026-11-02  
**Branch:** `feat/cbt-subject-combination-reconciled`  
**Purpose:** route all 90 replacement proposals to qualified subject reviewers. This index is administrative only; it does not approve, reject, import or publish questions.

## Authoritative checkpoint
Use the latest checkpoint file `order-1-final-assistant-review-checkpoint-2026-11-02.md` on this branch as the authoritative status record. The 2026-11-02 checkpoint currently records the 90/90 assistant review totals below; this handoff is a routing aid, not a replacement for the checkpoint.

- Replacement drafts: 90/90.
- Assistant full-bank comparisons: 90/90.
- Assistant preliminary answer/explanation checks: 90/90.
- Assistant contextual reassessment of current lexical flags: 11/11.
- Provenance joins: 90/90.
- Syllabus mapping: 57 provisionally aligned; 33 require qualified subject review.
- Explicit syllabus-scope/depth holds: 14.
- Independent qualified academic approvals: 0/90.
- Source CSV insertions / production imports / publication: 0.

The older overall-status paragraph in `replacement-review-packet-2026-11-02.md` contains superseded counts (25/65 and 12 lexical flags). Do not use those headline counts. The latest checkpoint above supersedes them. Historical pair notes remain useful evidence but are not independent approvals.

## Subject routing index
Every ID below requires independent review of the question, answer key, explanation, distractors, syllabus fit/depth and contextual uniqueness against the full same-subject bank. The 33 syllabus-review cases and 14 explicit holds are included in these subject queues; do not treat a provisionally aligned mapping as academic approval.

| Subject | Count | Replacement IDs |
|---|---:|---|
| Biology | 17 | DUP-04, DUP-06, DUP-14, DUP-17, DUP-22, DUP-24, DUP-38, DUP-41, DUP-50, DUP-58, DUP-60, DUP-61, DUP-65, DUP-70, DUP-73, DUP-74, DUP-84 |
| Chemistry | 13 | DUP-02, DUP-08, DUP-09, DUP-13, DUP-16, DUP-39, DUP-40, DUP-46, DUP-53, DUP-64, DUP-67, DUP-86, DUP-90 |
| Economics | 16 | DUP-10, DUP-12, DUP-15, DUP-19, DUP-20, DUP-23, DUP-25, DUP-42, DUP-45, DUP-49, DUP-54, DUP-75, DUP-76, DUP-80, DUP-82, DUP-88 |
| Government | 5 | DUP-28, DUP-36, DUP-37, DUP-47, DUP-77 |
| Literature in English | 12 | DUP-05, DUP-21, DUP-32, DUP-35, DUP-48, DUP-55, DUP-56, DUP-59, DUP-62, DUP-69, DUP-83, DUP-85 |
| Mathematics | 5 | DUP-01, DUP-27, DUP-43, DUP-52, DUP-63 |
| Physics | 11 | DUP-03, DUP-07, DUP-11, DUP-18, DUP-26, DUP-31, DUP-44, DUP-51, DUP-66, DUP-71, DUP-81 |
| Use of English | 11 | DUP-29, DUP-30, DUP-33, DUP-34, DUP-57, DUP-68, DUP-72, DUP-78, DUP-79, DUP-87, DUP-89 |
| **Total** | **90** | |

## Subject-specific review worksheets

Each worksheet contains the actual replacement questions for that subject, the existing assistant review evidence, and a consolidated reviewer sign-off table. These are blank review forms, not approvals.

- [Biology — 17 candidates](reviewer-worksheets-2026-11-02/biology-independent-review.md)
- [Chemistry — 13 candidates](reviewer-worksheets-2026-11-02/chemistry-independent-review.md)
- [Economics — 16 candidates](reviewer-worksheets-2026-11-02/economics-independent-review.md)
- [Government — 5 candidates](reviewer-worksheets-2026-11-02/government-independent-review.md)
- [Literature in English — 12 candidates](reviewer-worksheets-2026-11-02/literature-in-english-independent-review.md)
- [Mathematics — 5 candidates](reviewer-worksheets-2026-11-02/mathematics-independent-review.md)
- [Physics — 11 candidates](reviewer-worksheets-2026-11-02/physics-independent-review.md)
- [Use of English — 11 candidates](reviewer-worksheets-2026-11-02/use-of-english-independent-review.md)

## Explicit syllabus-scope/depth holds
These 14 require an explicit written decision on whether the tested detail is within JAMB syllabus scope and at appropriate depth:

- Biology: DUP-06, DUP-38
- Chemistry: DUP-39, DUP-40
- Economics: DUP-15, DUP-19, DUP-23, DUP-25, DUP-45
- Government: DUP-37, DUP-47
- Literature in English: DUP-35, DUP-48
- Mathematics: DUP-43

## Current lexical flags requiring independent contextual decisions
The latest checkpoint records **11/11** current lexical flags as having received assistant contextual reassessment. The exact current flag IDs must be taken from the latest screening artifact on this branch, not from older historical triage lists embedded in the review packet or earlier PR descriptions. Confirm the current screening artifact and include every flagged candidate in the independent subject review; do not treat assistant reassessment as human clearance.

A flag is not automatically a duplicate. The reviewer must compare the learning outcome and concept against the closest retained and held items and record why the item is distinct or overlapping.

## Required reviewer record — one record per DUP ID
For each candidate, record:

1. Reviewer name and relevant subject qualification/experience.
2. Review date.
3. Decision: **Approve / Revise / Reject**.
4. Correct answer and explanation check.
5. Distractor quality and whether exactly one answer is defensible.
6. Exact JAMB syllabus topic/subtopic and a short scope/depth rationale.
7. Closest existing-bank match and a short semantic comparison.
8. Concise rationale and any required correction.

A **Revise** or **Reject** decision keeps the item out of the import set. An approval is valid only when attributable to an independent qualified reviewer. Assistant checks, lexical scores and provisional syllabus mappings do not count as approvals.

## Source packet
The full question text, options, draft keys, explanations, syllabus mappings and existing assistant review notes remain in:

`content/cbt/audits/replacement-review-packet-2026-11-02.md`

Reviewers should use that packet alongside the actual retained-plus-held subject bank and the official JAMB syllabus. This index is not a substitute for those source materials.

## Release restriction
Do not modify original source CSVs, generate a production import, import into Supabase, publish to the student feed, merge PR #194 or deploy to production until all required independent reviews are recorded and the user gives the final controlled replacement approval. Authenticated admin import/review/publish testing and release regression checks remain separate later gates.
