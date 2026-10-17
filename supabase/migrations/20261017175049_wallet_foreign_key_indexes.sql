-- Add covering indexes for foreign keys used by service checkout and wallet ledger.
-- Safe on existing data; indexes improve lookups and FK checks without changing rows.
create index if not exists service_requests_service_id_idx
  on public.service_requests (service_id);

create index if not exists service_requests_user_id_idx
  on public.service_requests (user_id);

create index if not exists wallet_transactions_service_request_id_idx
  on public.wallet_transactions (service_request_id);

create index if not exists wallet_transactions_wallet_id_idx
  on public.wallet_transactions (wallet_id);
