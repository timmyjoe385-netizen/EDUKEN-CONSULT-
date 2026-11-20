# R4 Uncovered Queue Reconciliation — Corrected 14 November 2026

**Branch:** `feat/cbt-subject-combination-reconciled`  
**Pull request:** #194 (draft; open; unmerged)  
**Purpose:** Correct the prior 14 November queue count using held source locations, not exact ID equality.

## Authoritative scope

The R4 coverage report dated 11 November establishes 161 unique held source locations. The uncovered queue lists 45 specific held locations. A replacement draft counts toward this queue only when its documented held target points to that location. Pair IDs, proposal IDs and cluster relationships are not interchangeable.

## Drafts verified against the 45 queue locations

The following draft files explicitly name these queue targets:

| Held target | Held source location | Evidence |
|---|---|---|
| DUP-108 | batch 22 row 35 | 11 Nov first-five draft file |
| DUP-133 | batch 25 row 27 | 11 Nov first-five draft file |
| DUP-176 | batch 26 row 41 | 11 Nov first-five draft file |
| DUP-165 | batch 27 row 12 | 11 Nov first-five draft file |
| DUP-169 | batch 31 row 25 | 11 Nov first-five draft file |
| DUP-128 | batch 26 row 33 | 14 Nov two-draft supplement |
| DUP-96 | batch 28 row 27 | 14 Nov two-draft supplement |
| DUP-151 | batch 29 row 12 | 14 Nov three-draft supplement |
| DUP-110 | batch 29 row 13 | 14 Nov three-draft supplement |
| DUP-116 | batch 30 row 15 | 14 Nov three-draft supplement |

These are ten distinct held source locations, all present in the 45-item uncovered queue.

## Corrected progress

| Measure | Verified count |
|---|---:|
| R4 uncovered held locations | 45 |
| Targets with a separately documented draft | 10 |
| Remaining targets without a documented draft in these supplements | 35 |
| Canonical inventory proposals | 116 |
| New drafts documented outside the canonical inventory | 5 (first five) + 2 + 3 |
| Qualified academic approvals verifiably documented in the reviewed files | 0 |

The 116 canonical proposals cover a separate set of held locations and must not be counted as queue drafts merely because their IDs resemble held pair IDs. The ten rows above are counted only from explicit target-location statements in their respective supplement files.

## Correction to the earlier 14 November note

The earlier note titled `2026-11-14-r4-uncovered-queue-reconciliation.md` compared the 45 queue pair IDs directly with the 116 canonical proposal target IDs and treated that exact-ID overlap as the main coverage measure. That comparison omitted the five target-specific drafts in the 11 November first-five supplement and the two target-specific drafts in the 14 November supplement. Its statement that only two queue targets were evidenced as drafted is therefore incorrect and is superseded by this location-based reconciliation.

The correct current progress is **10/45 drafted, 35/45 remaining**, based on the three named supplement files. The 10 drafts remain proposals only, not approved or import-ready questions.

## Remaining queue targets

The remaining 35 target IDs are:

DUP-215, DUP-99, DUP-233, DUP-171, DUP-125, DUP-224, DUP-180, DUP-225, DUP-117, DUP-118, DUP-112, DUP-132, DUP-147, DUP-95, DUP-212, DUP-134, DUP-242, DUP-220, DUP-194, DUP-119, DUP-106, DUP-226, DUP-97, DUP-111, DUP-192, DUP-105, DUP-159, DUP-167, DUP-158, DUP-179, DUP-156, DUP-103, DUP-230, DUP-41, DUP-175.

## Academic and release status

A prior lineage report records a historical user-reported approval of 90 earlier proposals, but says the repository does not contain signed item-level decisions, reviewer identity or credentials. Do not treat that report as documentary verification for the ten queue drafts. No independently attributable approval for these ten drafts is evidenced in the reviewed supplements.

All ten remain draft-only. No source CSV, canonical inventory, database row, application code or production resource was changed by this reconciliation. No import, publication, merge or deployment was performed.
