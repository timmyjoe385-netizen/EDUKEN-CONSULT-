# EDUKEN CBT — five-workstream continuation round 5 (13 November 2026)

## Safety boundary
Continued from Round 4 on the existing work branch. This was a read-only source-evidence and release-gate review followed by audit documentation only. No question bank, canonical replacement inventory, staging CSV, database, Worker, authentication/payment configuration or production resource was changed. No question was imported or published. No PR was merged or deployed.

## Workstream 1 — source and rank evidence
- Re-opened the 6 November cross-window tail review. It records five fully content-checked semantic duplicate pairs at candidate ranks 291, 293, 304, 308 and 319. Its own scope says 286 previously manually reviewed, 291 now manually reviewed and 1,013 remaining at that historical checkpoint.
- Re-opened the 6 November holdout index and delta index. They agree on 28 new pair candidates, six unique cluster-extension locations, two reused already-held locations excluded, and 34 unique new held locations. Their rank span is 565–909.
- The source-row/staging join audit reports all 56 pair locations and all eight extension locations source-checked; 34 unique held locations joined with 34 retained anchors; 1,476 retained + 124 held = 1,600 in the 6 November staging revision, with no overlap.
- These are dated 6 November records on the earlier `feat/cbt-subject-combination-reconciled` branch. They provide useful bounded evidence, not a current complete rank crosswalk. The baseline ranks 1–286, the reported 237 targeted reviews, and the 1,007-versus-1,003 counter discrepancy remain unresolved.

## Workstream 2 — current R4 target coverage and stale-report control
- Current explicit target baseline remains 116 canonical proposal targets across 161 held locations, leaving 45 uncovered. Twelve uncovered targets have recorded draft candidates; 33 have no retained candidate in the reviewed reports.
- Identified an older 10 November structural report that still states 104/161 coverage and a 55-target gap. It is tied to the earlier branch/revision and predates later proposal additions. Do not reuse its 104/161 count as current. The newer Round 3/4 checkpoint and explicit 13 November reconciliation remain the current basis: 116/161.
- The older 10 November report is retained as historical evidence, not silently edited or deleted.

## Workstream 3 — draft and approval safeguards
- The canonical 116-item inventory's last structural validation remains 116 unique target IDs with required fields, four distinct options and valid A–D answer keys.
- Seven content-construction/concept-variety flags remain open: Economics DUP-228 and DUP-109; Government DUP-102, DUP-221, DUP-104 and DUP-123; Literature DUP-59/DUP-232 overlap.
- The two alternatives retained in the 12 November consolidated pass (DUP-147 Chemistry and DUP-226 Biology) remain draft-only. Semantic exclusions DUP-112/DUP-61 and DUP-212/DUP-62 remain valid warnings against relying on lexical scores alone.
- Assistant review and structural checks are not independent subject/syllabus approval. Qualified academic approvals recorded remain 0.

## Workstream 4 — order-1 review and provenance
- Rechecked the 2 November Order 1 progress and reconciliation records: they distinguish assistant preliminary review (90/90) from independent qualified approval (0/90). The records list 16 syllabus-scope/depth holds and 11 contextual lexical flags at that historical point.
- Those 90 Order 1 drafts are a separate earlier review set; their assistant-review completion must not be used to imply approval of the later R4 proposals.
- No signed reviewer identity, credentials or item-level independent approval evidence was found in the reviewed records. The owner has said no external academic reviewer is available; internal QA can continue, but approval status stays zero.

## Workstream 5 — PR, CI and preview gate
- PR #194 and #199 remain open, draft, unmerged and mergeable at their previously inspected heads.
- Four workflow groups on each exact PR head were recorded successful: build, wallet migration SQL integration, Playwright browser checks, and build/Cloudflare deployment. The audit-only current branch head has no PR-triggered workflow runs.
- Preview acceptance remains limited to isolated test data, one-question practice and API attempt lifecycle. Eight sample questions cannot validate full-length mock modes. Authenticated admin/non-admin walkthrough and live AI-assistant POST remain outstanding.
- No owner action was required for this evidence round. The future authenticated preview walkthrough requires the owner to sign in on the isolated preview site; do not share credentials in chat.

## Round result
Five workstreams completed. New evidence clarifies the historical 6 November staging join and cross-window review boundaries, while identifying an outdated 10 November 104/161 coverage statement that must not override the current 116/161 baseline. The 45-location gap, rank/provenance uncertainties, content flags, and preview acceptance gaps remain open. No content was promoted and production remains untouched.
