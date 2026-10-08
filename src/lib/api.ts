const SUPABASE_URL = 'https://pphxltbkwygqjtjgkhxu.supabase.co';
const SUPABASE_KEY = 'sb_publishable__qH331oDMJzmjqlOig3C0Q_EIHRa24p';
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
    const email = window.prompt(
      'EDUKEN CONSULT sign-in\nEnter your email address:'
    );
    if (!email) throw new Error('Sign-in cancelled.');
    const password = window.prompt('Enter your password:');
    if (!password) throw new Error('Sign-in cancelled.');
    const response = await fetch(
      SUPABASE_URL + '/auth/v1/token?grant_type=password',
      {
        method: 'POST',
        headers: { apikey: SUPABASE_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      }
    );
    const data = await response.json();
    if (!response.ok)
      throw new Error(
        data.error_description || data.msg || 'Invalid email or password.'
      );
    const session = {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at:
        Math.floor(Date.now() / 1000) + Number(data.expires_in || 3600),
      user: data.user,
    };
    writeSession(session);
    return { user: data.user, session };
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
