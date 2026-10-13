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
- `EMAIL_ALERTS_TOKEN_SECRET` — a stable secret of at least 32 characters used to derive revocable unsubscribe tokens. Keep it unchanged after subscriptions exist.

The feature intentionally returns a clear `503` until all three values are configured. Do not add fake credentials or send mail during automated browser tests.

## Still required before enabling the feature

- Apply the migration only after schema review and explicit production approval.
- Configure and verify the sender domain in Resend.
- Configure a trusted external scheduler to call `POST /api/internal/email-alerts/process` with `Authorization: Bearer <EMAIL_ALERTS_CRON_SECRET>`; `EMAIL_ALERTS_CRON_SECRET` must be at least 32 characters. The processor handles up to 25 due deliveries per invocation and retries temporary failures up to five attempts.
- Schedule the processor at a short interval only after migration, provider secrets and sender-domain verification are approved.
- Queue events idempotently, honor publication/source/notification eligibility, and reschedule or cancel reminders when content changes.
- Add delivery retry/backoff, attempt limits, provider message ID storage and operational monitoring.
- Add rate limiting/abuse controls for public subscription and token endpoints before broad public launch.
- Test against a dedicated inbox, then review all checks before production deployment.

## Security and deployment boundary

Verification tokens are never stored in plaintext in the database. Unsubscribe tokens are deterministically derived with HMAC from the subscription ID and `EMAIL_ALERTS_TOKEN_SECRET`; only their SHA-256 hashes are stored. Keep that secret stable to preserve existing unsubscribe links. The public UI removes one-time query tokens from the address bar before calling the API. Subscriber data and token hashes are not exposed through public database policies. This migration is not applied by this branch and the Edge Function is not deployed to production by CI.
