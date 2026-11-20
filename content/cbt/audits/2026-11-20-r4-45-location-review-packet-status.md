# R4 45-Location Replacement Review Packet — Status and Release Gates

**Date:** 20 November 2026  
**Branch:** `work/cbt-r4-next-replacement-drafts-20261112`  
**Primary worksheet:** `content/cbt/audits/2026-11-20-r4-45-location-review-signoff-matrix.csv`  
**Source queue:** `content/cbt/audits/2026-11-11-r4-45-uncovered-replacement-draft-work-queue.md`

## Consolidated result

The original 45-location queue has been reconciled to its documented batch reports and placed into one reviewer sign-off worksheet.

| Disposition | Locations | Meaning |
|---|---:|---|
| One provisional draft recorded | 24 | One candidate is identified for item-level review; this is not approval |
| Competing alternatives | 7 | More than one candidate exists for one held location; reviewer/owner must select at most one |
| Existing draft re-screened | 1 | DUP-147 reuses its earlier burette draft; count it once |
| No candidate retained | 13 | Alternatives were rejected, or no distinct syllabus-grounded draft was justified; keep held |
| **Total** | **45** | All queue locations accounted for |

The 13 no-candidate locations are: DUP-128, DUP-225, DUP-117, DUP-212, DUP-134, DUP-242, DUP-220, DUP-119, DUP-192, DUP-159, DUP-156, DUP-103 and DUP-230. These remain held; no replacement should be forced into the bank merely to fill a count.

## Reviewer assignments

The worksheet pre-fills the subject-level reviewers recorded in the 20 November independent subject-review register:

| Subject | Assigned reviewer |
|---|---|
| Use of English | Alade Tobi |
| Mathematics | James Oreofeoluwa |
| Biology | Samuel Elijah |
| Chemistry | Adeleke Emmanuel |
| Physics | Precious |
| Economics | James Ademola |
| Government | John Damilola |
| Literature in English | James |

**Important distinction:** These reviewers' earlier subject-level decisions do not automatically approve any of the replacement drafts in this packet. Each exact replacement version still requires its own item-level confirmation. The worksheet explicitly labels the assigned names as subject-level reviewers and leaves all replacement-specific decisions pending.

## High-priority reconciliation cautions

1. **DUP-41 ID collision:** The new queue item is batch 40, row 13 and has a candidate in the batches 44–45 report. The same identifier is also used by an existing canonical proposal associated with batch 19, row 16. Never join or approve these by DUP ID alone. Use exact held source location and exact draft ID.
2. **DUP-108, DUP-133, DUP-165, DUP-169, DUP-176, DUP-95 and DUP-175:** Each has competing alternatives. Select no more than one replacement per held location. Do not count each alternative as a separate replacement.
3. **DUP-147:** The burette question is a re-screen of the earlier draft, not a second independent proposal.
4. **DUP-106:** The reported 0.467 lexical score against a glomerular-ultrafiltration item requires an explicit reviewer distinction between filtration and selective reabsorption.
5. **DUP-226:** The reported 0.507 score against a mitosis item requires explicit reviewer confirmation of homologous chromosome separation in meiosis I versus sister-chromatid separation in mitosis.
6. **DUP-97:** The reported 0.555 score against a strong-acid item requires explicit reviewer confirmation that acid strength and acid basicity are different properties.
7. **DUP-41 fossil draft and DUP-151 fossil draft:** Both concern fossil evidence/evolution. They target different held locations but should be compared for bank-wide coverage balance and avoid unnecessary repetition.

## Required item-level sign-off

For each candidate selected for review, the reviewer must:
- Open the cited source audit report and inspect the exact question, options, answer and explanation.
- Confirm the exact candidate ID and immutable version/hash being reviewed.
- Confirm the answer and explanation.
- Confirm fit to the current JAMB syllabus and intended difficulty.
- Confirm distinction from the retained-plus-held subject bank and other replacement proposals.
- Record one decision: **APPROVED**, **APPROVED WITH REQUIRED EDITS**, **REJECTED**, or **HOLD**.
- Record any required edits/reason and the review date.

For a competing target, only one candidate may advance. Any edited version must be rechecked and signed off again. A target with no retained candidate stays held until a distinct candidate is developed and screened.

## Release status

- 45/45 queue locations represented in the consolidated worksheet.
- 45/45 rows have a subject reviewer assigned from the existing register.
- Exact replacement-version confirmations: pending.
- Item-level replacement approvals: **0 recorded by this packet**.
- Import eligibility granted: **0**.
- Publication authorization granted: **0**.
- Canonical 116-proposal inventory changes: 0.
- Source/staging question changes: 0.
- Database writes: 0.
- Merge/deployment/production changes: 0.

This is a documentation and review-preparation milestone only. It does not approve, import or publish questions. Production remains untouched.


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
