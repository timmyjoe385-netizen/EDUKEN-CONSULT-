-- Server-graded CBT result summaries for signed-in student progress history.
create table if not exists public.cbt_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  mode text not null check (mode in ('practice','mock')),
  subject text not null check (length(trim(subject)) between 1 and 120),
  score integer not null check (score >= 0),
  total integer not null check (total > 0),
  duration_seconds integer check (duration_seconds is null or duration_seconds >= 0),
  submitted_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  attempt_session_id uuid unique references public.cbt_attempt_sessions(id) on delete set null,
  check (score <= total)
);
create index if not exists cbt_attempts_user_submitted_idx on public.cbt_attempts (user_id, submitted_at desc) where user_id is not null;
alter table public.cbt_attempts enable row level security;
revoke all on public.cbt_attempts from anon, authenticated;
grant select, insert, update, delete on public.cbt_attempts to service_role;
