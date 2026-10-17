// Client-side write guard. This is defense in depth; server-side authorization remains required.
export const PRODUCTION_ORIGIN = 'https://eduken-consult.timmyjoe385.workers.dev';
export const PRODUCTION_SUPABASE_URL = 'https://pphxltbkwygqjtjgkhxu.supabase.co';

const READ_ONLY_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

export const shouldBlockWrite = (origin, method = 'GET', options = {}) => {
  if (READ_ONLY_METHODS.has(String(method || 'GET').toUpperCase())) return false;

  const configuredUrl = String(options.supabaseUrl || PRODUCTION_SUPABASE_URL).replace(/\/+$/, '');
  const isProductionBackend = configuredUrl === PRODUCTION_SUPABASE_URL;

  // Never let the production site write to a non-production database.
  if (origin === PRODUCTION_ORIGIN) return !isProductionBackend;

  // Preview writes require an explicit build-time opt-in and a non-production backend.
  // If preview secrets are missing, api.ts falls back to production and remains read-only.
  return !(options.allowTestWrites === true && !isProductionBackend);
};
