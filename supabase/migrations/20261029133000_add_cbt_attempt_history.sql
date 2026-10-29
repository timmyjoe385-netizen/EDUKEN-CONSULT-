-- Signed-in student CBT attempt history. Apply to isolated test project first.
create table if not exists public.cbt_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  mode text not null check (mode in ('practice','mock')),
  subject text not null check (length(trim(subject)) between 1 and 120),
  score integer not null check (score >= 0),
  total integer not null check (total > 0 and score <= total),
  duration_seconds integer check (duration_seconds is null or duration_seconds >= 0),
  submitted_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index if not exists cbt_attempts_user_submitted_idx
  on public.cbt_attempts (user_id, submitted_at desc);
alter table public.cbt_attempts enable row level security;
revoke all on public.cbt_attempts from anon, authenticated;
grant select, insert on public.cbt_attempts to service_role;
