import { shouldBlockWrite, PRODUCTION_SUPABASE_URL } from './api-safety.js';

// Use direct Vite env references so the build statically injects preview-scoped values.
const PRODUCTION_SUPABASE_KEY = 'sb_publishable__qH331oDMJzmjqlOig3C0Q_EIHRa24p';
const suppliedSupabaseUrl = String(import.meta.env.VITE_SUPABASE_URL || '').trim();
const suppliedPublishableKey = String(import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '').trim();
const SUPABASE_URL = (suppliedSupabaseUrl || PRODUCTION_SUPABASE_URL).replace(/\/+$/, '');
const SUPABASE_KEY = suppliedPublishableKey || PRODUCTION_SUPABASE_KEY;
const ALLOW_TEST_WRITES =
  import.meta.env.VITE_ENABLE_TEST_WRITES === 'true' &&
  Boolean(suppliedSupabaseUrl && suppliedPublishableKey) &&
  SUPABASE_URL !== PRODUCTION_SUPABASE_URL &&
  SUPABASE_KEY !== PRODUCTION_SUPABASE_KEY;
const ALLOW_CBT_TEST_WRITES =
  import.meta.env.VITE_ENABLE_CBT_TEST_WRITES === 'true' &&
  Boolean(suppliedSupabaseUrl && suppliedPublishableKey) &&
  SUPABASE_URL !== PRODUCTION_SUPABASE_URL &&
  SUPABASE_KEY !== PRODUCTION_SUPABASE_KEY;

// Expose the resolved backend mode so preview-only UI reads use the same isolated test project as writes.
export const usesIsolatedTestBackend = ALLOW_TEST_WRITES;
// Production Flutterwave UI is opt-in at build time and never enabled in the isolated test preview.
export const isFlutterwaveLiveUiEnabled = import.meta.env.VITE_ENABLE_FLUTTERWAVE_LIVE === 'true' && !ALLOW_TEST_WRITES;
const API_BASE = SUPABASE_URL + '/functions/v1/eduken-api';
const SESSION_KEY = 'eduken_auth_session';

// Keep slow mobile connections from leaving controls spinning indefinitely.
// Read requests may be retried safely; writes are never replayed automatically.
const REQUEST_TIMEOUT_MS = 18000;
const READ_RETRY_DELAY_MS = 300;
const inFlightReads = new Map<string, Promise<any>>();

const fetchWithTimeout = async (input: RequestInfo | URL, init: RequestInit = {}, timeoutMs = REQUEST_TIMEOUT_MS) => {
  const controller = new AbortController();
  const externalSignal = init.signal;
  const abortFromCaller = () => controller.abort();
  if (externalSignal?.aborted) controller.abort();
  else externalSignal?.addEventListener('abort', abortFromCaller, { once: true });
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } catch (error) {
    if (controller.signal.aborted && !externalSignal?.aborted) {
      throw new Error('The request took too long. Check your connection and try again.');
    }
    throw error;
  } finally {
    window.clearTimeout(timeout);
    externalSignal?.removeEventListener('abort', abortFromCaller);
  }
};

type Session = {
  access_token: string;
  refresh_token?: string;
  expires_at?: number;
  user?: any;
};

const readSession = (): Session | null => {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const writeSession = (session: Session | null) => {
  if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  else localStorage.removeItem(SESSION_KEY);
  if (typeof window !== 'undefined') window.dispatchEvent(new Event('eduken-auth-changed'));
};

let refreshInFlight: Promise<Session> | null = null;

const refreshSession = (session: Session): Promise<Session> => {
  if (!session.refresh_token) return Promise.resolve(session);
  if (refreshInFlight) return refreshInFlight;
  refreshInFlight = (async () => {
    const res = await fetchWithTimeout(
      SUPABASE_URL + '/auth/v1/token?grant_type=refresh_token',
      {
        method: 'POST',
        headers: { apikey: SUPABASE_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: session.refresh_token }),
      },
      12000
    );
    if (!res.ok) {
      writeSession(null);
      throw new Error('Session expired. Please sign in again.');
    }
    const next = await res.json();
    const updated = {
      ...session,
      access_token: next.access_token,
      refresh_token: next.refresh_token || session.refresh_token,
      expires_at: Math.floor(Date.now() / 1000) + Number(next.expires_in || 3600),
      user: next.user || session.user,
    };
    writeSession(updated);
    return updated;
  })();
  return refreshInFlight.finally(() => { refreshInFlight = null; });
};

