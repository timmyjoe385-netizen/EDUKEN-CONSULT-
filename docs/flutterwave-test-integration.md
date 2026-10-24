# Flutterwave checkout integration — production rollout

This integration adds guarded Flutterwave checkout while preserving Paystack as the existing payment provider and fallback. The frontend exposes live Flutterwave only when the GitHub Actions repository variable `VITE_ENABLE_FLUTTERWAVE_LIVE=true` is available at build time.

## Production safeguards

- Keep provider secret keys and the Flutterwave webhook hash in Supabase Edge Function secrets only. Never commit or share their values.
- Production webhook endpoint: `/functions/v1/eduken-api/api/flutterwave/payments/webhook`.
- The handler must validate the configured webhook hash, verify transactions with Flutterwave, and match the stored reference, NGN amount, currency, and provider before marking a payment paid.
- Preserve existing Paystack checkout and settlement behavior.
- Do not run a real charge as a smoke test. Use safe negative probes and isolated synthetic test records where possible.
- Do not apply additional production migrations without explicit review and approval.

## Required deployment configuration

- GitHub Actions repository variable: `VITE_ENABLE_FLUTTERWAVE_LIVE=true`.
- Supabase Edge Function secrets are configured directly in the production project; secret values must never be stored in this repository.
- The website build reads the feature flag during `npm run build`; changing the variable alone does not rebuild already-deployed frontend assets. A new successful Cloudflare deployment is required.

## Verification status

- Flutterwave and Paystack backend routes are deployed.
- CI build, wallet migration integration checks, and Playwright browser checks passed for the integration release.
- A successful real Flutterwave transaction has not been performed or verified. Do not describe live payment processing as end-to-end verified until a safe provider-approved verification plan is completed.
