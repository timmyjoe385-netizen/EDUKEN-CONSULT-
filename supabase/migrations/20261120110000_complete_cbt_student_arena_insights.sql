-- Complete the Student Arena with private per-student progress and public-safe weekly champions.
-- Both functions are service-role-only and return no auth IDs or contact details.

create or replace function public.cbt_student_arena_summary(p_user_id uuid)
returns table (
  username text,
  national_rank bigint,
  best_mock_score integer,
  best_mock_total integer,
  best_mock_percentage numeric,
  attempts_count bigint,
  questions_attempted bigint,
  overall_accuracy numeric,
  recent_accuracy numeric,
  previous_accuracy numeric,
  improvement_percentage_points numeric
)
language sql
security definer
set search_path = ''
as $$
  with profile as (
    select p.username from public.cbt_student_profiles p where p.user_id = p_user_id
  ),
  best_per_student as (
    select distinct on (a.user_id)
      a.user_id, a.score, a.total, a.duration_seconds, a.submitted_at
    from public.cbt_attempts a
    join public.cbt_student_profiles p on p.user_id = a.user_id
    where a.mode = 'mock' and a.total = 180
    order by a.user_id,
      (a.score::numeric / nullif(a.total, 0)) desc,
      a.score desc, a.duration_seconds asc nulls last, a.submitted_at asc
  ),
  national_ranks as (
    select b.user_id,
      row_number() over (
        order by (b.score::numeric / nullif(b.total, 0)) desc,
          b.score desc, b.duration_seconds asc nulls last, b.submitted_at asc
      ) as position
    from best_per_student b
  ),
  recent as (
    select a.score, a.total, a.submitted_at,
      row_number() over (order by a.submitted_at desc, a.id desc) as recency
    from public.cbt_attempts a
    where a.user_id = p_user_id
    order by a.submitted_at desc, a.id desc
    limit 20
  ),
  stats as (
    select count(*) as attempts_count,
      coalesce(sum(total), 0) as questions_attempted,
      case when sum(total) > 0 then round(sum(score)::numeric / sum(total) * 100, 2) else 0 end as overall_accuracy,
      case when sum(total) filter (where recency <= 5) > 0
        then round(sum(score) filter (where recency <= 5)::numeric /
          sum(total) filter (where recency <= 5) * 100, 2) else null end as recent_accuracy,
      case when sum(total) filter (where recency between 6 and 10) > 0
        then round(sum(score) filter (where recency between 6 and 10)::numeric /
          sum(total) filter (where recency between 6 and 10) * 100, 2) else null end as previous_accuracy
    from recent
  ),
  best as (
    select a.score, a.total,
      round(a.score::numeric / nullif(a.total, 0) * 100, 2) as pct
    from public.cbt_attempts a
    where a.user_id = p_user_id and a.mode = 'mock' and a.total = 180
    order by (a.score::numeric / nullif(a.total, 0)) desc,
      a.score desc, a.duration_seconds asc nulls last, a.submitted_at asc
    limit 1
  )
  select profile.username, nr.position,
    best.score, best.total, best.pct,
    stats.attempts_count, stats.questions_attempted, stats.overall_accuracy,
    stats.recent_accuracy, stats.previous_accuracy,
    case when stats.recent_accuracy is not null and stats.previous_accuracy is not null
      then round(stats.recent_accuracy - stats.previous_accuracy, 2) else null end
  from profile
  cross join stats
  left join national_ranks nr on nr.user_id = p_user_id
  left join best on true;
$$;

create or replace function public.cbt_student_weekly_champions()
returns table (
  category text,
  username text,
  score integer,
  total integer,
  percentage numeric,
  detail text,
  attempts_count bigint
)
language sql
security definer
set search_path = ''
as $$
  with weekly as (
    select a.user_id, p.username, a.score, a.total, a.duration_seconds, a.submitted_at,
      round(a.score::numeric / nullif(a.total, 0) * 100, 2) as pct
    from public.cbt_attempts a
    join public.cbt_student_profiles p on p.user_id = a.user_id
    where a.mode = 'mock' and a.total = 180
      and a.submitted_at >= date_trunc('week', now())
  ),
  top_performer as (
    select 'top-performer'::text as category, w.username, w.score, w.total, w.pct as percentage,
      'Highest qualifying mock score this week'::text as detail, 1::bigint as attempts_count
    from weekly w
    order by w.pct desc, w.score desc, w.duration_seconds asc nulls last, w.submitted_at asc
    limit 1
  ),
  per_student as (
    select w.user_id, w.username, count(*)::bigint as attempts_count,
      (array_agg(w.pct order by w.submitted_at asc))[1] as first_pct,
      (array_agg(w.pct order by w.submitted_at desc))[1] as latest_pct,
      (array_agg(w.score order by w.submitted_at desc))[1] as latest_score,
      (array_agg(w.total order by w.submitted_at desc))[1] as latest_total,
      avg(w.pct) as average_pct,
      coalesce(stddev_pop(w.pct), 0) as variation
    from weekly w
    group by w.user_id, w.username
    having count(*) >= 2
  ),
  improved as (
    select 'most-improved'::text as category, p.username,
      p.latest_score as score, p.latest_total as total, p.latest_pct as percentage,
      ('Improved ' || round(p.latest_pct - p.first_pct, 2)::text || ' percentage points across this week')::text as detail,
      p.attempts_count
    from per_student p
    order by (p.latest_pct - p.first_pct) desc, p.latest_pct desc, p.attempts_count desc, p.username asc
    limit 1
  ),
  consistent as (
    select 'most-consistent'::text as category, p.username,
      p.latest_score as score, p.latest_total as total, p.average_pct as percentage,
      ('Average ' || round(p.average_pct, 2)::text || '% across ' || p.attempts_count::text || ' qualifying mocks')::text as detail,
      p.attempts_count
    from per_student p
    order by p.variation asc, p.average_pct desc, p.attempts_count desc, p.username asc
    limit 1
  )
  select * from top_performer
  union all select * from improved
  union all select * from consistent;
$$;

revoke all on function public.cbt_student_arena_summary(uuid) from public, anon, authenticated;
revoke all on function public.cbt_student_weekly_champions() from public, anon, authenticated;
grant execute on function public.cbt_student_arena_summary(uuid) to service_role;
grant execute on function public.cbt_student_weekly_champions() to service_role;
