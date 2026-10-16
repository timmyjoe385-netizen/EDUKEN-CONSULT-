import { useEffect, useMemo, useState } from 'react';
import { analyticsApi, api, auth } from './lib/api';
import { installAnalyticsTracking, trackEvent } from './lib/analytics';
import {
  ArrowRight,
  BookOpen,
  Calculator,
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
  Share2,
  ShieldCheck,
  Sparkles,
  Target,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import PlatformHub from './PlatformHub';
import { JAMB_SERVICE_TEMPLATES, jambServiceFieldsFor, isJambCatalogueService } from './lib/jamb-service-catalogue.mjs';

const WA = 'https://wa.me/2348129811733';
const channel = 'https://whatsapp.com/channel/0029VbCwMut3WHTfyxih1U0g';

const EMAIL_ALERT_TOPICS = [
  ['admissions', 'Admissions'],
  ['scholarships-grants', 'Scholarships & grants'],
  ['jobs-internships', 'Jobs & internships'],
  ['remote-opportunities', 'Remote opportunities'],
  ['educational-updates', 'Educational updates'],
  ['career-mentorship', 'Career & mentorship'],
] as const;

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

const DEFAULT_SYSTEM_SETTINGS = {
  subscriberNotificationsEnabled: true,
  deadlineEmailAlertsEnabled: true,
  defaultNotifyOnPublish: false,
};

type SystemSettings = typeof DEFAULT_SYSTEM_SETTINGS;

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
  const [contentLoadFailed, setContentLoadFailed] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loginOpen, setLoginOpen] = useState(false);
  const [adminView, setAdminView] = useState(false);
  const [adminTab, setAdminTab] = useState('opportunities');
  const [systemSettings, setSystemSettings] = useState<SystemSettings>(DEFAULT_SYSTEM_SETTINGS);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState<string | null>(null);
  const [settingsError, setSettingsError] = useState('');
  const [adminItems, setAdminItems] = useState<Item[]>([]);
  const [consultations, setConsultations] = useState<Item[]>([]);
  const [serviceRequests, setServiceRequests] = useState<Item[]>([]);
  const [selectedService, setSelectedService] = useState<Item | null>(null);
  const [serviceForm, setServiceForm] = useState<Record<string, string>>({});
  const [serviceSubmitting, setServiceSubmitting] = useState(false);
  const [addingServiceTemplates, setAddingServiceTemplates] = useState(false);
  const [alertEmail, setAlertEmail] = useState('');
  const [alertTopics, setAlertTopics] = useState<string[]>(['admissions', 'scholarships-grants', 'jobs-internships']);
  const [alertSubmitting, setAlertSubmitting] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [pendingEmailAction, setPendingEmailAction] = useState<{ type: 'verify' | 'unsubscribe'; token: string } | null>(null);
  const [emailActionSubmitting, setEmailActionSubmitting] = useState(false);
  const [form, setForm] = useState<Record<string, any>>({});
  const [deleteTarget, setDeleteTarget] = useState<{ item: Item; table: string } | null>(null);
  const [deletingAdmin, setDeletingAdmin] = useState(false);
  const [savingAdminMode, setSavingAdminMode] = useState<'draft' | 'publish' | 'preserve' | null>(null);
  const [analyticsSummary, setAnalyticsSummary] = useState<any>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState('');
  const [analyticsDays, setAnalyticsDays] = useState(30);
  const [articleSlug, setArticleSlug] = useState('');
  const [admissionId, setAdmissionId] = useState('');
  const [shareCopied, setShareCopied] = useState(false);
  const [shareDraft, setShareDraft] = useState('');
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
    const hash = window.location.hash;
    const opportunityMatch = hash.match(/^#opportunity\/(.+)$/);
    const admissionMatch = hash.match(/^#admission\/(.+)$/);
    const decodeHashValue = (value: string | undefined) => {
      if (!value) return '';
      try {
        return decodeURIComponent(value);
      } catch {
        return '';
      }
    };
    setArticleSlug(decodeHashValue(opportunityMatch?.[1]));
    setAdmissionId(decodeHashValue(admissionMatch?.[1]));
    if (!admissionMatch) window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const articleUrl = (slug: string) =>
    window.location.origin +
    window.location.pathname +
    '#opportunity/' +
    encodeURIComponent(slug);

  const shortArticleUrl = (slug: string) =>
    'https://tinyurl.com/EDUKEN-CONSULT#opportunity/' +
    encodeURIComponent(slug);

  const admissionUrl = (item: Item) =>
    window.location.origin + window.location.pathname + '#admission/' + encodeURIComponent(String(item.id));

  const formatShareDate = (value: string) => {
    const match = value.match(/^(\d{4})-(\d{2})-(\d{2})(?:$|T)/);
    if (!match) return value;
    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const date = new Date(Date.UTC(year, month - 1, day));
    if (
      date.getUTCFullYear() !== year ||
      date.getUTCMonth() !== month - 1 ||
      date.getUTCDate() !== day
    ) return value;
    return new Intl.DateTimeFormat('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    }).format(date);
  };

  const shareAdmissionOnWhatsApp = (item: Item) => {
    const title = String(item.school || item.title || 'Admission update').trim();
    const course = String(item.course || item.programme || '').trim();
    const rawDetails = String(item.details || item.description || item.content || '')
      .replace(/\s+/g, ' ')
      .trim();
    const details = rawDetails.slice(0, 240);
    const dateValue = String(item.deadline || '').trim();
    const link = admissionUrl(item);
    const context = [title, course, String(item.type || ''), rawDetails].join(' ');
    const calendarMatch = context.match(/\b(20\d{2}\s*[/–-]\s*20\d{2})\b/);
    const isAcademicCalendar = /academic calendar/i.test(context) && Boolean(calendarMatch);
    const session = calendarMatch?.[1].replace(/\s*([/–-])\s*/g, '$1');
    const genericCourse = /^(all\s+programmes?|all\s+programs?|all courses?)$/i.test(course);
    const headlineTitle = isAcademicCalendar && session
      ? title + ' — ' + session + ' Academic Calendar'
      : title + (course && !genericCourse ? ' — ' + course : '');
    const headline = '🎓 ADMISSION SPOTLIGHT: ' + headlineTitle;
    const dateLabel = /\b(resumption|resume|reopening|re-open|reopen|resumes)\b/i.test(context)
      ? 'Resumption Date'
      : /\b(application deadline|deadline|closing date|last date to apply|applications close)\b/i.test(context)
        ? 'Application Deadline'
        : 'Key Date';
    const formattedDate = dateValue ? formatShareDate(dateValue) : '';
    const intro = isAcademicCalendar
      ? '📣 STUDENTS, TAKE NOTE! Check this academic calendar update from EDUKEN CONSULT.'
      : '📣 Looking for your next admission opportunity? Check out this update from EDUKEN CONSULT.';
    const message = [
      headline,
      '',
      intro,
      ...(details ? ['', details] : []),
      ...(formattedDate ? ['', '📅 ' + dateLabel + ': ' + formattedDate] : []),
      '',
      '👉 READ MORE on EDUKEN CONSULT:',
      link,
      '',
      '🌍 EDUKEN CONSULT — Your Trusted Plug for Educational Updates, Admissions & Opportunities.',
    ].join('\n');
    window.open('https://wa.me/?text=' + encodeURIComponent(message), '_blank', 'noopener,noreferrer');
  };

  useEffect(() => {
    if (!admissionId || loading) return;
    const target = document.getElementById('admission-' + admissionId);
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [admissionId, loading, content.admissions]);

  const openOpportunity = (item: Item) => {
    trackEvent('opportunity_view', { target: item.title || item.slug || item.id });
    const slug = item.slug || makeSlug(item.title || item.id);
    window.location.hash = 'opportunity/' + encodeURIComponent(slug);
    setArticleSlug(slug);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const loadContent = async () => {
    try {
      const res = await fetch('https://pphxltbkwygqjtjgkhxu.supabase.co/functions/v1/eduken-api/public-content', { cache: 'no-store', headers: { apikey: 'sb_publishable__qH331oDMJzmjqlOig3C0Q_EIHRa24p' } }).then(async response => { if (!response.ok) throw new Error('Live content request failed'); return { data: await response.json() }; });
      const live = res.data || {};
      setContentLoadFailed(false);
      const normalizeFlag = (value: unknown) =>
        value === true || String(value).toLowerCase() === 'true' || String(value) === '1';
      const normalizePublished = (item: Item) =>
        normalizeFlag(item.is_published ?? item.isPublished ?? item.published);
      setContent({
        opportunities: (live.opportunities || []).map((item: Item) => ({
          ...item,
          verified: normalizeFlag(item.verified ?? item.is_verified ?? item.isVerified),
          featured: normalizeFlag(item.featured ?? item.is_featured ?? item.isFeatured),
          urgent: normalizeFlag(item.urgent ?? item.is_urgent ?? item.isUrgent),
          sourceUrl: item.sourceUrl ?? item.source_url ?? item.official_source ?? '',
          link: item.link ?? item.application_url ?? '',
          status: normalizePublished(item) ? 'PUBLISHED' : 'DRAFT',
        })),
        admissions: (live.admissions || []).map((item: Item) => ({
          ...item,
          school: item.school ?? item.title ?? '',
          course: item.course ?? item.programme ?? '',
          type: item.type ?? item.category ?? '',
          details: item.details ?? item.description ?? item.content ?? '',
          link: item.link ?? item.application_url ?? '',
          sourceUrl: item.sourceUrl ?? item.source_url ?? item.official_source ?? '',
          verified: normalizeFlag(item.verified ?? item.is_verified ?? item.isVerified),
          slug: item.slug ?? '',
          featured: normalizeFlag(item.featured ?? item.is_featured ?? item.isFeatured),
          urgent: normalizeFlag(item.urgent ?? item.is_urgent ?? item.isUrgent),
          notifyOnPublish: normalizeFlag(item.notifyOnPublish ?? item.notify_on_publish),
          status: normalizePublished(item) ? 'PUBLISHED' : 'DRAFT',
        })),
        updates: (live.updates || []).map((item: Item) => ({
          ...item,
          body: item.body ?? item.content ?? '',
          sourceUrl: item.sourceUrl ?? item.source_url ?? '',
          verified: normalizeFlag(item.verified ?? item.is_verified ?? item.isVerified),
          slug: item.slug ?? '',
          featured: normalizeFlag(item.featured ?? item.is_featured ?? item.isFeatured),
          urgent: normalizeFlag(item.urgent ?? item.is_urgent ?? item.isUrgent),
          notifyOnPublish: normalizeFlag(item.notifyOnPublish ?? item.notify_on_publish),
          status: normalizePublished(item) ? 'PUBLISHED' : 'DRAFT',
        })),
        faqs: (live.faqs || []).map((item: Item) => ({
          ...item,
          status: normalizePublished(item) ? 'PUBLISHED' : 'DRAFT',
        })),
        services: (live.services || []).map((item: Item) => ({
          ...item,
          is_available: item.is_available === undefined ? true : normalizeFlag(item.is_available),
          is_catalog_item: normalizeFlag(item.is_catalog_item),
          status: normalizePublished(item) ? 'PUBLISHED' : 'DRAFT',
        })),
      });
    } catch {
      setContentLoadFailed(true);
      setToast('Unable to load live content. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    // Admin entry is intentionally not linked from public navigation.
    // Owners can open /admin directly; OAuth returns to this same path.
    if (window.location.pathname.replace(/\/+$/, '') === '/admin') {
      setLoginOpen(true);
    }
    const params = new URLSearchParams(window.location.search);
    const verificationToken = params.get('email_alert_verify');
    const unsubscribeToken = params.get('email_alert_unsubscribe');
    if (verificationToken || unsubscribeToken) {
      // Remove one-time tokens from the visible URL before making a request.
      window.history.replaceState({}, document.title, window.location.pathname + window.location.hash);
      // Do not perform a subscription-changing action just because a browser or
      // email-security scanner opened the link. Ask the visitor to confirm first.
      setPendingEmailAction({
        type: verificationToken ? 'verify' : 'unsubscribe',
        token: (verificationToken || unsubscribeToken)!,
      });
    }
    void auth.completeOAuthCallback().then((result: any) => {
      if (!active || !result) return;
      setUser(result.user);
      setAdminView(true);
      void loadAdmin('opportunities');
      void loadSystemSettings();
    }).catch((error: unknown) => {
      if (active) setToast(error instanceof Error ? error.message : 'Google sign-in could not be completed.');
    });
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
      active = false;
      window.removeEventListener('hashchange', onHashChange);
      window.removeEventListener('beforeinstallprompt', onInstallPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  useEffect(() => installAnalyticsTracking(), []);

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

  const isPlaceholderOpportunity = (item: Item) => {
    const title = String(item.title || '').trim().toLowerCase();
    const description = String(item.description || '').trim().toLowerCase();
    const hasDetails = Boolean(
      String(item.content || '').trim() ||
      String(item.link || item.application_url || '').trim() ||
      String(item.sourceUrl || item.official_source || '').trim()
    );
    return !hasDetails && (
      /coming soon|will be published here|will be listed here|when published/.test(title) ||
      /verified opportunities will appear here|student and graduate opportunities will be listed here|browse funding opportunities when published|remote opportunities curated for young people/.test(description)
    );
  };

  const isPlaceholderUpdate = (item: Item) => {
    const title = String(item.title || '').trim().toLowerCase();
    const body = String(item.body || '').trim().toLowerCase();
    return /will appear here|will be published here/.test(title) ||
      /use the eduken admin dashboard to publish clear, useful updates|add scholarships, jobs, internships, grants, fellowships and competitions from the dashboard|publish practical career guidance and development opportunities/.test(body);
  };

  const filteredOpps = useMemo(
    () =>
      content.opportunities.filter(o => {
        if (isPlaceholderOpportunity(o)) return false;
        const category = String(o.category || '').trim().toLowerCase();
        const filter = oppFilter.toLowerCase();
        const categoryMatches = oppFilter === 'All' ||
          (filter === 'scholarships' && /scholarship|grant|fellowship|funding/.test(category)) ||
          (filter === 'jobs' && /job|career|employment|vacancy/.test(category)) ||
          (filter === 'internships' && /internship|trainee/.test(category)) ||
          (filter === 'grants' && /grant|funding/.test(category)) ||
          (filter === 'fellowships' && /fellowship/.test(category)) ||
          (filter === 'remote' && /remote/.test(category)) ||
          (filter === 'competitions' && /competition|contest/.test(category));
        return categoryMatches &&
          [o.title, o.description, o.content, o.category, o.eligibility, o.benefits]
            .some(value => String(value || '').toLowerCase().includes(search.toLowerCase()));
      }),
    [content.opportunities, oppFilter, search]
  );

  const visibleUpdates = useMemo(
    () => content.updates.filter(item => !isPlaceholderUpdate(item)),
    [content.updates]
  );

  const isPlaceholderAdmission = (item: Item) => {
    const school = String(item.school || '').trim().toLowerCase();
    const course = String(item.course || '').trim().toLowerCase();
    const details = String(item.details || item.description || item.content || '').trim().toLowerCase();
    const link = String(item.link || item.application_url || '').trim();
    const deadline = String(item.deadline || '').trim();
    // A single generic field is not enough to discard a potentially real record.
    // Hide only linkless/deadlineless rows whose populated identifying fields are all generic.
    const identifyingFields = [school, course, details].filter(Boolean);
    const genericValues = new Set([
      'nigerian universities',
      'universities',
      'polytechnics',
      'colleges of education',
      'admission information',
      'application information',
      'programme information',
      'general admission information',
      'details coming soon',
    ]);
    return identifyingFields.length >= 2 &&
      identifyingFields.every(value => genericValues.has(value)) &&
      !link &&
      !deadline;
  };

  const filteredAdmissions = useMemo(
    () =>
      content.admissions.filter(a =>
        !isPlaceholderAdmission(a) &&
        ((a.school || '') + (a.course || '') + (a.type || ''))
          .toLowerCase()
          .includes(search.toLowerCase())
      ),
    [content.admissions, search]
  );

  const globalSearchResults = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return [];
    const opportunities = content.opportunities
      .filter(item =>
        !isPlaceholderOpportunity(item) &&
        [item.title, item.description, item.content, item.category, item.eligibility, item.benefits]
          .some(value => String(value || '').toLowerCase().includes(query))
      )
      .map(item => ({ type: 'Opportunity', id: item.id, title: item.title || 'Opportunity', detail: item.category || 'Opportunity', item }));
    const admissions = content.admissions
      .filter(item =>
        !isPlaceholderAdmission(item) &&
        [item.school, item.course, item.type, item.status, item.details]
          .some(value => String(value || '').toLowerCase().includes(query))
      )
      .map(item => ({ type: 'Admission', id: item.id, title: item.school || 'Admission update', detail: [item.course, item.type, item.status].filter(Boolean).join(' • '), item }));
    const updates = content.updates
      .filter(item =>
        !isPlaceholderUpdate(item) &&
        [item.title, item.body, item.category, item.date]
          .some(value => String(value || '').toLowerCase().includes(query))
      )
      .map(item => ({ type: 'Update', id: item.id, title: item.title || 'Education update', detail: item.category || 'EDUKEN Update', item }));
    return [...opportunities, ...admissions, ...updates].slice(0, 12);
  }, [content.opportunities, content.admissions, content.updates, search]);

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
      await auth.signIn();
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Unable to start Google sign-in. Please try again.');
    }
  };

  const loadSystemSettings = async () => {
    setSettingsLoading(true);
    setSettingsError('');
    try {
      const result = await api.get('/api/admin/system-settings');
      setSystemSettings({ ...DEFAULT_SYSTEM_SETTINGS, ...(result.data.settings || {}) });
    } catch (error) {
      setSettingsError(error instanceof Error ? error.message : 'Could not load system settings.');
    } finally {
      setSettingsLoading(false);
    }
  };

  const updateSystemSetting = async (key: keyof SystemSettings, value: boolean) => {
    const previous = systemSettings;
    const next = { ...systemSettings, [key]: value };
    setSystemSettings(next);
    setSettingsSaving(key);
    setSettingsError('');
    try {
      await api.put('/api/admin/system-settings', { settings: next });
      showToast('System setting saved.');
    } catch (error) {
      setSystemSettings(previous);
      setSettingsError(error instanceof Error ? error.message : 'Setting could not be saved. Your previous value was restored.');
    } finally {
      setSettingsSaving(null);
    }
  };

  const loadAdmin = async (table = adminTab) => {
    try {
      const res =
        table === 'consultations'
          ? await api.get('/api/admin/consultations')
          : table === 'service-requests'
            ? await api.get('/api/admin/service-requests')
            : await api.get('/api/admin/content/' + table);
      if (table === 'consultations') {
        setConsultations(res.data.items || []);
        return;
      }
      if (table === 'service-requests') {
        setServiceRequests(res.data.items || []);
        return;
      }

      const normalizeFlag = (value: unknown) =>
        value === true || String(value).toLowerCase() === 'true' || String(value) === '1';
      const items = (res.data.items || []).map((item: Item) => {
        const published = normalizeFlag(item.is_published ?? item.isPublished ?? item.published);
        if (table === 'opportunities') {
          return {
            ...item,
            status: published ? 'PUBLISHED' : 'DRAFT',
            verified: normalizeFlag(item.verified ?? item.is_verified ?? item.isVerified),
            featured: normalizeFlag(item.featured ?? item.is_featured ?? item.isFeatured),
            urgent: normalizeFlag(item.urgent ?? item.is_urgent ?? item.isUrgent),
            sourceUrl: item.sourceUrl ?? item.source_url ?? item.official_source ?? '',
            link: item.link ?? item.application_url ?? '',
          };
        }
        if (table === 'admissions') {
          return {
            ...item,
            status: published ? 'PUBLISHED' : 'DRAFT',
            school: item.school ?? item.title ?? '',
            course: item.course ?? item.programme ?? '',
            type: item.type ?? item.category ?? '',
            details: item.details ?? item.description ?? item.content ?? '',
            link: item.link ?? item.application_url ?? '',
            sourceUrl: item.sourceUrl ?? item.source_url ?? item.official_source ?? '',
            verified: normalizeFlag(item.verified ?? item.is_verified ?? item.isVerified),
            slug: item.slug ?? '',
            featured: normalizeFlag(item.featured ?? item.is_featured ?? item.isFeatured),
            urgent: normalizeFlag(item.urgent ?? item.is_urgent ?? item.isUrgent),
            notifyOnPublish: normalizeFlag(item.notifyOnPublish ?? item.notify_on_publish),
          };
        }
        if (table === 'updates') {
          return {
            ...item,
            status: published ? 'PUBLISHED' : 'DRAFT',
            body: item.body ?? item.content ?? '',
            sourceUrl: item.sourceUrl ?? item.source_url ?? '',
            verified: normalizeFlag(item.verified ?? item.is_verified ?? item.isVerified),
            slug: item.slug ?? '',
            featured: normalizeFlag(item.featured ?? item.is_featured ?? item.isFeatured),
            urgent: normalizeFlag(item.urgent ?? item.is_urgent ?? item.isUrgent),
            notifyOnPublish: normalizeFlag(item.notifyOnPublish ?? item.notify_on_publish),
          };
        }
        return { ...item, status: published ? 'PUBLISHED' : 'DRAFT' };
      });
      setAdminItems(items);
    } catch {
      showToast(
        'Access denied. Only authorized EDUKEN administrators can use the dashboard.'
      );
      setAdminView(false);
    }
  };

  const loadAnalytics = async (days = analyticsDays) => {
    setAnalyticsLoading(true);
    setAnalyticsError('');
    try {
      const result = await analyticsApi.summary(days);
      setAnalyticsSummary(result.data);
    } catch (error) {
      setAnalyticsError(error instanceof Error ? error.message : 'Could not load analytics.');
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const shareOpportunityOnWhatsApp = (item: Item) => {
    const slug = item.slug || makeSlug(item.title || item.id);
    const link = shortArticleUrl(slug);
    const teaser = String(item.description || item.content || '')
      .split(/\r?\n/)[0]
      .trim()
      .slice(0, 240);
    const message = [
      '📢 ' + (item.title || 'EDUKEN CONSULT Update'),
      '',
      teaser,
      '',
      '🔗 READ MORE HERE 👇',
      link,
      '',
      '🎓 EDUKEN CONSULT',
      'Your Trusted Plug for Educational Updates, Admissions & Opportunities.',
    ].filter(Boolean).join('\n');
    window.open(
      'https://wa.me/?text=' + encodeURIComponent(message),
      '_blank',
      'noopener,noreferrer'
    );
  };

  const shareUpdateOnWhatsApp = (item: Item) => {
    const title = String(item.title || 'EDUKEN educational update').trim();
    const rawCategory = String(item.category || '').trim();
    const category = !rawCategory || /^update$/i.test(rawCategory)
      ? 'Educational Update'
      : rawCategory;
    const fullBody = String(item.body || item.content || item.description || '')
      .replace(/\s+/g, ' ')
      .trim();
    const bodyLimit = 800;
    const body = fullBody.length > bodyLimit
      ? fullBody.slice(0, bodyLimit).replace(/\s+\S*$/, '').trimEnd() + '…'
      : fullBody;
    const link = window.location.origin + '/#updates';
    const message = [
      '📰 EDUKEN CONSULT UPDATE',
      '',
      '📌 ' + title,
      '🏷️ Category: ' + category,
      ...(body ? ['', body] : []),
      ...(item.sourceUrl ? ['', '🔎 Official/source link: ' + String(item.sourceUrl).trim()] : []),
      '',
      '👉 Read this update on EDUKEN CONSULT:',
      link,
      '',
      '🌍 EDUKEN CONSULT — Your Trusted Plug for Educational Updates, Admissions & Opportunities.',
    ].join('\n');
    window.open(
      'https://wa.me/?text=' + encodeURIComponent(message),
      '_blank',
      'noopener,noreferrer'
    );
  };

  const saveAdmin = async (publishMode: 'draft' | 'publish' | 'preserve' = 'preserve') => {
    if (savingAdminMode) return;
    const table = adminTab;
    const requiredFields: Record<string, { field: string; label: string }[]> = {
      opportunities: [{ field: 'title', label: 'opportunity title' }],
      admissions: [{ field: 'school', label: 'school name' }],
      updates: [{ field: 'title', label: 'update title' }],
      faqs: [
        { field: 'question', label: 'FAQ question' },
        { field: 'answer', label: 'FAQ answer' },
      ],
      services: [{ field: 'name', label: 'service name' }],
    };
    const missingField = (requiredFields[table] || []).find(
      required => !String(form[required.field] ?? '').trim()
    );
    if (missingField) {
      showToast('Please enter the ' + missingField.label + ' before saving or publishing.');
      return;
    }
    setSavingAdminMode(publishMode);
    try {
      const payload: Record<string, any> = { ...form };
      if (table === 'services') {
        const rawPrice = String(payload.price ?? '').trim();
        if (rawPrice && (!Number.isFinite(Number(rawPrice)) || Number(rawPrice) < 0)) {
          showToast('Enter a valid non-negative service price.');
          return;
        }
        payload.price = rawPrice ? Number(rawPrice) : null;
        payload.requirements = String(payload.requirements ?? '').trim();
        payload.is_available = payload.is_available === undefined ? true : (payload.is_available === true || String(payload.is_available).toLowerCase() === 'true');
      }
      if (table !== 'opportunities') {
        // Keep the database boolean in sync with the editor's Draft/Published
        // control, including when an existing row is switched to a new state.
        if (publishMode === 'draft') {
          payload.status = 'DRAFT';
          payload.is_published = false;
        } else if (publishMode === 'publish') {
          payload.status = 'PUBLISHED';
          payload.is_published = true;
        } else if (payload.status !== undefined) {
          payload.is_published = String(payload.status).toUpperCase() === 'PUBLISHED';
        }
      }
      if (table === 'opportunities') {
        if (publishMode === 'draft') {
          payload.status = 'DRAFT';
          payload.is_published = false;
        } else if (publishMode === 'publish') {
          payload.status = 'PUBLISHED';
          payload.is_published = true;
        } else if (payload.is_published === undefined) {
          payload.is_published = String(payload.status || '').toUpperCase() === 'PUBLISHED';
        }
        if (!payload.slug)
          payload.slug = makeSlug(payload.title || '') + '-' + Date.now().toString(36);
        if (!payload.description)
          payload.description = (payload.content || '').split(/\r?\n/)[0].slice(0, 180);
      }
      if (form.id)
        await api.put('/api/admin/content/' + table + '/' + form.id, payload);
      else
        await api.post('/api/admin/content/' + table, payload);

      setForm({});
      await loadAdmin(table);
      await loadContent();

      if (publishMode === 'draft') {
        showToast('Saved as draft successfully.');
      } else if (publishMode === 'publish') {
        showToast('Published successfully.');
        if (['opportunities', 'admissions', 'updates'].includes(table)) {
          const title = String(payload.title || payload.school || payload.name || 'EDUKEN CONSULT Update').trim();
          const summary = String(payload.description || payload.body || payload.details || payload.content || '')
            .replace(/\s+/g, ' ')
            .trim()
            .slice(0, 220);
          const slug = String(payload.slug || makeSlug(title));
          const link = table === 'opportunities'
            ? articleUrl(slug)
            : table === 'admissions'
              ? window.location.origin + '/#admissions'
              : window.location.origin + '/#updates';
          const heading = table === 'opportunities'
            ? '📢 OPPORTUNITY UPDATE'
            : table === 'admissions'
              ? '🎓 ADMISSION UPDATE'
              : '📰 EDUKEN UPDATE';
          setShareDraft([
            heading,
            '',
            title,
            ...(summary ? [summary, ''] : ['']),
            'Read the full details here 👇',
            link,
            '',
            '🌍 EDUKEN CONSULT — Your Trusted Plug for Educational Updates, Admissions & Opportunities.',
          ].join('\n'));
        }
      } else {
        showToast('Changes saved successfully.');
      }
    } catch (error) {
      showToast(error instanceof Error ? 'Could not save this item: ' + error.message : 'Could not save this item. Please try again.');
    } finally {
      setSavingAdminMode(null);
    }
  };

  const deleteAdmin = async (item: Item, table: string) => {
    if (!item?.id || !table || deletingAdmin) return;
    setDeletingAdmin(true);
    try {
      await api.delete('/api/admin/content/' + table + '/' + item.id);
      setDeleteTarget(null);
      await loadAdmin(table);
      await loadContent();
      showToast('Deleted successfully.');
    } catch {
      showToast('Could not delete this item. Please try again.');
    } finally {
      setDeletingAdmin(false);
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

  const addJambServiceTemplates = async () => {
    if (addingServiceTemplates) return;
    setAddingServiceTemplates(true);
    try {
      const existing = await api.get('/api/admin/content/services');
      const existingItems: Item[] = existing.data.items || [];
      let added = 0;
      let converted = 0;
      let alreadyConfigured = 0;

      // Reuse legacy rows where possible so existing service-request references stay intact.
      // Once a row is marked as a catalogue item, repeat clicks never overwrite admin pricing or availability.
      for (const template of JAMB_SERVICE_TEMPLATES) {
        const templateNames = [template.name, ...template.legacyNames].map(name => name.trim().toLowerCase());
        const match = existingItems.find(item => templateNames.includes(String(item.name || '').trim().toLowerCase()));
        const { legacyNames, ...templateData } = template;
        if (match) {
          const alreadyCatalogueItem = match.is_catalog_item === true || String(match.is_catalog_item).toLowerCase() === 'true';
          if (alreadyCatalogueItem) {
            alreadyConfigured += 1;
            continue;
          }
          await api.put('/api/admin/content/services/' + encodeURIComponent(match.id), {
            ...templateData,
            is_published: true,
            status: 'PUBLISHED',
          });
          converted += 1;
        } else {
          await api.post('/api/admin/content/services', {
            ...templateData,
            is_published: true,
            status: 'PUBLISHED',
          });
          added += 1;
        }
      }

      await loadAdmin('services');
      await loadContent();
      showToast(`JAMB catalogue ready: ${added} added, ${converted} existing services configured, ${alreadyConfigured} already set up. Prices and availability can be edited in Services.`);
    } catch (error) {
      await loadAdmin('services').catch(() => undefined);
      showToast(error instanceof Error
        ? 'Catalogue setup may be partial. Review Services and retry safely: ' + error.message
        : 'Catalogue setup may be partial. Review Services before retrying.');
    } finally {
      setAddingServiceTemplates(false);
    }
  };

  const updateServiceRequest = async (item: Item, status: string) => {
    try {
      await api.put('/api/admin/service-requests/' + encodeURIComponent(item.id), { status });
      await loadAdmin('service-requests');
      showToast('Service request status updated.');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Could not update service request.');
    }
  };

  const submitServiceRequest = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedService || serviceSubmitting) return;
    const formElement = e.currentTarget;
    const fd = new FormData(formElement);
    setServiceSubmitting(true);
    try {
      const result = await api.post('/api/service-requests', {
        serviceId: selectedService.id && !String(selectedService.id).startsWith('fallback-') ? selectedService.id : null,
        customerName: String(fd.get('customerName') || '').trim(),
        whatsapp: String(fd.get('whatsapp') || '').trim(),
        email: String(fd.get('email') || '').trim(),
        details: [
          ...(isJambCatalogueService(selectedService) ? [
            'Number of candidates: ' + String(Math.max(1, Math.min(100, Math.floor(Number(fd.get('candidateCount') || 1))))),
            'Estimated total: ₦' + (Number(selectedService.price) * Math.max(1, Math.min(100, Math.floor(Number(fd.get('candidateCount') || 1))))).toLocaleString('en-NG'),
          ] : []),
          ...jambServiceFieldsFor(selectedService).map(field => field.label + ': ' + String(fd.get('serviceField_' + field.name) || '').trim()),
          String(fd.get('details') || '').trim() ? 'Additional notes: ' + String(fd.get('details') || '').trim() : '',
        ].filter(Boolean).join('\n'),
      });
      formElement.reset();
      setSelectedService(null);
      showToast('Request received. Reference: ' + String(result.data.referenceNumber || 'saved') + '. EDUKEN will contact you.');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Could not submit your request. Please try again.');
    } finally {
      setServiceSubmitting(false);
    }
  };

  const submitEmailAlerts = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (alertSubmitting) return;
    if (!alertTopics.length) {
      setAlertMessage('Choose at least one category.');
      return;
    }
    setAlertSubmitting(true);
    setAlertMessage('');
    try {
      const result = await api.post('/api/email-alerts/subscribe', {
        email: alertEmail,
        topics: alertTopics,
      });
      setAlertMessage(result.data.message || 'Check your inbox for a confirmation link.');
      setAlertEmail('');
    } catch (error) {
      setAlertMessage(error instanceof Error ? error.message : 'We could not start your email subscription. Please try again.');
    } finally {
      setAlertSubmitting(false);
    }
  };

  const confirmEmailAlertAction = async () => {
    if (!pendingEmailAction || emailActionSubmitting) return;
    setEmailActionSubmitting(true);
    try {
      const path = pendingEmailAction.type === 'verify'
        ? '/api/email-alerts/verify'
        : '/api/email-alerts/unsubscribe';
      const result = await api.post(path, { token: pendingEmailAction.token });
      const message = result.data.message || 'Your email alert preference has been updated.';
      setAlertMessage(message);
      setToast(message);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'This email alert link could not be processed.';
      setAlertMessage(message);
      setToast(message);
    } finally {
      setEmailActionSubmitting(false);
      setPendingEmailAction(null);
    }
  };

  const submitConsultation = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formElement = e.currentTarget;
    const fd = new FormData(formElement);
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
      trackEvent('consultation_submit', { target: 'Consultation form' });
      formElement.reset();
      showToast(
        'Consultation request received. We will follow up through your contact details.'
      );
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : 'We could not save your request. Please try again.'
      );
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
      'sourceUrl',
      'verified',
      'slug',
      'featured',
      'urgent',
      'notifyOnPublish',
    ],
    updates: [
      'category',
      'title',
      'body',
      'sourceUrl',
      'verified',
      'slug',
      'featured',
      'urgent',
      'notifyOnPublish',
      'status',
    ],
    faqs: ['question', 'answer', 'category', 'status'],
    services: ['name', 'category', 'description', 'requirements', 'price', 'is_available', 'status'],
  };

  if (adminView) {
    const fields = adminFields[adminTab] || [];
    return (
      <div className="admin-shell">
        {toast && (
          <div className="toast" role="status" aria-live="polite">
            <CheckCircle2 size={18} />
            <span>{toast}</span>
            <button type="button" aria-label="Dismiss notification" onClick={() => setToast('')}><X size={16} /></button>
          </div>
        )}
        {shareDraft && (
          <div className="share-composer-backdrop" role="dialog" aria-modal="true" aria-labelledby="share-composer-title">
            <section className="share-composer">
              <button type="button" className="share-composer-close" aria-label="Close share message" onClick={() => setShareDraft('')}>×</button>
              <span className="kicker">PUBLISHED SUCCESSFULLY</span>
              <h2 id="share-composer-title">Your update is ready to share 🎉</h2>
              <p>Review or edit this WhatsApp-ready message. Nothing is sent automatically.</p>
              <textarea aria-label="WhatsApp share message" value={shareDraft} onChange={e => setShareDraft(e.target.value)} />
              <div className="share-composer-actions">
                <button type="button" className="secondary" onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(shareDraft);
                    showToast('Share message copied. You can paste it into your WhatsApp DM or group.');
                  } catch {
                    showToast('Copy was blocked by this browser. Select the message and copy it manually.');
                  }
                }}>Copy message</button>
                <button type="button" className="primary" onClick={() => window.open('https://wa.me/?text=' + encodeURIComponent(shareDraft), '_blank', 'noopener,noreferrer')}>Open WhatsApp</button>
                <button type="button" className="secondary" onClick={() => setShareDraft('')}>Close</button>
              </div>
              <small>Choose a WhatsApp chat after it opens. EDUKEN does not send messages on your behalf.</small>
            </section>
          </div>
        )}
        {deleteTarget && (
          <div className="admin-confirm-backdrop">
            <section className="admin-confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="admin-delete-title" aria-describedby="admin-delete-description">
              <h2 id="admin-delete-title">Delete this item?</h2>
              <p id="admin-delete-description">This will permanently delete <strong>{deleteTarget.item.title || deleteTarget.item.school || deleteTarget.item.question || deleteTarget.item.name || deleteTarget.item.id}</strong>. This action cannot be undone.</p>
              <div className="admin-confirm-actions">
                <button type="button" className="secondary" disabled={deletingAdmin} onClick={() => setDeleteTarget(null)}>Cancel</button>
                <button type="button" className="danger" disabled={deletingAdmin} onClick={() => deleteAdmin(deleteTarget.item, deleteTarget.table)}>{deletingAdmin ? 'Deleting…' : 'Delete permanently'}</button>
              </div>
            </section>
          </div>
        )}
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
              'service-requests',
              'analytics',
              'system-settings',
            ].map(tab => (
              <button
                className={adminTab === tab ? 'active' : ''}
                key={tab}
                onClick={() => {
                  setAdminTab(tab);
                  setForm({});
                  if (tab === 'analytics') loadAnalytics();
                  else if (tab === 'system-settings') loadSystemSettings();
                  else loadAdmin(tab);
                }}
              >
                {tab === 'opportunities'
                  ? '🌍 Opportunities'
                  : tab === 'consultations'
                    ? '📩 Consultations'
                    : tab === 'service-requests'
                      ? '🧾 Service Requests'
                      : tab === 'analytics'
                      ? '📊 Analytics & Insights'
                      : tab === 'system-settings'
                        ? '⚙️ Manage System'
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
                <h1>{adminTab === 'analytics' ? 'Analytics & Insights' : adminTab === 'system-settings' ? 'Manage System' : adminTab[0].toUpperCase() + adminTab.slice(1) + ' Manager'}</h1>
              </div>
              {adminTab !== 'consultations' && adminTab !== 'service-requests' && adminTab !== 'analytics' && adminTab !== 'system-settings' && (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  {adminTab === 'services' && (
                    <button
                      className="secondary"
                      type="button"
                      disabled={addingServiceTemplates || savingAdminMode !== null}
                      onClick={() => void addJambServiceTemplates()}
                    >
                      {addingServiceTemplates ? 'Adding templates…' : 'Add JAMB service templates'}
                    </button>
                  )}
                  <button className="primary" onClick={() => setForm(adminTab === 'opportunities' ? { notifyOnPublish: systemSettings.defaultNotifyOnPublish } : {})}>
                    <Plus size={17} /> New
                  </button>
                </div>
              )}
            </div>
            {adminTab === 'system-settings' ? (
              <section className="system-settings-panel">
                <div className="system-settings-intro">
                  <span className="tag">ADMIN ONLY · SAVES IMMEDIATELY</span>
                  <h2>System-wide preferences</h2>
                  <p>These controls are separate from creating or publishing content. Changes are saved to the protected settings store; if a save fails, the previous value is restored.</p>
                </div>
                {settingsError ? <div className="analytics-error" role="alert"><b>Settings need attention</b><p>{settingsError}</p><button className="secondary" type="button" onClick={() => void loadSystemSettings()}>Retry loading</button></div> : null}
                {settingsLoading ? <div className="admin-empty">Loading saved system settings…</div> : (
                  <div className="system-settings-list">
                    <label className="system-setting-row">
                      <span className="system-setting-copy"><b>Subscriber notifications</b><small>Allow opted-in subscribers to receive notifications when an opportunity is published.</small></span>
                      <span className="admin-toggle-control"><input type="checkbox" role="switch" checked={systemSettings.subscriberNotificationsEnabled} disabled={settingsSaving !== null} onChange={event => void updateSystemSetting('subscriberNotificationsEnabled', event.target.checked)} /><span>{settingsSaving === 'subscriberNotificationsEnabled' ? 'SAVING…' : systemSettings.subscriberNotificationsEnabled ? 'ON' : 'OFF'}</span></span>
                    </label>
                    <label className="system-setting-row">
                      <span className="system-setting-copy"><b>Smart Alerts · deadline email reminders</b><small>Allow the automated email-alert queue to schedule and reschedule opportunity deadline reminders.</small></span>
                      <span className="admin-toggle-control"><input type="checkbox" role="switch" checked={systemSettings.deadlineEmailAlertsEnabled} disabled={settingsSaving !== null} onChange={event => void updateSystemSetting('deadlineEmailAlertsEnabled', event.target.checked)} /><span>{settingsSaving === 'deadlineEmailAlertsEnabled' ? 'SAVING…' : systemSettings.deadlineEmailAlertsEnabled ? 'ON' : 'OFF'}</span></span>
                    </label>
                    <label className="system-setting-row">
                      <span className="system-setting-copy"><b>Default “Notify on Publish”</b><small>Preselect the notification option when an administrator creates a new opportunity. Existing items are not changed.</small></span>
                      <span className="admin-toggle-control"><input type="checkbox" role="switch" checked={systemSettings.defaultNotifyOnPublish} disabled={settingsSaving !== null} onChange={event => void updateSystemSetting('defaultNotifyOnPublish', event.target.checked)} /><span>{settingsSaving === 'defaultNotifyOnPublish' ? 'SAVING…' : systemSettings.defaultNotifyOnPublish ? 'ON' : 'OFF'}</span></span>
                    </label>
                  </div>
                )}
                <p className="system-settings-footnote">Content publishing remains available in its own manager tabs. These settings do not grant admin access; server-side Google-account authorization remains required.</p>
              </section>
            ) : adminTab === 'analytics' ? (
              <section className="analytics-panel">
                              <div className="analytics-toolbar">
                                <div>
                                  <span className="tag">First-party analytics</span>
                                  <p>Anonymous site activity. Visitor counts are estimates based on anonymous browser IDs.</p>
                                </div>
                                <div className="analytics-controls">
                                  <select value={analyticsDays} onChange={e => { const days = Number(e.target.value); setAnalyticsDays(days); loadAnalytics(days); }} aria-label="Analytics date range">
                                    <option value={7}>Last 7 days</option>
                                    <option value={30}>Last 30 days</option>
                                    <option value={90}>Last 90 days</option>
                                  </select>
                                  <button className="primary" onClick={() => loadAnalytics()} disabled={analyticsLoading}>{analyticsLoading ? 'Refreshing…' : '↻ Refresh'}</button>
                                </div>
                              </div>
                              {analyticsError ? <div className="analytics-error"><b>Analytics could not load</b><p>{analyticsError}</p><small>Analytics storage is separate from the content database.</small></div> : null}
                              {analyticsLoading && !analyticsSummary ? <div className="admin-empty">Loading analytics…</div> : null}
                              {analyticsSummary ? (
                                <>
                                  <div className="analytics-cards">
                                    <article><span>Unique visitors</span><strong>{analyticsSummary.totals?.visitors ?? 0}</strong><small>Estimated unique browsers</small></article>
                                    <article><span>Page views</span><strong>{analyticsSummary.totals?.pageViews ?? 0}</strong><small>Across {analyticsSummary.days} days</small></article>
                                    <article><span>Clicks</span><strong>{analyticsSummary.totals?.clicks ?? 0}</strong><small>Buttons and outgoing links</small></article>
                                    <article><span>Online estimate</span><strong>{analyticsSummary.onlineNow ?? 0}</strong><small>Active in the last 5 minutes</small></article>
                                    <article><span>AI queries</span><strong>{analyticsSummary.totals?.aiQueries ?? 0}</strong><small>Submitted to EDUKEN AI</small></article>
                                    <article><span>Consultation leads</span><strong>{analyticsSummary.totals?.consultationSubmissions ?? 0}</strong><small>Successful form submissions</small></article>
                                  </div>
                                  <div className="analytics-grid">
                                    <article className="analytics-card"><h3>Most visited pages</h3>{(analyticsSummary.topPages || []).length ? analyticsSummary.topPages.map((item: any) => <div className="analytics-row" key={item.label}><span>{item.label === '/' ? 'Homepage' : (item.label || 'Unknown page')}</span><b>{item.count}</b></div>) : <p>{analyticsSummary.totals?.pageViews ? 'Page views are recorded, but the page breakdown is unavailable. Tap Refresh to try again.' : 'No page views recorded yet.'}</p>}</article>
                                    <article className="analytics-card"><h3>Most clicked items</h3>{(analyticsSummary.topTargets || []).length ? analyticsSummary.topTargets.map((item: any) => <div className="analytics-row" key={item.label}><span>{item.label}</span><b>{item.count}</b></div>) : <p>No clicks recorded yet.</p>}</article>
                                    <article className="analytics-card"><h3>Traffic sources</h3>{(analyticsSummary.sources || []).length ? analyticsSummary.sources.map((item: any) => <div className="analytics-row" key={item.label}><span>{item.label || 'Direct'}</span><b>{item.count}</b></div>) : <p>Sources appear as traffic arrives.</p>}</article>
                                    <article className="analytics-card"><h3>Devices</h3>{(analyticsSummary.devices || []).length ? analyticsSummary.devices.map((item: any) => <div className="analytics-row" key={item.label}><span>{item.label}</span><b>{item.count}</b></div>) : <p>No device data yet.</p>}</article>
                                    <article className="analytics-card"><h3>Visitor countries</h3>{(analyticsSummary.countries || []).length ? analyticsSummary.countries.map((item: any) => <div className="analytics-row" key={item.label}><span>{item.label}</span><b>{item.count}</b></div>) : <p>Country data appears as traffic arrives.</p>}</article>
                                    <article className="analytics-card"><h3>Daily page views</h3>{(analyticsSummary.daily || []).length ? analyticsSummary.daily.map((item: any) => <div className="analytics-row" key={item.day}><span>{item.day}</span><b>{item.views}</b></div>) : <p>No daily trend yet.</p>}</article>
                                  </div>
                                  <p className="analytics-privacy">{analyticsSummary.privacy || 'Analytics are anonymous and designed to avoid collecting personal details.'} Last updated {analyticsSummary.generatedAt ? new Date(analyticsSummary.generatedAt).toLocaleString() : 'just now'}.</p>
                                </>
                              ) : null}
                            </section>
            ) : adminTab === 'service-requests' ? (
              <div className="admin-list">
                {serviceRequests.length === 0 ? (
                  <div className="admin-empty">No service requests yet.</div>
                ) : serviceRequests.map(item => (
                  <article className="admin-item" key={item.id}>
                    <div>
                      <span className="tag">{item.status || 'New Requests'}</span>
                      <h3>{item.reference_number || 'Service request'} — {item.services?.name || 'Service enquiry'}</h3>
                      <p>{item.details}</p>
                      <small>{item.customer_name} • {item.whatsapp} • {item.email || 'No email'} • {item.created_at ? new Date(item.created_at).toLocaleString() : ''}</small>
                    </div>
                    <select aria-label={'Status for ' + (item.reference_number || 'service request')} value={item.status || 'New Requests'} disabled={item.status === 'Paid'} onChange={e => updateServiceRequest(item, e.target.value)}>
                      {item.status === 'Paid' && <option value="Paid" disabled>Paid (payment confirmed)</option>}
                      <option>New Requests</option><option>Contacted</option><option>In Progress</option><option>Completed</option><option>Cancelled</option>
                    </select>
                  </article>
                ))}
              </div>
            ) : adminTab === 'consultations' ? (
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
                        {adminTab === 'opportunities' ? (
                          <div className="admin-item-meta">
                            <span className="tag">{item.category || 'Opportunity'}</span>
                            <span className="tag" aria-label="Publication status">
                              {item.is_published === false ||
                              String(item.is_published).toLowerCase() === 'false' ||
                              String(item.is_published) === '0' ||
                              String(item.status || '').toUpperCase() === 'DRAFT'
                                ? 'Draft'
                                : 'Published'}
                            </span>
                          </div>
                        ) : (
                          <span className="tag">
                            {item.category || item.status || 'Published'}
                          </span>
                        )}
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
                        {adminTab === 'opportunities' &&
                          (String(item.status || '').toUpperCase() === 'PUBLISHED' ||
                            item.is_published === true ||
                            String(item.is_published).toLowerCase() === 'true' ||
                            String(item.is_published) === '1') && (
                            <button
                              type="button"
                              className="secondary"
                              onClick={() => shareOpportunityOnWhatsApp(item)}
                              title="Share a teaser with a Read More link on WhatsApp"
                            >
                              <Share2 size={14} /> Share
                            </button>
                          )}
                        {adminTab === 'admissions' &&
                          (String(item.status || '').toUpperCase() === 'PUBLISHED' ||
                            item.is_published === true ||
                            String(item.is_published).toLowerCase() === 'true' ||
                            String(item.is_published) === '1') && (
                            <button
                              type="button"
                              className="secondary"
                              onClick={() => shareAdmissionOnWhatsApp(item)}
                              title="Share this published admission post and its direct EDUKEN link on WhatsApp"
                            >
                              <Share2 size={14} /> Share on WhatsApp
                            </button>
                          )}
                        {adminTab === 'updates' &&
                          (String(item.status || '').toUpperCase() === 'PUBLISHED' ||
                            item.is_published === true ||
                            String(item.is_published).toLowerCase() === 'true' ||
                            String(item.is_published) === '1') && (
                            <button
                              type="button"
                              className="secondary"
                              onClick={() => shareUpdateOnWhatsApp(item)}
                              title="Share this published educational update on WhatsApp"
                            >
                              <Share2 size={14} /> Share on WhatsApp
                            </button>
                          )}
                        <button onClick={() => setForm(adminTab === 'opportunities' ? { ...item, status: (item.is_published === true || String(item.is_published).toLowerCase() === 'true' || String(item.is_published) === '1') ? 'PUBLISHED' : 'DRAFT' } : item)}>Edit</button>
                        <button
                          className="danger"
                          onClick={() => setDeleteTarget({ item, table: adminTab })}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
                <div className="admin-editor">
                  <h2>{form.id ? 'Edit item' : 'Create item'}</h2>
                  {fields.map(field => {
                    const booleanFields = [
                      'verified',
                      'featured',
                      'urgent',
                      'notifyOnPublish',
                    ];
                    const isBoolean = booleanFields.includes(field);
                    const isLongText = [
                      'content',
                      'description',
                      'details',
                      'body',
                      'answer',
                      'eligibility',
                      'benefits',
                      'howToApply',
                      'requirements',
                    ].includes(field);
                    const checked =
                      form[field] === true ||
                      String(form[field]).toLowerCase() === 'true' ||
                      String(form[field]) === '1';
                    const fieldLabel = field
                      .replace(/_/g, ' ')
                      .replace(/([A-Z])/g, ' $1')
                      .replace(/^./, letter => letter.toUpperCase());
                    return (
                      <label
                        key={field}
                        className={isBoolean ? 'admin-toggle-field' : undefined}
                      >
                        <span>{fieldLabel}</span>
                        {field === 'is_available' ? (
                          <select
                            value={String(form.is_available === undefined ? true : form.is_available).toLowerCase() === 'true' ? 'true' : 'false'}
                            onChange={e => setForm({ ...form, is_available: e.target.value === 'true' })}
                          >
                            <option value="true">Available</option>
                            <option value="false">Unavailable</option>
                          </select>
                        ) : field === 'status' ? (
                          <select
                            value={String(form.status || (form.is_published ? 'PUBLISHED' : 'DRAFT')).toUpperCase() === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT'}
                            onChange={e => setForm({ ...form, status: e.target.value, is_published: e.target.value === 'PUBLISHED' })}
                          >
                            <option value="DRAFT">Draft</option>
                            <option value="PUBLISHED">Published</option>
                          </select>
                        ) : isBoolean ? (
                          <span className="admin-toggle-control">
                            <input
                              type="checkbox"
                              role="switch"
                              checked={checked}
                              onChange={e =>
                                setForm({ ...form, [field]: e.target.checked })
                              }
                            />
                            <span>{checked ? 'ON' : 'OFF'}</span>
                          </span>
                        ) : isLongText ? (
                          <textarea
                            value={form[field] ?? ''}
                            onChange={e =>
                              setForm({ ...form, [field]: e.target.value })
                            }
                            rows={field === 'content' ? 8 : 5}
                          />
                        ) : field === 'price' ? (
                          <input
                            type="number"
                            min="0"
                            step="1"
                            inputMode="numeric"
                            value={form[field] ?? ''}
                            onChange={e => setForm({ ...form, [field]: e.target.value })}
                          />
                        ) : (
                          <input
                            value={form[field] ?? ''}
                            onChange={e =>
                              setForm({ ...form, [field]: e.target.value })
                            }
                          />
                        )}
                      </label>
                    );
                  })}
                  {adminTab === 'opportunities' ? (
                    <div className="admin-editor-actions">
                      <button
                        className="secondary"
                        type="button"
                        disabled={
                          savingAdminMode !== null ||
                          !form.id ||
                          !(String(form.status || '').toUpperCase() === 'PUBLISHED' ||
                            form.is_published === true ||
                            String(form.is_published).toLowerCase() === 'true' ||
                            String(form.is_published) === '1')
                        }
                        onClick={() => shareOpportunityOnWhatsApp(form as Item)}
                        title="Save and publish the opportunity before sharing its Read More link"
                      >
                        <Share2 size={15} /> Share to WhatsApp
                      </button>
                      <button className="secondary" disabled={savingAdminMode !== null} onClick={() => saveAdmin('draft')}>
                        {savingAdminMode === 'draft' ? 'Saving Draft…' : 'Save Draft'}
                      </button>
                      {form.id ? (
                        <>
                          <button className="primary" disabled={savingAdminMode !== null} onClick={() => saveAdmin('preserve')}>
                            {savingAdminMode === 'preserve' ? 'Saving…' : 'Save Changes'}
                          </button>
                          <button className="primary" disabled={savingAdminMode !== null} onClick={() => saveAdmin('publish')}>
                            {savingAdminMode === 'publish' ? 'Publishing…' : 'Publish Changes'}
                          </button>
                        </>
                      ) : (
                        <button className="primary" disabled={savingAdminMode !== null} onClick={() => saveAdmin('publish')}>
                          {savingAdminMode === 'publish' ? 'Publishing…' : 'Publish Item'}
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="admin-editor-actions">
                      <button
                        className="secondary"
                        type="button"
                        disabled={savingAdminMode !== null}
                        onClick={() => saveAdmin('draft')}
                      >
                        {savingAdminMode === 'draft' ? 'Saving Draft…' : 'Save Draft'}
                      </button>
                      {form.id ? (
                        <button
                          className="secondary"
                          type="button"
                          disabled={savingAdminMode !== null}
                          onClick={() => saveAdmin('preserve')}
                        >
                          {savingAdminMode === 'preserve' ? 'Saving…' : 'Save Changes'}
                        </button>
                      ) : null}
                      <button
                        className="primary"
                        type="button"
                        disabled={savingAdminMode !== null}
                        onClick={() => saveAdmin('publish')}
                      >
                        {savingAdminMode === 'publish' ? 'Publishing…' : (form.id ? 'Publish Changes' : 'Publish Item')}
                      </button>
                    </div>
                  )}
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
                  onClick={() => {
                    const slug =
                      activeOpportunity.slug ||
                      makeSlug(activeOpportunity.title || activeOpportunity.id);
                    const link = shortArticleUrl(slug);
                    const message = [
                      '🎓 EDUKEN CONSULT',
                      '',
                      activeOpportunity.title || 'Educational opportunity',
                      activeOpportunity.description || '',
                      '',
                      'Read the full details here:',
                      link,
                      '',
                      'Stay informed. Stay ahead with EDUKEN CONSULT.',
                    ]
                      .filter(Boolean)
                      .join('\n');
                    window.open(
                      'https://wa.me/?text=' + encodeURIComponent(message),
                      '_blank',
                      'noopener,noreferrer'
                    );
                  }}
                >
                  <Share2 size={16} /> Share on WhatsApp
                </button>
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
        {loginOpen && (
        <div className="login-backdrop" role="presentation" onClick={event => { if (event.target === event.currentTarget) setLoginOpen(false); }}>
          <section className="login-dialog" role="dialog" aria-modal="true" aria-labelledby="admin-login-title">
            <button className="login-close" type="button" aria-label="Close sign-in" onClick={() => setLoginOpen(false)}>×</button>
            <span className="kicker">SECURE ADMIN ACCESS</span>
            <h2 id="admin-login-title">Admin sign in</h2>
            <p>Continue with one of the authorized Google accounts for EDUKEN CONSULT administration.</p>
            <button className="primary login-submit" type="button" onClick={() => void signIn()}><ArrowRight size={17} /> Continue with Google</button>
          </section>
        </div>
      )}
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
        <nav id="primary-navigation" className={menu ? 'nav-links open' : 'nav-links'}>
          {['Home', 'Opportunities', 'Admissions', 'Updates', 'More'].map(x => (
            <a
              key={x}
              href={x === 'More' ? '#more' : '#' + x.toLowerCase()}
              onClick={() => setMenu(false)}
            >
              {x}
            </a>
          ))}
          <a className="calculator-nav-link" href="/aggregate-calculator" onClick={() => setMenu(false)}>
            <Calculator size={16} aria-hidden="true" /> Aggregate Calculator
          </a>
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
          <a className="nav-cta" href={WA} target="_blank" rel="noreferrer">
            Get Consultation <ArrowRight size={16} />
          </a>
        </nav>
        <button
          type="button"
          className="menu-btn"
          aria-label={menu ? 'Close navigation' : 'Open navigation'}
          aria-controls="primary-navigation"
          aria-expanded={menu}
          onClick={() => setMenu(open => !open)}
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
              <a className="secondary aggregate-hero-cta" href="/aggregate-calculator">
                <Calculator size={18} /> Calculate Aggregate
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
                <span className="mini-logo">🌍</span>
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
                      <span className="verified-pill"><ShieldCheck size={18} strokeWidth={3} aria-hidden="true" /><span>Verified by EDUKEN</span></span>
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
                        ? '✓ Verified by EDUKEN'
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

        {visibleUpdates.length > 0 && (
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
              {visibleUpdates.slice(0, 3).map(x => (
                <article className="newsroom-card" key={x.id}>
                  <div className="newsroom-top">
                    <span className="tag">{x.category || 'Update'}</span>
                    {x.verified ? (
                      <span className="verified-pill"><ShieldCheck size={18} strokeWidth={3} aria-hidden="true" /><span>Verified by EDUKEN</span></span>
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
                placeholder="Search opportunities, schools, courses, updates..."
                aria-label="Search all EDUKEN content"
              />
              {search && (
                <button type="button" className="search-clear" onClick={() => setSearch('')} aria-label="Clear search">
                  <X size={16} />
                </button>
              )}
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
          {search.trim() && (
            <div className="global-search-results" role="region" aria-live="polite" aria-label="Search results">
              <div className="global-search-heading">
                <b>Search results</b>
                <span>{loading ? 'Searching published content…' : `${globalSearchResults.length} result(s) found`}</span>
              </div>
              {!loading && globalSearchResults.length === 0 && (
                <p className="search-empty">No matching published opportunities, admissions or updates were found. Try another keyword.</p>
              )}
              {globalSearchResults.map(result => (
                <button
                  type="button"
                  className="global-search-result"
                  key={result.type + ':' + result.id}
                  onClick={() => {
                    if (result.type === 'Opportunity') {
                      openOpportunity(result.item);
                    } else if (result.type === 'Admission') {
                      window.location.hash = 'admissions';
                      setSearch('');
                      setMenu(false);
                    } else {
                      window.location.hash = 'updates';
                      setSearch('');
                      setMenu(false);
                    }
                  }}
                >
                  <span className="search-result-type">{result.type}</span>
                  <span className="search-result-copy">
                    <b>{result.title}</b>
                    <small>{result.detail}</small>
                  </span>
                  <ArrowRight size={16} />
                </button>
              ))}
            </div>
          )}
          <div className="opp-grid">
            {loading ? (
              <p>Loading live opportunities...</p>
            ) : (
              filteredOpps.map(o => (
                <article className="opp-card" key={o.id}>
                  <div className="opp-topline">
                    <span className="tag">{o.category || 'Opportunity'}</span>
                    {o.verified ? (
                      <span className="verified-pill"><ShieldCheck size={18} strokeWidth={3} aria-hidden="true" /><span>Verified by EDUKEN</span></span>
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
            ) : filteredAdmissions.length === 0 ? (
              <p className="empty-state">No matching published admission records yet. Please check back soon.</p>
            ) : (
              filteredAdmissions.map(a => (
                <article className="admission-card" id={'admission-' + a.id} key={a.id}>
                  <div className="admission-top">
                    <span>{a.type || 'Admission'}</span>
                    {a.verified ? <span className="verified-pill"><ShieldCheck size={16} strokeWidth={3} aria-hidden="true" /><span>Verified by EDUKEN</span></span> : null}
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

        <section className="section jamb-catalogue-section" id="jamb-services">
          <div className="section-head">
            <div>
              <span className="kicker">EDUKEN SERVICE PORTAL</span>
              <h2>JAMB Services</h2>
            </div>
            <p>Choose a service, review its requirements and check availability before requesting assistance. Prices and availability are managed by EDUKEN in the admin dashboard.</p>
          </div>
          <div className="jamb-service-grid">
            {content.services.filter(isJambCatalogueService).map((service, index) => {
              const price = Number(service.price);
              const hasPrice = service.price !== null && service.price !== undefined && String(service.price).trim() !== '' && Number.isFinite(price) && price > 0;
              const available = service.is_available !== false;
              return (
                <article className={`jamb-service-card ${available ? 'is-available' : 'is-unavailable'}`} key={service.id}>
                  <div className="jamb-service-card__topline">
                    <span className="jamb-service-card__category">{service.category || 'JAMB Services'}</span>
                    <span className={`jamb-service-status ${available ? 'is-available' : 'is-unavailable'}`} aria-label={available ? 'Available' : 'Unavailable'}>
                      <span className="jamb-service-status__dot" aria-hidden="true" />
                      {available ? 'Available' : 'Unavailable'}
                    </span>
                  </div>
                  <div className="jamb-service-card__title-row">
                    <span className="jamb-service-card__number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                    <h3>{service.name}</h3>
                  </div>
                  {service.description ? <p className="jamb-service-card__description">{service.description}</p> : null}
                  {service.requirements ? (
                    <div className="jamb-service-requirements">
                      <div className="jamb-service-requirements__label"><ShieldCheck size={16} strokeWidth={2.5} /> Before you request</div>
                      <p>{service.requirements}</p>
                    </div>
                  ) : null}
                  <div className="jamb-service-card__footer">
                    <div className="jamb-service-price">
                      <span className="jamb-service-price__label">Service price</span>
                      <strong>{hasPrice ? '₦' + price.toLocaleString('en-NG') : 'Price not set'}</strong>
                      {hasPrice ? <span className="jamb-service-price__unit">per candidate</span> : null}
                    </div>
                    <button type="button" className="primary jamb-service-request" disabled={!available || !hasPrice} onClick={() => { setSelectedService(service); setServiceForm({}); }}>
                      {!available ? 'Currently unavailable' : hasPrice ? 'Request this service' : 'Price not set'}
                      {available && hasPrice ? <ArrowRight size={16} aria-hidden="true" /> : null}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
          {!loading && !contentLoadFailed && !content.services.some(isJambCatalogueService) ? <div className="admin-empty jamb-catalogue-empty">The JAMB catalogue has not been set up yet. Open Admin → Services and choose “Add JAMB service templates”.</div> : null}
          <p className="jamb-catalogue-safety">This form collects a service request only; it does not take payment. Never send your NIN, OTP, JAMB password, email password or bank-card details through this form.</p>
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
            {(content.services.some(s => s.is_catalog_item) ? content.services.filter(s => !s.is_catalog_item) : content.services.length ? content.services : [
              { id: 'fallback-admission-guidance', name: 'Admission Guidance', category: 'Admissions', description: 'Guidance on school choices, admission requirements and next steps.', price: null },
              { id: 'fallback-application-help', name: 'School Application Assistance', category: 'Applications', description: 'Support understanding application steps and requirements.', price: null },
              { id: 'fallback-jamb', name: 'JAMB Guidance', category: 'JAMB Services', description: 'Ask about JAMB-related guidance and available support.', price: null },
              { id: 'fallback-career', name: 'Career & Opportunity Guidance', category: 'Career', description: 'Guidance on scholarships, internships, jobs and other opportunities.', price: null },
              { id: 'fallback-consultation', name: 'Educational Consultation', category: 'Consultation', description: 'Personal guidance for education and study-related decisions.', price: null },
            ]).map((s, i) => (
              <article className="service-row" key={s.id || s.name} style={{ alignItems: 'flex-start', gap: 14, flexWrap: 'wrap' }}>
                <span>{String(i + 1).padStart(2, '0')}</span>
                <div style={{ flex: '1 1 220px', minWidth: 0 }}>
                  <b style={{ display: 'block', marginBottom: 6 }}>{s.name}</b>
                  {s.category && <small style={{ display: 'block', opacity: 0.75, marginBottom: 6 }}>{s.category}</small>}
                  {s.description && <p style={{ margin: '0 0 8px', lineHeight: 1.55 }}>{s.description}</p>}
                  <strong style={{ display: 'block', marginBottom: 8 }}>{s.price !== null && s.price !== undefined && s.price !== '' && Number.isFinite(Number(s.price)) ? '₦' + Number(s.price).toLocaleString('en-NG') : 'Contact for price'}</strong>
                  <button type="button" className="primary" onClick={() => setSelectedService(s)}>Request this service <ArrowRight size={15} /></button>
                </div>
              </article>
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
            {visibleUpdates.map((x, i) => (
              <article className="update-card" key={x.id}>
                <div className={'update-image u' + (i % 3)}>
                  <span>{x.category || 'Update'}</span>
                </div>
                <small>EDUKEN UPDATE • {x.date || 'Recent'}</small>
                <h3>{x.title}</h3>
                <p>{x.body || 'Open this update for more information.'}</p>
                {x.verified ? (
                  <span className="verified-pill inline-pill">
                    <CheckCircle2 size={14} aria-hidden="true" /> Verified by EDUKEN
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
            <a className="primary" href={WA} target="_blank" rel="noreferrer">
              Contact EDUKEN
            </a>
          </div>
        </section>

        <section className="section pale" id="email-alerts" aria-labelledby="email-alerts-title" style={{ paddingTop: 40, paddingBottom: 40 }}>
          <div className="section-head">
            <div>
              <span className="kicker">FREE EMAIL ALERTS</span>
              <h2 id="email-alerts-title">Get important opportunities in your inbox.</h2>
            </div>
            <p>Choose the topics you care about. No account or password required. We only activate alerts after you confirm your email.</p>
          </div>
          <form onSubmit={submitEmailAlerts} style={{ display: 'grid', gap: 16, maxWidth: 760 }}>
            <label htmlFor="email-alert-address" style={{ display: 'grid', gap: 6, fontWeight: 600 }}>
              Email address
              <input id="email-alert-address" type="email" name="email" autoComplete="email" required maxLength={254} value={alertEmail} onChange={e => setAlertEmail(e.target.value)} placeholder="you@example.com" />
            </label>
            <fieldset style={{ border: '1px solid var(--border, #d9e2dc)', borderRadius: 14, padding: 16, display: 'grid', gap: 12 }}>
              <legend style={{ padding: '0 6px', fontWeight: 700 }}>Select at least one category</legend>
              {EMAIL_ALERT_TOPICS.map(([value, label]) => (
                <label key={value} style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 500 }}>
                  <input
                    type="checkbox"
                    checked={alertTopics.includes(value)}
                    onChange={e => setAlertTopics(current => e.target.checked ? [...current, value] : current.filter(topic => topic !== value))}
                  />
                  <span>{label}</span>
                </label>
              ))}
            </fieldset>
            <button className="primary" type="submit" disabled={alertSubmitting || !alertTopics.length}>
              {alertSubmitting ? 'Sending confirmation…' : 'Subscribe to free email alerts'} <ArrowRight size={17} />
            </button>
            <p aria-live="polite" role="status" style={{ margin: 0 }}>{alertMessage}</p>
            <small>Confirm within 30 minutes. Unsubscribe links are provided. Your email is not shown publicly.</small>
          </form>
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

      {pendingEmailAction && (
        <div role="presentation" style={{ position: 'fixed', inset: 0, zIndex: 1100, background: 'rgba(12,24,18,.72)', display: 'grid', placeItems: 'center', padding: 16 }}>
          <section role="dialog" aria-modal="true" aria-labelledby="email-alert-action-title" style={{ width: '100%', maxWidth: 480, background: '#fff', color: '#17251d', borderRadius: 18, padding: 22 }}>
            <span className="kicker">EDUKEN EMAIL ALERTS</span>
            <h2 id="email-alert-action-title">{pendingEmailAction.type === 'verify' ? 'Confirm your email alerts?' : 'Unsubscribe from email alerts?'}</h2>
            <p>{pendingEmailAction.type === 'verify'
              ? 'Confirm only if you requested EDUKEN email alerts. This will activate email notifications for your selected topics.'
              : 'Please confirm if you want to stop receiving EDUKEN email alerts. Opening this page alone will not unsubscribe you.'}</p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button type="button" className="primary" disabled={emailActionSubmitting} onClick={() => void confirmEmailAlertAction()}>
                {emailActionSubmitting ? 'Processing…' : pendingEmailAction.type === 'verify' ? 'Confirm email alerts' : 'Yes, unsubscribe'}
              </button>
              <button type="button" className="secondary" disabled={emailActionSubmitting} onClick={() => setPendingEmailAction(null)}>Cancel</button>
            </div>
          </section>
        </div>
      )}
      {loginOpen && (
        <div className="login-backdrop" role="presentation" onClick={event => { if (event.target === event.currentTarget) setLoginOpen(false); }}>
          <section className="login-dialog" role="dialog" aria-modal="true" aria-labelledby="admin-login-title">
            <button className="login-close" type="button" aria-label="Close sign-in" onClick={() => setLoginOpen(false)}>×</button>
            <span className="kicker">PRIVATE ADMIN ACCESS</span>
            <h2 id="admin-login-title">Admin sign in</h2>
            <p>This private sign-in page is for authorized EDUKEN CONSULT administrators only.</p>
            <button className="primary login-submit" type="button" onClick={() => void signIn()}><ArrowRight size={17} /> Continue with Google</button>
          </section>
        </div>
      )}
      {selectedService && (
        <div role="presentation" onClick={e => { if (e.target === e.currentTarget && !serviceSubmitting) setSelectedService(null); }} style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(12,24,18,.72)', display: 'grid', placeItems: 'center', padding: 16, overflowY: 'auto' }}>
          <section role="dialog" aria-modal="true" aria-labelledby="service-request-title" style={{ width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto', background: '#fff', color: '#17251d', borderRadius: 18, padding: 22 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
              <div><span className="kicker">SERVICE REQUEST</span><h2 id="service-request-title">{selectedService.name}</h2><p>Price: {selectedService.price !== null && selectedService.price !== undefined && String(selectedService.price).trim() !== '' ? '₦' + Number(selectedService.price).toLocaleString('en-NG') : 'To be confirmed'}. Submit your details to send a service request. Payment checkout is not connected to this form yet.</p></div>
              <button type="button" aria-label="Close service request" disabled={serviceSubmitting} onClick={() => setSelectedService(null)}><X size={20} /></button>
            </div>
            <form className="service-request-form" onSubmit={submitServiceRequest}>
              <label className="service-request-field" htmlFor="service-request-customer-name">
                <span>Full name <b aria-hidden="true">*</b></span>
                <input id="service-request-customer-name" name="customerName" required maxLength={120} autoComplete="name" placeholder="Enter your full name" />
              </label>
              <label className="service-request-field" htmlFor="service-request-whatsapp">
                <span>WhatsApp number <b aria-hidden="true">*</b></span>
                <input id="service-request-whatsapp" name="whatsapp" required maxLength={40} autoComplete="tel" inputMode="tel" placeholder="Enter your WhatsApp number" />
              </label>
              <label className="service-request-field" htmlFor="service-request-email">
                <span>Email address <small>(optional)</small></span>
                <input id="service-request-email" name="email" type="email" maxLength={200} autoComplete="email" placeholder="Enter your email address" />
              </label>
              {isJambCatalogueService(selectedService) ? (
                <label className="service-request-field">
                  <span>Number of candidates <b aria-hidden="true">*</b></span>
                  <input name="candidateCount" type="number" min="1" max="100" required value={serviceForm.candidateCount || '1'} onChange={e => setServiceForm({ ...serviceForm, candidateCount: e.target.value })} aria-label="Number of candidates" />
                  <span style={{ fontSize: 13, color: '#526158' }}>Estimated total: {Number.isFinite(Number(selectedService.price)) && Number(selectedService.price) > 0 && Number(serviceForm.candidateCount || 1) >= 1 ? '₦' + (Number(selectedService.price) * Math.min(100, Math.floor(Number(serviceForm.candidateCount || 1)))).toLocaleString('en-NG') : 'To be confirmed'}</span>
                </label>
              ) : null}
              {jambServiceFieldsFor(selectedService).map(field => (
                <label key={field.name} className="service-request-field">
                  <span style={{ fontWeight: 600 }}>{field.label} *</span>
                  {field.options ? (
                    <select name={'serviceField_' + field.name} required defaultValue="" aria-label={field.label}>
                      <option value="" disabled>Select {field.label.toLowerCase()}</option>
                      {field.options.map(option => <option key={option} value={option}>{option}</option>)}
                    </select>
                  ) : (
                    <input name={'serviceField_' + field.name} type={field.type || 'text'} min={field.type === 'number' ? 2000 : undefined} max={field.type === 'number' ? 2026 : undefined} required maxLength={160} placeholder={field.placeholder || field.label} aria-label={field.label} />
                  )}
                </label>
              ))}
              {selectedService.requirements ? <p style={{ margin: 0, fontSize: 13, whiteSpace: 'pre-line', color: '#526158' }}><b>Before you submit</b>{'\n'}{selectedService.requirements}</p> : null}
              <label className="service-request-field" htmlFor="service-request-details">
                <span>Additional notes <small>{jambServiceFieldsFor(selectedService).length ? "(optional)" : "(required)"}</small></span>
                <textarea id="service-request-details" name="details" maxLength={4000} rows={4} placeholder="Tell us what you need help with…" required={!jambServiceFieldsFor(selectedService).length} />
              </label>
              <p>Please do not submit passwords, bank details or sensitive identity documents.</p>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button type="submit" className="primary" disabled={serviceSubmitting}>{serviceSubmitting ? 'Sending request…' : 'Send service request'}</button>
                <button type="button" className="secondary" disabled={serviceSubmitting} onClick={() => setSelectedService(null)}>Cancel</button>
              </div>
            </form>
          </section>
        </div>
      )}
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
            <a href="/admin">Admin sign in</a>
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
