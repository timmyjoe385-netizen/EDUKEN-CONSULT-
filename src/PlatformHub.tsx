import React, { useEffect, useMemo, useState } from 'react';
import { api, auth, notifications } from './lib/api';
import { FileText, Download, RefreshCw } from 'lucide-react';
import {
  Bell,
  Bookmark,
  Check,
  CreditCard,
  Search,
  Sparkles,
  Target,
  UserRound,
  X,
} from 'lucide-react';

type Item = Record<string, any> & { id: string };
const TOPICS = [
  'Scholarships',
  'Jobs',
  'Internships',
  'Admissions',
  'Grants',
  'Fellowships',
  'Competitions',
  'Remote Jobs',
];
const makeOpportunitySlug = (item: Item) =>
  item.slug ||
  String(item.title || item.id || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const STATUSES = [
  'Planning to Apply',
  'Application Started',
  'Submitted',
  'Awaiting Result',
  'Accepted',
  'Rejected',
  'Closed',
];

const deadlineState = (value: unknown) => {
  if (!value) return { label: 'Deadline not specified', tone: 'neutral' };
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime()))
    return { label: 'Deadline not specified', tone: 'neutral' };
  const diff = date.getTime() - Date.now();
  if (diff <= 0) return { label: 'Application closed', tone: 'closed' };
  const hours = Math.ceil(diff / 36e5);
  const days = Math.ceil(diff / 864e5);
  if (hours <= 24) return { label: '🔥 Closes today', tone: 'urgent' };
  if (days <= 3) return { label: '⚠️ ' + days + ' days left', tone: 'urgent' };
  if (days <= 7) return { label: '⏳ ' + days + ' days left', tone: 'soon' };
  return { label: '⏳ ' + days + ' days left', tone: 'open' };
};

function formatWalletTransferCountdown(expiresAt: string | null, now: number): string | null {
  if (!expiresAt) return null;
  const expiresAtMs = new Date(expiresAt).getTime();
  if (!Number.isFinite(expiresAtMs)) return null;
  const remainingSeconds = Math.max(0, Math.floor((expiresAtMs - now) / 1000));
  if (remainingSeconds <= 0) return 'Expired';
  const hours = Math.floor(remainingSeconds / 3600);
  const minutes = Math.floor((remainingSeconds % 3600) / 60);
  const seconds = remainingSeconds % 60;
  return [hours, minutes, seconds].map(value => String(value).padStart(2, '0')).join(':');
}

function renderAiInline(text: string): React.ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).filter(Boolean).map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={index}>{part.slice(1, -1)}</em>;
    }
    return <React.Fragment key={index}>{part}</React.Fragment>;
  });
}

function AiFormattedAnswer({ text }: { text: string }) {
  const lines = text.replace(/\r/g, '').split('\n');
  return (
    <div className="ai-formatted-answer">
      {lines.map((rawLine, index) => {
        const line = rawLine.trim();
        if (!line) return <div key={index} style={{ height: 8 }} />;
        const heading = line.match(/^#{1,4}\s+(.+)$/);
        if (heading) {
          const HeadingTag = line.startsWith('# ') ? 'h3' : line.startsWith('## ') ? 'h4' : 'h5';
          return <HeadingTag key={index} style={{ margin: '14px 0 6px', lineHeight: 1.35 }}>{renderAiInline(heading[1])}</HeadingTag>;
        }
        const bullet = line.match(/^(?:[-*+] )(.+)$/);
        if (bullet) {
          return <div key={index} style={{ display: 'flex', gap: 8, margin: '5px 0', paddingLeft: 4 }}><span aria-hidden="true">•</span><span>{renderAiInline(bullet[1])}</span></div>;
        }
        const numbered = line.match(/^\d+[.)]\s+(.+)$/);
        if (numbered) {
          const number = line.match(/^\d+/)?.[0] || '';
          return <div key={index} style={{ display: 'flex', gap: 8, margin: '5px 0', paddingLeft: 4 }}><span>{number}.</span><span>{renderAiInline(numbered[1])}</span></div>;
        }
        return <p key={index} style={{ margin: '6px 0', lineHeight: 1.65 }}>{renderAiInline(line)}</p>;
      })}
    </div>
  );
}

