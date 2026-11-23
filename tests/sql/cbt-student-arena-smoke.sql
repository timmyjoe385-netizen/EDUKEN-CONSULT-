-- Rollback-only Student Arena migration and RPC integration checks.
begin;

insert into auth.users (id, email) values
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1', 'arena-top@example.test'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2', 'arena-improved@example.test'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3', 'arena-consistent@example.test');

insert into public.cbt_student_profiles (user_id, username) values
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1', 'arena_top'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2', 'arena_improved'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3', 'arena_consistent');

-- Anchor fixtures inside the current week. Hour offsets from now() can cross
-- the Monday week boundary when CI runs shortly after midnight UTC.
insert into public.cbt_attempts (user_id, mode, subject, score, total, duration_seconds, submitted_at) values
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1', 'mock', 'Mixed mock', 170, 180, 7000, date_trunc('week', now()) + interval '90 minutes'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2', 'mock', 'Mixed mock', 120, 180, 7100, date_trunc('week', now()) + interval '1 hour'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2', 'mock', 'Mixed mock', 150, 180, 7000, date_trunc('week', now()) + interval '2 hours'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3', 'mock', 'Mixed mock', 145, 180, 7050, date_trunc('week', now()) + interval '1 hour'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3', 'mock', 'Mixed mock', 146, 180, 7040, date_trunc('week', now()) + interval '2 hours');

do $$
declare
  summary record;
  champions record;
  top_name text;
  improved_name text;
  consistent_name text;
  champion_count integer;
begin
  select * into summary
  from public.cbt_student_arena_summary('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2');

  if summary.username <> 'arena_improved' then raise exception 'Student summary returned the wrong username'; end if;
  if summary.national_rank <> 2 then raise exception 'Expected national rank 2, received %', summary.national_rank; end if;
  if summary.best_mock_score <> 150 or summary.best_mock_total <> 180 then raise exception 'Best mock score was not selected correctly'; end if;
  if summary.attempts_count <> 2 or summary.questions_attempted <> 360 then raise exception 'Attempt history totals are incorrect'; end if;
  if summary.overall_accuracy <> 75.00 then raise exception 'Overall accuracy should be 75%%, received %', summary.overall_accuracy; end if;

  select count(*) into champion_count from public.cbt_student_weekly_champions();
  if champion_count <> 3 then raise exception 'Expected 3 weekly champion categories, received %', champion_count; end if;

  select username into top_name from public.cbt_student_weekly_champions() where category = 'top-performer';
  select username into improved_name from public.cbt_student_weekly_champions() where category = 'most-improved';
  select username into consistent_name from public.cbt_student_weekly_champions() where category = 'most-consistent';

  if top_name <> 'arena_top' then raise exception 'Top performer selection is incorrect: %', top_name; end if;
  if improved_name <> 'arena_improved' then raise exception 'Most improved selection is incorrect: %', improved_name; end if;
  if consistent_name <> 'arena_consistent' then raise exception 'Most consistent selection is incorrect: %', consistent_name; end if;

  if has_function_privilege('anon', 'public.cbt_student_arena_summary(uuid)', 'EXECUTE') then raise exception 'anon must not execute personal summary RPC'; end if;
  if has_function_privilege('authenticated', 'public.cbt_student_arena_summary(uuid)', 'EXECUTE') then raise exception 'authenticated must not execute personal summary RPC directly'; end if;
  if not has_function_privilege('service_role', 'public.cbt_student_arena_summary(uuid)', 'EXECUTE') then raise exception 'service_role must execute personal summary RPC'; end if;
  if has_function_privilege('anon', 'public.cbt_student_weekly_champions()', 'EXECUTE') then raise exception 'anon must not execute champions RPC directly'; end if;
  if not has_function_privilege('service_role', 'public.cbt_student_weekly_champions()', 'EXECUTE') then raise exception 'service_role must execute champions RPC'; end if;
end $$;

rollback;
