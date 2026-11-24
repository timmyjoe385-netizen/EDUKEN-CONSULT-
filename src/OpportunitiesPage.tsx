import { useMemo, useState } from 'react';
import { ArrowRight, Search, ShieldCheck } from 'lucide-react';

type Item = Record<string, any> & { id: string };

function deadlineTime(value: unknown) {
  if (!value) return NaN;
  const text = String(value).trim();
  const parsed = Date.parse(text);
  return Number.isFinite(parsed) ? parsed : NaN;
}
function status(item: Item) {
  if (/^(closed|expired)$/i.test(String(item.status || ''))) return 'Closed';
  const deadline = deadlineTime(item.deadline);
  if (Number.isFinite(deadline) && deadline <= Date.now()) return 'Closed';
  if (Number.isFinite(deadline) && deadline - Date.now() <= 14 * 864e5) return 'Closing soon';
  return 'Open';
}
export default function OpportunitiesPage({ opportunities, loading }: { opportunities: Item[]; loading: boolean }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const visible = useMemo(() => opportunities.filter(item => {
    const published = item.is_published ?? item.isPublished ?? item.published;
    if (published === false || String(published).toLowerCase() === 'false' || String(published) === '0' || String(item.status || '').toUpperCase() === 'DRAFT') return false;
    const state = status(item);
    if (state === 'Closed') return false;
    const text = [item.title,item.description,item.category,item.eligibility,item.benefits].map(x=>String(x||'')).join(' ').toLowerCase();
    const term = query.trim().toLowerCase();
    const categoryMatches = category === 'All' || String(item.category||'').toLowerCase().includes(category.toLowerCase().replace(/s$/,''));
    return (!term || text.includes(term)) && categoryMatches;
  }), [opportunities, query, category]);
  return <main className="opportunities-page">
    <section className="services-page-hero">
      <span className="kicker">EDUKEN CONSULT · OPPORTUNITY HUB</span>
      <h1>Find opportunities that move you forward.</h1>
      <p>Explore published scholarships, grants, internships, jobs, fellowships and other opportunities. Check eligibility and deadlines before applying.</p>
      <div className="services-page-actions"><a className="primary" href="#open-opportunities">Explore opportunities <ArrowRight size={17}/></a><a className="secondary" href="/my-eduken">Save and track in My EDUKEN</a></div>
    </section>
    <section className="section" id="open-opportunities">
      <div className="section-head"><div><span className="kicker">CURRENT LISTINGS</span><h2>Open opportunities</h2></div><p>Expired listings are excluded from this list. Verify application details with the official provider.</p></div>
      <label className="search opportunities-search"><Search size={18}/><input aria-label="Search opportunities" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search title, category or eligibility…"/></label>
      <div className="filters" role="group" aria-label="Opportunity categories">
        {['All','Scholarship','Grant','Job','Internship','Fellowship','Remote','Competition'].map(item=><button type="button" key={item} className={category===item?'active':''} aria-pressed={category===item} onClick={()=>setCategory(item)}>{item}</button>)}
      </div>
      <div className="opp-grid">
        {loading ? <p>Loading published opportunities…</p> : visible.length === 0 ? <div className="hub-empty-state"><span className="hub-empty-icon" aria-hidden="true">🌱</span><h3>{query || category!=='All' ? 'No matching opportunities' : 'Fresh opportunities are coming'}</h3><p>{query || category!=='All' ? 'Try another keyword or choose a different category.' : 'We are preparing new scholarships, grants, jobs and internships. Check back soon or contact EDUKEN for guidance.'}</p><div className="hub-empty-actions"><a className="primary" href="/my-eduken">Open My EDUKEN <ArrowRight size={15} /></a><a className="secondary" href="https://wa.me/2348129811733" target="_blank" rel="noreferrer">Ask EDUKEN</a></div></div> : visible.map(item=><article className="opp-card" key={item.id}>
          <div className="opp-topline"><span className="tag">{item.category||'Opportunity'}</span><span className={'opportunity-status opportunity-status--'+status(item).toLowerCase().replace(/\s+/g,'-')}>{status(item)}</span>{item.verified?<span className="verified-pill"><ShieldCheck size={16}/><span>Verified by EDUKEN</span></span>:null}</div>
          <h3>{item.title}</h3><p>{item.description||item.content||'Open the official provider details to review this opportunity.'}</p>
          {item.eligibility?<p><b>Eligibility:</b> {item.eligibility}</p>:null}
          {item.benefits?<p><b>Benefits:</b> {item.benefits}</p>:null}
          <div className="opp-foot"><span>Deadline: {item.deadline||'See official details'}</span>{item.application_url||item.link||item.sourceUrl?<a href={item.application_url||item.link||item.sourceUrl} target="_blank" rel="noreferrer">Official details <ArrowRight size={14}/></a>:<span>Confirm application details with provider</span>}</div>
        </article>)}
      </div>
    </section>
  </main>;
}
