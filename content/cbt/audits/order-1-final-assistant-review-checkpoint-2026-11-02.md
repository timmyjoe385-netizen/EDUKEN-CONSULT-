# Current technical checkpoint — 2026-11-06

This section supersedes older technical and review-count statements below wherever they conflict.

## Latest verified technical status

- Latest code-bearing PR #194 commit reviewed: `a121ee7c19887bca26f7ed03cefa83fc417437d8`.
- On that commit, build, validation, Playwright/browser + isolated CBT API, wallet/CBT migration integration, and isolated preview deployment all passed. Production deploy job was skipped.
- Authenticated isolated admin E2E passed on 2026-11-05: allowlisted Google admin login, synthetic CSV import, duplicate retry, persisted review/approval/publish transitions, student-feed visibility, unpublish/removal, cleanup, sign-out and non-allowlisted HTTP 403 rejection. The test project returned to baseline; import history was retained.
- The subsequent audit-only commit is `a78e5f9125aeffad4e05b0c5a67d7aa6cb0807b2`; CI for this new head has not yet been confirmed.
- Independent external fetch of the preview hostname previously failed DNS resolution. CI deployment and Chromium smoke passed, but public hostname reachability and fresh external visual inspection remain unconfirmed.
- Production deployment remains skipped; no production data, Worker, payment settings or student records were changed.

## Current question-bank and release blockers

- Isolated test database has 73 questions total: 65 drafts and 8 published (one published question per subject). It cannot support a 180-question mock. No source CSVs or 90 replacement candidates have been imported.
- Cross-window semantic review: **361 of 1,304 candidates manually reviewed; 943 remain**. The latest five full-content checks are recorded in `cross-window-tail-review-2026-11-06-part12.json`; all five were preserved as distinct questions. Candidate rank 889 was not counted again because its civic-duty cluster was already recorded as DUP-120/DUP-126.
- Within-window different-topic candidates: 279 reported pending; the original 390 versus independently recomputed 352 candidate-count discrepancy (38) remains unresolved.
- Fourteen replacement-history records still need commit-SHA normalization; one provenance pair remains unverified.
- The owner-reported 90/90 reviewer approval remains user-reported. Signed item-level reviewer worksheets and reviewer identity/credentials are absent (0/90 documentary records). The 43 newly discovered held targets remain outside that approval and do not have approved replacement drafts.
- Keep the 1,600 source drafts and all replacement candidates out of Supabase and unpublished until the remaining semantic/provenance gates are closed and the reviewer-evidence limitation is resolved or explicitly accepted by the project owner.
- PR #194 must remain unmerged and production deployment/import/publication must remain blocked until the outstanding gates are resolved and the user separately authorizes production release.


