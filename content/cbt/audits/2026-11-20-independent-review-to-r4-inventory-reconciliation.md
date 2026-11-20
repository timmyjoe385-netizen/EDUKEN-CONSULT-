# EDUKEN JAMB CBT — Independent Review to R4 Inventory Reconciliation

**Date:** 20 November 2026  
**Working branch:** `work/cbt-r4-next-replacement-drafts-20261112`  
**Source revision checked:** `2026-11-10-r4`  
**Scope:** Reconcile the eight user-reported subject-level approvals against the current 1,600-row source/staging inventory and separate those approvals from replacement-draft readiness.

## 1. Reconciliation result

The R4 staging manifest defines 1,600 source questions: 1,439 provisionally retained and 161 held as duplicate rows. The four retained CSV exports and four held CSV exports were independently parsed for this report. They contain 1,439 retained records and 161 held records; the retained source-location count is 1,439 and the held-location count is 161.

Each of the eight subjects totals exactly 200 source questions when retained and held rows are combined. This reconciles the subject-level approval scope to the eight 200-question subject banks, but it does not prove that a reviewer inspected a particular question version.

| Subject | Retained | Held | Total source rows | Reported subject decision |
|---|---:|---:|---:|---|
| Use of English | 185 | 15 | 200 | Approved all — Alade Tobi |
| Mathematics | 193 | 7 | 200 | Approved all — James Oreofeoluwa |
| Biology | 169 | 31 | 200 | Approved all — Samuel Elijah |
| Chemistry | 179 | 21 | 200 | Approved all — Adeleke Emmanuel |
| Physics | 185 | 15 | 200 | Approved all — Precious |
| Economics | 173 | 27 | 200 | Approved all — James Ademola |
| Government | 175 | 25 | 200 | Approved all — John Damilola |
| Literature in English | 180 | 20 | 200 | Approved all — James |
| **Total** | **1,439** | **161** | **1,600** | **8 of 8 subjects reported approved** |

## 2. What is reconciled

- All eight reviewer-subject entries in the 20 November register are present.
- Each subject's retained-plus-held count is exactly 200.
- The retained and held exports total 1,600 records, with no duplicate source locations within either exported set.
- The staging manifest records 1,600 unique source-row identities, no retained/held overlap, no missing held anchors, and all eight subjects at 200 rows.
- The review register records reviewer-reported subject-level decisions and explicitly discloses that reviewer identity, credentials and the underlying process are not independently authenticated.

## 3. What is not yet proven

The submitted records contain no question IDs, item-level annotations, signed worksheets, version hashes, or reviewer-to-source-row mapping. Consequently:

1. The subject-level approvals can be recorded as reported approvals covering each 200-question subject bank.
2. The exact set of question versions seen by each reviewer cannot be independently established from the submitted records.
3. The approval cannot be used as proof that any replacement draft created or revised outside the reviewed bank was seen and approved.
4. The 161 held duplicate rows remain excluded from the 1,439-row provisional retained set. A subject-level “approved all” statement does not by itself resolve the duplicate disposition or authorize a held row for publication.

## 4. Replacement-draft and publication boundary

The canonical replacement proposal file contains 116 distinct target IDs. Its own status text says the proposals remain unpublished drafts and require owner review; the historical lineage audit says 90 proposals match a previously user-reported reviewer-approved set and 26 are additional proposals. The 20 November AI-assisted screen reviewed all 116 for first-pass content quality, but recorded zero new human academic approvals.

The separate 45-location R4 work queue is a held-row coverage task, not 45 additional approvals. The queue and its later batch reports include provisional drafts and explicit decisions to leave some targets held. Those draft proposals are not part of the 1,439 retained rows and must not inherit the eight subject-level approvals without item/version-specific confirmation.

The AI-assisted screen of the 116 proposals flagged items for correction, overlap resolution or syllabus/context confirmation. In particular, proposal-level overlaps include DUP-17/DUP-61 (Biology phototropism) and DUP-59/DUP-232 (Literature epithet); several proposals need stem/option revision or explicit subject-syllabus confirmation. These flags remain review requirements, not automatic rejection decisions.

## 5. Release gate

**Current disposition: subject-level review coverage reconciled; question-version and replacement-draft approval not fully evidenced.**

Before any held-row replacement is eligible for import or publication:
- preserve reviewer evidence identifying the exact version or question IDs reviewed;
- obtain explicit reviewer dispositions for replacement drafts not demonstrably included in the reviewed bank;
- resolve competing proposals for the same held target and all AI-screened revise/hold flags;
- maintain held status for any unresolved duplicate or replacement target;
- run a fresh, read-only inventory/version check immediately before any separately authorized import.

## 6. Safety record

This reconciliation is documentation-only. It changed no source CSV, staging CSV, canonical replacement proposal, database record, approval state, import state or publication state. No merge, production deployment, production database write or production content change was performed. Production remains untouched.
