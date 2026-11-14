# EDUKEN CONSULT — AI coding-agent instructions

This repository is the existing EDUKEN CONSULT production codebase. Continue it; do not rebuild, migrate, rebrand, or replace its hosting.

## Required working rules
- Work only on the explicitly assigned feature branch or a new review branch. Never commit directly to the production/default branch.
- Before changing anything, inspect the current branch, open pull requests, recent commits, workflows, relevant application code, database migrations, and existing project documentation. Do not repeat completed work.
- Treat the existing Cloudflare Worker and Supabase projects as production infrastructure. Never deploy to production, run production migrations, alter production data/auth/payment settings, publish questions, or merge a pull request without explicit human approval.
- Use only the isolated test Supabase project and preview deployment for testing. Never copy production secrets into prompts, logs, source files, or a third-party AI workspace.
- Do not add paid services, paid APIs, subscriptions, or new hosting. Prefer existing dependencies and free checks.
- Make small, reversible, clearly scoped changes. Preserve current architecture, routes, brand, payment configuration, and unrelated working features.
- Do not claim a fix, test, preview, deployment, or release succeeded unless the relevant run or live result proves it. Distinguish passed, failed, cancelled, skipped, pending, and not run.
- Never weaken, delete, bypass, or relabel failing tests to obtain a green check. Add regression coverage for fixes.

## CBT release requirements
- A student-facing CBT option must never imply that an exam is available unless the complete student journey works in the target environment.
- Verify subject selection and subject-combination rules; published-only question retrieval; sufficient question counts; option selection and answer persistence; timer and navigation; submit/auto-submit; server-side grading; result display and retrieval; empty-pool/error states; and mobile browser usability.
- The JAMB mock blueprint is 60 Use of English + 40 questions from each of three selected additional subjects (180 questions total) with a 120-minute timer. Do not claim full-mock readiness when any selected subject pool is underfilled.
- Question-bank CSVs are drafts until academic/semantic review, answer-key verification, syllabus-fit review, approval, and publication are completed through the existing guarded workflow. Do not bulk-import or publish the 1,600 draft questions as a shortcut.
- Keep confirmed duplicate questions held out until suitable, syllabus-aligned replacements are verified. Do not treat lexical similarity screening as proof of duplication or uniqueness.
- If the production CBT cannot deliver a complete usable journey, recommend hiding it or clearly marking it unavailable rather than exposing a broken experience.

## Reporting
For every task, report the exact branch and commit, files changed, tests actually run with their outcomes, remaining blockers, and whether production was untouched. Do not ask the user to perform technical steps unless a genuine account permission or approval action is required.
