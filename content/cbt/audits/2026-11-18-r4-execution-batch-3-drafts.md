# R4 Execution Batch 3 — Screened Replacement Drafts

Date: 18 November 2026
Branch: `feat/cbt-subject-combination-reconciled`
Status: Draft-only. No import, approval, publication, merge or production action.

## Screening scope and method

The R4 source bank was fetched from the four retained-batch CSVs and four held-duplicate CSVs: 1,600 source rows total, with 200 rows per subject. Each candidate stem plus four options was compared with every question in its subject bank and all 116 canonical replacement proposals using the existing padded character-trigram Dice method. The screening threshold is 0.42.

Supplemental drafts were also checked against 26 stem strings extracted from the nine previously documented supplemental-draft files. This extraction is a supplementary check, not a claim that it exhausts every prior draft text. A score below 0.42 is only a lexical screen; it does not prove semantic uniqueness, factual accuracy, syllabus suitability or academic approval.

## Draft 1 — DUP-132 (Use of English)

- Held target: batch 34 row 3.
- Held concept: Vocabulary / Synonyms — meaning of “ephemeral”.
- New topic: Vocabulary and word formation / Acronyms.
- Stem: A word formed from the initial letters of a group of words and pronounced as a single word is known as an:
- A. Acronym
- B. Anagram
- C. Homonym
- D. Antonym
- Correct answer: A.
- Explanation: An acronym is formed from the initial letters or parts of a series of words and is pronounced as a word, for example, UNESCO.
- Difficulty: Medium.
- Highest same-subject source-bank score: 0.2434 (batch 25, row 4).
- Highest canonical-proposal score: 0.2807 (DUP-200).
- Highest extracted supplemental-stem score: 0.2614.
- Screen: all reported maxima below 0.42.
- Review note: A qualified English reviewer should confirm the distinction between acronyms and initialisms and whether this level of word formation is appropriate for the current UTME syllabus.

## Draft 2 — DUP-194 (Economics)

- Held target: batch 36 row 27.
- Held concept: Market structures / Monopolistic competition.
- New topic: Market structures / Perfect competition.
- Stem: A firm operating under perfect competition is described as a price taker because it:
- A. Accepts the market price determined by industry demand and supply
- B. Sets any price it wishes without losing customers
- C. Is the only seller of the product
- D. Controls the quantity supplied by every rival
- Correct answer: A.
- Explanation: Under perfect competition, an individual firm is too small relative to the market to influence the prevailing price, so it accepts the market price.
- Difficulty: Medium.
- Highest same-subject source-bank score: 0.4084 (batch 22, row 28).
- Highest canonical-proposal score: 0.3341 (DUP-49).
- Highest extracted supplemental-stem score: 0.2558.
- Screen: all reported maxima below 0.42.
- Review note: The target concerns product differentiation under monopolistic competition; this draft tests price-taking under perfect competition. A qualified Economics reviewer should confirm the distinction and syllabus fit.

## Screened-out alternatives (not added)

These alternatives were rejected because the source-bank or canonical-proposal score reached or exceeded 0.42, or because the closest item was semantically duplicative despite a sub-threshold lexical score:

- DUP-180 marginal utility: 0.7967 against a held source question.
- DUP-180 opportunity cost: 0.4104 against a source question, but the nearest question tests the same definition; rejected as a semantic duplicate.
- DUP-117 rule of law: 0.4425 against a canonical proposal.
- DUP-112 carrying capacity: 0.4685 against the source bank.
- DUP-112 Rhizobium / nitrogen fixation: 0.4404 against the source bank.
- DUP-147 amphoteric oxides: 0.8360 against a canonical proposal.
- DUP-212 metre: 0.6816 against the source bank.
- DUP-119 by-election: 0.4821 against the source bank and 0.4620 against a canonical proposal.
- DUP-179 fractional distillation: 0.7202 against the source bank.
- DUP-106 antidiuretic hormone: 0.7179 against the source bank.

These are screening rejections, not judgments that the underlying facts are incorrect. The candidates should not be recycled without a new, materially different learning outcome.

## Status and safeguards

- New draft candidates documented in this batch: 2.
- Total documented uncovered-target drafts: 23 of 45, counting the 19 prior documented drafts and the four drafts in the two 18 November batches.
- Remaining uncovered targets without a documented draft: 22.
- Qualified independent approvals created: 0.
- Imports, question-status changes and publications: 0.
- Source CSVs, canonical 116-proposal inventory and staging question rows changed: 0.
- Production database and Worker changed: 0.
- PR merged or production deployment performed: 0.

Both proposals remain draft-only. Neither may be imported or published until qualified independent subject and syllabus review is recorded.
