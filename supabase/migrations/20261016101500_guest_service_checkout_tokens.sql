-- Guest checkout uses a high-entropy capability token. Store only its SHA-256 hash.
-- This forward-only migration is included in the PR; it has not been applied to production.
alter table public.service_requests
  add column if not exists checkout_token_hash text,
  add column if not exists quantity integer not null default 1;

alter table public.service_requests
  drop constraint if exists service_requests_quantity_range;
alter table public.service_requests
  add constraint service_requests_quantity_range check (quantity between 1 and 100);

comment on column public.service_requests.quantity is
  'Requested quantity for catalogue services; server validates the range and uses the published unit price.';

comment on column public.service_requests.checkout_token_hash is
  'SHA-256 hash of a high-entropy guest checkout token; never store the raw token.';

-- Reuse the same provider checkout URL for repeated requests and prevent concurrent pending attempts.
alter table public.payments
  add column if not exists authorization_url text;

comment on column public.payments.authorization_url is
  'Paystack checkout URL for a pending payment; only the server returns it after request-token validation.';

create unique index if not exists payments_one_pending_per_service_request_idx
  on public.payments (service_request_id)
  where service_request_id is not null and status = 'Pending';
