import { useEffect, useState } from 'react';

type Item = Record<string, any> & { id: string };
type Category = 'jamb-news' | 'admissions' | 'scholarships' | 'education-news' | 'school-updates' | 'jobs-internships' | 'opportunities';

const pageConfig: Record<Category, { title: string; kicker: string; intro: string }> = {
  'jamb-news': { title: 'JAMB News & Examination Updates', kicker: 'JAMB & EXAMINATIONS', intro: 'Important examination announcements, registration information and JAMB-related updates published by EDUKEN CONSULT.' },
  admissions: { title: 'Admission Guidance & Updates', kicker: 'ADMISSION HUB', intro: 'Admission announcements, screening information and guidance to help students follow the next steps.' },
  scholarships: { title: 'Scholarships & Grants', kicker: 'FUNDING OPPORTUNITIES', intro: 'Scholarships, grants, bursaries and fellowships published for students and graduates.' },
  'education-news': { title: 'Educational News', kicker: 'EDUCATION NEWSROOM', intro: 'Education news and important learning-related announcements in one place.' },
  'school-updates': { title: 'School & Institution Updates', kicker: 'SCHOOL UPDATES', intro: 'Notices and announcements from universities, polytechnics, colleges and other institutions.' },
  'jobs-internships': { title: 'Internships & Jobs', kicker: 'CAREER OPPORTUNITIES', intro: 'Job openings, internships, graduate opportunities and career programmes.' },
  opportunities: { title: 'Opportunities', kicker: 'EDUKEN OPPORTUNITY HUB', intro: 'Explore currently published scholarships, jobs, internships, grants and other opportunities.' },
};

const clean = (value: unknown) => String(value ?? '').trim();
const isPlaceholder = (item: Item) => {
  const title = clean(item.title || item.school).toLowerCase();
  const body = clean(item.body || item.details || item.description || item.content).toLowerCase();
  return /will appear here|will be published here/.test(title) ||
    /use the eduken admin dashboard to publish clear, useful updates|verified opportunities will appear here/.test(body);
};
const isExpired = (value: unknown) => {
  const raw = clean(value);
  if (!raw) return false;
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return false;
  const deadline = new Date(parsed);
  deadline.setHours(23, 59, 59, 999);
  return deadline.getTime() < Date.now();
};