const validSession = async () => {
  const session = readSession();
  if (!session) return null;
  if (
    !session.expires_at ||
    session.expires_at - 60 > Math.floor(Date.now() / 1000)
  )
    return session;
  return refreshSession(session);
};


const request = async (
  path: string,
  options: RequestInit = {},
  retry = true
): Promise<any> => {
  const method = String(options.method || 'GET').toUpperCase();
  const isolatedCbtTestWrite =
    ALLOW_CBT_TEST_WRITES &&
    window.location.origin !== 'https://eduken-consult.timmy385.workers.dev' &&
    SUPABASE_URL !== PRODUCTION_SUPABASE_URL &&
    /^\/api\/(?:admin\/)?cbt(?:\/|$)/.test(path);
  if (!isolatedCbtTestWrite && shouldBlockWrite(window.location.origin, method, {
    supabaseUrl: SUPABASE_URL,
    allowTestWrites: ALLOW_TEST_WRITES,
  })) {
    throw new Error('Preview safety mode: saving is disabled until a separate test database is connected. No changes were sent to the live database.');
  }
  const session = await validSession();
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  headers.set('apikey', SUPABASE_KEY);
  if (session?.access_token)
    headers.set('Authorization', 'Bearer ' + session.access_token);
  let response: Response;
  try {
    response = await fetchWithTimeout(API_BASE + path, { ...options, headers });
  } catch (error) {
    // GET requests are idempotent. Retry once after a brief pause for transient
    // mobile-network failures; never automatically replay a POST/PUT/DELETE.
    if (method === 'GET' && retry) {
      await new Promise(resolve => window.setTimeout(resolve, READ_RETRY_DELAY_MS));
      return request(path, options, false);
    }
    throw error;
  }
  if (method === 'GET' && retry && [502, 503, 504].includes(response.status)) {
    await new Promise(resolve => window.setTimeout(resolve, READ_RETRY_DELAY_MS));
    return request(path, options, false);
  }
  const text = await response.text();
  let data: any = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }
  if (response.status === 401 && retry && session?.refresh_token) {
    await refreshSession(session);
    return request(path, options, false);
  }
  if (!response.ok) throw new Error(data.error || 'Request failed.');
  return { data };
};

const getOnce = (path: string) => {
  // Keep reads from an old signed-in session separate from reads made after
  // sign-out or account switching, even when the endpoint path is identical.
  const sessionKey = readSession()?.access_token || 'anonymous';
  const key = sessionKey + ':' + path;
  const existing = inFlightReads.get(key);
  if (existing) return existing;
  const pending = request(path).finally(() => {
    if (inFlightReads.get(key) === pending) inFlightReads.delete(key);
  });
  inFlightReads.set(key, pending);
  return pending;
};

export const api = {
  // Identical simultaneous reads share one network request (useful on mobile
  // when multiple dashboard panels mount together).
  get: (path: string) => getOnce(path),
  post: (path: string, body: any) =>
    request(path, { method: 'POST', body: JSON.stringify(body ?? {}) }),
  put: (path: string, body: any) =>
    request(path, { method: 'PUT', body: JSON.stringify(body ?? {}) }),
  delete: (path: string) => request(path, { method: 'DELETE' }),
};

