const SESSION_KEY = 'eduken_analytics_session';

type TrackDetails = {
  target?: string;
  pageTitle?: string;
};

function sessionId() {
  try {
    let id = localStorage.getItem(SESSION_KEY);
    if (!id) {
      id = typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : 's-' + Math.random().toString(36).slice(2) + Date.now().toString(36);
      localStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return 'temporary-' + Math.random().toString(36).slice(2);
  }
}

function deviceType() {
  const ua = navigator.userAgent || '';
  if (/tablet|ipad/i.test(ua)) return 'tablet';
  if (/mobile|android|iphone/i.test(ua)) return 'mobile';
  return 'desktop';
}

function browserType() {
  const ua = navigator.userAgent || '';
  if (/Edg\//.test(ua)) return 'Edge';
  if (/Firefox\//.test(ua)) return 'Firefox';
  if (/CriOS|Chrome\//.test(ua)) return 'Chrome';
  if (/Safari\//.test(ua)) return 'Safari';
  return 'Other';
}

export function trackEvent(eventName: string, details: TrackDetails = {}) {
  if (typeof window === 'undefined' || !navigator.onLine) return;
  const params = new URLSearchParams(window.location.search);
  const referrerHost = (() => {
    try { return document.referrer ? new URL(document.referrer).hostname : ''; }
    catch { return ''; }
  })();
  const source = params.get('utm_source') || (referrerHost ? referrerHost.replace(/^www\./, '') : 'direct');
  const payload = {
    eventName,
    sessionId: sessionId(),
    path: window.location.pathname + window.location.hash,
    pageTitle: String(details.pageTitle || document.title || '').slice(0, 120),
    referrerHost: referrerHost.slice(0, 120),
    source: String(source).slice(0, 100),
    medium: String(params.get('utm_medium') || '').slice(0, 100),
    campaign: String(params.get('utm_campaign') || '').slice(0, 100),
    device: deviceType(),
    browser: browserType(),
    target: String(details.target || '').replace(/\s+/g, ' ').trim().slice(0, 140),
  };
  fetch('/api/analytics/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    keepalive: true,
  }).catch(() => undefined);
}

export function installAnalyticsTracking() {
  if (typeof window === 'undefined') return () => undefined;
  let lastPath = '';
  const pageView = () => {
    const current = window.location.pathname + window.location.hash;
    if (current === lastPath) return;
    lastPath = current;
    trackEvent('page_view');
  };
  const click = (event: MouseEvent) => {
    const element = (event.target as HTMLElement | null)?.closest('a,button,[role="button"]') as HTMLElement | null;
    if (!element) return;
    const label = (element.innerText || element.getAttribute('aria-label') || element.getAttribute('title') || '').trim();
    const anchor = element instanceof HTMLAnchorElement ? element : null;
    const target = anchor?.href && anchor.origin !== window.location.origin
      ? anchor.hostname + ' · ' + label
      : label;
    const isWhatsApp = Boolean(anchor?.href && /(?:wa\.me|whatsapp\.com)/i.test(anchor.href));
    trackEvent(isWhatsApp ? 'whatsapp_click' : anchor?.href && anchor.origin !== window.location.origin ? 'outbound_click' : 'click', { target });
  };
  pageView();
  window.addEventListener('hashchange', pageView);
  document.addEventListener('click', click, { passive: true });
  const heartbeat = window.setInterval(() => {
    if (document.visibilityState === 'visible') trackEvent('heartbeat');
  }, 60_000);
  return () => {
    window.removeEventListener('hashchange', pageView);
    document.removeEventListener('click', click);
    window.clearInterval(heartbeat);
  };
}
