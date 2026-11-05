// Client-side write guard. This is defense in depth; server-side authorization remains required.
export const PRODUCTION_ORIGIN = 'https://eduken-consult.timmyjoe385.workers.dev';
export const PRODUCTION_SUPABASE_URL = 'https://pphxltbkwygqjtjgkhxu.supabase.co';

// Resolve preview deployments to the isolated test project when Cloudflare's
// branch-preview build does not inject Vite environment variables.
export const resolveSupabaseBackend = ({
  origin,
  suppliedUrl,
  suppliedKey,
  productionUrl,
  productionKey,
  previewUrl,
  previewKey,
}) => {
  const trimTrailingSlashes = (value) => {
    let result = String(value || '').trim();
    while (result.endsWith('/')) result = result.slice(0, -1);
    return result;
  };
  const url = trimTrailingSlashes(suppliedUrl);
  const key = String(suppliedKey || '').trim();
  if (url && key) {
    return {
      url,
      key,
      explicit: true,
      isolated: url !== productionUrl && key !== productionKey,
    };
  }

  if (origin === PRODUCTION_ORIGIN) {
    return { url: productionUrl, key: productionKey, explicit: false, isolated: false };
  }

  return {
    url: trimTrailingSlashes(previewUrl),
    key: String(previewKey || '').trim(),
    explicit: false,
    isolated: true,
  };
};

const READ_ONLY_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

export const shouldBlockWrite = (origin, method = 'GET', options = {}) => {
  if (READ_ONLY_METHODS.has(String(method || 'GET').toUpperCase())) return false;

  const configuredUrl = String(options.supabaseUrl || PRODUCTION_SUPABASE_URL).replace(/\/+$/, '');
  const isProductionBackend = configuredUrl === PRODUCTION_SUPABASE_URL;

  // Never let the production site write to a non-production database.
  if (origin === PRODUCTION_ORIGIN) return !isProductionBackend;

  // Preview writes require an explicit build-time opt-in and a non-production backend.
  // If preview secrets are missing, only CBT endpoints may use the isolated preview backend; other writes stay blocked.
  return !(options.allowTestWrites === true && !isProductionBackend);
};