export default function ContentCategoryPage({ category, opportunities, admissions, updates, loading }: {
  category: string; opportunities: Item[]; admissions: Item[]; updates: Item[]; loading: boolean;
}) {
  const key = (pageConfig[category as Category] ? category : 'education-news') as Category;
  const config = pageConfig[key];
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const match = window.location.hash.match(/^#(?:admission\/|admission-)(.+)$/);
    if (!match) return;
    let targetId = '';
    try {
      targetId = decodeURIComponent(match[1]);
    } catch {
      return;
    }
    window.requestAnimationFrame(() => {
      document.getElementById('admission-' + targetId)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }, [key, loading, admissions]);

  const updateMatches = (item: Item) => {
    if (isPlaceholder(item)) return false;
    const searchable = [item.category, item.title, item.body, item.content].map(clean).join(' ').toLowerCase();
    if (key === 'jamb-news') return /jamb|utme|exam|post[- ]?utme|waec|neco|nabteb/.test(searchable);
    if (key === 'education-news') return /education|announcement|update|news|learning|student/.test(searchable) && !/jamb|utme/.test(searchable);
    if (key === 'school-updates') return /universit|institution|polytechnic|college|school|campus/.test(searchable);
    return false;
  };
  const opportunityMatches = (item: Item) => {
    if (isExpired(item.deadline)) return false;
    const categoryText = clean(item.category + ' ' + item.title + ' ' + item.description).toLowerCase();
    if (key === 'scholarships') return /scholarship|grant|fellowship|bursary|funding/.test(categoryText);
    if (key === 'jobs-internships') return /job|internship|career|vacanc|employment|trainee/.test(categoryText);
    return key === 'opportunities';
  };
  const updateItems = updates.filter(updateMatches);
  const admissionItems = admissions.filter(item => {
    const hasUsefulDetails = [item.course, item.details, item.description, item.content, item.link, item.application_url, item.deadline].some(value => clean(value));
    return !isPlaceholder(item) && hasUsefulDetails && (
      key === 'admissions' || (key === 'school-updates' && /school|institution|university|polytechnic|college/i.test(clean(item.school + ' ' + item.type)))
    );
  });
  const opportunityItems = opportunities.filter(item => !isPlaceholder(item) && opportunityMatches(item));
  const items: Array<{ id: string; title: string; category: string; body: string; date: string; link: string; label: string; verified: boolean; kind: string }> = [
    ...updateItems.map(item => ({ id: 'update-' + item.id, title: clean(item.title) || 'Education update', category: clean(item.category) || 'EDUKEN Update', body: clean(item.body || item.content || item.description), date: clean(item.date || item.published_at), link: clean(item.link || item.url), label: 'Read announcement', verified: Boolean(item.verified), kind: 'update' })),
    ...admissionItems.map(item => ({ id: 'admission-' + item.id, title: clean(item.school || item.title) || 'Admission update', category: clean(item.type) || 'Admission', body: [clean(item.course), clean(item.details || item.description || item.content)].filter(Boolean).join('\n\n'), date: clean(item.deadline), link: clean(item.link || item.application_url), label: 'View admission details', verified: Boolean(item.verified), kind: 'admission' })),
    ...opportunityItems.map(item => ({ id: 'opportunity-' + item.id, title: clean(item.title) || 'Opportunity', category: clean(item.category) || 'Opportunity', body: [clean(item.description), clean(item.eligibility) ? 'Eligibility: ' + clean(item.eligibility) : ''].filter(Boolean).join('\n\n'), date: clean(item.deadline), link: clean(item.sourceUrl || item.link || item.application_url), label: 'View official details', verified: Boolean(item.verified), kind: 'opportunity' })),
  ];
  const normalizedSearch = searchQuery.trim().toLowerCase();
  const visibleItems = items.filter(item => !normalizedSearch || [item.title, item.category, item.body].join(' ').toLowerCase().includes(normalizedSearch));
  const dateLabel = (value: string) => {
    if (!value) return '';
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  return <main id={key === 'admissions' ? 'admissions' : key === 'education-news' ? 'updates' : key === 'opportunities' ? 'opportunities' : undefined} className="content-category-page">
    <div className="content-category-page__inner">
      <nav className="content-category-page__nav" aria-label="EDUKEN navigation">
        <a className="content-category-page__brand" href="/">EDUKEN <strong>CONSULT</strong></a>
        <div><a href="/jamb-news">JAMB News</a><a href="/admissions">Admissions</a><a href="/scholarships">Scholarships</a><a href="/jobs-internships">Jobs</a></div>
      </nav>
      <div className="content-category-page__breadcrumb"><a href="/">Home</a><span>›</span><span>{config.title}</span></div>
      <header className="content-category-page__hero">
        <span className="kicker">{config.kicker}</span>
        <h1>{config.title}</h1>
        <p>{config.intro}</p>
      </header>
      <nav className="content-category-page__quicklinks" aria-label="More EDUKEN categories">
        <a href="/jamb-news">JAMB News</a><a href="/admissions">Admissions</a><a href="/scholarships">Scholarships & Grants</a><a href="/education-news">Educational News</a><a href="/school-updates">School Updates</a><a href="/jobs-internships">Internships & Jobs</a>
      </nav>
      <div className="content-category-page__search">
        <label htmlFor="category-content-search">Search this section</label>
        <input id="category-content-search" type="search" aria-label="Search this section" value={searchQuery} onChange={event => setSearchQuery(event.target.value)} placeholder="Search published information…" />
        {searchQuery ? <button type="button" onClick={() => setSearchQuery('')}>Clear search</button> : null}
      </div>
      <p className="content-category-page__count" role="status" aria-live="polite">{loading ? 'Loading published information…' : visibleItems.length + ' published item(s)'}</p>
      {loading ? <div className="content-category-page__empty">Please wait while published information loads.</div> :
        visibleItems.length === 0 ? <div className="content-category-page__empty">{normalizedSearch ? 'No matching information found. Try another search.' : 'There are no matching published items in this section yet. Please check back later as EDUKEN publishes verified updates.'}</div> :
        <div className="content-category-page__grid">{visibleItems.map(item => <article className="content-category-card" id={item.kind === 'admission' ? item.id : undefined} key={item.id}>
          <div className="content-category-card__meta"><span>{item.category}</span>{item.date ? <span>{item.kind === 'admission' ? 'Deadline: ' : 'Date: '}{dateLabel(item.date)}</span> : null}</div>
          {item.verified ? <span className="verified-pill"><span aria-hidden="true">✓</span> Verified by EDUKEN</span> : null}
          <h2>{item.title}</h2>
          {item.body ? <p>{item.body.length > 700 ? item.body.slice(0, 697) + '…' : item.body}</p> : <p>Open the full announcement for details and next steps.</p>}
          <button
            type="button"
            className="content-category-card__details-toggle"
            aria-expanded={expandedItemId === item.id}
            aria-controls={`content-details-${item.id}`}
            onClick={() => setExpandedItemId(current => current === item.id ? null : item.id)}
          >
            {expandedItemId === item.id ? 'Hide details' : 'View details'}
          </button>
          {expandedItemId === item.id ? (
            <div className="content-category-card__details" id={`content-details-${item.id}`} role="region" aria-label={`Full details for ${item.title}`}>
              <p>{item.body || 'No additional description has been provided yet.'}</p>
              {item.date ? <p><strong>{item.kind === 'admission' ? 'Deadline: ' : 'Date: '}</strong>{dateLabel(item.date)}</p> : null}
              {item.link ? <a href={item.link} target="_blank" rel="noopener noreferrer">{item.label} <span aria-hidden="true">↗</span></a> : null}
            </div>
          ) : null}
          {item.link && expandedItemId !== item.id ? <a href={item.link} target="_blank" rel="noopener noreferrer">{item.label} <span aria-hidden="true">↗</span></a> : null}
        </article>)}</div>}
      <a className="content-category-page__back" href="/">← Back to EDUKEN homepage</a>
    </div>
  </main>;
}
