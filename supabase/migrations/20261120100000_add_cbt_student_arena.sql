-- EDUKEN CBT Student Arena: free student handles and server-derived leaderboard scores.
-- Guest practice remains available. Only authenticated students who claim a username
-- are eligible for public ranking. All writes are performed by the trusted Edge Function.

create table if not exists public.cbt_student_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  username text not null,
  username_normalized text generated always as (lower(username)) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint cbt_student_profiles_username_format check (
    username ~ '^[A-Za-z0-9_]{3,20}$'
  ),
  constraint cbt_student_profiles_username_normalized_unique unique (username_normalized)
);

create table if not exists public.cbt_attempt_subject_scores (
  id uuid primary key default gen_random_uuid(),
  attempt_session_id uuid not null references public.cbt_attempt_sessions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  mode text not null check (mode in ('practice','mock')),
  subject text not null check (length(trim(subject)) between 1 and 120),
  score integer not null check (score >= 0),
  total integer not null check (total > 0 and score <= total),
  duration_seconds integer check (duration_seconds is null or duration_seconds >= 0),
  submitted_at timestamptz not null,
  created_at timestamptz not null default now(),
  constraint cbt_attempt_subject_scores_unique unique (attempt_session_id, subject)
);

create index if not exists cbt_attempt_subject_scores_rank_idx
  on public.cbt_attempt_subject_scores (subject, submitted_at desc, score desc, total desc);
create index if not exists cbt_attempt_subject_scores_user_idx
  on public.cbt_attempt_subject_scores (user_id, submitted_at desc);

alter table public.cbt_student_profiles enable row level security;
alter table public.cbt_attempt_subject_scores enable row level security;
revoke all on public.cbt_student_profiles from public, anon, authenticated;
revoke all on public.cbt_attempt_subject_scores from public, anon, authenticated;
grant select, insert, update, delete on public.cbt_student_profiles to service_role;
grant select, insert, update, delete on public.cbt_attempt_subject_scores to service_role;

-- Return only public-safe username and score fields. Real names, email addresses,
-- phone numbers, auth IDs and profile data are never part of this result.
create or replace function public.cbt_student_leaderboard(
  p_scope text,
  p_subject text default null,
  p_period text default 'week',
  p_limit integer default 50,
  p_offset integer default 0
)
returns table (
  rank bigint,
  username text,
  score integer,
  total integer,
  percentage numeric,
  duration_seconds integer,
  submitted_at timestamptz,
  participant_count bigint
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_scope not in ('national','subject') then
    raise exception 'Invalid leaderboard scope';
  end if;
  if p_period not in ('week','all-time') then
    raise exception 'Invalid leaderboard period';
  end if;
  if p_scope = 'subject' and (p_subject is null or length(trim(p_subject)) = 0) then
    raise exception 'Subject is required';
  end if;
  if p_limit < 1 or p_limit > 100 or p_offset < 0 then
    raise exception 'Invalid pagination';
  end if;

  if p_scope = 'national' then
    return query
    with eligible as (
      select a.user_id, a.score, a.total, a.duration_seconds, a.submitted_at,
             row_number() over (
               partition by a.user_id
               order by (a.score::numeric / nullif(a.total,0)) desc,
                        a.score desc, a.duration_seconds asc nulls last, a.submitted_at asc
             ) as personal_choice
      from public.cbt_attempts a
      join public.cbt_student_profiles p on p.user_id = a.user_id
      where a.user_id is not null and a.mode = 'mock' and a.total = 180
        and (p_period = 'all-time' or a.submitted_at >= date_trunc('week', now()))
    ), best as (
      select e.* from eligible e where e.personal_choice = 1
    ), ranked as (
      select row_number() over (
               order by (b.score::numeric / nullif(b.total,0)) desc,
                        b.score desc, b.duration_seconds asc nulls last, b.submitted_at asc
             ) as position,
             p.username, b.score, b.total,
             round((b.score::numeric / nullif(b.total,0)) * 100, 2) as pct,
             b.duration_seconds, b.submitted_at,
             count(*) over () as total_people
      from best b join public.cbt_student_profiles p on p.user_id = b.user_id
    )
    select r.position, r.username, r.score, r.total, r.pct, r.duration_seconds,
           r.submitted_at, r.total_people
    from ranked r
    order by r.position
    limit p_limit offset p_offset;
  else
    return query
    with eligible as (
      select s.user_id, s.score, s.total, s.duration_seconds, s.submitted_at,
             row_number() over (
               partition by s.user_id
               order by (s.score::numeric / nullif(s.total,0)) desc,
                        s.score desc, s.duration_seconds asc nulls last, s.submitted_at asc
             ) as personal_choice
      from public.cbt_attempt_subject_scores s
      join public.cbt_student_profiles p on p.user_id = s.user_id
      where s.subject = p_subject and s.total >= 20
        and (p_period = 'all-time' or s.submitted_at >= date_trunc('week', now()))
    ), best as (
      select e.* from eligible e where e.personal_choice = 1
    ), ranked as (
      select row_number() over (
               order by (b.score::numeric / nullif(b.total,0)) desc,
                        b.score desc, b.duration_seconds asc nulls last, b.submitted_at asc
             ) as position,
             p.username, b.score, b.total,
             round((b.score::numeric / nullif(b.total,0)) * 100, 2) as pct,
             b.duration_seconds, b.submitted_at,
             count(*) over () as total_people
      from best b join public.cbt_student_profiles p on p.user_id = b.user_id
    )
    select r.position, r.username, r.score, r.total, r.pct, r.duration_seconds,
           r.submitted_at, r.total_people
    from ranked r
    order by r.position
    limit p_limit offset p_offset;
  end if;
end;
$$;

revoke all on function public.cbt_student_leaderboard(text,text,text,integer,integer) from public, anon, authenticated;
grant execute on function public.cbt_student_leaderboard(text,text,text,integer,integer) to service_role;
