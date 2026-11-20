# R4 Uncovered Queue — Retained-Bank Collision Screen (15 November 2026)

## Scope

Continues the 45-target uncovered replacement-draft queue from the existing feature branch. This is a non-destructive screen of held targets against the 1,439 provisionally retained R4 questions. It does not change the retained bank, held rows, canonical replacement inventory, database or application code.

A proposal was not created where the retained bank already tests the same concept or learning outcome. These are collision findings, not academic approval or a claim that the held item is itself a confirmed duplicate beyond the existing disposition record.

## Targets screened and not drafted

| Target | Subject | Held concept | Retained-bank collision | Decision |
|---|---|---|---|---|
| DUP-215 | Government | Constitutional amendment | Existing retained item: “A constitutional amendment is a change made to a constitution through…” | Do not paraphrase the same amendment concept |
| DUP-117 | Government | Vote of no confidence | Existing retained item: “A successful motion of no confidence in a parliamentary system usually indicates that…” | Same parliamentary confidence outcome |
| DUP-112 | Biology | Xylem transport | Retained items directly ask what xylem transports and its main function | Same transport function |
| DUP-132 | Use of English | Synonym of “ephemeral” | Retained item asks “The word ‘ephemeral’ most nearly means” | Exact vocabulary collision |
| DUP-242 | Economics | Marginal utility | Retained item asks “Marginal utility is the additional satisfaction obtained from” | Same definition/learning outcome |
| DUP-194 | Economics | Monopolistic competition | Retained item asks a common feature of monopolistic competition and differentiated firms | Same defining feature |
| DUP-106 | Biology | Nephron ultrafiltration | Retained items test the glomerulus and filtrate entering Bowman's capsule | Same nephron filtration concept |
| DUP-105 | Biology | Site of human fertilisation | Retained item directly asks where fertilisation normally occurs in the human female reproductive system | Exact learning-outcome collision |
| DUP-103 | Economics | Monopsony | Retained item asks for a market with one dominant buyer and many sellers | Same market-structure definition |
| DUP-230 | Government | Civil-service political neutrality | Retained item directly asks what political neutrality in the civil service means | Same principle |
| DUP-233 | Literature in English | Dramatic aside | Retained bank has multiple questions defining an aside, including the audience/other-characters distinction | Same dramatic-device outcome |
| DUP-167 | Literature in English | Couplet | Retained item directly asks for the name of a two-line poetic unit | Same poetry-form definition |

## Interpretation

- These 12 targets were screened and no new proposal was added for them in this pass.
- A lexical match or topic overlap is a screening signal; contextual academic judgement remains necessary.
- The remaining targets must still be assessed individually. No proposal should be forced merely to increase the draft count.
- The latest recorded target-specific proposal count remains **19 of 45**; **26** targets remain without documented draft proposals.
- Qualified independent academic approval evidenced for the 19 existing proposals remains **0**. No reviewer identity or approval has been invented.

## Verification and release boundary

- Branch: `feat/cbt-subject-combination-reconciled`
- PR: #194, open, draft and unmerged.
- On commit `b39eec86c4c6751e77c0c5de571fb92b47c859ab`, the build, isolated preview deployment/Chromium smoke test, wallet migration SQL integration and Playwright browser checks completed successfully. The production deploy job was skipped.
- This report is audit documentation only. No question import, publication, merge, production deployment, production database change or source/staging CSV change was performed.
