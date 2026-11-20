# R4 Authoritative 45-Target Candidate Inventory — Decision Log

**Date:** 20 November 2026  
**Branch:** `work/cbt-r4-next-replacement-drafts-20261112`  
**Master inventory:** `content/cbt/audits/2026-11-20-r4-authoritative-45-target-candidate-inventory.csv`  
**Reviewer worksheet:** `content/cbt/audits/2026-11-20-r4-45-location-review-signoff-matrix.csv`

## 1. Consolidated outcome

The 45 held source locations have been consolidated into one target-level inventory. Each target now has one lead candidate for item-level review or an explicit hold disposition.

| Inventory disposition | Targets |
|---|---:|
| Lead candidate awaiting exact-version academic review | 31 |
| Existing candidate re-screened (count once) | 1 |
| No replacement retained; source location remains held | 13 |
| **Total targets** | **45** |

The 32 candidate-bearing rows consist of 31 unique draft candidates plus one previously recorded burette candidate (DUP-147) that was re-screened and is not counted as a new proposal.

This inventory is a review index. It does not change the canonical 116-proposal inventory or the R4 question CSVs.

## 2. Competing alternatives resolved for review routing

The following lead candidates were selected for reviewer attention. Alternatives remain recorded in the inventory; “not selected” means not routed as the lead for this target, not an independent academic rejection.

| Held target | Lead candidate | Alternative(s) not selected | Selection rationale |
|---|---|---|---|
| DUP-108 — Government | Code of Conduct Tribunal adjudication | Red-tapism; ombudsman | Most directly aligned to ethics/accountability in public office; reviewer must verify Bureau/Tribunal roles |
| DUP-133 — Economics | Public-good characteristics | Circular flow of factor services/incomes | More directly related to the held market-failure/externalities topic |
| DUP-176 — Literature | Euphemism | Epiphany | Clear, directly testable figure-of-speech example |
| DUP-165 — Biology | Phagocytosis | AB blood-group antibodies | Avoids adding another ABO-focused item where related blood-group coverage exists |
| DUP-169 — Physics | Escape velocity | Principle of moments | Explicit JAMB Physics syllabus fit recorded and lower lexical score in the earlier screen |
| DUP-95 — Chemistry | Average rate of gas production | Gamma radiation penetration | More directly aligned to the held reaction-rate topic and tests a distinct experimental skill |
| DUP-175 — Biology | Amniotic egg adaptation in reptiles | Swim bladder in bony fish | Clear distinct reproductive adaptation; wording correctly says “many reptiles” |

These are AI-assisted routing choices to reduce competing versions. The assigned subject reviewer may request the alternative or reject both. No human decision is presumed.

## 3. Cross-target overlap resolved

Two separate held locations had fossil-evidence candidates:

- **DUP-151 — batch 29, row 12:** retain the fossil-sequence/evolution candidate as the lead.
- **DUP-41 — batch 40, row 13:** route the vestigial-structures candidate instead.

The DUP-41 fossil-remains candidate from batches 44–45 is not selected because it would repeat the fossil-record learning outcome already assigned to DUP-151. This preserves two different evidence types for review rather than creating two fossil questions.

**DUP-41 identity collision safeguard:** the held target is specifically batch 40, row 13. A separate canonical proposal also uses the label DUP-41 for batch 19, row 16. All review and future changes must use the exact batch/row and candidate ID, never the DUP number alone.

## 4. Candidate ID and version control

Where an original batch report supplied a Draft ID, that ID is retained. Where an earlier report did not supply a formal Draft ID, this inventory assigns a local `R4Q-` registry alias so that the candidate can be referenced consistently.

A local alias is an inventory identifier only. It is **not** a source-authored immutable content hash or proof that the wording has been frozen. The reviewer must inspect the exact question and options in the cited audit report and confirm the exact version before recording a decision. If the wording changes, the reviewer must review the changed version again.

## 5. Targets remaining held

These 13 targets have no replacement candidate retained in the reviewed audit trail and must remain held:

- DUP-128 — Government
- DUP-225 — Economics
- DUP-117 — Government
- DUP-212 — Literature in English
- DUP-134 — Biology
- DUP-242 — Economics
- DUP-220 — Literature in English
- DUP-119 — Government
- DUP-192 — Government
- DUP-159 — Government
- DUP-156 — Physics
- DUP-103 — Economics
- DUP-230 — Government

Do not fill these locations with a paraphrase of a question already in the bank merely to reach a target count. A new distinct candidate must be drafted and screened before the held status can change.

## 6. Mandatory review gates

For each of the 32 candidate-bearing rows:
1. Confirm the exact held source location and exact candidate ID.
2. Inspect the complete stem, all options, answer key and explanation in the cited audit report.
3. Confirm the precise version being reviewed; record a hash or equivalent immutable version evidence if available.
4. Verify factual correctness, one defensible key, distractor quality and current JAMB syllabus fit.
5. Review the recorded duplicate/overlap cautions, including the high-similarity flags for DUP-106, DUP-226 and DUP-97.
6. Record APPROVED, APPROVED WITH REQUIRED EDITS, REJECTED or HOLD, with reviewer, reason/edits and date.
7. Re-review any changed version before it can be considered approved.

The subject-level approvals already recorded for the eight subjects do not constitute item-level approvals of these replacements.

## 7. Release boundary

- Candidate-bearing target rows: 32 (31 unique drafts plus one re-screened existing draft).
- No-candidate held rows: 13.
- Item-level replacement approvals created by this work: **0**.
- Import eligibility granted: **0**.
- Publication authorization granted: **0**.
- Canonical 116-proposal inventory changed: no.
- Original R4 source/staging CSVs changed: no.
- Database writes: 0.
- Merge, deployment or production changes: 0.

This is documentation-only reconciliation and review routing. The R4 candidate inventory is now consolidated, but the question bank is not thereby approved, import-ready or publish-ready. Production remains untouched.


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
