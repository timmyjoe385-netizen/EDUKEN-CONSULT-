# EDUKEN CBT — reviewer approval and proposal-version reconciliation follow-up

Date: 20 November 2026  
Branch: `feat/cbt-subject-combination-reconciled`  
Related PR: #194  
Source checkpoint: commit `3ef11a1efd69ea8624a3aef9bf9b2cd8c5ce02e9`

## 1. Scope confirmed

The 20 November owner-reported reviewer register records eight subject submissions, all reported as “Approved all”. It preserves the project owner's explicit confirmation that each reviewer individually checked and approved the replacement questions for their respective subject.

The replacement inventory is two workstreams, not one:
- 116 canonical proposals in `duplicate-replacement-drafts-2026-11-01.json`.
- 31 additional target-specific proposals listed in the 20 November reviewer register.
- Total recorded proposals across these workstreams: 147.
- 14 other uncovered targets are documented as no-new-draft collision outcomes because the retained bank already covers the learning outcomes.

The eight subject-level approval reports are retained as substantive owner-reported approvals. This follow-up does not downgrade them to “no approval”.

## 2. What is and is not version-pinned

The reviewer submissions did not include a complete machine-readable proposal-ID/version list. The repository record therefore cannot yet prove, for every one of the 147 proposals, the exact stem/options/key/explanation version each reviewer saw.

This is a traceability gap, not evidence that the reviewers did not perform the reviews. Do not ask reviewers to repeat blanket approvals. Do not silently transfer an approval to a materially changed version.

The 116 canonical proposal inventory was inspected at the source checkpoint above. The earlier 11 November QA report identified eight construction/wording targets for draft correction. The separate proposed-revisions JSON contains suggested revised versions, but those suggestions are not automatically the canonical inventory and must not be treated as applied without an exact version comparison.

## 3. Rechecked QA flags in the canonical inventory

At the inspected checkpoint, the canonical inventory still contains the following pre-revision versions:

| Proposal | Subject | Current inventory state | Earlier QA finding / required treatment |
|---|---|---|---|
| DUP-87 | Use of English | Original “deliberately gives up” wording remains | Editorial precision suggestion exists; compare the exact reviewer-seen version before treating the suggestion as an applied correction. |
| DUP-78 | Use of English | Original punctuation stem remains | Earlier precision suggestion exists; confirm whether reviewers saw this or the suggested semicolon-specific wording. |
| DUP-228 | Economics | Declarative definition of capital flight | Stem gives away/repeats the answer; proposed direct-question rewrite exists but is not reflected in the canonical inventory snapshot. |
| DUP-109 | Economics | Declarative definition of recession | Stem gives away/repeats the answer; proposed direct-question rewrite exists but is not reflected in the canonical inventory snapshot. |
| DUP-102 | Government | Declarative Commonwealth definition | Stem repeats the answer; proposed direct-question rewrite exists but is not reflected in the canonical inventory snapshot. |
| DUP-221 | Government | Declarative caretaker-government definition | Stem repeats the answer; proposed direct-question rewrite exists but is not reflected in the canonical inventory snapshot. |
| DUP-104 | Government | Declarative electoral-college definition | Stem repeats the answer; proposed direct-question rewrite exists but is not reflected in the canonical inventory snapshot. |
| DUP-123 | Government | Declarative political-ideology definition | Stem repeats the answer; proposed direct-question rewrite exists but is not reflected in the canonical inventory snapshot. |

The proposed revised text for these targets is in `2026-11-11-proposed-replacement-draft-revisions.json`. It remains a proposal set; this audit does not overwrite the canonical drafts or claim that the revised versions were reviewed.

## 4. Literature overlap and other subject-review notes

- DUP-59 and DUP-232 both assess epithet. DUP-59 uses “swift-footed Achilles”; DUP-232 asks for the general definition. The earlier QA report recommends keeping the stronger item or obtaining a clear Literature reviewer disposition that both add distinct value. The 20 November subject-level approval report does not identify which exact version or disposition was applied to this pair.
- DUP-05 (iambic pentameter versus an existing blank-verse item), DUP-55/DUP-56 (cacophony/euphony), DUP-48 (denotation/diction), and DUP-62 (enjambment/caesura) remain contextual Literature review notes from the earlier QA. They are not automatically duplicate verdicts.
- DUP-47 (Government legislative privilege wording), DUP-64 (Chemistry half-life syllabus fit), and DUP-52/DUP-63 (Mathematics syllabus fit) remain subject-specific verification notes. The earlier notes distinguish content plausibility from current JAMB syllabus confirmation.

## 5. Reconciliation disposition

1. Preserve the eight 20 November reviewer submissions as owner-reported, subject-level approvals.
2. Preserve the 116 + 31 = 147 proposal inventory accounting and the 14 no-new-draft collision outcomes.
3. Do not claim that a complete 147-row exact-version crosswalk has been completed; the required item/version evidence is not present in the reviewer submissions currently recorded.
4. Do not treat the eight earlier proposed wording/construction revisions as applied to the canonical inventory. Compare each exact candidate version against the version actually reviewed; only a materially changed version needs renewed review.
5. Resolve the DUP-59/DUP-232 Literature disposition against the version actually reviewed.
6. Keep all imports, publication, approval-metadata writes, production changes, PR merges and deployments outside this audit. No question content, staging row, database record or production resource was changed by this follow-up.

**Status:** Reviewer reports preserved; proposal counts reconciled; exact per-proposal version attribution remains an evidence gap; earlier QA flags are explicitly carried forward for targeted, not blanket, resolution.
