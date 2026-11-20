# R4 Approved Replacement Candidates — Pre-Import Validation (32 Rows)

**Date:** 20 November 2026
**Branch:** `work/cbt-r4-next-replacement-drafts-20261112`
**Prepared CSV:** `content/cbt/staging/2026-11-20/approved-replacement-candidates-32.csv`
**Source packet:** `content/cbt/audits/2026-11-20-r4-item-level-review-packet-32-candidates.csv`
**Status:** Pre-import package prepared and structurally validated; no database import executed.

## Validation results

- Candidate rows: **32**
- CSV columns: **20**
- Unique candidate IDs: **32/32**
- Candidate IDs match the approved master packet: **32/32**
- JAMB exam type: **32/32**
- Supported UTME subjects: **32/32**
- Required topic and question text: **32/32**
- Four non-empty, distinct options: **32/32**
- Valid answer key: **32/32**
- Explanation length: **32/32**
- Valid difficulty: **32/32**
- Original EDUKEN source metadata: **32/32**
- Status column: intentionally omitted, so the server import normalizer defaults each inserted question to **draft**.
- Structural validation errors: **0**

The full source bank was also checked using the four retained staging files (1,510 rows) and four held-duplicate files (90 rows), for **1,600 source questions**. No candidate had a same-subject exact normalized stem match in those 1,600 rows. This is an exact-stem screen, not a substitute for the semantic duplicate cautions recorded in the subject audit reports.

## Import-safety notes

- The import CSV includes each candidate ID, target ID, and SHA-256 version digest in dedicated columns and provenance notes.
- All 32 questions are marked as original EDUKEN content, not third-party past-question material.
- The import route validates records, checks existing question fingerprints, and inserts accepted records with status `draft`; it does not auto-publish them.
- The import endpoint is a write operation, not a dry-run endpoint. It was **not called**.
- No database records were created or changed.
- No questions were published.
- The 13 no-candidate held locations remain excluded.
- Production remains untouched.

## Remaining gates

1. Confirm the isolated test Supabase project and run a controlled test import there only if the project owner authorizes that write.
2. Verify the import batch summary, inserted count, duplicate count, and draft status in the isolated test project.
3. Do not import to production, publish questions, merge the branch, or deploy the production Worker without separate explicit approval.
