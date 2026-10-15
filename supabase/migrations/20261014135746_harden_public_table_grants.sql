-- EDUKEN CONSULT: least-privilege grants for public-schema tables.
-- Production migration recorded in Supabase history as version 20261014135746; this file preserves the applied schema change.
-- RLS policies remain the row-level authorization boundary; these grants remove
-- broad table-level privileges that RLS alone does not replace.

-- Remove inherited/default broad privileges from existing public-schema objects.
revoke all privileges on all tables in schema public from public, anon, authenticated;
revoke all privileges on all sequences in schema public from public, anon, authenticated;

-- Prevent future tables/sequences/functions created by postgres from
-- silently inheriting client grants. The live project also has broad defaults
-- for supabase_admin, but postgres is not a member of that role; this migration
-- cannot alter that role's defaults. That remaining owner-level ACL task must
-- be completed separately before claiming default privileges are fully hardened.
-- New client-accessible objects must receive explicit reviewed grants.
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

-- Public catalogue: RLS limits rows to published content, while column-level
-- grants prevent direct PostgREST clients from reading internal editorial fields.
-- In particular, opportunities.notify_on_publish must remain admin-only.
revoke select (notify_on_publish) on table public.opportunities from public, anon, authenticated;

grant select (
  id, title, slug, category, description, organization, location, deadline,
  application_url, official_source, is_published, created_at, updated_at,
  verified, featured, urgent, content, eligibility, benefits, how_to_apply
) on table public.opportunities to anon, authenticated;

grant select (
  id, title, school, programme, category, description, deadline, application_url,
  official_source, is_published, created_at, updated_at
) on table public.admissions to anon, authenticated;

grant select (
  id, title, category, content, source, source_url, is_published, created_at, updated_at
) on table public.updates to anon, authenticated;

-- is_published is needed to evaluate the RLS policy but is not returned by the
-- public-content API; only explicitly listed columns are readable to clients.
grant select (id, question, answer, category, is_published, created_at, updated_at)
  on table public.faqs to anon, authenticated;

grant select (
  id, name, category, description, price, is_published, created_at, updated_at
) on table public.services to anon, authenticated;

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
-- Remove the legacy public INSERT policy as defense in depth: a policy alone does
-- not grant table privileges, but leaving it in place can become unsafe if a later
-- grant accidentally restores direct client access. The Edge Function uses the
-- service_role server credential and does not depend on this client-facing policy.
drop policy if exists "Anyone can submit a consultation" on public.consultations;
-- Remove the legacy authenticated INSERT path too. Its user_id IS NULL
-- branch allows signed-in clients to submit anonymous-style requests directly,
-- bypassing Edge Function validation and the database-backed rate limiter.
drop policy if exists "Users can create service requests" on public.service_requests;

-- Intentionally no direct client table grants for consultations or other tables.
-- Public forms and admin CRUD are handled by the server-side Edge Function,
-- which authenticates callers and validates payloads.
