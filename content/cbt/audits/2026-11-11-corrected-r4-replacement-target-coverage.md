# Corrected R4 Replacement Target Coverage — 11 November 2026

## Supersedes earlier interpretation
This report supersedes the coverage interpretation in `2026-11-11-r4-held-row-location-proposal-crosswalk.md`. The earlier report treated a matching pair ID as evidence that the proposal targeted that held source row. That assumption is not valid: proposal IDs and held-row pair IDs can differ, and the proposal's actual target location must be used.

## Method
For each of the 116 replacement proposals, resolve its target location in this order:
1. proposal `target_location`;
2. register `replacement_draft_location`;
3. register `replace`;
4. register `replace_candidate`.

Compare that explicit location with all 161 held-row `held_location` values in the four R4 CSV files. Also verify that the proposal subject matches the subject of the held row at the target location.

## Verified results
- R4 held rows: **161**.
- Unique held source locations: **161**.
- Replacement proposals: **116**.
- Proposals with a resolvable target location: **116 of 116**.
- Distinct proposal target locations: **116**.
- Proposal target locations that match a held source location: **116 of 116**.
- Proposal/held subject mismatches: **0**.
- Held source locations with no proposal target: **45**.

The location-level result is therefore **116/161 covered; 45/161 without a draft target**. This corrects the previous 117/161 and 44/161 interpretation. The prior 45 exact-ID-only result happened to equal the correct missing-target count, but the rationale is now explicit target-location matching, not ID equality.

## Remaining 45 held locations by subject
- Biology: **13**
- Government: **11**
- Economics: **7**
- Literature in English: **6**
- Chemistry: **4**
- Physics: **3**
- Use of English: **1**

## Remaining target locations
| Held pair ID | Subject | Held source location |
|---|---|---|
| DUP-215 | Government | batch 21 row 35 |
| DUP-108 | Government | batch 22 row 35 |
| DUP-99 | Literature in English | batch 23 row 38 |
| DUP-133 | Economics | batch 25 row 27 |
| DUP-128 | Government | batch 26 row 33 |
| DUP-233 | Literature in English | batch 26 row 37 |
| DUP-176 | Literature in English | batch 26 row 41 |
| DUP-165 | Biology | batch 27 row 12 |
| DUP-96 | Economics | batch 28 row 27 |
| DUP-171 | Government | batch 28 row 32 |
| DUP-151 | Biology | batch 29 row 12 |
| DUP-110 | Biology | batch 29 row 13 |
| DUP-125 | Government | batch 29 row 33 |
| DUP-116 | Biology | batch 30 row 15 |
| DUP-224 | Biology | batch 30 row 16 |
| DUP-180 | Economics | batch 30 row 28 |
| DUP-169 | Physics | batch 31 row 25 |
| DUP-225 | Economics | batch 31 row 30 |
| DUP-117 | Government | batch 31 row 32 |
| DUP-118 | Government | batch 32 row 36 |
| DUP-112 | Biology | batch 33 row 14 |
| DUP-132 | Use of English | batch 34 row 3 |
| DUP-147 | Chemistry | batch 34 row 18 |
| DUP-95 | Chemistry | batch 34 row 21 |
| DUP-212 | Literature in English | batch 34 row 38 |
| DUP-134 | Biology | batch 35 row 13 |
| DUP-242 | Economics | batch 35 row 30 |
| DUP-220 | Literature in English | batch 35 row 41 |
| DUP-194 | Economics | batch 36 row 27 |
| DUP-119 | Government | batch 36 row 35 |
| DUP-106 | Biology | batch 37 row 13 |
| DUP-226 | Biology | batch 37 row 14 |
| DUP-97 | Chemistry | batch 37 row 21 |
| DUP-111 | Physics | batch 37 row 25 |
| DUP-192 | Government | batch 37 row 35 |
| DUP-105 | Biology | batch 38 row 14 |
| DUP-159 | Government | batch 38 row 36 |
| DUP-167 | Literature in English | batch 38 row 38 |
| DUP-158 | Biology | batch 39 row 12 |
| DUP-179 | Chemistry | batch 39 row 21 |
| DUP-156 | Physics | batch 39 row 23 |
| DUP-103 | Economics | batch 39 row 27 |
| DUP-230 | Government | batch 39 row 34 |
| DUP-41 | Biology | batch 40 row 13 |
| DUP-175 | Biology | batch 40 row 16 |

## What the count means
These 45 are held source locations with no replacement proposal currently targeting them. They are the current draft-coverage gap. They should be treated as 45 draft targets to resolve, not as 45 automatically approved questions: each needs a suitable new or intentionally mapped replacement, a full-bank uniqueness screen, and qualified subject/syllabus review.

Cluster relationships can help explain why rows were held together, but they do not by themselves supply a replacement for a different held location. A cluster-level draft can only count for a location if the proposal explicitly targets that location or a reviewed mapping explicitly assigns it there.

## Safety
This is an audit-only reconciliation. No source CSV, proposal inventory, register, database row or production resource was changed. No replacement was imported, approved or published. No PR was merged and no production deployment was performed.
