-- Persisted administrator-only global controls, independent of editorial content rows.
create table if not exists public.admin_system_settings (
  id text primary key check (id = 'global'),
  settings jsonb not null default '{"subscriberNotificationsEnabled":true,"deadlineEmailAlertsEnabled":true,"defaultNotifyOnPublish":false}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);

alter table public.admin_system_settings enable row level security;
revoke all on table public.admin_system_settings from anon, authenticated;
grant all on table public.admin_system_settings to service_role;

insert into public.admin_system_settings (id, settings)
values ('global', '{"subscriberNotificationsEnabled":true,"deadlineEmailAlertsEnabled":true,"defaultNotifyOnPublish":false}'::jsonb)
on conflict (id) do nothing;
