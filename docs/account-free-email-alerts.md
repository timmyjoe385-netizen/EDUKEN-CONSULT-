# Account-free email alerts and deadline reminders

## Implemented in this branch

- Public subscription UI with category selection and no account/password requirement.
- Server-side email and topic validation.
- Subscription creation/update with hashed one-time verification tokens and HMAC-derived unsubscribe tokens stored only as hashes.
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
- `EMAIL_ALERTS_CRON_SECRET` — a separate random secret of at least 32 characters required by the internal delivery processor. Configure the same value as the GitHub repository secret `EDUKEN_EMAIL_ALERTS_CRON_SECRET`; never reuse the Resend API key.

The public subscription and verification endpoints require rate limiting to be available. The internal delivery processor also returns a clear `503` until its required Edge Function secrets and email provider configuration are present. Do not add fake credentials or send mail during automated browser tests.

## Still required before enabling the feature

- Apply the migration only after schema review and explicit production approval.
- Configure and verify the sender domain in Resend.
- A GitHub Actions scheduler is included at `.github/workflows/email-alert-delivery.yml`. After the migration and function are approved/deployed, configure repository secrets `EDUKEN_EMAIL_ALERTS_PROCESS_URL` (full HTTPS URL ending in `/api/internal/email-alerts/process`) and `EDUKEN_EMAIL_ALERTS_CRON_SECRET` (at least 32 characters). The processor handles up to 25 due deliveries per invocation and retries temporary failures up to five attempts.
- The scheduled workflow intentionally does nothing until both repository secrets exist. Do not configure them until the database migration, Supabase function secrets and sender-domain verification are approved.
- Add operational monitoring and an alert for repeatedly failing delivery jobs.
- An atomic database-backed rate limiter is included in the feature migration: five subscription, consultation, or service-request submissions per identified client IP and endpoint action per 15 minutes, and 20 verification/unsubscribe attempts per IP per 15 minutes. It stores only hashed action/IP keys, fails closed if rate limiting is unavailable, and has no public table/function permissions. Consultation and service-request protection depends on this migration being applied before the corresponding API code is deployed.
- Test against a dedicated inbox, then review all checks before production deployment.

## Security and deployment boundary

Verification tokens are never stored in plaintext in the database. Unsubscribe tokens are deterministically derived with HMAC from the subscription ID and `EMAIL_ALERTS_TOKEN_SECRET`; only their SHA-256 hashes are stored. Keep that secret stable to preserve existing unsubscribe links. The public UI removes one-time query tokens from the address bar before calling the API. Subscriber data and token hashes are not exposed through public database policies. This migration is not applied by this branch and the Edge Function is not deployed to production by CI.
