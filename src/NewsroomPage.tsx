import { useMemo, useState } from 'react';
import { ArrowRight, Search, CheckCircle2 } from 'lucide-react';

type Item = Record<string, any> & { id: string };
const categories = ['All updates','JAMB & Examinations','Admissions','Scholarships','Universities & Institutions','Jobs & Internships','Educational News'];
const patterns: Record<string, RegExp> = {
  'JAMB & Examinations': /jamb|exam|utme|post[- ]?utme|waec|neco|nabteb/,
  Admissions: /admission|screening|matriculation|acceptance/,
  Scholarships: /scholarship|grant|fellowship|bursary|funding/,
  'Universities & Institutions': /universit|institution|polytechnic|college|school/,
  'Jobs & Internships': /job|internship|career|vacanc|employment|trainee/,
  'Educational News': /education|announcement|update|news|learning|student/,
};
export default function NewsroomPage({ updates, loading }: { updates: Item[]; loading: boolean }) {
  const [query,setQuery]=useState('');
  const [category,setCategory]=useState('All updates');
  const visible=useMemo(()=>updates.filter(item=>{
    const text=[item.category,item.title,item.body,item.content].map(x=>String(x||'')).join(' ').toLowerCase();
    if(category!=='All updates' && !(patterns[category]?.test(text))) return false;
    return !query.trim() || text.includes(query.trim().toLowerCase());
  }),[updates,category,query]);
  return <main className="newsroom-page">
    <section className="services-page-hero">
      <span className="kicker">EDUKEN CONSULT · NEWSROOM</span>
      <h1>Stay informed. Stay ahead.</h1>
      <p>Education updates, admission notices and student-focused news published by EDUKEN, with source context where available.</p>
      <div className="services-page-actions"><a className="primary" href="#latest-updates">Read latest updates <ArrowRight size={17}/></a><a className="secondary" href="/admissions">Explore admissions</a></div>
    </section>
    <section className="section" id="latest-updates">
      <div className="section-head"><div><span className="kicker">EDUKEN NEWSROOM</span><h2>Latest education updates</h2></div><p>Check publication dates and follow official sources for time-sensitive announcements.</p></div>
      <label className="search newsroom-search"><Search size={18}/><input aria-label="Search newsroom" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search updates, schools or topics…"/></label>
      <div className="filters update-filters" role="group" aria-label="Filter newsroom categories">{categories.map(item=><button type="button" key={item} className={category===item?'active':''} aria-pressed={category===item} onClick={()=>setCategory(item)}>{item}</button>)}</div>
      <div className="update-grid">
        {loading?<p>Loading published updates…</p>:visible.length===0?<p className="empty-state">No published updates match this search. Try another topic or check back later.</p>:visible.map((item,index)=><article className="update-card" key={item.id}>
          <div className={'update-image u'+(index%3)}><span>{item.category||'Update'}</span></div>
          <small>EDUKEN UPDATE · {item.date||'Date not specified'}</small>
          <h3>{item.title}</h3>
          <p>{item.body||item.content||'Open the official source for more information.'}</p>
          {item.verified?<span className="verified-pill inline-pill"><CheckCircle2 size={14}/> Verified by EDUKEN</span>:item.sourceUrl?<span className="source-pill inline-pill">Source available</span>:null}
          {item.sourceUrl?<a href={item.sourceUrl} target="_blank" rel="noreferrer">View source <ArrowRight size={14}/></a>:<span>Source link not provided</span>}
        </article>)}
      </div>
    </section>
  </main>;
}
