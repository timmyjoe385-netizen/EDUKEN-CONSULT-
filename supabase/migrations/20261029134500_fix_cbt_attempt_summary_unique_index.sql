-- Ensure PostgreSQL can infer the idempotency conflict target used by PostgREST upsert.
drop index if exists public.cbt_attempts_attempt_session_id_uidx;
create unique index cbt_attempts_attempt_session_id_uidx
  on public.cbt_attempts (attempt_session_id);
