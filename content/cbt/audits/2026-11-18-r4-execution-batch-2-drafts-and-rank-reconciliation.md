# R4 Execution Batch 2 — Draft Candidates and Rank-Reconciliation Checkpoint

Date: 18 November 2026
Branch: `feat/cbt-subject-combination-reconciled`
Status: Draft-only; no import, approval, publication, merge or production action.

## A. Cross-window baseline rank reconciliation

The source evidence was rechecked in:
- `2026-11-06-cross-window-rank-reconciliation-r1.json`
- `2026-11-08-cross-window-baseline-rank-crosswalk-r2.json`
- `2026-11-09-cross-window-register-rank-crosswalk.json`
- `cross-window-tail-review-2026-11-06-part63.json`
- The consolidated 11 November checkpoint.

Verified facts:
- Candidate set: 1,304 ranks.
- Explicit tail dispositions: all 1,018 ranks from 287 through 1,304.
- Exact endpoint crosswalk: 184 register pairs map to 184 unique ranks.
- High-similarity shortlist: 49 exact endpoint matches; 16 overlap the 184.
- Combined exact crosswalk: 217 unique ranks, including 108 ranks in 1–286.
- Therefore 178 baseline-band ranks remain unrepresented by the inspected exact pair crosswalks.

The reported baseline count of 286 is not an exact itemized review list. The reported additional targeted count of 237 has no individual endpoint/rank list in the inspected evidence. The part63 persisted counter is 1,007 versus 1,003 from the earlier rank-derived checkpoint (difference 4). Other historical register conflicts remain: 472 versus 237 additional targeted reviews and 685 versus 717 earlier tail ranks.

**Disposition:** no missing rank IDs inferred, no review decisions created, no counters overwritten. The 178-rank mapping and counter lineage remain unresolved because the underlying item-level records are absent from the inspected repository evidence.

## B. New target-specific draft proposals

Two candidates passed the existing padded character-trigram Dice screen. Each was compared with all 200 questions in its subject within the 1,600-row R4 source bank, all 116 canonical replacement proposals, and 24 extracted supplemental draft stems. The existing 0.42 threshold is a lexical screen only.

### Draft 1 — DUP-99 (Literature in English)
- Held target: batch 23 row 38.
- Held concept: Satire.
- Proposed topic: Poetry / Elegy.
- Stem: A poem written to mourn or lament the death of a person is known as an:
- A. Elegy
- B. Ode
- C. Epigram
- D. Limerick
- Key: A
- Explanation: An elegy is a poem that expresses sorrow or lament, commonly for someone who has died. An ode is generally a poem of praise or serious reflection; an epigram is a brief witty statement or poem.
- Difficulty: Medium.
- Highest same-subject R4 source-bank score: 0.3643 (batch 14, source CSV row 38).
- Highest canonical-proposal score: 0.2963 (DUP-85).
- Highest supplemental-draft score: 0.2396.
- Screen: all below 0.42.
- Review gate: qualified Literature reviewer must confirm the terminology, syllabus scope and distinction from other poetic forms.

### Draft 2 — DUP-171 (Government)
- Held target: batch 28 row 32.
- Held concept: Checks and balances.
- Proposed topic: Constitutional government / Supremacy of the constitution.
- Stem: The principle that a constitution is the highest law and inconsistent laws are invalid is known as:
- A. Constitutional supremacy
- B. Collective responsibility
- C. Popular sovereignty
- D. Judicial immunity
- Key: A
- Explanation: Constitutional supremacy means the constitution is the highest legal authority. A law or government action that conflicts with it may be declared invalid by a competent court.
- Difficulty: Medium.
- Highest same-subject R4 source-bank score: 0.3860 (batch 40, source CSV row 33).
- Highest canonical-proposal score: 0.3901 (DUP-77).
- Highest supplemental-draft score: 0.2214.
- Screen: all below 0.42.
- Review gate: qualified Government reviewer must confirm the constitutional terminology, Nigerian context and syllabus scope.

## C. Rejected first-pass candidates

The following initial candidates were not added because the source-bank score reached or exceeded 0.42:
- DUP-215 pressure groups: 0.5352.
- DUP-99 dramatic monologue: 0.5700.
- DUP-233 stage directions: 0.4959.
- DUP-171 presidential assent: 0.4249.
- DUP-224 transpiration: 0.7905.

These are screening rejections, not evidence that the concepts themselves are wrong. They are recorded to prevent the same candidate wording being recycled.

## D. Safety and status

- New draft candidates documented: 2.
- Candidate proposals imported: 0.
- Question status changes: 0.
- Independent reviewer decisions created: 0.
- Source CSV or staging question content changed: 0.
- Production database or Worker changed: 0.
- PR merged or production deployment performed: 0.

Both new proposals remain draft-only and require qualified subject/syllabus review. A lexical score below 0.42 is not academic approval, proof of semantic uniqueness, or release authorization.