export default function PlatformHub({
  opportunities,
  admissions,
  customerSignInRequest = 0,
}: {
  opportunities: Item[];
  admissions: Item[];
  customerSignInRequest?: number;
}) {
  const [user, setUser] = useState<any>(null);
  const [saved, setSaved] = useState<Item[]>([]);
  const [tracker, setTracker] = useState<Item[]>([]);
  const [alerts, setAlerts] = useState<Item[]>([]);
  const [topics, setTopics] = useState<string[]>([]);
  const [open, setOpen] = useState('');
  const [query, setQuery] = useState('');
  const [course, setCourse] = useState('');
  const [location, setLocation] = useState('');
  const [jamb, setJamb] = useState('');
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiAnswer, setAiAnswer] = useState('');
  const [aiSources, setAiSources] = useState<{ title: string; url: string; description?: string }[]>([]);
  const [aiResearchStatus, setAiResearchStatus] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [deliverables, setDeliverables] = useState<Item[]>([]);
  const [deliverablesLoading, setDeliverablesLoading] = useState(false);
  const [deliverablesMessage, setDeliverablesMessage] = useState('');
  const [wallet, setWallet] = useState<any>(null);
  const [walletTransactions, setWalletTransactions] = useState<Item[]>([]);
  const [walletLoading, setWalletLoading] = useState(false);
  const [walletAmount, setWalletAmount] = useState('1000');
  const [walletDepositKey, setWalletDepositKey] = useState('');
  const [walletAction, setWalletAction] = useState(false);
  const [walletMessage, setWalletMessage] = useState('');
  const [walletTransferKey, setWalletTransferKey] = useState('');
  const [walletTransferInfo, setWalletTransferInfo] = useState<{ accountNumber: string; bankName: string; accountName: string | null; amount: number; expiresAt: string | null; reference: string } | null>(null);
  const [walletTransferNow, setWalletTransferNow] = useState(Date.now());
  useEffect(() => {
    if (!walletTransferInfo?.expiresAt) return;
    const expiresAtMs = new Date(walletTransferInfo.expiresAt).getTime();
    if (!Number.isFinite(expiresAtMs)) return;
    const updateCountdown = () => {
      const now = Date.now();
      setWalletTransferNow(now);
      if (now >= expiresAtMs) {
        setWalletTransferInfo(null);
        setWalletTransferKey('');
        setWalletMessage('These bank-transfer details have expired. Request fresh details before making a transfer.');
      }
    };
    updateCountdown();
    const timer = window.setInterval(updateCountdown, 1000);
    return () => window.clearInterval(timer);
  }, [walletTransferInfo?.expiresAt]);
  const walletTransferCountdown = formatWalletTransferCountdown(walletTransferInfo?.expiresAt ?? null, walletTransferNow);
  const [customerSignInOpen, setCustomerSignInOpen] = useState(false);
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPassword, setCustomerPassword] = useState('');
  const [customerSignInLoading, setCustomerSignInLoading] = useState(false);
  const [customerSignInMessage, setCustomerSignInMessage] = useState('');
  const [customerAuthMode, setCustomerAuthMode] = useState<'signin' | 'signup'>('signin');

  const refreshWallet = async () => {
    if (!auth.isSignedIn()) {
      setWallet(null);
      setWalletTransactions([]);
      return;
    }
    setWalletLoading(true);
    let pendingWalletMessage = '';
    const pendingWalletDepositKey = 'eduken_pending_wallet_deposit_reference';
    let pendingReference = '';
    try { pendingReference = window.sessionStorage.getItem(pendingWalletDepositKey) || ''; } catch { pendingReference = ''; }
    if (pendingReference && !/^EDK-PAY-[A-Z0-9]{18}$/.test(pendingReference)) {
      try { window.sessionStorage.removeItem(pendingWalletDepositKey); } catch { /* ignore unavailable session storage */ }
      pendingReference = '';
    }
    if (pendingReference) {
      try {
        const verification = await api.post('/api/wallet/deposit/verify', { reference: pendingReference });
        if (verification.data?.paid) {
          try { window.sessionStorage.removeItem(pendingWalletDepositKey); } catch { /* preserve the visible result */ }
          pendingWalletMessage = 'Wallet deposit verified successfully. Your balance has been refreshed.';
        } else if (verification.data?.status === 'Failed') {
          try { window.sessionStorage.removeItem(pendingWalletDepositKey); } catch { /* preserve the visible result */ }
          pendingWalletMessage = 'The payment provider did not complete this deposit. No wallet credit was added. You can start a new deposit attempt.';
        } else {
          pendingWalletMessage = 'This deposit is not confirmed yet. Do not pay again immediately. Saved reference: ' + pendingReference;
        }
      } catch {
        pendingWalletMessage = 'We could not verify the saved wallet deposit yet. Your reference remains saved for another check: ' + pendingReference;
      }
    }
    try {
      const result = await api.get('/api/wallet');
      setWallet(result.data.wallet || null);
      setWalletTransactions(result.data.transactions || []);
      setWalletMessage(pendingWalletMessage);
    } catch {
      setWallet(null);
      setWalletTransactions([]);
      setWalletMessage(pendingWalletMessage || 'Wallet service is not available yet. It will appear after the wallet release is enabled.');
    } finally {
      setWalletLoading(false);
    }
  };

  const startWalletDeposit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (walletAction) return;
    const amount = Number(walletAmount);
    if (!Number.isInteger(amount) || amount < 100 || amount > 500000) {
      setWalletMessage('Enter a whole-naira amount between ₦100 and ₦500,000.');
      return;
    }
    const idempotencyKey = walletDepositKey || ('wallet-deposit:' + crypto.randomUUID());
    setWalletDepositKey(idempotencyKey);
    setWalletAction(true);
    setWalletMessage('Preparing secure Flutterwave checkout…');
    try {
      const result = await api.post('/api/wallet/deposit/initialize-flutterwave', { amount, idempotencyKey });
      const authorizationUrl = String(result.data?.authorizationUrl || '');
      if (!/^https:\/\/(?:checkout\.flutterwave\.com|checkout-v2\.dev-flutterwave\.com)\/[A-Za-z0-9/_-]+(?:\?[^\s]*)?$/.test(authorizationUrl)) {
        throw new Error('Flutterwave did not return a trusted checkout URL. Do not retry immediately; refresh your wallet or contact support.');
      }
      const reference = String(result.data?.reference || '');
      if (!/^EDK-PAY-[A-Z0-9]{18}$/.test(reference)) {
        throw new Error('Flutterwave checkout reference could not be confirmed. Do not retry immediately; contact support.');
      }
      try { window.sessionStorage.setItem('eduken_pending_wallet_deposit_reference', reference); } catch { /* callback verification can be resumed from the account */ }
      window.location.assign(authorizationUrl);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not start the wallet deposit.';
      setWalletMessage(message);
      if (message.includes('You can safely start a new attempt')) setWalletDepositKey('');
    } finally {
      setWalletAction(false);
    }
  };

  const startWalletTransfer = async () => {
    if (walletAction) return;
    const amount = Number(walletAmount);
    if (!Number.isInteger(amount) || amount < 100 || amount > 500000) {
      setWalletMessage('Enter a whole-naira amount between ₦100 and ₦500,000.');
      return;
    }
    const idempotencyKey = walletTransferKey || ('wallet-transfer:' + crypto.randomUUID());
    setWalletTransferKey(idempotencyKey);
    setWalletAction(true);
    setWalletMessage('Preparing secure bank-transfer details…');
    setWalletTransferInfo(null);
    try {
      const result = await api.post('/api/wallet/deposit/initialize-flutterwave-transfer', { amount, idempotencyKey });
      const account = result.data?.transferAccount;
      const accountNumber = String(account?.accountNumber || '');
      const bankName = String(account?.bankName || '');
      const transferAmount = Number(account?.amount);
      const reference = String(result.data?.reference || '');
      if (!/^\d{8,20}$/.test(accountNumber) || !bankName || !Number.isFinite(transferAmount) || transferAmount <= 0 || !/^EDK-PAY-[A-Z0-9]{18}$/.test(reference)) {
        throw new Error('Bank-transfer details could not be confirmed. Do not transfer; contact EDUKEN support.');
      }
      setWalletTransferInfo({ accountNumber, bankName, accountName: typeof account.accountName === 'string' && account.accountName.trim() ? account.accountName.trim() : null, amount: transferAmount, expiresAt: typeof account.expiresAt === 'string' ? account.expiresAt : null, reference });
      try { window.sessionStorage.setItem('eduken_pending_wallet_deposit_reference', reference); } catch { /* account details remain visible for this session */ }
      setWalletMessage('Transfer the exact amount shown below before the account expires. Your wallet is credited only after Flutterwave confirms payment.');
    } catch (error) {
      setWalletMessage(error instanceof Error ? error.message : 'Could not prepare bank-transfer details.');
    } finally {
      setWalletAction(false);
    }
  };

  const refreshDeliverables = async () => {
    if (!auth.isSignedIn()) {
      setDeliverables([]);
      setDeliverablesMessage('Sign in to view documents EDUKEN has published for your service requests.');
      return;
    }
    setDeliverablesLoading(true);
    try {
      const result = await api.get('/api/service-deliverables');
      setDeliverables(result.data.items || []);
      setDeliverablesMessage((result.data.items || []).length ? '' : 'No documents have been published to your account yet.');
    } catch (error) {
      setDeliverablesMessage(error instanceof Error ? error.message : 'Documents are temporarily unavailable.');
    } finally {
      setDeliverablesLoading(false);
    }
  };

  const downloadDeliverable = async (item: Item) => {
    try {
      const result = await api.post('/api/service-deliverables/' + encodeURIComponent(item.id) + '/download', {});
      const downloadUrl = String(result.data?.url || '');
      if (!downloadUrl.startsWith('https://')) throw new Error('A secure download link was not returned.');
      window.location.assign(downloadUrl);
    } catch (error) {
      setDeliverablesMessage(error instanceof Error ? error.message : 'Could not prepare this download.');
    }
  };

  const refresh = async () => {
    if (!auth.isSignedIn()) {
      setUser(null);
      setSaved([]);
      setTracker([]);
      setAlerts([]);
      setTopics([]);
      setWallet(null);
      setWalletTransactions([]);
      return;
    }
    try {
      const [me, saves, apps, notices, topicData] = await Promise.all([
        api.get('/api/me'),
        api.get('/api/user/saved'),
        api.get('/api/user/tracker'),
        api.get('/api/user/notifications'),
        api.get('/api/user/topics'),
      ]);
      setUser(me.data.user);
      setSaved(saves.data.items || []);
      setTracker(apps.data.items || []);
      setAlerts(notices.data.items || []);
      setTopics(topicData.data.topics || []);
      void refreshWallet();
      api.post('/api/user/reminders/check', {}).catch(() => undefined);
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    void refresh();
    void refreshDeliverables();
    const onAuthChanged = () => { void refresh(); void refreshDeliverables(); };
    const onWalletUpdated = () => { setWalletDepositKey(''); void refreshWallet(); };
    window.addEventListener('eduken-auth-changed', onAuthChanged);
    window.addEventListener('eduken-wallet-updated', onWalletUpdated);
    const unsubscribe = auth.isSignedIn() ? notifications.onMessage(() => { void refresh(); void refreshWallet(); }) : () => undefined;
    return () => {
      window.removeEventListener('eduken-auth-changed', onAuthChanged);
      window.removeEventListener('eduken-wallet-updated', onWalletUpdated);
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (customerSignInRequest > 0) {
      setCustomerAuthMode('signin');
      setCustomerSignInMessage('');
      setCustomerSignInOpen(true);
    }
  }, [customerSignInRequest]);

  const signIn = async () => {
    try {
      await auth.signIn({ scope: 'openid email profile offline_access' });
      await refresh();
    } catch {
      /* cancelled */
    }
  };

  const signInCustomer = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (customerSignInLoading) return;
    setCustomerSignInLoading(true);
    setCustomerSignInMessage('');
    try {
      await auth.signInWithPassword(customerEmail, customerPassword);
      setCustomerPassword('');
      setCustomerSignInOpen(false);
      setCustomerSignInMessage('');
      await refresh();
      await refreshWallet();
    } catch (error) {
      setCustomerSignInMessage(error instanceof Error ? error.message : 'Customer sign-in failed. Please try again.');
    } finally {
      setCustomerSignInLoading(false);
    }
  };

  const signUpCustomer = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (customerSignInLoading) return;
    setCustomerSignInLoading(true);
    setCustomerSignInMessage('');
    try {
      const result = await auth.signUpWithPassword(customerEmail, customerPassword);
      setCustomerPassword('');
      if (result.session) {
        setCustomerSignInOpen(false);
        setCustomerAuthMode('signin');
        await refresh();
        await refreshWallet();
      } else {
        setCustomerSignInMessage('Account created. Check your email to confirm your account, then return here to sign in before submitting the service request.');
        setCustomerAuthMode('signin');
      }
    } catch (error) {
      setCustomerSignInMessage(error instanceof Error ? error.message : 'Account creation failed. Please try again.');
    } finally {
      setCustomerSignInLoading(false);
    }
  };

  const save = async (item: Item) => {
    if (!user) {
      await signIn();
      return;
    }
    if (saved.some(x => x.opportunityId === item.id))
      await api.delete('/api/user/saved/' + item.id);
    else
      await api.post('/api/user/saved', {
        opportunityId: item.id,
        title: item.title,
        slug: makeOpportunitySlug(item),
      });
    await refresh();
  };

  const track = async (item: Item) => {
    if (!user) {
      await signIn();
      return;
    }
    if (!tracker.some(x => x.opportunityId === item.id)) {
      await api.post('/api/user/tracker', {
        opportunityId: item.id,
        title: item.title,
        slug: makeOpportunitySlug(item),
        status: STATUSES[0],
        deadline: item.deadline || '',
        notes: '',
      });
      await refresh();
    }
    setOpen('tracker');
  };

  const toggleTopic = async (topic: string) => {
    if (!user) {
      await signIn();
      return;
    }
    const active = topics.includes(topic);
    await api.post(
      '/api/user/topics/' + (active ? 'unsubscribe' : 'subscribe'),
      { topic }
    );
    await refresh();
  };

  const [notificationStatus, setNotificationStatus] = useState('');

  const enablePush = async () => {
    if (!user) {
      await signIn();
      return;
    }
    try {
      const result = await notifications.subscribe({ showUi: true });
      if (result.permission === 'unsupported') {
        setNotificationStatus('This browser does not support notification permissions.');
      } else if (result.permission === 'granted') {
        setNotificationStatus('Browser permission granted. Automatic push delivery is not connected yet, so this does not enable background alerts.');
      } else if (result.permission === 'denied') {
        setNotificationStatus('Notifications are blocked in your browser settings. You can change that in your browser settings.');
      } else {
        setNotificationStatus('Notification permission was not granted. You can try again or check your browser settings.');
      }
    } catch {
      setNotificationStatus('Could not check notification permission on this device.');
    }
  };

  const markRead = async (id?: string) => {
    await api.post('/api/user/notifications/read', id ? { id } : { all: true });
    await refresh();
  };

  const updateTracker = async (item: Item, status: string, notes: string) => {
    await api.put('/api/user/tracker/' + item.id, { status, notes });
    await refresh();
  };

  const askAi = async () => {
    if (!aiQuestion.trim()) return;
    setAiLoading(true);
    setAiSources([]);
    setAiResearchStatus(null);
    try {
      const res = await fetch('/api/ai-assistant', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ question: aiQuestion }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'AI request failed');
      setAiAnswer(data.answer || 'I could not find a confident answer.');
      setAiSources(Array.isArray(data.sources) ? data.sources.filter((source: any) => source?.url) : []);
      setAiResearchStatus(typeof data.researchStatus === 'string' ? data.researchStatus : null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown AI assistant error';
      setAiAnswer(`EDUKEN AI error: ${message}. Please try again shortly.`);
      setAiSources([]);
      setAiResearchStatus(null);
    } finally {
      setAiLoading(false);
    }
  };

  const matches = useMemo(() => {
    const q = query.toLowerCase();
    return opportunities.filter(x =>
      ((x.title || '') + ' ' + (x.description || '') + ' ' + (x.category || ''))
        .toLowerCase()
        .includes(q)
    );
  }, [opportunities, query]);

  const schoolMatches = useMemo(
    () =>
      admissions
        .filter(x => {
          const text = (
            (x.school || '') +
            ' ' +
            (x.course || '') +
            ' ' +
            (x.details || '')
          ).toLowerCase();
          return (
            (!course || text.includes(course.toLowerCase())) &&
            (!location || text.includes(location.toLowerCase()))
          );
        })
        .slice(0, 8),
    [admissions, course, location]
  );

  return (
    <section className="platform-hub section" id="eduken-platform">
      <div className="section-head">
        <div>
          <span className="kicker">🚀 MY EDUKEN</span>
          <h2>Your student workspace.</h2>
        </div>
        <p>
          Save opportunities, track applications, manage alerts and research
          admissions from one mobile-first platform.
        </p>
      </div>
      <div className="platform-grid">
        <div className="platform-card">
          <div className="platform-icon">
            <Search size={20} />
          </div>
          <h3>EDUKEN Search</h3>
          <p>Search live opportunities, admissions and updates.</p>
          <div className="platform-input">
            <Search size={15} />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Scholarship, job, school..."
            />
          </div>
          {query && (
            <div className="platform-results">
              {matches.slice(0, 5).map(item => (
                <button
                  key={item.id}
                  onClick={() =>
                    (window.location.hash =
                      'opportunity/' + encodeURIComponent(makeOpportunitySlug(item)))
                  }
                >
                  <span>{item.category || 'Opportunity'}</span>
                  <b>{item.title}</b>
                </button>
              ))}
              {!matches.length && <small>No matching opportunity.</small>}
            </div>
          )}
        </div>
        <div className="platform-card">
          <div className="platform-icon">
            <Bookmark size={20} />
          </div>
          <h3>Saved Opportunities</h3>
          <p>Keep opportunities you want to revisit.</p>
          {user ? (
            <button className="primary" onClick={() => setOpen('saved')}>
              Open Saved ({saved.length})
            </button>
          ) : (
            <button className="secondary" onClick={signIn}>
              <UserRound size={15} /> Sign in to save
            </button>
          )}
        </div>
        <div className="platform-card">
          <div className="platform-icon">
            <CreditCard size={20} />
          </div>
          <h3>EDUKEN Wallet</h3>
          <p>Keep optional service credit and pay for eligible EDUKEN services without starting a new checkout each time.</p>
          {user ? (
            <>
              <p className="wallet-card-balance">{walletLoading ? 'Loading balance…' : wallet ? 'Balance: ₦' + Number(wallet.balance || 0).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : 'Wallet status unavailable'}</p>
              <button className="primary" onClick={() => { setWalletMessage(''); setOpen('wallet'); void refreshWallet(); }}>Open Wallet</button>
            </>
          ) : (
            <button className="secondary" onClick={() => { setCustomerSignInMessage(''); setCustomerSignInOpen(true); }}><UserRound size={15} /> Sign in to get a wallet</button>
          )}
          {walletMessage && !wallet && user ? <small role="status">{walletMessage}</small> : null}
        </div>
        <div className="platform-card">
          <div className="platform-icon">
            <Target size={20} />
          </div>
          <h3>Application Tracker</h3>
          <p>Track applications from planning through results.</p>
          {user ? (
            <button className="primary" onClick={() => setOpen('tracker')}>
              My Tracker ({tracker.length})
            </button>
          ) : (
            <button className="secondary" onClick={signIn}>
              Sign in to track
            </button>
          )}
        </div>
        <div className="platform-card">
          <div className="platform-icon">
            <Bell size={20} />
          </div>
          <h3>Smart Alerts</h3>
          <p>
            Choose categories and enable device notifications where supported.
          </p>
          <button className="secondary" onClick={() => setOpen('alerts')}>
            <Bell size={15} /> Manage alerts
          </button>
        </div>
      </div>

      <div className="platform-wide student-deliverables" aria-labelledby="student-deliverables-title">
        <div className="student-deliverables-heading">
          <span className="kicker"><FileText size={15} /> MY SERVICE DOCUMENTS</span>
          <h3 id="student-deliverables-title">Results and deliverables</h3>
          <p>Download documents that EDUKEN has securely published to your account. Only your own published files are shown.</p>
        </div>
        <div className="student-deliverables-actions">
          <button className="secondary" type="button" onClick={() => void refreshDeliverables()} disabled={deliverablesLoading}>
            <RefreshCw size={15} /> {deliverablesLoading ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
        {deliverablesMessage ? <p role="status" aria-live="polite">{deliverablesMessage}</p> : null}
        {deliverablesLoading && !deliverables.length ? <p>Loading your documents…</p> : null}
        {deliverables.map(item => (
          <article className="student-deliverable-row" key={item.id}>
            <div className="student-deliverable-icon"><FileText size={20} /></div>
            <div className="student-deliverable-copy">
              <strong>{item.title}</strong>
              {item.description ? <p>{item.description}</p> : null}
              <small>
                {item.service_requests?.reference_number ? 'Request ' + item.service_requests.reference_number : 'Service request'}
                {item.service_requests?.services?.name ? ' · ' + item.service_requests.services.name : ''}
                {item.published_at ? ' · Published ' + new Date(item.published_at).toLocaleDateString('en-NG') : ''}
              </small>
              <small>{item.original_filename} · {Math.max(1, Math.ceil(Number(item.file_size_bytes || 0) / 1024))} KB</small>
            </div>
            <button className="secondary" type="button" onClick={() => void downloadDeliverable(item)} aria-label={'Download ' + item.title}>
              <Download size={15} /> Download
            </button>
          </article>
        ))}
      </div>

      <div className="platform-wide finder-box">
        <div>
          <span className="kicker">🎓 ADMISSION FINDER</span>
          <h3>Research schools and courses.</h3>
          <p>Guidance only — never a guaranteed admission predictor.</p>
        </div>
        <div className="finder-inputs">
          <input
            placeholder="Course / keyword"
            value={course}
            onChange={e => setCourse(e.target.value)}
          />
          <input
            placeholder="Location / state"
            value={location}
            onChange={e => setLocation(e.target.value)}
          />
          <input
            placeholder="JAMB score"
            value={jamb}
            onChange={e => setJamb(e.target.value)}
          />
        </div>
        <div className="finder-results">
          {schoolMatches.length ? (
            schoolMatches.map(x => (
              <div key={x.id}>
                <b>{x.school}</b>
                <span>
                  {x.course || 'Admission information'}
                  {jamb ? ' • JAMB: ' + jamb : ''}
                </span>
              </div>
            ))
          ) : (
            <small>No matching published admission records yet.</small>
          )}
        </div>
      </div>

      <div className="platform-wide ai-panel">
        <div>
          <span className="kicker">ASK EDUKEN</span>
          <h3>Need help understanding what is published?</h3>
          <p>
            Use the AI Assistant as a guide to EDUKEN's current content. It does
            not guarantee admission or invent facts.
          </p>
        </div>
        <div className="platform-input">
          <input
            value={aiQuestion}
            onChange={e => setAiQuestion(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && askAi()}
            placeholder="Ask about an EDUKEN update..."
          />
          <button className="primary" onClick={askAi}>
            {aiLoading ? '…' : 'Ask EDUKEN'}
          </button>
        </div>
        {aiAnswer && (
          <div className="ai-answer">
            {aiResearchStatus && aiResearchStatus !== 'completed' && aiResearchStatus !== 'not_needed' && (
              <div role="status" style={{ padding: '10px 12px', marginBottom: 12, borderRadius: 8, background: '#fff4df', color: '#744b00', fontSize: 13, lineHeight: 1.5 }}>
                ⚠️ Live web research could not be completed for this answer. Current deadlines, availability and requirements may not be verified; check the official source before acting.
              </div>
            )}
            {aiResearchStatus === 'completed' && (
              <div role="status" style={{ padding: '8px 12px', marginBottom: 12, borderRadius: 8, background: '#e8f7ee', color: '#17633a', fontSize: 13 }}>
                ✓ Live web research completed. Relevant sources are listed below.
              </div>
            )}
            <AiFormattedAnswer text={aiAnswer} />
            {aiSources.length > 0 && (
              <div className="ai-sources" style={{ marginTop: 14 }}>
                <strong>Sources checked</strong>
                <ul style={{ margin: '8px 0 0', paddingLeft: 20 }}>
                  {[...new Set(aiSources.map((source) => {
                    try {
                      return new URL(source.url).hostname.replace(/^www\./, '');
                    } catch {
                      return '';
                    }
                  }).filter(Boolean))].slice(0, 5).map((sourceName) => (
                    <li key={sourceName} style={{ marginBottom: 6 }}>{sourceName}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {customerSignInOpen && (
        <div role="presentation" onClick={event => { if (event.target === event.currentTarget && !customerSignInLoading) setCustomerSignInOpen(false); }} style={{ position: 'fixed', inset: 0, zIndex: 1200, background: 'rgba(7, 20, 38, .72)', display: 'grid', placeItems: 'center', padding: 16 }}>
          <section className="login-dialog" role="dialog" aria-modal="true" aria-labelledby="customer-signin-title" style={{ width: '100%', maxWidth: 440 }}>
            <button className="login-close" type="button" aria-label="Close customer sign-in" disabled={customerSignInLoading} onClick={() => setCustomerSignInOpen(false)}>×</button>
            <span className="kicker">CUSTOMER ACCOUNT</span>
            <h2 id="customer-signin-title">{customerAuthMode === 'signup' ? 'Create your EDUKEN account' : 'Sign in to EDUKEN'}</h2>
            <p>Use your student account to submit service requests and receive your documents securely.</p>
            <button
              className="customer-google-signin"
              type="button"
              onClick={() => { setCustomerSignInMessage(''); void auth.signIn(); }}
              disabled={customerSignInLoading}
            >
              <span className="customer-google-mark" aria-hidden="true">G</span>
              Continue with Google
            </button>
            <div className="customer-signin-divider"><span>or use email</span></div>
            <form className="service-request-form" onSubmit={customerAuthMode === 'signup' ? signUpCustomer : signInCustomer}>
              <label className="service-request-field" htmlFor="customer-signin-email">
                <span>Email address</span>
                <input id="customer-signin-email" type="email" autoComplete="username" required value={customerEmail} onChange={event => setCustomerEmail(event.target.value)} disabled={customerSignInLoading} />
              </label>
              <label className="service-request-field" htmlFor="customer-signin-password">
                <span>Password {customerAuthMode === 'signup' ? '(at least 8 characters)' : ''}</span>
                <input id="customer-signin-password" type="password" autoComplete={customerAuthMode === 'signup' ? 'new-password' : 'current-password'} minLength={customerAuthMode === 'signup' ? 8 : undefined} required value={customerPassword} onChange={event => setCustomerPassword(event.target.value)} disabled={customerSignInLoading} />
              </label>
              {customerSignInMessage ? <p className="make-payments-message" role="alert">{customerSignInMessage}</p> : null}
              <button className="primary" type="submit" disabled={customerSignInLoading}>{customerSignInLoading ? (customerAuthMode === 'signup' ? 'Creating account…' : 'Signing in…') : (customerAuthMode === 'signup' ? 'Create account' : 'Sign in securely')}</button>
              <button className="secondary" type="button" disabled={customerSignInLoading} onClick={() => { setCustomerAuthMode(customerAuthMode === 'signup' ? 'signin' : 'signup'); setCustomerSignInMessage(''); setCustomerPassword(''); }}>{customerAuthMode === 'signup' ? 'Already have an account? Sign in' : 'New here? Create an account'}</button>
            </form>
          </section>
        </div>
      )}

      {open === 'wallet' && (
        <Drawer title="EDUKEN Wallet" close={() => setOpen('')}>
          <div className="drawer-list">
            <div className="platform-wide">
              <span className="kicker">AVAILABLE BALANCE</span>
              <h2>₦{Number(wallet?.balance || 0).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
              <p>Wallet funds are currently intended for eligible EDUKEN services only. Withdrawals are not enabled.</p>
            </div>
            <form className="service-request-form" onSubmit={startWalletDeposit}>
              <label className="service-request-field" htmlFor="wallet-deposit-amount">
                <span>Add funds (NGN)</span>
                <input id="wallet-deposit-amount" type="number" min="100" max="500000" step="1" required disabled={walletAction || Boolean(walletDepositKey) || Boolean(walletTransferKey)} value={walletAmount} onChange={event => setWalletAmount(event.target.value)} />
              </label>
              <p className="make-payments-security">Deposits are credited only after EDUKEN verifies a successful Flutterwave payment. Do not share your card PIN or banking password.</p>
              {walletDepositKey ? <small>Keep this checkout attempt unchanged until payment is confirmed. If initialization is uncertain, contact support before retrying.</small> : null}
              {walletTransferKey && !walletTransferInfo ? <small>Keep this bank-transfer attempt unchanged while details are being checked. Do not start another attempt.</small> : null}
              {walletMessage ? <p className="make-payments-message" role="status" aria-live="polite">{walletMessage}</p> : null}
              {walletTransferInfo ? (
                <div className="platform-wide" style={{ marginTop: 12, padding: 14, border: '1px solid #cbded2', borderRadius: 12 }}>
                  <strong>Flutterwave bank transfer</strong>
                  <p>Bank: <b>{walletTransferInfo.bankName}</b></p>
                  <p>Account name: <b>{walletTransferInfo.accountName || 'EDUKEN WALLET TOPUP (confirm this name in your banking app before transferring)'}</b></p>
                  <p>Account number: <b>{walletTransferInfo.accountNumber}</b></p>
                  <p>Transfer exactly: <b>₦{walletTransferInfo.amount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</b></p>
                  {walletTransferInfo.expiresAt ? (
                    <div role="timer" aria-live="off" style={{ margin: '12px 0', padding: '10px 12px', borderRadius: 10, background: walletTransferCountdown === 'Expired' ? '#fff0f0' : '#eef8f1', color: walletTransferCountdown === 'Expired' ? '#9b1c1c' : '#14532d' }}>
                      <span style={{ display: 'block', fontSize: 13, fontWeight: 600 }}>Time remaining</span>
                      <strong style={{ fontSize: 24, fontVariantNumeric: 'tabular-nums' }}>{walletTransferCountdown ?? 'Checking expiry…'}</strong>
                      <small style={{ display: 'block', marginTop: 4 }}>Expires: {new Date(walletTransferInfo.expiresAt).toLocaleString('en-NG')}</small>
                    </div>
                  ) : <p><b>Expiry time was not supplied by the bank. Confirm validity before transferring.</b></p>}
                  <p>Reference: <b>{walletTransferInfo.reference}</b></p>
                  <small>Do not transfer after expiry. Your wallet balance updates only after verified confirmation; bank transfers may take a few minutes.</small>
                </div>
              ) : null}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                <button className="primary" type="submit" disabled={walletAction || Boolean(walletTransferKey)}>{walletAction ? 'Preparing…' : 'Pay with Flutterwave checkout'}</button>
                <button className="primary" type="button" disabled={walletAction || Boolean(walletDepositKey) || Boolean(walletTransferKey)} onClick={() => void startWalletTransfer()}>{walletAction ? 'Preparing…' : 'Get bank-transfer details'}</button>
              </div>
            </form>
            <div>
              <h4>Recent transactions</h4>
              {walletLoading ? <p>Loading wallet history…</p> : walletTransactions.length ? (
                walletTransactions.map(transaction => {
                  const isCredit = transaction.transaction_type === 'deposit' || transaction.transaction_type === 'refund';
                  const label = transaction.transaction_type === 'deposit' ? 'Wallet deposit' : transaction.transaction_type === 'refund' ? 'Refund' : 'Service payment';
                  return (
                    <div className="drawer-item" key={transaction.id}>
                      <div>
                        <b>{label}</b>
                        <small>{transaction.description || new Date(transaction.created_at).toLocaleString()}</small>
                        <small>{new Date(transaction.created_at).toLocaleString('en-NG')}</small>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <b>{isCredit ? '+' : '−'}₦{Number(transaction.amount || 0).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</b>
                        <small>Balance: ₦{Number(transaction.balance_after || 0).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</small>
                      </div>
                    </div>
                  );
                })
              ) : <div className="empty">No wallet transactions yet.</div>}
            </div>
          </div>
        </Drawer>
      )}

      {open === 'saved' && (
        <Drawer title="Saved Opportunities" close={() => setOpen('')}>
          <div className="drawer-list">
            {saved.length ? (
              saved.map(x => (
                <div className="drawer-item" key={x.id}>
                  <div>
                    <b>{x.title}</b>
                    <small>Saved opportunity</small>
                  </div>
                  <a
                    className="secondary"
                    href={
                      '#opportunity/' +
                      encodeURIComponent(x.slug || x.opportunityId)
                    }
                  >
                    Open
                  </a>
                  <button
                    className="icon-button"
                    onClick={() =>
                      save({
                        id: x.opportunityId,
                        title: x.title,
                        slug: x.slug,
                      })
                    }
                  >
                    <X size={15} />
                  </button>
                </div>
              ))
            ) : (
              <div className="empty">No saved opportunities yet.</div>
            )}
          </div>
        </Drawer>
      )}

      {open === 'tracker' && (
        <Drawer title="Application Tracker" close={() => setOpen('')}>
          <div className="drawer-list">
            {tracker.length ? (
              tracker.map(x => (
                <div className="tracker-row" key={x.id}>
                  <b>{x.title}</b>
                  <small>
                    {x.deadline
                      ? 'Deadline: ' + x.deadline
                      : 'Deadline not specified'}
                  </small>
                  <select
                    value={x.status}
                    onChange={e =>
                      updateTracker(x, e.target.value, x.notes || '')
                    }
                  >
                    {STATUSES.map(s => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                  <textarea
                    defaultValue={x.notes || ''}
                    placeholder="Notes"
                    onBlur={e => updateTracker(x, x.status, e.target.value)}
                  />
                </div>
              ))
            ) : (
              <div className="empty">No applications tracked yet.</div>
            )}
          </div>
        </Drawer>
      )}

      {open === 'alerts' && (
        <Drawer title="Notifications & Alerts" close={() => setOpen('')}>
          <button className="primary full" onClick={enablePush}>
            <Bell size={15} /> Check browser notification permission
          </button>
          <p role="status" aria-live="polite" style={{ fontSize: 13, lineHeight: 1.5 }}>
            Automatic background push alerts are not connected yet. Topic preferences and in-app alerts can still be managed here.
          </p>
          {notificationStatus && (
            <p role="status" aria-live="polite" style={{ fontSize: 13, lineHeight: 1.5 }}>
              {notificationStatus}
            </p>
          )}
          <button className="secondary full" onClick={() => markRead()}>
            <Check size={15} /> Mark all as read
          </button>
          <h4>Topics</h4>
          {TOPICS.map(topic => {
            const enabled = topics.includes(topic);
            return (
              <button
                type="button"
                role="switch"
                aria-checked={enabled}
                aria-label={topic + ' notifications'}
                className={'topic-row topic-switch-row ' + (enabled ? 'active' : '')}
                key={topic}
                onClick={() => toggleTopic(topic)}
              >
                <span className="topic-switch-label">{topic}</span>
                <span className="topic-switch-state">
                  <span className="topic-switch-track" aria-hidden="true">
                    <span className="topic-switch-thumb" />
                  </span>
                  <b>{enabled ? 'ON' : 'OFF'}</b>
                </span>
              </button>
            );
          })}
          <h4>Recent alerts</h4>
          {alerts.map(x => (
            <button
              className={'alert-row ' + (x.read ? 'read' : '')}
              key={x.id}
              onClick={() => markRead(x.id)}
            >
              <b>{x.title}</b>
              <span>{x.body}</span>
            </button>
          ))}
        </Drawer>
      )}
    </section>
  );
}

function Drawer({
  title,
  close,
  children,
}: {
  title: string;
  close: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="drawer-backdrop" onClick={close}>
      <aside className="drawer" onClick={e => e.stopPropagation()}>
        <header>
          <div>
            <span className="kicker">EDUKEN CONSULT</span>
            <h3>{title}</h3>
          </div>
          <button className="icon-button" onClick={close}>
            <X />
          </button>
        </header>
        {children}
      </aside>
    </div>
  );
}
