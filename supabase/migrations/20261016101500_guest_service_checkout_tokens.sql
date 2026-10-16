-- Guest checkout uses a high-entropy capability token. Store only its SHA-256 hash.
-- This forward-only migration is included in the PR; it has not been applied to production.
alter table public.service_requests
  add column if not exists checkout_token_hash text;

comment on column public.service_requests.checkout_token_hash is
  'SHA-256 hash of a high-entropy guest checkout token; never store the raw token.';
