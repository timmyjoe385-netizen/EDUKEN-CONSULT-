import { shouldBlockWrite, PRODUCTION_SUPABASE_URL } from './api-safety.js';

const viteEnv = (import.meta as any).env || {};
const PRODUCTION_SUPABASE_KEY = 'sb_publishable__qH331oDMJzmjqlOig3C0Q_EIHRa24p';
const suppliedSupabaseUrl = String(viteEnv.VITE_SUPABASE_URL || '').trim();
const suppliedPublishableKey = String(viteEnv.VITE_SUPABASE_PUBLISHABLE_KEY || '').trim();
const SUPABASE_URL = (suppliedSupabaseUrl || PRODUCTION_SUPABASE_URL).replace(/\/+$/, '');
const SUPABASE_KEY = suppliedPublishableKey || PRODUCTION_SUPABASE_KEY;
const ALLOW_TEST_WRITES =
  viteEnv.VITE_ENABLE_TEST_WRITES === 'true' &&
  Boolean(suppliedSupabaseUrl && suppliedPublishableKey) &&
  SUPABASE_URL !== PRODUCTION_SUPABASE_URL &&
  SUPABASE_KEY !== PRODUCTION_SUPABASE_KEY;
const API_BASE = SUPABASE_URL + '/functions/v1/eduken-api';
const SESSION_KEY = 'eduken_auth_session';

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

const refreshSession = async (session: Session) => {
  if (!session.refresh_token) return session;
  const res = await fetch(
    SUPABASE_URL + '/auth/v1/token?grant_type=refresh_token',
    {
      method: 'POST',
      headers: { apikey: SUPABASE_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: session.refresh_token }),
    }
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
  if (shouldBlockWrite(window.location.origin, method, {
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
  const response = await fetch(API_BASE + path, { ...options, headers });
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

export const api = {
  get: (path: string) => request(path),
  post: (path: string, body: any) =>
    request(path, { method: 'POST', body: JSON.stringify(body ?? {}) }),
  put: (path: string, body: any) =>
    request(path, { method: 'PUT', body: JSON.stringify(body ?? {}) }),
  delete: (path: string) => request(path, { method: 'DELETE' }),
};

export const auth = {
  isSignedIn: () => Boolean(readSession()?.access_token),
  signIn: async (_options?: any) => {
    const redirectTo = window.location.origin + window.location.pathname;
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
