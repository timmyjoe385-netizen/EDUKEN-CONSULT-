# EDUKEN CBT — Owner-reported subject reviewer register
Date recorded: 20 November 2026
Branch: `feat/cbt-subject-combination-reconciled`
PR: #194
Evidence type: project-owner report of reviewer submissions in the project conversation

## 1. Reviewer submissions recorded

The project owner supplied eight subject-review submissions on 20 November 2026 and confirmed that each reviewer individually checked and approved the replacement questions for their respective subject. The reported outcome is 8/8 subject submissions received, with all recorded as “Approved all”.

| Subject | Reviewer | Qualification/role supplied | Reported decision | Review date |
|---|---|---|---|---|
| Use of English | Alade Tobi | Lecturer | Approved all | 20 November 2026 |
| Mathematics | James Oreofeoluwa | 400 Level | Approved all | 20 November 2026 |
| Biology | Samuel Elijah | 400 Level | Approved all | 20 November 2026 |
| Physics | Precious | 400 Level | Approved all | 20 November 2026 |
| Chemistry | Adeleke Emmanuel | Not supplied | Approved all | 20 November 2026 |
| Economics | James Ademola | 400 Level | Approved all | 20 November 2026 |
| Government | John Damilola | Not supplied | Approved all | 20 November 2026 |
| Literature in English | James | Not supplied | Approved all | 20 November 2026 |

This register preserves the project owner's explicit report that reviewers individually approved the replacement questions in their respective subjects. It supersedes older checkpoint wording that said no reviewer approval had been reported for these subject submissions.

## 2. Scope and version reconciliation

The canonical replacement inventory previously reconciled on this branch contains 116 proposal IDs, distributed as follows:

| Subject | Canonical proposal count |
|---|---:|
| Mathematics | 7 |
| Chemistry | 17 |
| Physics | 12 |
| Biology | 18 |
| Literature in English | 14 |
| Economics | 20 |
| Government | 14 |
| Use of English | 14 |
| **Total** | **116** |

Separate R4 uncovered-target execution batches subsequently added target-specific proposals beyond that 116-item canonical inventory. The 19 November branch reconciliation records **31/45** target-specific proposals in the uncovered queue, including 12 later additions. These 31 targets are distinct from the 116-item canonical inventory in the earlier location-based reconciliation; together, the current branch records **147 replacement proposals** across those two workstreams.

The 31 target-specific queue proposal IDs recorded across the 19-proposal checkpoint and later batches are:
DUP-108, DUP-133, DUP-176, DUP-165, DUP-169, DUP-128, DUP-96, DUP-151, DUP-110, DUP-116, DUP-125, DUP-225, DUP-134, DUP-226, DUP-97, DUP-111, DUP-41, DUP-175, DUP-118, DUP-99, DUP-171, DUP-132, DUP-194, DUP-147, DUP-215, DUP-224, DUP-179, DUP-180, DUP-117, DUP-233, and DUP-112.

The project owner reports that the eight reviewers individually approved every replacement proposal in their respective subjects. This register therefore preserves the reported approval as applying to the replacement workstreams, including the 116 canonical proposals and 31 additional target-specific proposals. The 14 remaining uncovered targets are separately documented as no-new-draft collision outcomes; no replacement question was created for them merely to increase coverage.

Accordingly:
- The project owner's report of individual subject-level approvals is preserved as a substantive reviewer outcome, not downgraded to “no approval”.
- The 116 canonical proposal counts and 31 additional target-specific IDs above are known inventory baselines; the eight submissions did not include a complete machine-readable ID/version list.
- The reviewer submissions are subject-level reports of individual review, but the conversation records do not include a complete signed, question-ID-and-version crosswalk tying each reviewer decision to every canonical and supplemental draft version.
- The repository does not contain reviewer signatures, full qualification evidence, dated item-level worksheets, or a complete proposal-ID/version-to-reviewer crosswalk in this record.
- Any item revised after its reviewer checked it must be re-presented for approval; an earlier approval must not silently transfer to a materially changed version.

## 3. Separate technical and content gates

The reviewer reports do not by themselves resolve the separate question-bank provenance and duplicate/rank reconciliation work:
- R4 source bank: 1,600 rows, comprising 1,439 provisionally retained and 161 held; 200 source rows per subject.
- Retained means structurally provisionally retained, not automatically approved for publication.
- The 19 November branch reconciliation reports 31/45 target-specific replacement proposals in the uncovered queue; the other 14 are documented as no-new-draft collision outcomes, not a requirement to manufacture paraphrases.
- The baseline cross-window rank evidence still has unresolved exact-ID and counter discrepancies documented in the 18 November reconciliation. Reviewer approval of replacement drafts does not repair missing historical rank evidence.
- The assistant's earlier content QA flags and proposed revisions must be checked against the exact versions reviewed. In particular, a proposal changed after review requires renewed subject review.

## 4. Release boundary

This is an audit/provenance record only. It does not:
- change source CSVs or R4 staging rows;
- import or publish any question;
- change reviewer/approval metadata in Supabase;
- merge PR #194 or PR #207;
- deploy either Worker or change production configuration.

**Disposition:** Eight subject reviewer submissions are reported by the project owner as received and all approved on 20 November 2026. Preserve that reported approval. Complete the exact proposal-ID/version crosswalk and separately close provenance/reconciliation, technical acceptance and release authorization gates before any question publication or production release.
