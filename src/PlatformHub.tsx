import { useEffect, useMemo, useState } from 'react';
import { api, auth, notifications } from './lib/api';
import {
  Bell,
  Bookmark,
  Calculator,
  Check,
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

export default function PlatformHub({
  opportunities,
  admissions,
}: {
  opportunities: Item[];
  admissions: Item[];
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
  const [post, setPost] = useState('');
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiAnswer, setAiAnswer] = useState('');
  const [aiSources, setAiSources] = useState<{ title: string; url: string; description?: string }[]>([]);
  const [aiLoading, setAiLoading] = useState(false);

  const refresh = async () => {
    if (!auth.isSignedIn()) return;
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
      api.post('/api/user/reminders/check', {}).catch(() => undefined);
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    refresh();
    if (!auth.isSignedIn()) return;
    return notifications.onMessage(() => refresh());
  }, []);

  const signIn = async () => {
    try {
      await auth.signIn({ scope: 'openid email profile offline_access' });
      await refresh();
    } catch {
      /* cancelled */
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
        slug: item.slug || item.id,
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
        slug: item.slug || item.id,
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

  const enablePush = async () => {
    if (!user) {
      await signIn();
      return;
    }
    try {
      await notifications.subscribe({ showUi: true });
    } catch {
      /* unsupported */
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
    try {
      const res = await fetch('/api/ai-assistant', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ question: aiQuestion }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'AI request failed');
      setAiAnswer(data.answer || 'I could not find a confident answer.');
      setAiSources(Array.isArray(data.sources) ? data.sources.filter((source: any) => source?.url) : []);
    } catch {
      setAiAnswer(
        'I could not answer that right now. Please verify the official source or contact EDUKEN CONSULT.'
      );
      setAiSources([]);
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
                      'opportunity/' + encodeURIComponent(item.slug || item.id))
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

      <div className="platform-grid">
        <div className="platform-card">
          <div className="platform-icon">
            <Calculator size={20} />
          </div>
          <h3>EDUKEN Score Tool</h3>
          <p>Quick raw-score calculation. Institutional formulas differ.</p>
          <div className="finder-inputs two">
            <input
              inputMode="numeric"
              placeholder="JAMB"
              value={jamb}
              onChange={e => setJamb(e.target.value)}
            />
            <input
              inputMode="numeric"
              placeholder="Post-UTME"
              value={post}
              onChange={e => setPost(e.target.value)}
            />
          </div>
          <strong>
            {jamb && post
              ? 'Raw combined score: ' + (Number(jamb) + Number(post))
              : 'Enter both scores'}
          </strong>
          <small>
            Guidance only. Confirm the official institution's formula.
          </small>
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
            <div>{aiAnswer}</div>
            {aiSources.length > 0 && (
              <div className="ai-sources" style={{ marginTop: 14 }}>
                <strong>Web sources to verify</strong>
                <ul style={{ margin: '8px 0 0', paddingLeft: 20 }}>
                  {aiSources.map((source, index) => (
                    <li key={source.url + index} style={{ marginBottom: 8 }}>
                      <a href={source.url} target="_blank" rel="noreferrer">
                        {source.title || source.url}
                      </a>
                      {source.description && <div>{source.description}</div>}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

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
            <Bell size={15} /> Enable device notifications
          </button>
          <button className="secondary full" onClick={() => markRead()}>
            <Check size={15} /> Mark all as read
          </button>
          <h4>Topics</h4>
          {TOPICS.map(topic => (
            <button
              className={
                'topic-row ' + (topics.includes(topic) ? 'active' : '')
              }
              key={topic}
              onClick={() => toggleTopic(topic)}
            >
              <span>{topic}</span>
              <b>{topics.includes(topic) ? 'ON' : 'OFF'}</b>
            </button>
          ))}
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
