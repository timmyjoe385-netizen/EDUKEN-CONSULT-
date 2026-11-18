# EDUKEN CBT — Dual Workstream Closure Checkpoint
Date: 18 November 2026
Branch: `feat/cbt-subject-combination-reconciled`
PR: #194

This checkpoint records two workstreams executed together: (A) remaining R4 replacement-target review and (B) cross-window baseline-rank evidence reconciliation. It is audit-only and does not authorize academic approval, question import/publication, merge or production deployment.

## A. Replacement-target workstream

### Reconciled coverage

- Corrected uncovered-target queue: 45 unique held source locations.
- Earlier documented target-specific proposals: 19.
- New proposals documented on 18 November:
  - DUP-99 (Literature in English — elegy; batch 2).
  - DUP-171 (Government — constitutional supremacy; batch 2).
  - DUP-132 (Use of English — acronym; batch 3).
  - DUP-194 (Economics — perfect-competition price taker; batch 3).
  - DUP-147 (Chemistry — titration equivalence point; batch 5).
- Total documented target-specific drafts: **24/45**.
- Remaining uncovered targets without a documented draft: **21/45**.

The five new proposals were compared against all 200 source-bank questions in their respective subjects, the 116-item canonical proposal inventory and the documented supplemental stem extracts specified in their individual batch reports. Their reported lexical maxima were below 0.42. This is only a lexical screen, not proof of semantic uniqueness, factual correctness, syllabus fit or academic approval.

### Remaining 21 targets — no forced paraphrase

The complete 15 November retained-bank collision screen reviewed the 26 targets then lacking drafts. Five of those targets subsequently received the new, separately screened proposals listed above. The following 21 remain without target-specific proposals. The existing retained bank already tests the same core definition, fact, principle or learning outcome; creating paraphrases merely to raise the coverage count is not justified.

| Target | Subject | Existing collision / reason not to force a draft |
|---|---|---|
| DUP-215 | Government | Constitutional amendment is already tested in the retained bank. |
| DUP-117 | Government | Vote-of-no-confidence outcome is already tested. |
| DUP-112 | Biology | Xylem transport function is already tested. |
| DUP-242 | Economics | Marginal utility definition is already tested. |
| DUP-106 | Biology | Glomerular ultrafiltration and filtrate entry into Bowman's capsule are already tested. |
| DUP-105 | Biology | Normal site of human fertilisation is already tested. |
| DUP-103 | Economics | Monopsony definition is already tested. |
| DUP-230 | Government | Civil-service political neutrality is already tested. |
| DUP-233 | Literature in English | Dramatic aside and audience/character distinction are already tested. |
| DUP-167 | Literature in English | Couplet definition is already tested. |
| DUP-224 | Biology | Xylem and water transport from roots are already tested. |
| DUP-180 | Economics | Producer-subsidy purpose/effect is already tested. |
| DUP-95 | Chemistry | Temperature effect on reaction rate is already tested. |
| DUP-212 | Literature in English | Stanza definition is already tested. |
| DUP-220 | Literature in English | Peripeteia / tragic reversal is already tested. |
| DUP-119 | Government | Purpose of an election petition is already tested. |
| DUP-192 | Government | Opposition-party scrutiny role is already tested. |
| DUP-159 | Government | Constitutional distribution of federal powers is already tested. |
| DUP-158 | Biology | Heterozygous genotype definition is already tested. |
| DUP-179 | Chemistry | Paper chromatography/mobile-phase relationship is already tested. |
| DUP-156 | Physics | Wavelength definition is already tested. |

**Disposition:** the 21 are not forgotten or silently dropped. They remain held pending qualified reviewer direction on whether a genuinely distinct learning outcome is required, whether a target may be mapped to an existing distinct proposal, or whether another resolution is academically justified. No new draft is fabricated for a concept already adequately represented.

### Academic gate

- Qualified independent academic approvals evidenced in this workstream: **0**.
- All 24 proposals remain drafts.
- No proposal imported or published.
- No source CSV, R4 staging question row or canonical proposal inventory changed in this dual-workstream checkpoint.

## B. Cross-window baseline-rank workstream

### Evidence inventory checked

The PR #194 changed-file inventory and the following authoritative evidence were checked:

- `2026-11-08-cross-window-baseline-rank-crosswalk-r2.json`
- `2026-11-09-cross-window-register-rank-crosswalk.json`
- `2026-11-06-cross-window-rank-reconciliation-r1.json`
- `cross-window-high-similarity-review-2026-11-01.json`
- `cross-window-staging-reconciliation-gap-2026-11-06.json`
- Tail review parts 1–83, including part63.

The PR changed-file inventory contains the crosswalks, candidate set, high-similarity shortlist, staging reconciliation and tail-review records. It does not contain a separate item-level baseline-review ledger that maps the reported 237 additional targeted reviews to exact endpoint pairs/ranks. The corrected 8 November crosswalk explicitly sets both the exact rank IDs for the baseline records and the exact rank IDs for the reported 237 targeted reviews to null.

### Reconciled facts — do not conflate unlike counts

- Cross-window candidate set: **1,304** ranks.
- Explicit tail disposition range: **287–1,304**, or **1,018** ranks.
- Existing disposition register exact endpoint matches: **184** unique ranks.
- High-similarity shortlist exact endpoint matches: **49** unique ranks.
- Overlap between those two pair-crosswalk sets: **16** ranks.
- Combined pair-crosswalk set: **217** unique ranks.
- Of those 217, **108** are in baseline band 1–286.
- Therefore **178** ranks in baseline band 1–286 are not represented by those pair crosswalks.
- The reported **237** additional targeted reviews still have no exact rank IDs / endpoint list in the inspected evidence.
- The 286 ranks at or above the 0.65 score cutoff are candidates in score order, not proof that 286 individual reviews were completed.

### Counter conflicts remain open

- Part63 persisted cumulative counter: **1,007**.
- Earlier rank-derived checkpoint: **1,003**.
- Difference: **4**, with no four exact records identified.
- Historical register conflict: **472** additional targeted reviews versus **237** in the progress note.
- Historical tail conflict: **685** unique tail rank IDs versus **717** in the progress reconciliation.
- The crosswalk's 973 combined explicit rank IDs and the 921 part56 checkpoint are distinct counters and must not be treated as equivalent to a complete manual-review total.

**Disposition:** no rank IDs were inferred from score order, arithmetic complements or missing values. No review decisions or counter values were fabricated or overwritten. Final unique reviewed and remaining totals stay null/unverified. The baseline evidence-recovery task is not complete; the repository evidence set does not currently contain the missing item-level ledger.

## C. Safeguards and release status

- Source CSV / R4 staging question rows changed: 0.
- Canonical proposal inventory changed: 0.
- Question imports / status transitions / publications: 0.
- Independent academic approvals created: 0.
- Production database / Worker changed: 0.
- PR merge / production deployment: 0.
- PR #194 remains open, draft and unmerged.

**Overall disposition: 24/45 target-specific proposals documented; 21 remain appropriately held without forced paraphrases. Baseline rank reconciliation remains evidence-blocked. Academic approval remains outstanding. Production release remains blocked.**
