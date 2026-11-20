# R4 Two Additional Uncovered Replacement Drafts — 14 November 2026

**Branch:** `feat/cbt-subject-combination-reconciled`  
**Status:** Draft proposals only; not added to the canonical 116-item inventory.  
**Source:** R4 45-uncovered replacement work queue.

## Screening method

Both drafts were screened against all 1,600 R4 source rows (1,439 retained and 161 held) and all 116 existing replacement proposals. Character-trigram Dice similarity compares each stem plus its four options. The screening threshold is 0.42. Source-bank maxima are restricted to the same subject. Below-threshold scores do not establish semantic uniqueness, syllabus fit or academic approval.

## Draft 1 — Government

- **Held target:** DUP-128 — batch 26 row 33
- **Held topic:** Electoral systems / Proportional representation
- **Draft topic:** Electoral process / Secret ballot
- **Stem:** The secret ballot is important in an election because it:
- **Options:**
  - A. allows voters to make their choices without publicly revealing them
  - B. requires every voter to announce a choice aloud
  - C. gives political parties the right to mark ballot papers
  - D. allows electoral officers to choose for undecided voters
- **Answer:** A
- **Explanation:** A secret ballot protects the privacy of each voter's choice and helps reduce intimidation or undue influence.
- **Difficulty:** Easy
- **Highest same-subject source-bank lexical score:** 0.393 (held-source row; source location metadata is not present in that CSV row)
- **Highest existing-proposal lexical score:** 0.333 (DUP-104)
- **Screen:** Both scores below 0.42. The question tests ballot secrecy, not the allocation of seats under proportional representation.
- **Review status:** Draft only; qualified Government syllabus and factual review required.

## Draft 2 — Economics

- **Held target:** DUP-96 — batch 28 row 27
- **Held topic:** Demand and supply / Price ceiling
- **Draft topic:** Basic economic concepts / Opportunity cost
- **Stem:** A local council uses its available funds to build a market instead of repairing a rural road. The road repairs that are given up represent the:
- **Options:**
  - A. opportunity cost of the decision
  - B. market price of the new market
  - C. total revenue of the council
  - D. law of diminishing returns
- **Answer:** A
- **Explanation:** Opportunity cost is the value of the next best alternative forgone. By choosing the market project, the council gives up the road repairs it could otherwise have funded.
- **Difficulty:** Medium
- **Highest same-subject source-bank lexical score:** 0.363 (batch 09, source CSV row 30)
- **Highest existing-proposal lexical score:** 0.337 (DUP-42)
- **Screen:** Both scores below 0.42. The question tests choice and forgone alternatives, not the effect of a price ceiling.
- **Review status:** Draft only; qualified Economics syllabus and factual review required.

## Items deliberately not drafted in this pass

The other three candidates tested for DUP-215, DUP-99 and DUP-233 exceeded the 0.42 source-bank or existing-proposal screen, or collided with already-present question content. They were excluded rather than weakening the screening rule or relabelling a near-duplicate as a replacement. No candidate was added for those targets.

## Required review and release gates

A qualified reviewer must independently verify syllabus fit, factual accuracy, answer keys, distractor quality and suitability as replacements. Record reviewer identity, qualification, date and item-level decision. These assistant-created drafts are not approvals.

## Safety record

- R4 source rows screened: 1,600
- Existing proposals screened: 116
- New draft proposals: 2
- Original source CSV changes: 0
- R4 staging CSV changes: 0
- Canonical 116-item inventory changes: 0
- Database changes: 0
- Production changes: 0
- Imports: 0
- Publications: 0
- Qualified academic approvals created: 0

**Status:** TWO_ADDITIONAL_DRAFT_PROPOSALS_SCREENED_PENDING_QUALIFIED_REVIEW
