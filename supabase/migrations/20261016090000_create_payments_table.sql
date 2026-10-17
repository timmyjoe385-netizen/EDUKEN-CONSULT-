-- EDUKEN CONSULT: reproducible payment ledger schema.
-- Safe to run when the table already exists: preserve existing rows and add
-- only missing columns, constraints, indexes, and policy. Never inserts or changes payment rows.

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid null references auth.users(id) on delete set null,
  service_request_id uuid null references public.service_requests(id) on delete set null,
  amount numeric not null,
  currency text not null default 'NGN',
  status text not null default 'Pending',
  payment_reference text unique,
  authorization_url text null,
  paid_at timestamptz null,
  created_at timestamptz not null default now()
);

-- Keep the migration safe for databases where the ledger was created manually.
alter table public.payments
  add column if not exists authorization_url text;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.payments'::regclass
      and conname = 'payments_user_id_fkey'
  ) then
    alter table public.payments
      add constraint payments_user_id_fkey
      foreign key (user_id) references auth.users(id) on delete set null;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.payments'::regclass
      and conname = 'payments_service_request_id_fkey'
  ) then
    alter table public.payments
      add constraint payments_service_request_id_fkey
      foreign key (service_request_id) references public.service_requests(id) on delete set null;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.payments'::regclass
      and conname = 'payments_payment_reference_key'
  ) then
    alter table public.payments
      add constraint payments_payment_reference_key unique (payment_reference);
  end if;
end
$$;

create index if not exists payments_service_request_id_idx
  on public.payments (service_request_id);
create index if not exists payments_user_id_idx
  on public.payments (user_id);

alter table public.payments enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'payments'
      and policyname = 'Users can view their payments'
  ) then
    create policy "Users can view their payments"
      on public.payments for select to authenticated
      using ((select auth.uid()) = user_id);
  end if;
end
$$;

-- The Edge Function uses service_role for server-side checkout operations.
grant select on table public.payments to authenticated;
grant select, insert, update on table public.payments to service_role;

comment on column public.payments.authorization_url is
  'Paystack checkout URL for a pending payment; only the server returns it after request-token validation.';
