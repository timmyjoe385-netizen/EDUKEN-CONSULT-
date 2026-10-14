-- EDUKEN CONSULT: least-privilege grants for public-schema tables.
-- Apply only with the matching Edge Function/API release after staging regression tests.
-- RLS policies remain the row-level authorization boundary; these grants remove
-- broad table-level privileges that RLS alone does not replace.

-- Remove inherited/default broad privileges from existing public-schema objects.
revoke all privileges on all tables in schema public from public, anon, authenticated;
revoke all privileges on all sequences in schema public from public, anon, authenticated;

-- Also prevent future tables/sequences created by the migration owner (postgres)
-- from silently inheriting client grants. New client-accessible objects must
-- receive explicit grants in their reviewed migration.
alter default privileges for role postgres in schema public
  revoke all privileges on tables from public, anon, authenticated;
alter default privileges for role postgres in schema public
  revoke all privileges on sequences from public, anon, authenticated;

-- Remove direct and PUBLIC-inherited EXECUTE privileges. Revoking only from
-- anon/authenticated is insufficient when PUBLIC has EXECUTE, because every
-- client role inherits that grant. Keep future function defaults least-privilege.
revoke execute on all functions in schema public from public, anon, authenticated;
alter default privileges for role postgres in schema public
  revoke execute on functions from public, anon, authenticated;

-- Public catalogue: anonymous visitors may read rows only; existing RLS policies
-- restrict the rows to published content. The Edge Function uses service_role.
grant select on table
  public.opportunities,
  public.admissions,
  public.updates,
  public.faqs,
  public.services
to anon, authenticated;

-- User-owned workspace tables: grants permit only operations represented by
-- the existing auth.uid() = user_id/id RLS policies.
grant select, insert, update on table public.profiles to authenticated;
grant select, insert, update, delete on table
  public.application_tracker,
  public.saved_opportunities,
  public.topic_subscriptions,
  public.user_reminders
to authenticated;
grant select, update on table public.notifications to authenticated;
grant select on table public.payments to authenticated;
-- Service requests and consultations are written through the validated Edge Function;
-- do not grant direct client inserts, including user_id IS NULL requests.

-- Intentionally no direct client table grants for consultations or other tables.
-- Public forms and admin CRUD are handled by the server-side Edge Function,
-- which authenticates callers and validates payloads.
