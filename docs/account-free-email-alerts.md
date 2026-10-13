# Account-free email alerts and deadline reminders

## Implemented in this branch

- Public subscription UI with category selection and no account/password requirement.
- Server-side email and topic validation.
- Subscription creation/update with SHA-256 hashes for one-time verification and unsubscribe tokens.
- 30-minute verification expiry; inactive until email confirmation succeeds.
- Confirmation email sent through Resend using server-side environment variables.
- Verification and unsubscribe endpoints; unsubscribe also cancels pending delivery queue items.
- Migration defines private subscription and delivery tables with RLS enabled and no public policies.
- Invalid payloads and unconfigured email delivery are rejected without exposing provider credentials or subscriber records.

## Required Edge Function secrets

Configure these through Supabase project secrets, never in the repository or browser:

- `RESEND_API_KEY` — Resend API key.
- `EMAIL_FROM` — a verified sender, for example `EDUKEN CONSULT <alerts@your-verified-domain.example>`.
- `PUBLIC_SITE_URL` — the HTTPS website origin used in verification links.

The feature intentionally returns a clear `503` until all three values are configured. Do not add fake credentials or send mail during automated browser tests.

## Still required before enabling the feature

- Apply the migration only after schema review and explicit production approval.
- Configure and verify the sender domain in Resend.
- Add the scheduled delivery processor for new published opportunities and 7/3/1-day deadline reminders.
- Queue events idempotently, honor publication/source/notification eligibility, and reschedule or cancel reminders when content changes.
- Add delivery retry/backoff, attempt limits, provider message ID storage and operational monitoring.
- Add rate limiting/abuse controls for public subscription and token endpoints.
- Test against a dedicated inbox, then review all checks before production deployment.

## Security and deployment boundary

Tokens are never stored in plaintext in the database. The public UI removes one-time query tokens from the address bar before calling the API. Subscriber data and token hashes are not exposed through public database policies. This migration is not applied by this branch and the Edge Function is not deployed to production by CI.
