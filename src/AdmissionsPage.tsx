import { useMemo, useState } from 'react';
import { ArrowRight, Search, ShieldCheck } from 'lucide-react';

type Admission = Record<string, any> & { id: string };

export default function AdmissionsPage({ admissions, loading }: { admissions: Admission[]; loading: boolean }) {
  const [query, setQuery] = useState('');
  const visibleAdmissions = useMemo(() => {
    const term = query.trim().toLowerCase();
    return admissions.filter(item => {
      const published = item.is_published ?? item.isPublished ?? item.published;
      if (published === false || String(published).toLowerCase() === 'false' || String(item.status || '').toUpperCase() === 'DRAFT') return false;
      if (!term) return true;
      return [item.school, item.course, item.type, item.status, item.details]
        .some(value => String(value || '').toLowerCase().includes(term));
    });
  }, [admissions, query]);

  return (
    <main className="admissions-page">
      <section className="services-page-hero">
        <span className="kicker">EDUKEN CONSULT · ADMISSION HUB</span>
        <h1>Find your next admission opportunity.</h1>
        <p>Explore admission and screening information published by EDUKEN. Check each school’s requirements and confirm important details with the institution before applying.</p>
        <div className="services-page-actions">
          <a className="primary" href="#published-admissions">Browse admissions <ArrowRight size={17} /></a>
          <a className="secondary" href="/aggregate-calculator">Aggregate calculator</a>
        </div>
      </section>
      <section className="section" id="published-admissions">
        <div className="section-head">
          <div><span className="kicker">PUBLISHED ADMISSION INFORMATION</span><h2>Admissions and screening updates</h2></div>
          <p>Records shown here are managed through the secure EDUKEN dashboard. Always confirm deadlines and eligibility with the school.</p>
        </div>
        <label className="search admissions-search">
          <Search size={18} />
          <input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search school, course or admission type…" aria-label="Search admissions" />
        </label>
        <div className="admission-grid">
          {loading ? <p>Loading published admissions…</p> : visibleAdmissions.length === 0 ? (
            <p className="empty-state">{query ? 'No published admission records match your search.' : 'No published admission records are available right now. Please check back soon.'}</p>
          ) : visibleAdmissions.map(item => (
            <article className="admission-card" key={item.id}>
              <div className="admission-top">
                <span>{item.type || 'Admission'}</span>
                {item.verified ? <span className="verified-pill"><ShieldCheck size={16} strokeWidth={3} aria-hidden="true" /><span>Verified by EDUKEN</span></span> : null}
              </div>
              <h3>{item.school || item.title || 'Admission update'}</h3>
              <p>{item.course || item.programme || 'Course details not specified'}</p>
              {item.details ? <p>{item.details}</p> : null}
              <div className="line" />
              <small>Deadline: {item.deadline || 'Not specified — confirm with the institution'}</small>
              {item.link || item.sourceUrl ? (
                <a className="primary" href={item.link || item.sourceUrl} target="_blank" rel="noreferrer">View official details <ArrowRight size={14} /></a>
              ) : <span className="admission-no-link">Contact the institution to confirm current details.</span>}
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