export const auth = {
  isSignedIn: () => Boolean(readSession()?.access_token),
  isGoogleSignedIn: () => {
    const user = readSession()?.user;
    return Boolean(user && (user.app_metadata?.provider === 'google' || (Array.isArray(user.identities) && user.identities.some((identity: any) => identity?.provider === 'google'))));
  },
  signIn: async (_options?: any) => {
    const redirectTo = window.location.origin + window.location.pathname;
    const currentSession = readSession();

    // Preserve CBT history for students who already have an anonymous preview account:
    // link Google to that same Supabase user instead of creating a second identity.
    if (currentSession?.user?.is_anonymous) {
      const linkUrl = new URL(SUPABASE_URL + '/auth/v1/user/identities/authorize');
      linkUrl.searchParams.set('provider', 'google');
      linkUrl.searchParams.set('redirect_to', redirectTo);
      linkUrl.searchParams.set('scopes', 'openid email profile');
      linkUrl.searchParams.set('skip_http_redirect', 'true');
      const linkResponse = await fetch(linkUrl.toString(), {
        method: 'GET',
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: 'Bearer ' + currentSession.access_token,
        },
      });
      const linkResult = await linkResponse.json().catch(() => ({}));
      if (!linkResponse.ok || typeof linkResult.url !== 'string') {
        const reason = String(linkResult.msg || linkResult.message || linkResult.error_description || linkResult.error || '');
        throw new Error(reason || 'We could not connect Google to your existing EDUKEN account. Account linking must be enabled before continuing.');
      }
      window.location.assign(linkResult.url);
      return new Promise(() => undefined);
    }

    const url = new URL(SUPABASE_URL + '/auth/v1/authorize');
    url.searchParams.set('provider', 'google');
    url.searchParams.set('redirect_to', redirectTo);
    url.searchParams.set('scopes', 'openid email profile');
    window.location.assign(url.toString());
    return new Promise(() => undefined);
  },
  completeOAuthCallback: async () => {
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    const accessToken = hash.get('access_token');
    const refreshToken = hash.get('refresh_token');
    const isOAuthResponse = hash.has('access_token') || hash.has('refresh_token') ||
      hash.has('error') || hash.has('error_description');
    if (!isOAuthResponse) return null;
    // Clear OAuth response data before making network requests, but preserve
    // ordinary SPA hashes such as #opportunities and #opportunity/article-slug.
    window.history.replaceState({}, document.title, window.location.pathname);
    if (!accessToken) {
      const oauthError = hash.get('error_description') || hash.get('error');
      if (oauthError) {
        const readableError = oauthError.replace(/\+/g, ' ').replace(/_/g, ' ');
        throw new Error('Google sign-in could not finish: ' + readableError + '. Check the Supabase Auth redirect URL allowlist if this is a preview deployment.');
      }
      return null;
    }
    const response = await fetch(SUPABASE_URL + '/auth/v1/user', {
      headers: { apikey: SUPABASE_KEY, Authorization: 'Bearer ' + accessToken },
    });
    const user = await response.json();
    if (!response.ok || !user.email) {
      writeSession(null);
      throw new Error('Could not verify the Google account.');
    }
    // Customer accounts are allowed to sign in. Admin endpoints independently enforce
    // the server-side ADMIN_EMAILS allowlist; client-side UI visibility is not authorization.
    const session = {
      access_token: accessToken,
      refresh_token: refreshToken || undefined,
      expires_at: Math.floor(Date.now() / 1000) + Number(hash.get('expires_in') || 3600),
      user,
    };
    writeSession(session);
    window.history.replaceState({}, document.title, window.location.pathname);
    return { user, session };
  },
  signOut: async () => {
    const session = readSession();
    if (session?.access_token) {
      await fetch(SUPABASE_URL + '/auth/v1/logout', {
        method: 'POST',
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: 'Bearer ' + session.access_token,
        },
      }).catch(() => undefined);
    }
    writeSession(null);
  },
  getUser: () => readSession()?.user || null,
};

export const notifications = {
  onMessage: (_callback: () => void) => () => undefined,
  subscribe: async (_options?: any) => {
    if (!('Notification' in window)) return { permission: 'unsupported' };
    const permission = await Notification.requestPermission();
    return { permission };
  },
};


const workerRequest = async (path: string): Promise<any> => {
  const session = await validSession();
  const headers = new Headers({ 'Content-Type': 'application/json' });
  if (session?.access_token) headers.set('Authorization', 'Bearer ' + session.access_token);
  const response = await fetch(path, { headers, cache: 'no-store' });
  const text = await response.text();
  let data: any = {};
  try { data = text ? JSON.parse(text) : {}; } catch { data = { error: text }; }
  if (!response.ok) throw new Error(data.error || 'Analytics request failed.');
  return { data };
};

export const analyticsApi = {
  summary: (days = 30) => workerRequest('/api/analytics/summary?days=' + encodeURIComponent(String(days))),
};
