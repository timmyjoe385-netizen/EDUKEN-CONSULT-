-- Cover the admin settings updater foreign key to avoid scans when an auth user is deleted/updated.
-- Index-only change: does not alter rows, policies, grants, or production configuration.
create index if not exists admin_system_settings_updated_by_idx
  on public.admin_system_settings (updated_by);
