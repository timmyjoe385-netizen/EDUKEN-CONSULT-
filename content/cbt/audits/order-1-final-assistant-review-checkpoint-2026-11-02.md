# Current technical checkpoint — 2026-11-05

This section supersedes the older "Release gate" paragraph below wherever it describes authenticated admin E2E or the latest CI/preview status. Historical review findings and the question-bank counts remain unchanged.

## Latest verified technical status

- PR #194 head: `0653f73b11e8a321358353681a1dac2a177b08d6`; PR remains open, draft and unmerged.
- Build and validation workflow `41981412207`: **passed**.
- Playwright/browser and isolated real-CBT-API workflow `41981412057`: **passed**.
- Build plus isolated preview deployment workflow `41981412186`: **passed**. Chromium CBT preview smoke and isolated guest-payment recovery smoke passed. Production deploy job was skipped.
- Wallet and CBT migration integration workflow `41981412079`: **passed**.
- Authenticated isolated admin E2E: **passed 2026-11-05**. Allowlisted Google admin login, synthetic CSV draft import, duplicate retry, persisted review/approval/publish transitions, student-feed visibility, unpublish/removal, cleanup, sign-out and non-allowlisted HTTP 403 rejection all verified. Test project returned to its baseline; import history was retained. See `isolated-admin-e2e-runbook-2026-11-05.md`.
- Independent external fetch of the preview hostname currently fails DNS resolution. Therefore CI's deployment and Chromium smoke are verified, but independent public hostname reachability and a fresh external visual inspection remain unconfirmed.
- Production deployment remains skipped; no production data, Worker, payment settings or student records were changed.

## Current question-bank and release blockers

- Isolated test database has 73 questions total: 65 drafts and 8 published (one published question per subject). It cannot support a 180-question mock. No source CSVs or 90 replacement candidates have been imported.
- 1,018 cross-window semantic candidates remain unreviewed.
- 279 within-window different-topic candidates are reported pending; the original 390 versus independently recomputed 352 candidate-count discrepancy (38) remains unresolved.
- Fourteen replacement-history records still need commit-SHA normalization; one provenance pair remains unverified.
- The owner-reported 90/90 reviewer approval remains user-reported. Signed item-level reviewer worksheets and reviewer identity/credentials are absent (0/90 documentary records). This is not being represented as independently verified.
- Keep the 1,600 source drafts and 90 replacements out of Supabase and unpublished until the remaining semantic/provenance gates are closed and the reviewer evidence limitation is resolved or explicitly accepted by the project owner.
- PR #194 must remain unmerged and production deployment/import/publication must remain blocked until the outstanding gates are resolved and the user separately authorizes production release.

---

# Order 1 — latest assistant review checkpoint (2026-11-02)

## Verified progress

- Replacement targets/drafts: **90/90**.
- Assistant pairwise bankwide comparisons: **90/90**.
- Assistant preliminary answer/explanation/context checks: **90/90**.
- Assistant contextual reassessment of lexical similarity flags: **11/11**.
- Retained/held source-row provenance joins: **90/90**, previously reconciled.
- Current syllabus map: **57 provisionally aligned; 33 require qualified subject review**.
- Explicit syllabus-scope/depth holds: **14** — DUP-06, DUP-15, DUP-19, DUP-23, DUP-25, DUP-35, DUP-37, DUP-38, DUP-39, DUP-40, DUP-43, DUP-45, DUP-47 and DUP-48.
- Reviewer disposition: **90/90 approved, as explicitly reported by the project owner on 2026-11-02**. The repository does not contain signed item-level reviewer records or reviewer identity/credentials; see `order-1-reviewer-disposition-2026-11-02.md`.
- Current candidates blocked by known exact/full-fingerprint overlap: **0**; exact same-subject stem matches in the 1,600-row staged bank: **0**.
- Replacement-only candidate CSV: **90/90 rows**, one per held duplicate; all 90 target IDs and subjects match the held-row register.
- Import-format validation: **90/90 passed**; 90 distinct candidate fingerprints; no candidate-to-bank exact collisions or candidate-to-candidate fingerprint collisions.
- Projected post-replacement balance: **200 questions in each of the eight subjects**.
- Earlier rejected candidate drafts: **5**, replaced/withdrawn; they are not import candidates.
- Questions inserted into source CSVs or production: **0**.

## Important syllabus corrections

- DUP-12 (optimum population) is now provisionally mapped to official Economics Population Topic 20(c), which expressly lists optimum population.
- DUP-41 (prolactin) is now provisionally mapped to official Biology Topic 9(c), which lists pituitary hormones and requires candidates to relate hormones to their functions.
- DUP-42 maps to Economics Topic 8(b), the law of variable proportion.
- DUP-44 maps to Physics Topic 20(c), wave diffraction.
- DUP-51 maps to Physics resonance/forced vibration and simple A.C. circuits.
- DUP-61 maps to Biology tropic movements and auxins.
- DUP-66 maps to Physics transformers/electrical power.
- DUP-71 maps to Physics Topic 28(iv), Coulomb's inverse-square law.
- DUP-75 maps to Economics Topic 21(a), comparative costs/advantages.
- DUP-88 maps to Economics Topic 12(e), types and causes of inflation.

## Release gate

The reviewer stage is **reported complete (90/90)** based on the project owner's explicit confirmation. The 14 syllabus-scope/depth cases and all 11 lexical-flag cases are included in that reported approval. This is a user-reported disposition, not independently documentary-verified: no signed reviewer worksheets, reviewer identity/credentials or item-level sign-off records were uploaded. Technical replacement-set validation is complete; authenticated admin import/review/publish E2E testing in the isolated preview remains outstanding.

No original source CSVs were modified. The 90-row candidate file is staged only; no question was imported into Supabase or published. PR #194 remains draft and unmerged. Next: complete authenticated admin E2E import/review/publish testing in the isolated preview and rerun regression checks. Production import, publication, merge and deployment remain blocked pending successful isolated tests and the user's explicit production-release approval.
