# EDUKEN JAMB CBT — Item-Level Review Packet (32 Candidate Records)

**Date:** 20 November 2026  
**Branch:** `work/cbt-r4-next-replacement-drafts-20261112`  
**Source inventory:** `content/cbt/audits/2026-11-20-r4-authoritative-45-target-candidate-inventory.csv`  
**Purpose:** Human academic review of candidate replacements for the 45 held source locations.

## How to use this packet

- This packet contains **32 candidate records: 31 unique draft questions plus one previously recorded burette draft re-screened at DUP-147**. DUP-147 is not a new draft and must be counted once.
- Each record preserves the exact held target, source location, assigned subject reviewer, candidate ID/registry alias, full stem, all four options, answer key, explanation and source audit report.
- The named reviewer is the assigned subject-level reviewer. Their earlier subject-bank approval is **not** an item-level approval of any replacement.
- The `R4Q-` identifiers are local registry aliases where the source report did not provide a formal draft ID. They are not content hashes.
- The original audit report is the review source of truth for each proposed wording. The reviewer must compare the packet with that report and confirm the exact version before signing.
- Record one item-level decision per candidate: `APPROVED`, `APPROVED WITH REQUIRED EDITS`, `REJECTED` or `HOLD`. Include the date and reasons/edits.

## Required checks for every candidate

1. Exact held location and candidate ID are correct.
2. Stem and all four options match the cited audit report.
3. Answer key is correct and only one option is defensible.
4. Explanation is accurate and supports the keyed answer.
5. Current UTME/JAMB syllabus fit is confirmed for the precise topic and level.
6. The candidate does not duplicate an existing question or learning outcome in the subject bank.
7. Any caution in the source report is explicitly considered. In particular:
   - DUP-106: distinguish selective reabsorption in the proximal convoluted tubule from glomerular ultrafiltration.
   - DUP-226: distinguish homologous-chromosome separation in meiosis I from sister-chromatid separation in mitosis.
   - DUP-97: distinguish acid basicity from acid strength.
   - DUP-41: this held target is batch 40, row 13; do not confuse it with the separate canonical DUP-41 at batch 19, row 16.
   - DUP-175: preserve the qualification “many reptiles”; some reptiles are viviparous.
   - DUP-147: this is the existing burette draft re-screened, not a new candidate version.

## CSV companion

The complete machine-readable review worksheet is in:
`2026-11-20-r4-item-level-review-packet-32-candidates.csv`

It includes reviewer assignment and blank decision fields. No reviewer decision has been prefilled.

## Current disposition

- 31 unique draft candidates plus one re-screened candidate: review pending.
- 13 held source locations still have no retained replacement candidate.
- Item-level approvals created by this packet: **0**.
- Import eligibility granted: **0**.
- Production changes: **0**.
- Database writes, imports, publication, merge or deployment: **0**.

This is a review-preparation artifact only. It does not approve, import or publish any question.


## 8. Post-review update — 20 November 2026

The project owner subsequently confirmed that each assigned subject reviewer approved every replacement individually for their respective subject. The seven subject-specific reviewer CSVs and the authoritative 45-target candidate inventory have now been updated to record **32 item-level APPROVED decisions**:
- Biology: 12
- Chemistry: 4
- Economics: 4
- Government: 5
- Literature in English: 4
- Physics: 2
- Use of English: 1

All 32 reviewer-sheet candidate IDs match the authoritative inventory's preferred candidate IDs and exact held locations. Their stems and four options were reconciled against the cited source audit reports. This corrects the earlier review-preparation status above; the prior statement of zero item-level approvals described the packet before the project owner's subsequent confirmation.

The approval record is owner-reported; reviewers did not submit signed forms directly through this workflow. Immutable candidate-content hashes have not yet been separately captured. Therefore, the exact-version-hash field remains pending and **import eligibility remains NO for all 32**.

The 13 targets with no retained candidate remain held. No source question bank, database, import, publication, merge, or production deployment was changed. See `2026-11-20-r4-item-level-approval-reconciliation.md` for the full register and remaining release gates.


## 6. Version pinning update — 20 November 2026

The approved content for all 32 candidate records has now been pinned with a SHA-256 digest. Each digest is calculated from the UTF-8 JSON representation of this ordered field set: held target, subject, exact held source location, candidate ID, question stem, options A–D, answer key, and answer explanation. The same digest is recorded in the master 32-candidate packet, all seven subject worksheets, and the authoritative 45-target inventory.

The exact-version-hash gate is now closed for these 32 records. **Import eligibility remains NO** pending final staging/import-schema validation, preservation of the 13 held locations, and explicit project-owner authorization for the specific staging import. No database or production action has been taken.
