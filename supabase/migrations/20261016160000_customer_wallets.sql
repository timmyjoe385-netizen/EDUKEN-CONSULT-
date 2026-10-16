-- EDUKEN customer wallets. Forward-only; do not apply to production without release approval.
-- Wallets are internal service credits, not withdrawable cash.
-- All balance-changing operations are server-only SECURITY DEFINER RPCs and run atomically.

alter table public.payments
  add column if not exists payment_type text not null default 'service',
  add column if not exists idempotency_key text;

alter table public.payments
  drop constraint if exists payments_payment_type_check;
alter table public.payments
  add constraint payments_payment_type_check
  check (payment_type in ('service', 'wallet_deposit', 'wallet_service'));

-- The existing payments_payment_reference_key constraint already enforces unique references.

create unique index if not exists payments_user_idempotency_key_unique
  on public.payments (user_id, idempotency_key)
  where idempotency_key is not null;

create table if not exists public.customer_wallets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  balance numeric(12,2) not null default 0 check (balance >= 0),
  currency text not null default 'NGN' check (currency = 'NGN'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.wallet_transactions (
  id uuid primary key default gen_random_uuid(),
  wallet_id uuid not null references public.customer_wallets(id) on delete restrict,
  user_id uuid not null references auth.users(id) on delete restrict,
  transaction_type text not null check (transaction_type in ('deposit', 'service_payment', 'refund')),
  amount numeric(12,2) not null check (amount > 0),
  balance_after numeric(12,2) not null check (balance_after >= 0),
  idempotency_key text not null,
  payment_id uuid references public.payments(id) on delete restrict,
  service_request_id uuid references public.service_requests(id) on delete restrict,
  description text not null,
  created_at timestamptz not null default now(),
  constraint wallet_transactions_user_idempotency_unique unique (user_id, idempotency_key)
);

create unique index if not exists wallet_transactions_payment_id_unique
  on public.wallet_transactions (payment_id)
  where payment_id is not null;
create index if not exists wallet_transactions_user_created_idx
  on public.wallet_transactions (user_id, created_at desc);

alter table public.customer_wallets enable row level security;
alter table public.wallet_transactions enable row level security;
revoke all on public.customer_wallets from anon, authenticated;
revoke all on public.wallet_transactions from anon, authenticated;
grant select, insert, update, delete on public.customer_wallets to service_role;
grant select, insert, update, delete on public.wallet_transactions to service_role;

create or replace function public.create_customer_wallet_for_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.customer_wallets (user_id)
  values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

revoke all on function public.create_customer_wallet_for_new_user() from public, anon, authenticated;
drop trigger if exists auth_user_create_customer_wallet on auth.users;
create trigger auth_user_create_customer_wallet
after insert on auth.users
for each row execute function public.create_customer_wallet_for_new_user();

-- Backfill zero-balance wallets for existing registered customers.
insert into public.customer_wallets (user_id)
select id from auth.users
on conflict (user_id) do nothing;

create or replace function public.settle_customer_wallet_deposit(
  p_payment_id uuid,
  p_reference text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_payment public.payments%rowtype;
  v_wallet public.customer_wallets%rowtype;
  v_existing public.wallet_transactions%rowtype;
begin
  select * into v_payment
  from public.payments
  where id = p_payment_id
  for update;

  if not found
     or v_payment.payment_type <> 'wallet_deposit'
     or v_payment.user_id is null
     or v_payment.payment_reference is distinct from p_reference
     or v_payment.currency <> 'NGN'
     or v_payment.amount <= 0 then
    raise exception 'WALLET_DEPOSIT_INVALID';
  end if;

  select * into v_existing
  from public.wallet_transactions
  where user_id = v_payment.user_id
    and idempotency_key = 'paystack:' || p_reference;

  if v_payment.status = 'Paid' then
    if not found and v_existing.id is null then
      raise exception 'WALLET_DEPOSIT_LEDGER_MISSING';
    end if;
    select * into v_wallet from public.customer_wallets where user_id = v_payment.user_id;
    if not found then raise exception 'WALLET_DEPOSIT_WALLET_MISSING'; end if;
    return jsonb_build_object('paid', true, 'balance', v_wallet.balance, 'reused', true);
  end if;

  if v_payment.status not in ('Pending', 'Failed') then
    raise exception 'WALLET_DEPOSIT_NOT_SETTLEABLE';
  end if;

  insert into public.customer_wallets (user_id)
  values (v_payment.user_id)
  on conflict (user_id) do nothing;

  select * into v_wallet
  from public.customer_wallets
  where user_id = v_payment.user_id
  for update;

  update public.customer_wallets
  set balance = balance + v_payment.amount, updated_at = now()
  where id = v_wallet.id
  returning * into v_wallet;

  update public.payments
  set status = 'Paid', paid_at = now()
  where id = v_payment.id;

  insert into public.wallet_transactions (
    wallet_id, user_id, transaction_type, amount, balance_after,
    idempotency_key, payment_id, description
  ) values (
    v_wallet.id, v_payment.user_id, 'deposit', v_payment.amount, v_wallet.balance,
    'paystack:' || p_reference, v_payment.id, 'Wallet deposit via Paystack'
  );

  return jsonb_build_object('paid', true, 'balance', v_wallet.balance, 'reused', false);
end;
$$;

create or replace function public.pay_service_from_customer_wallet(
  p_user_id uuid,
  p_service_request_id uuid,
  p_idempotency_key text,
  p_payment_reference text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_request public.service_requests%rowtype;
  v_service public.services%rowtype;
  v_wallet public.customer_wallets%rowtype;
  v_existing public.wallet_transactions%rowtype;
  v_amount numeric(12,2);
  v_payment_id uuid;
begin
  if p_user_id is null
     or p_service_request_id is null
     or p_idempotency_key is null
     or length(p_idempotency_key) < 8
     or length(p_idempotency_key) > 200
     or p_payment_reference !~ '^EDK-WAL-[A-Z0-9]{18}$' then
    raise exception 'WALLET_PAYMENT_INVALID';
  end if;

  select * into v_existing
  from public.wallet_transactions
  where user_id = p_user_id and idempotency_key = p_idempotency_key;

  if found then
    select balance into v_amount from public.customer_wallets where user_id = p_user_id;
    return jsonb_build_object(
      'paid', true, 'balance', v_amount, 'reused', true, 'transaction_id', v_existing.id,
      'payment_reference', (select payment_reference from public.payments where id = v_existing.payment_id),
      'amount', v_existing.amount
    );
  end if;

  select * into v_request
  from public.service_requests
  where id = p_service_request_id and user_id = p_user_id
  for update;

  if not found or v_request.service_id is null then
    raise exception 'WALLET_SERVICE_REQUEST_NOT_FOUND';
  end if;
  if v_request.status = 'Paid' then
    -- A concurrent retry may have waited for the first wallet payment to commit.
    -- Return that committed result instead of reporting a false failure or debiting again.
    select * into v_existing
    from public.wallet_transactions
    where user_id = p_user_id and idempotency_key = p_idempotency_key;
    if found then
      select balance into v_amount from public.customer_wallets where user_id = p_user_id;
      return jsonb_build_object(
        'paid', true, 'balance', v_amount, 'reused', true,
        'transaction_id', v_existing.id,
        'payment_reference', (select payment_reference from public.payments where id = v_existing.payment_id),
        'amount', v_existing.amount
      );
    end if;
    raise exception 'SERVICE_REQUEST_ALREADY_PAID';
  end if;

  select * into v_service
  from public.services
  where id = v_request.service_id
    and is_published = true
    and is_available = true;

  if not found or v_service.price is null or v_service.price <= 0 then
    raise exception 'WALLET_SERVICE_NOT_PAYABLE';
  end if;

  if coalesce(v_request.quantity, 1) < 1
     or coalesce(v_request.quantity, 1) > 100
     or (coalesce(v_request.quantity, 1) > 1 and v_service.is_catalog_item is distinct from true) then
    raise exception 'WALLET_SERVICE_QUANTITY_INVALID';
  end if;

  v_amount := round(v_service.price * coalesce(v_request.quantity, 1), 2);
  if v_amount <= 0 then raise exception 'WALLET_SERVICE_NOT_PAYABLE'; end if;

  insert into public.customer_wallets (user_id)
  values (p_user_id)
  on conflict (user_id) do nothing;

  select * into v_wallet
  from public.customer_wallets
  where user_id = p_user_id
  for update;

  if v_wallet.balance < v_amount then
    raise exception 'WALLET_INSUFFICIENT_FUNDS';
  end if;

  update public.customer_wallets
  set balance = balance - v_amount, updated_at = now()
  where id = v_wallet.id
  returning * into v_wallet;

  insert into public.payments (
    user_id, service_request_id, amount, currency, status, payment_reference,
    paid_at, payment_type, idempotency_key
  ) values (
    p_user_id, v_request.id, v_amount, 'NGN', 'Paid', p_payment_reference,
    now(), 'wallet_service', p_idempotency_key
  )
  returning id into v_payment_id;

  insert into public.wallet_transactions (
    wallet_id, user_id, transaction_type, amount, balance_after,
    idempotency_key, payment_id, service_request_id, description
  ) values (
    v_wallet.id, p_user_id, 'service_payment', v_amount, v_wallet.balance,
    p_idempotency_key, v_payment_id, v_request.id, 'Payment for ' || v_service.name
  ) returning * into v_existing;

  update public.service_requests
  set status = 'Paid', updated_at = now()
  where id = v_request.id and user_id = p_user_id;

  return jsonb_build_object(
    'paid', true, 'balance', v_wallet.balance, 'reused', false,
    'transaction_id', v_existing.id, 'payment_reference', p_payment_reference,
    'amount', v_amount
  );
end;
$$;

create or replace function public.refund_customer_wallet_service_payment(
  p_payment_id uuid,
  p_reason text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $
declare
  v_payment public.payments%rowtype;
  v_wallet public.customer_wallets%rowtype;
  v_existing public.wallet_transactions%rowtype;
begin
  if p_payment_id is null or length(trim(coalesce(p_reason, ''))) < 4 or length(trim(coalesce(p_reason, ''))) > 200 then
    raise exception 'WALLET_REFUND_INVALID';
  end if;

  select * into v_payment
  from public.payments
  where id = p_payment_id
  for update;

  if not found or v_payment.payment_type <> 'wallet_service' or v_payment.user_id is null then
    raise exception 'WALLET_REFUND_NOT_ALLOWED';
  end if;

  select * into v_existing
  from public.wallet_transactions
  where user_id = v_payment.user_id
    and idempotency_key = 'wallet-refund:' || v_payment.id;

  if found then
    select * into v_wallet from public.customer_wallets where user_id = v_payment.user_id;
    if not found then raise exception 'WALLET_REFUND_WALLET_MISSING'; end if;
    return jsonb_build_object('refunded', true, 'balance', v_wallet.balance, 'reused', true, 'transaction_id', v_existing.id);
  end if;
  if v_payment.status <> 'Paid' then
    raise exception 'WALLET_REFUND_NOT_ALLOWED';
  end if;

  select * into v_wallet
  from public.customer_wallets
  where user_id = v_payment.user_id
  for update;
  if not found then raise exception 'WALLET_REFUND_WALLET_MISSING'; end if;

  update public.customer_wallets
  set balance = balance + v_payment.amount, updated_at = now()
  where id = v_wallet.id
  returning * into v_wallet;

  insert into public.wallet_transactions (
    wallet_id, user_id, transaction_type, amount, balance_after,
    idempotency_key, service_request_id, description
  ) values (
    v_wallet.id, v_payment.user_id, 'refund', v_payment.amount, v_wallet.balance,
    'wallet-refund:' || v_payment.id, v_payment.service_request_id,
    'Wallet refund for ' || coalesce(v_payment.payment_reference, v_payment.id::text) || ': ' || trim(p_reason)
  ) returning * into v_existing;

  update public.payments set status = 'Refunded' where id = v_payment.id;

  return jsonb_build_object('refunded', true, 'balance', v_wallet.balance, 'reused', false, 'transaction_id', v_existing.id);
end;
$;

revoke all on function public.settle_customer_wallet_deposit(uuid, text) from public, anon, authenticated;
revoke all on function public.pay_service_from_customer_wallet(uuid, uuid, text, text) from public, anon, authenticated;
revoke all on function public.refund_customer_wallet_service_payment(uuid, text) from public, anon, authenticated;
grant execute on function public.settle_customer_wallet_deposit(uuid, text) to service_role;
grant execute on function public.pay_service_from_customer_wallet(uuid, uuid, text, text) to service_role;
grant execute on function public.refund_customer_wallet_service_payment(uuid, text) to service_role;

comment on table public.customer_wallets is
  'EDUKEN internal NGN service-credit wallets; balances change only through server-side atomic functions.';
comment on table public.wallet_transactions is
  'Append-only wallet audit ledger; amount is positive and transaction_type determines credit/debit direction.';
