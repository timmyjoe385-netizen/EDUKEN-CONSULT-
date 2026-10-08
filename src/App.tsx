import { useEffect, useMemo, useState } from 'react';
import { api, auth } from './lib/api';
import {
  ArrowRight,
  BookOpen,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronDown,
  GraduationCap,
  Laptop,
  LogOut,
  Menu,
  MessageCircle,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import PlatformHub from './PlatformHub';

const WA = 'https://wa.me/2348129811733';
const channel = 'https://whatsapp.com/channel/0029VbCwMut3WHTfyxih1U0g';

type Item = Record<string, any> & { id: string };
type Content = {
  opportunities: Item[];
  admissions: Item[];
  updates: Item[];
  faqs: Item[];
  services: Item[];
};

const categories = [
  [
    'Admissions',
    'Admission updates, application information and school guidance.',
    GraduationCap,
  ],
  [
    'Scholarships & Grants',
    'Funding opportunities, fellowships and educational support.',
    Sparkles,
  ],
  [
    'Jobs & Internships',
    'Jobs, internships and graduate trainee opportunities.',
    BriefcaseBusiness,
  ],
  [
    'Remote Opportunities',
    'Legitimate remote work and digital opportunities.',
    Laptop,
  ],
  [
    'Educational Updates',
    'Important education, exams and school announcements.',
    BookOpen,
  ],
  [
    'Career & Mentorship',
    'Career development, mentorship and skill-building.',
    Target,
  ],
];

const emptyContent: Content = {
  opportunities: [],
  admissions: [],
  updates: [],
  faqs: [],
  services: [],
};

function App() {
  const [menu, setMenu] = useState(false);
  const [oppFilter, setOppFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [content, setContent] = useState<Content>(emptyContent);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [adminView, setAdminView] = useState(false);
  const [adminTab, setAdminTab] = useState('opportunities');
  const [adminItems, setAdminItems] = useState<Item[]>([]);
  const [consultations, setConsultations] = useState<Item[]>([]);
  const [form, setForm] = useState<Record<string, string>>({});
  const [articleSlug, setArticleSlug] = useState('');
  const [shareCopied, setShareCopied] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<Event | null>(null);
  const [installOpen, setInstallOpen] = useState(false);
  const [installed, setInstalled] = useState(false);

  const makeSlug = (value: string) =>
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

  const syncArticleFromHash = () => {
    const match = window.location.hash.match(/^#opportunity\/(.+)$/);
    setArticleSlug(match ? decodeURIComponent(match[1]) : '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const articleUrl = (slug: string) =>
    window.location.origin +
    window.location.pathname +
    '#opportunity/' +
    encodeURIComponent(slug);

  const openOpportunity = (item: Item) => {
    const slug = item.slug || makeSlug(item.title || item.id);
    window.location.hash = 'opportunity/' + encodeURIComponent(slug);
    setArticleSlug(slug);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const loadContent = async () => {
    try {
      const res = await fetch('https://pphxltbkwygqjtjgkhxu.supabase.co/functions/v1/eduken-api/public-content', { cache: 'no-store' }).then(async response => { if (!response.ok) throw new Error('Live content request failed'); return { data: await response.json() }; });
      setContent(res.data);
    } catch {
      setToast('Unable to load live content. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContent();
    syncArticleFromHash();
    const onHashChange = () => syncArticleFromHash();
    window.addEventListener('hashchange', onHashChange);
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setInstalled(standalone);
    const onInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event);
    };
    const onInstalled = () => {
      setInstalled(true);
      setInstallPrompt(null);
      setInstallOpen(false);
      setToast('EDUKEN CONSULT is now installed on your device.');
    };
    window.addEventListener('beforeinstallprompt', onInstallPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('hashchange', onHashChange);
      window.removeEventListener('beforeinstallprompt', onInstallPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 3500);
  };

  const installApp = async () => {
    if (installed) return;
    if (installPrompt) {
      const prompt = installPrompt as Event & {
        prompt?: () => Promise<void>;
        userChoice?: Promise<{ outcome: string }>;
      };
      if (prompt.prompt) {
        await prompt.prompt();
        const choice = await prompt.userChoice;
        if (choice?.outcome === 'accepted')
          setToast('Installing EDUKEN CONSULT…');
      }
      return;
    }
    setInstallOpen(true);
  };

  const filteredOpps = useMemo(
    () =>
      content.opportunities.filter(
        o =>
          (oppFilter === 'All' || o.category === oppFilter) &&
          ((o.title || '') + (o.description || ''))
            .toLowerCase()
            .includes(search.toLowerCase())
      ),
    [content.opportunities, oppFilter, search]
  );

  const filteredAdmissions = useMemo(
    () =>
      content.admissions.filter(a =>
        ((a.school || '') + (a.course || '') + (a.type || ''))
          .toLowerCase()
          .includes(search.toLowerCase())
      ),
    [content.admissions, search]
  );

  const closingSoon = useMemo(
    () =>
      content.opportunities
        .map(item => ({
          item,
          time: new Date(String(item.deadline || '')).getTime(),
        }))
        .filter(
          x =>
            Number.isFinite(x.time) &&
            x.time > Date.now() &&
            x.time - Date.now() <= 14 * 864e5
        )
        .sort((a, b) => a.time - b.time)
        .map(x => x.item)
        .slice(0, 4),
    [content.opportunities]
  );

  const featuredOpps = useMemo(
    () =>
      content.opportunities
        .filter(
          item =>
            item.featured === true ||
            String(item.featured).toLowerCase() === 'true'
        )
        .slice(0, 4),
    [content.opportunities]
  );

  const signIn = async () => {
    try {
      const result = await auth.signIn({
        scope: 'openid email profile offline_access',
      });
      setUser(result.user);
      setAdminView(true);
      await loadAdmin(adminTab);
    } catch {
      showToast('Admin sign-in was cancelled or unavailable.');
    }
  };

  const loadAdmin = async (table = adminTab) => {
    try {
      const res =
        table === 'consultations'
          ? await api.get('/api/admin/consultations')
          : await api.get('/api/admin/content/' + table);
      if (table === 'consultations') setConsultations(res.data.items);
      else setAdminItems(res.data.items);
    } catch {
      showToast(
        'Access denied. Only authorized EDUKEN administrators can use the dashboard.'
      );
      setAdminView(false);
    }
  };

  const saveAdmin = async () => {
    try {
      const table = adminTab;
      const payload = { ...form };
      if (table === 'opportunities' && !payload.slug)
        payload.slug =
          makeSlug(payload.title || '') + '-' + Date.now().toString(36);
      if (table === 'opportunities' && !payload.description)
        payload.description = (payload.content || '')
          .split('\n')[0]
          .slice(0, 180);
      if (form.id)
        await api.put('/api/admin/content/' + table + '/' + form.id, payload);
      else await api.post('/api/admin/content/' + table, payload);
      setForm({});
      await loadAdmin(table);
      await loadContent();
      showToast('Saved successfully.');
    } catch {
      showToast('Could not save this item.');
    }
  };

  const deleteAdmin = async (id: string) => {
    if (!window.confirm('Delete this item permanently?')) return;
    try {
      await api.delete('/api/admin/content/' + adminTab + '/' + id);
      await loadAdmin(adminTab);
      await loadContent();
      showToast('Deleted successfully.');
    } catch {
      showToast('Could not delete this item.');
    }
  };

  const updateConsultation = async (item: Item, status: string) => {
    try {
      await api.put('/api/admin/consultations/' + item.id, { status });
      await loadAdmin('consultations');
      showToast('Consultation status updated.');
    } catch {
      showToast('Could not update consultation.');
    }
  };

  const submitConsultation = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    try {
      await api.post('/consultations', {
        name: fd.get('name'),
        whatsapp: fd.get('whatsapp'),
        email: fd.get('email'),
        state: fd.get('state'),
        educationLevel: fd.get('educationLevel'),
        interest: fd.get('interest'),
        schoolCourse: fd.get('schoolCourse'),
        message: fd.get('message'),
      });
      e.currentTarget.reset();
      showToast(
        'Consultation request received. We will follow up through your contact details.'
      );
    } catch {
      showToast('We could not save your request. Please try again.');
    }
  };

  const logout = async () => {
    await auth.signOut();
    setUser(null);
    setAdminView(false);
  };

  const adminFields: Record<string, string[]> = {
    opportunities: [
      'title',
      'category',
      'description',
      'deadline',
      'link',
      'status',
      'content',
      'eligibility',
      'benefits',
      'howToApply',
      'sourceUrl',
      'verified',
      'slug',
      'featured',
      'urgent',
      'notifyOnPublish',
    ],
    admissions: [
      'school',
      'type',
      'course',
      'status',
      'deadline',
      'details',
      'link',
    ],
    updates: [
      'category',
      'title',
      'body',
      'date',
      'sourceUrl',
      'verified',
      'featured',
      'urgent',
      'status',
    ],
    faqs: ['question', 'answer', 'status'],
    services: ['name', 'status'],
  };

  if (adminView) {
    const fields = adminFields[adminTab] || [];
    return (
      <div className="admin-shell">
        <header className="admin-header">
          <div className="brand">
            <img
              className="brand-logo"
              src="./icons/icon.svg"
              alt="EDUKEN CONSULT"
            />
            <span>
              EDUKEN <b>ADMIN</b>
            </span>
          </div>
          <div className="admin-user">
            <span>{user?.email}</span>
            <button onClick={logout}>
              <LogOut size={16} /> Sign out
            </button>
          </div>
        </header>
        <div className="admin-layout">
          <aside className="admin-side">
            {[
              'opportunities',
              'admissions',
              'updates',
              'faqs',
              'services',
              'consultations',
            ].map(tab => (
              <button
                className={adminTab === tab ? 'active' : ''}
                key={tab}
                onClick={() => {
                  setAdminTab(tab);
                  setForm({});
                  loadAdmin(tab);
                }}
              >
                {tab === 'opportunities'
                  ? '🌍 Opportunities'
                  : tab === 'consultations'
                    ? '📩 Consultations'
                    : tab[0].toUpperCase() + tab.slice(1)}
              </button>
            ))}
            <button
              onClick={() => {
                setAdminView(false);
              }}
            >
              ← Public site
            </button>
          </aside>
          <main className="admin-main">
            <div className="admin-title">
              <div>
                <span className="kicker">EDUKEN CONSULT</span>
                <h1>{adminTab[0].toUpperCase() + adminTab.slice(1)} Manager</h1>
              </div>
              {adminTab !== 'consultations' && (
                <button className="primary" onClick={() => setForm({})}>
                  <Plus size={17} /> New
                </button>
              )}
            </div>
            {adminTab === 'consultations' ? (
              <div className="admin-list">
                {consultations.length === 0 ? (
                  <div className="admin-empty">
                    No consultation requests yet.
                  </div>
                ) : (
                  consultations.map(item => (
                    <article className="admin-item" key={item.id}>
                      <div>
                        <span className="tag">{item.status}</span>
                        <h3>{item.name}</h3>
                        <p>{item.message}</p>
                        <small>
                          {item.whatsapp} • {item.email || 'No email'} •{' '}
                          {item.createdAt}
                        </small>
                      </div>
                      <select
                        value={item.status || 'New'}
                        onChange={e => updateConsultation(item, e.target.value)}
                      >
                        <option>New</option>
                        <option>Contacted</option>
                        <option>Completed</option>
                        <option>Archived</option>
                      </select>
                    </article>
                  ))
                )}
              </div>
            ) : (
              <div className="admin-grid">
                <div className="admin-list">
                  {adminItems.map(item => (
                    <article className="admin-item" key={item.id}>
                      <div>
                        <span className="tag">
                          {item.category || item.status || 'Published'}
                        </span>
                        <h3>
                          {item.title ||
                            item.school ||
                            item.question ||
                            item.name}
                        </h3>
                        <p>
                          {item.description ||
                            item.body ||
                            item.answer ||
                            item.course ||
                            ''}
                        </p>
                      </div>
                      <div className="admin-actions">
                        <button onClick={() => setForm(item)}>Edit</button>
                        <button
                          className="danger"
                          onClick={() => deleteAdmin(item.id)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
                <div className="admin-editor">
                  <h2>{form.id ? 'Edit item' : 'Create item'}</h2>
                  {fields.map(field => (
                    <label key={field}>
                      {field}
                      {[
                        'content',
                        'eligibility',
                        'benefits',
                        'howToApply',
                      ].includes(field) ? (
                        <textarea
                          value={form[field] || ''}
                          onChange={e =>
                            setForm({ ...form, [field]: e.target.value })
                          }
                          rows={field === 'content' ? 8 : 5}
                        />
                      ) : (
                        <input
                          value={form[field] || ''}
                          onChange={e =>
                            setForm({ ...form, [field]: e.target.value })
                          }
                        />
                      )}
                    </label>
                  ))}
                  <button className="primary" onClick={saveAdmin}>
                    {form.id ? 'Save changes' : 'Publish item'}
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    );
  }

  const activeOpportunity = articleSlug
    ? content.opportunities.find(
        o => (o.slug || makeSlug(o.title || o.id)) === articleSlug
      )
    : null;

  if (activeOpportunity) {
    const paragraphs = String(
      activeOpportunity.content || activeOpportunity.description || ''
    )
      .split(/\n\s*\n|\n/)
      .filter(Boolean);
    return (
      <div className="site">
        {toast && (
          <div className="toast">
            <CheckCircle2 size={18} />
            {toast}
          </div>
        )}
        <header className="nav">
          <a className="brand" href="#home" onClick={() => setArticleSlug('')}>
            <img
              className="brand-logo"
              src="./icons/icon.svg"
              alt="EDUKEN CONSULT"
            />
            <span>
              EDUKEN <b>CONSULT</b>
            </span>
          </a>
          <nav className="nav-links open">
            <a href="#home">Home</a>
            <a href="#opportunities">Opportunities</a>
            <a href="#contact">Contact</a>
            {!installed && (
              <button className="install-nav" onClick={installApp}>
                Install App
              </button>
            )}
            <button className="admin-login" onClick={signIn}>
              <ShieldCheck size={15} /> Admin
            </button>
          </nav>
        </header>
        <main className="article-page">
          <button
            className="article-back"
            onClick={() => {
              window.location.hash = 'opportunities';
              setArticleSlug('');
            }}
          >
            <ArrowRight size={16} /> Back to Opportunity Hub
          </button>
          <div className="article-hero">
            <span className="tag">
              {activeOpportunity.category || 'Opportunity'}
            </span>
            <h1>{activeOpportunity.title}</h1>
            <p>{activeOpportunity.description}</p>
            <div className="article-meta">
              <span>
                📅 Deadline:{' '}
                <b>{activeOpportunity.deadline || 'See details'}</b>
              </span>
              <span>🌍 EDUKEN OPPORTUNITY HUB</span>
            </div>
          </div>
          <div className="article-layout">
            <article className="article-body">
              {paragraphs.map((paragraph, index) =>
                index === 0 ? (
                  <p className="lead" key={index}>
                    {paragraph}
                  </p>
                ) : (
                  <p key={index}>{paragraph}</p>
                )
              )}
              {activeOpportunity.eligibility && (
                <section>
                  <h2>Eligibility</h2>
                  {String(activeOpportunity.eligibility)
                    .split(/\n/)
                    .filter(Boolean)
                    .map((x, i) => (
                      <p key={i}>• {x}</p>
                    ))}
                </section>
              )}
              {activeOpportunity.benefits && (
                <section>
                  <h2>Benefits</h2>
                  {String(activeOpportunity.benefits)
                    .split(/\n/)
                    .filter(Boolean)
                    .map((x, i) => (
                      <p key={i}>• {x}</p>
                    ))}
                </section>
              )}
              {activeOpportunity.howToApply && (
                <section>
                  <h2>How to Apply</h2>
                  {String(activeOpportunity.howToApply)
                    .split(/\n/)
                    .filter(Boolean)
                    .map((x, i) => (
                      <p key={i}>{x}</p>
                    ))}
                </section>
              )}
              <div className="article-note">
                ⚠️ Always confirm requirements, deadlines and application
                instructions with the official opportunity provider before
                submitting personal information or payment.
              </div>
            </article>
            <aside className="article-side">
              <div className="article-apply">
                <span className="kicker">READY TO APPLY?</span>
                <h3>{activeOpportunity.title}</h3>
                <div className="article-deadline">
                  Deadline
                  <br />
                  <strong>
                    {activeOpportunity.deadline || 'Check details'}
                  </strong>
                </div>
                {activeOpportunity.link && (
                  <a
                    className="primary"
                    href={activeOpportunity.link}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Apply Now <ArrowRight size={16} />
                  </a>
                )}
                <button
                  className="secondary"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(
                        articleUrl(
                          activeOpportunity.slug ||
                            makeSlug(
                              activeOpportunity.title || activeOpportunity.id
                            )
                        )
                      );
                      setShareCopied(true);
                      window.setTimeout(() => setShareCopied(false), 2500);
                    } catch {
                      showToast(
                        'Copy failed. You can copy the page address from your browser.'
                      );
                    }
                  }}
                >
                  {shareCopied ? 'Link Copied ✓' : 'Copy Article Link'}
                </button>
                {activeOpportunity.sourceUrl && (
                  <a
                    className="article-source"
                    href={activeOpportunity.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View Source ↗
                  </a>
                )}
              </div>
            </aside>
          </div>
        </main>
        <footer>
          <div className="footer-main">
            <div>
              <a className="brand" href="#home">
                <img
                  className="brand-logo"
                  src="./icons/icon.svg"
                  alt="EDUKEN CONSULT"
                />
                <span>
                  EDUKEN <b>CONSULT</b>
                </span>
              </a>
              <p>
                Your Trusted Plug for Educational Updates, Admissions &
                Opportunities.
              </p>
            </div>
            <div>
              <b>Explore</b>
              <a href="#opportunities">Opportunities</a>
              <a href="#updates">Updates</a>
            </div>
            <div>
              <b>Connect</b>
              <a href={channel} target="_blank" rel="noreferrer">
                WhatsApp Channel
              </a>
              <a href={WA} target="_blank" rel="noreferrer">
                08129811733
              </a>
            </div>
          </div>
          <div className="footer-bottom">
            <span>© 2026 EDUKEN CONSULT. All rights reserved.</span>
            <span>Opportunity article</span>
          </div>
        </footer>
        <a className="wa-float" href={WA} target="_blank" rel="noreferrer">
          <MessageCircle size={22} />
        </a>
      </div>
    );
  }

  return (
    <div className="site">
      {toast && (
        <div className="toast">
          <CheckCircle2 size={18} />
          {toast}
        </div>
      )}
      <header className="nav">
        <a className="brand" href="#home" onClick={() => setMenu(false)}>
          <img
            className="brand-logo"
            src="./icons/icon.svg"
            alt="EDUKEN CONSULT"
          />
          <span>
            EDUKEN <b>CONSULT</b>
          </span>
        </a>
        <nav className={menu ? 'nav-links open' : 'nav-links'}>
          {['Home', 'Opportunities', 'Admissions', 'Updates', 'More'].map(x => (
            <a
              key={x}
              href={x === 'More' ? '#more' : '#' + x.toLowerCase()}
              onClick={() => setMenu(false)}
            >
              {x}
            </a>
          ))}
          {!installed && (
            <button
              className="install-nav"
              onClick={() => {
                setMenu(false);
                installApp();
              }}
            >
              Install App
            </button>
          )}
          <button className="admin-login" onClick={signIn}>
            <ShieldCheck size={15} /> Admin
          </button>
          <a className="nav-cta" href={WA} target="_blank" rel="noreferrer">
            Get Consultation <ArrowRight size={16} />
          </a>
        </nav>
        <button
          className="menu-btn"
          aria-label="Toggle navigation"
          onClick={() => setMenu(!menu)}
        >
          {menu ? <X /> : <Menu />}
        </button>
      </header>

      {installOpen && !installed && (
        <div
          className="install-sheet"
          role="dialog"
          aria-label="Install EDUKEN CONSULT"
        >
          <span className="install-badge">E</span>
          <h3>Install EDUKEN CONSULT</h3>
          <p>
            Keep EDUKEN one tap away for faster access to admissions updates,
            scholarships, jobs and opportunities.
          </p>
          <ol>
            <li>
              On Chrome or Edge, tap the browser menu and choose{' '}
              <b>Install app</b> if shown.
            </li>
            <li>
              On iPhone or iPad, use <b>Share → Add to Home Screen</b>.
            </li>
          </ol>
          <div className="install-sheet-actions">
            <button className="secondary" onClick={() => setInstallOpen(false)}>
              Not now
            </button>
            <button className="primary" onClick={() => setInstallOpen(false)}>
              Got it
            </button>
          </div>
        </div>
      )}
      <main>
        <section id="home" className="hero">
          <div className="hero-copy">
            <div className="eyebrow">
              <span /> TRUSTED UPDATES • STUDENT-FOCUSED • OFFICIAL SOURCES
              WHERE AVAILABLE
            </div>
            <h1>
              Education.
              <br />
              <em>Opportunities.</em>
              <br />
              Your Next Move.
            </h1>
            <p>
              EDUKEN CONSULT helps students, applicants and young people stay
              informed with trusted educational updates, admissions information
              and opportunities that can move their future forward.
            </p>
            <div className="hero-actions">
              <a className="primary" href="#opportunities">
                Explore Opportunities <ArrowRight size={18} />
              </a>
              <a
                className="secondary"
                href={WA}
                target="_blank"
                rel="noreferrer"
              >
                <MessageCircle size={18} /> Talk to a Consultant
              </a>
            </div>
            <div className="hero-proof">
              <span>
                <ShieldCheck size={17} /> Information-first
              </span>
              <span>
                <Users size={17} /> Built for students
              </span>
            </div>
          </div>
          <div className="hero-visual">
            <div className="orb orb-one" />
            <div className="orb orb-two" />
            <div className="visual-card main-card">
              <div className="card-top">
                <span className="mini-logo">E</span>
                <span>EDUKEN OPPORTUNITY HUB</span>
                <span className="live-dot" />
              </div>
              <div className="visual-title">
                Find your next
                <br />
                <strong>opportunity.</strong>
              </div>
              <div className="visual-grid">
                <span>🎓 Admissions</span>
                <span>🌍 Scholarships</span>
                <span>💼 Jobs</span>
                <span>💻 Remote</span>
              </div>
              <div className="progress">
                <span />
              </div>
              <small>Education + Knowledge + Opportunity</small>
            </div>
            <div className="floating-card float-one">
              <CheckCircle2 size={19} />
              <div>
                <b>Verified</b>
                <small>Updates</small>
              </div>
            </div>
            <div className="floating-card float-two">
              <Sparkles size={18} />
              <div>
                <b>Opportunities</b>
                <small>Worth exploring</small>
              </div>
            </div>
          </div>
        </section>

        <PlatformHub
          opportunities={content.opportunities}
          admissions={content.admissions}
        />

        {featuredOpps.length > 0 && (
          <section className="section spotlight-section" id="featured">
            <div className="section-head">
              <div>
                <span className="kicker">⭐ FEATURED OPPORTUNITIES</span>
                <h2>Worth a closer look.</h2>
              </div>
              <p>
                Curated from opportunities actually published in the EDUKEN
                database.
              </p>
            </div>
            <div className="spotlight-grid">
              {featuredOpps.map(o => (
                <article className="spotlight-card" key={o.id}>
                  <div className="spotlight-top">
                    <span className="tag">{o.category || 'Opportunity'}</span>
                    {o.verified ? (
                      <span className="verified-pill">✓ Verified Source</span>
                    ) : o.sourceUrl ? (
                      <span className="source-pill">Source available</span>
                    ) : null}
                  </div>
                  <h3>{o.title}</h3>
                  <p>
                    {o.description ||
                      'Open the opportunity for eligibility, benefits and application instructions.'}
                  </p>
                  <div className="spotlight-meta">
                    <span>Deadline: {o.deadline || 'See details'}</span>
                    <button onClick={() => openOpportunity(o)}>
                      View details <ArrowRight size={14} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {closingSoon.length > 0 && (
          <section className="section closing-section">
            <div className="section-head">
              <div>
                <span className="kicker">⏳ CLOSING SOON</span>
                <h2>Deadlines worth watching.</h2>
              </div>
              <p>
                Upcoming opportunities with a published deadline in the next 14
                days.
              </p>
            </div>
            <div className="spotlight-grid">
              {closingSoon.map(o => (
                <article className="spotlight-card closing-card" key={o.id}>
                  <div className="spotlight-top">
                    <span className="tag">{o.category || 'Opportunity'}</span>
                    <span className="deadline-pill">⏳ {o.deadline}</span>
                  </div>
                  <h3>{o.title}</h3>
                  <p>
                    {o.description ||
                      'Review the official requirements before applying.'}
                  </p>
                  <div className="spotlight-meta">
                    <span>
                      {o.verified
                        ? '✓ Verified Source'
                        : o.sourceUrl
                          ? 'Source available'
                          : 'Verify with provider'}
                    </span>
                    <button onClick={() => openOpportunity(o)}>
                      Review & apply <ArrowRight size={14} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {content.updates.length > 0 && (
          <section className="section newsroom-preview">
            <div className="section-head">
              <div>
                <span className="kicker">📰 LATEST UPDATES</span>
                <h2>What changed recently.</h2>
              </div>
              <p>
                Admission, scholarship, examination and education updates
                published by EDUKEN.
              </p>
            </div>
            <div className="newsroom-grid">
              {content.updates.slice(0, 3).map(x => (
                <article className="newsroom-card" key={x.id}>
                  <div className="newsroom-top">
                    <span className="tag">{x.category || 'Update'}</span>
                    {x.verified ? (
                      <span className="verified-pill">✓ Verified Source</span>
                    ) : null}
                  </div>
                  <small>{x.date || 'EDUKEN Update'}</small>
                  <h3>{x.title}</h3>
                  <p>{x.body || 'Open the update for the full information.'}</p>
                  {x.sourceUrl && (
                    <a href={x.sourceUrl} target="_blank" rel="noreferrer">
                      Official Source <ArrowRight size={14} />
                    </a>
                  )}
                </article>
              ))}
            </div>
          </section>
        )}

        <section className="section journey-section">
          <div className="section-head">
            <div>
              <span className="kicker">HOW EDUKEN WORKS</span>
              <h2>Discover. Verify. Save. Apply. Track.</h2>
            </div>
            <p>
              A simple student journey built around useful information rather
              than endless features.
            </p>
          </div>
          <div className="journey-grid">
            <div>
              <b>01</b>
              <h3>Discover</h3>
              <p>
                Find admissions, scholarships, jobs, internships and other
                opportunities.
              </p>
            </div>
            <div>
              <b>02</b>
              <h3>Verify</h3>
              <p>
                Check requirements, deadlines and official sources before
                acting.
              </p>
            </div>
            <div>
              <b>03</b>
              <h3>Save</h3>
              <p>
                Keep opportunities you want to revisit in your student
                workspace.
              </p>
            </div>
            <div>
              <b>04</b>
              <h3>Apply</h3>
              <p>
                Follow the correct application instructions from the provider.
              </p>
            </div>
            <div>
              <b>05</b>
              <h3>Track</h3>
              <p>
                Keep your applications and deadlines organized in one place.
              </p>
            </div>
          </div>
        </section>

        <section className="section" id="more">
          <div className="section-head">
            <div>
              <span className="kicker">EXPLORE</span>
              <h2>What are you looking for?</h2>
            </div>
            <p>
              One platform for the information and opportunities that matter to
              your next move.
            </p>
          </div>
          <div className="category-grid">
            {categories.map(([name, desc, Icon]) => (
              <a
                className="category-card"
                href={name === 'Admissions' ? '#admissions' : '#opportunities'}
                key={name as string}
              >
                <div className="icon-box">
                  <Icon size={21} />
                </div>
                <h3>{name as string}</h3>
                <p>{desc as string}</p>
                <span>
                  Explore <ArrowRight size={15} />
                </span>
              </a>
            ))}
          </div>
        </section>

        <section className="section dark-section" id="opportunities">
          <div className="section-head light">
            <div>
              <span className="kicker">🌍 EDUKEN OPPORTUNITY HUB</span>
              <h2>Discover what could change your next chapter.</h2>
            </div>
            <p>
              Curated categories for scholarships, jobs, internships, grants,
              fellowships, competitions, mentorship, study abroad and remote
              work.
            </p>
          </div>
          <div className="toolbar">
            <div className="search">
              <Search size={18} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search opportunities, schools, courses..."
              />
            </div>
            <div className="filters">
              {[
                'All',
                'Scholarships',
                'Jobs',
                'Internships',
                'Grants',
                'Fellowships',
                'Remote',
                'Competitions',
              ].map(f => (
                <button
                  className={oppFilter === f ? 'active' : ''}
                  key={f}
                  onClick={() => setOppFilter(f)}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div className="opp-grid">
            {loading ? (
              <p>Loading live opportunities...</p>
            ) : (
              filteredOpps.map(o => (
                <article className="opp-card" key={o.id}>
                  <div className="opp-topline">
                    <span className="tag">{o.category || 'Opportunity'}</span>
                    {o.verified ? (
                      <span className="verified-pill">✓ Verified Source</span>
                    ) : o.sourceUrl ? (
                      <span className="source-pill">Source available</span>
                    ) : null}
                  </div>
                  <h3>{o.title}</h3>
                  <p>{o.description}</p>
                  <div className="opp-foot">
                    <span>Deadline: {o.deadline || 'See details'}</span>
                    <button onClick={() => openOpportunity(o)}>
                      Read Full Article <ArrowRight size={14} />
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>

        <section className="section" id="admissions">
          <div className="section-head">
            <div>
              <span className="kicker">🎓 ADMISSION HUB</span>
              <h2>Navigate admissions with clarity.</h2>
            </div>
            <p>
              Searchable, structured admission information managed through the
              secure EDUKEN dashboard.
            </p>
          </div>
          <div className="admission-grid">
            {loading ? (
              <p>Loading live admissions...</p>
            ) : (
              filteredAdmissions.map(a => (
                <article className="admission-card" key={a.id}>
                  <div className="admission-top">
                    <span>{a.type}</span>
                    <b>{a.status}</b>
                  </div>
                  <h3>{a.school}</h3>
                  <p>{a.course}</p>
                  <div className="line" />
                  <small>Deadline: {a.deadline}</small>
                  <button
                    onClick={() =>
                      a.link
                        ? window.open(a.link, '_blank', 'noopener,noreferrer')
                        : showToast(
                            a.details ||
                              'Detailed admission information will appear when an update is published.'
                          )
                    }
                  >
                    View Details <ArrowRight size={14} />
                  </button>
                </article>
              ))
            )}
          </div>
        </section>

        <section className="section pale">
          <div className="section-head">
            <div>
              <span className="kicker">OUR SERVICES</span>
              <h2>Practical support when you need it.</h2>
            </div>
            <p>
              From choosing an application route to navigating educational
              opportunities, get structured guidance without the noise.
            </p>
          </div>
          <div className="service-list">
            {content.services.map((s, i) => (
              <div className="service-row" key={s.id}>
                <span>{String(i + 1).padStart(2, '0')}</span>
                <b>{s.name}</b>
                <ArrowRight size={18} />
              </div>
            ))}
          </div>
        </section>

        <section className="consult-section" id="contact">
          <div>
            <span className="kicker">NEED PERSONAL GUIDANCE?</span>
            <h2>
              Let's figure out
              <br />
              <em>your next move.</em>
            </h2>
            <p>
              Not sure which school, course, application route or opportunity is
              right for you? Send a request and connect with EDUKEN CONSULT.
            </p>
            <a
              className="secondary light-btn"
              href={WA}
              target="_blank"
              rel="noreferrer"
            >
              <MessageCircle size={18} /> Chat on WhatsApp
            </a>
          </div>
          <form onSubmit={submitConsultation}>
            <div className="form-row">
              <input name="name" required placeholder="Full Name" />
              <input name="whatsapp" required placeholder="WhatsApp Number" />
            </div>
            <div className="form-row">
              <input name="email" type="email" placeholder="Email" />
              <input name="state" placeholder="State" />
            </div>
            <div className="form-row">
              <input
                name="educationLevel"
                placeholder="Current Education Level"
              />
              <input name="interest" placeholder="Area of Interest" />
            </div>
            <input
              name="schoolCourse"
              placeholder="School / Course of Interest"
            />
            <textarea
              name="message"
              required
              placeholder="Tell us what you need help with..."
            />
            <button className="primary" type="submit">
              Request Consultation <ArrowRight size={17} />
            </button>
          </form>
        </section>

        <section className="section" id="updates">
          <div className="section-head">
            <div>
              <span className="kicker">📰 EDUKEN NEWSROOM</span>
              <h2>Stay informed. Stay ahead.</h2>
            </div>
            <p>
              Important updates explained clearly, with source context where
              available.
            </p>
          </div>
          <div className="update-grid">
            {content.updates.map((x, i) => (
              <article className="update-card" key={x.id}>
                <div className={'update-image u' + (i % 3)}>
                  <span>{x.category || 'Update'}</span>
                </div>
                <small>EDUKEN UPDATE • {x.date || 'Recent'}</small>
                <h3>{x.title}</h3>
                <p>{x.body || 'Open this update for more information.'}</p>
                {x.verified ? (
                  <span className="verified-pill inline-pill">
                    ✓ Verified Source
                  </span>
                ) : x.sourceUrl ? (
                  <span className="source-pill inline-pill">
                    Source available
                  </span>
                ) : null}
                {x.sourceUrl ? (
                  <a href={x.sourceUrl} target="_blank" rel="noreferrer">
                    View Source <ArrowRight size={14} />
                  </a>
                ) : (
                  <a href="#more">
                    Explore EDUKEN <ArrowRight size={14} />
                  </a>
                )}
              </article>
            ))}
          </div>
        </section>

        <section className="trust-section" id="about">
          <div className="trust-copy">
            <span className="kicker">WHY EDUKEN</span>
            <h2>Information you can actually use.</h2>
            <p>
              EDUKEN CONSULT exists to bridge the gap between students and
              useful educational information, admissions guidance and legitimate
              opportunities.
            </p>
            <div className="trust-points">
              <span>
                <CheckCircle2 /> Verified Information
              </span>
              <span>
                <CheckCircle2 /> Student-Focused
              </span>
              <span>
                <CheckCircle2 /> Timely Updates
              </span>
              <span>
                <CheckCircle2 /> Professional Guidance
              </span>
            </div>
          </div>
          <div className="stats">
            <div>
              <strong>01</strong>
              <span>Trusted plug</span>
            </div>
            <div>
              <strong>∞</strong>
              <span>Opportunities to discover</span>
            </div>
            <div>
              <strong>24/7</strong>
              <span>Information access</span>
            </div>
            <div>
              <strong>E+K</strong>
              <span>Education + Knowledge</span>
            </div>
          </div>
        </section>

        <section className="faq section">
          <div className="section-head">
            <div>
              <span className="kicker">FAQ</span>
              <h2>Questions, answered.</h2>
            </div>
          </div>
          {content.faqs.map((q, i) => (
            <div className="faq-row" key={q.id}>
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                <span>{q.question}</span>
                <ChevronDown className={openFaq === i ? 'rot' : ''} />
              </button>
              {openFaq === i && <p>{q.answer}</p>}
            </div>
          ))}
        </section>

        <section className="final-cta">
          <div>
            <span className="kicker">MAKE YOUR NEXT MOVE</span>
            <h2>
              Your next opportunity
              <br />
              could be one click away.
            </h2>
            <p>
              Stay informed. Make smarter decisions. Move forward with EDUKEN
              CONSULT.
            </p>
          </div>
          <div className="final-actions">
            <a className="primary" href="#opportunities">
              Explore Opportunities <ArrowRight size={18} />
            </a>
            <a className="secondary" href={WA} target="_blank" rel="noreferrer">
              Contact EDUKEN
            </a>
          </div>
        </section>

        <section className="whatsapp-cta" aria-label="EDUKEN WhatsApp Channel">
          <div>
            <span className="kicker">STAY CONNECTED</span>
            <h2>Never Miss an EDUKEN Update</h2>
            <p>
              Get educational updates, admissions news, scholarships, jobs,
              internships and important opportunities directly on WhatsApp.
            </p>
          </div>
          <a
            className="primary whatsapp-channel-btn"
            href={channel}
            target="_blank"
            rel="noreferrer"
          >
            📢 Join EDUKEN WhatsApp Channel <ArrowRight size={17} />
          </a>
        </section>
      </main>

      <footer>
        <div className="footer-main">
          <div>
            <a className="brand" href="#home">
              <img
                className="brand-logo"
                src="./icons/icon.svg"
                alt="EDUKEN CONSULT"
              />
              <span>
                EDUKEN <b>CONSULT</b>
              </span>
            </a>
            <p>
              Your Trusted Plug for Educational Updates, Admissions &
              Opportunities.
            </p>
          </div>
          <div>
            <b>Explore</b>
            <a href="#admissions">Admissions</a>
            <a href="#opportunities">Opportunities</a>
            <a href="#updates">Updates</a>
          </div>
          <div>
            <b>Services</b>
            <a href="#services">Consultation</a>
            <a href="#services">Admission Guidance</a>
            <a href="#services">Mentorship</a>
          </div>
          <div>
            <b>Stay Connected</b>
            <a href={channel} target="_blank" rel="noreferrer">
              📢 WhatsApp Channel
            </a>
            <a href={WA} target="_blank" rel="noreferrer">
              08129811733
            </a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 EDUKEN CONSULT. All rights reserved.</span>
          <span>Privacy Policy • Terms of Service</span>
        </div>
      </footer>
      <a className="wa-float" href={WA} target="_blank" rel="noreferrer">
        <MessageCircle size={22} />
      </a>
    </div>
  );
}

export default App;
