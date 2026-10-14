import { useMemo, useState } from 'react';
import { ArrowLeft, Calculator, ExternalLink, GraduationCap, Search, ShieldCheck } from 'lucide-react';

type SchoolKey = 'unilorin' | 'fuhsi' | 'uniben' | 'custom';
type FormulaStatus = 'official' | 'community';
const gradePoints: Record<string, number> = { A1: 8, B2: 7, B3: 6, C4: 5, C5: 4, C6: 3 };
const gradeOptions = Object.keys(gradePoints);
const sources: Partial<Record<SchoolKey, string>> = {
  unilorin: 'https://www.unilorin.edu.ng/wp-content/uploads/2026/06/Pre-admission-screening-2026.pdf',
  fuhsi: 'https://fuhsi.edu.ng/admissions.html',
  uniben: 'https://www.uniben.edu/',
};
const directory = [
  { name: 'University of Ilorin (UNILORIN)', status: 'official', note: '2026/2027 formula available', href: sources.unilorin },
  { name: 'Federal University of Health Sciences, Ila-Orangun (FUHSI)', status: 'official', note: 'Published 70:30 UTME/O’Level model', href: sources.fuhsi },
  { name: 'University of Benin (UNIBEN)', status: 'community', note: '50:50 formula reported by multiple education sources; official confirmation not found', href: sources.uniben },
  { name: 'University of Lagos (UNILAG)', status: 'review', note: 'Current session formula needs confirmation; do not assume older weightings' },
  { name: 'University of Ibadan (UI)', status: 'review', note: 'Conflicting third-party formula reports; current weighting needs confirmation', href: 'https://ui.edu.ng/news' },
  { name: 'Obafemi Awolowo University (OAU)', status: 'review', note: 'Current score weighting and O’Level scale need confirmation', href: 'https://oauife.edu.ng/' },
  { name: 'Lagos State University (LASU)', status: 'review', note: 'Online screening confirmed; complete current scoring conversion needs confirmation', href: 'https://lasu.edu.ng/' },
  { name: 'Federal University of Technology, Akure (FUTA)', status: 'review', note: 'Current formula not confirmed in the notice reviewed', href: 'https://futa.edu.ng/' },
  { name: 'University of Nigeria, Nsukka (UNN)', status: 'review', note: 'Method may vary by session; confirm the current score conversion', href: 'https://www.unn.edu.ng/' },
  { name: 'Federal University Oye-Ekiti (FUOYE)', status: 'review', note: 'Current screening formula needs confirmation', href: 'https://fuoye.edu.ng/' },
  { name: 'Federal University of Technology, Minna (FUTMINNA)', status: 'review', note: 'Current formula needs confirmation' },
  { name: 'Ahmadu Bello University (ABU), Zaria', status: 'review', note: 'Current score scale and formula need confirmation' },
  { name: 'Nnamdi Azikiwe University (UNIZIK)', status: 'review', note: 'Current formula needs confirmation' },
  { name: 'Alex Ekwueme Federal University, Ndufu-Alike (AE-FUNAI)', status: 'review', note: 'Screening method and score scale need confirmation' },
  { name: 'Federal University, Otuoke (FUOTUOKE)', status: 'review', note: 'O’Level-based options are reported; exact current method needs confirmation' },
  { name: 'Imo State University (IMSU)', status: 'review', note: 'Current formula needs confirmation' },
  { name: 'Rivers State University (RSU)', status: 'review', note: 'Current formula needs confirmation' },
  { name: 'Ekiti State University (EKSU)', status: 'review', note: 'Current formula needs confirmation' },
  { name: 'Delta State University (DELSU)', status: 'review', note: 'Current formula needs confirmation' },
  { name: 'Federal University of Agriculture, Abeokuta (FUNAAB)', status: 'review', note: 'Current formula needs confirmation' },
  { name: 'Osun State University (UNIOSUN)', status: 'review', note: 'Current formula needs confirmation' },
  { name: 'Bamidele Olumilua University (BOUESTI)', status: 'review', note: 'Current formula needs confirmation' },
  { name: 'University of Port Harcourt (UNIPORT)', status: 'review', note: 'Current formula needs confirmation' },
  { name: 'Bayero University Kano (BUK)', status: 'review', note: 'Current formula needs confirmation' },
  { name: 'Federal University, Dutse (FUD)', status: 'review', note: 'Current formula needs confirmation' },
  { name: 'Federal University, Lafia (FULAFIA)', status: 'review', note: 'Current formula needs confirmation' },
  { name: 'Federal University, Dutsin-Ma (FUDMA)', status: 'review', note: 'Current formula needs confirmation' },
  { name: 'Niger Delta University (NDU)', status: 'review', note: 'Current formula needs confirmation' },
  { name: 'National Open University of Nigeria (NOUN)', status: 'review', note: 'Admission route differs; aggregate method needs separate review' },
];

const clamp = (value: string, max: number) => {
  const n = Number(value);
  return Number.isFinite(n) ? Math.min(max, Math.max(0, n)) : 0;
};

export default function AggregateCalculator() {
  const [school, setSchool] = useState<SchoolKey>('unilorin');
  const [jamb, setJamb] = useState('');
  const [post, setPost] = useState('');
  const [olevelPoints, setOlevelPoints] = useState('');
  const [grades, setGrades] = useState<string[]>(['', '', '', '', '']);
  const [extraGrades, setExtraGrades] = useState<Array<{ subject: string; grade: string }>>([]);
  const [jambWeight, setJambWeight] = useState('50');
  const [postWeight, setPostWeight] = useState('50');
  const [showResult, setShowResult] = useState(false);
  const [directoryQuery, setDirectoryQuery] = useState('');
  const [directoryFilter, setDirectoryFilter] = useState<'all' | 'ready' | 'review'>('all');

  const result = useMemo(() => {
    const utme = clamp(jamb, 400);
    if (school === 'unilorin') {
      const parts = [
        { label: 'UTME contribution', value: utme / 400 * 50, max: 50 },
        { label: 'Post-UTME contribution', value: clamp(post, 100) / 100 * 30, max: 30 },
        { label: 'O’Level contribution (entered out of 20)', value: clamp(olevelPoints, 20), max: 20 },
      ];
      return { total: parts.reduce((sum, part) => sum + part.value, 0), parts };
    }
    if (school === 'fuhsi') {
      const olevel = grades.reduce((sum, grade) => sum + (gradePoints[grade] || 0), 0);
      const parts = [
        { label: 'UTME contribution', value: utme / 400 * 70, max: 70 },
        { label: 'O’Level contribution', value: olevel / 40 * 30, max: 30 },
      ];
      return { total: parts.reduce((sum, part) => sum + part.value, 0), parts };
    }
    if (school === 'uniben') {
      const parts = [
        { label: 'UTME contribution (reported 50%)', value: utme / 400 * 50, max: 50 },
        { label: 'Post-UTME contribution (reported 50%)', value: clamp(post, 100) / 100 * 50, max: 50 },
      ];
      return { total: parts.reduce((sum, part) => sum + part.value, 0), parts };
    }
    const jw = clamp(jambWeight, 100);
    const pw = clamp(postWeight, 100);
    const totalWeight = jw + pw || 1;
    const parts = [
      { label: 'UTME contribution', value: utme / 400 * (jw / totalWeight * 100), max: jw / totalWeight * 100 },
      { label: 'Post-UTME contribution', value: clamp(post, 100) / 100 * (pw / totalWeight * 100), max: pw / totalWeight * 100 },
    ];
    return { total: parts.reduce((sum, part) => sum + part.value, 0), parts };
  }, [school, jamb, post, olevelPoints, grades, jambWeight, postWeight]);

  const ready = Boolean(jamb) &&
    (school === 'unilorin' ? Boolean(post) && olevelPoints !== '' :
      school === 'fuhsi' ? grades.every(Boolean) :
      school === 'uniben' ? Boolean(post) :
      Boolean(post) && Number(jambWeight) + Number(postWeight) > 0);

  const clear = () => {
    setJamb(''); setPost(''); setOlevelPoints(''); setGrades(['', '', '', '', '']); setExtraGrades([]); setShowResult(false);
  };

  const filteredDirectory = directory.filter((item) => {
    const matchesQuery = item.name.toLowerCase().includes(directoryQuery.toLowerCase());
    const matchesFilter = directoryFilter === 'all' ||
      (directoryFilter === 'ready' && (item.status === 'official' || item.status === 'community')) ||
      (directoryFilter === 'review' && item.status === 'review');
    return matchesQuery && matchesFilter;
  });

  return <div className="aggregate-page">
    <header className="aggregate-topbar">
      <a href="/" className="aggregate-back"><ArrowLeft size={17} /> EDUKEN CONSULT</a>
      <span><GraduationCap size={17} /> Admission tools</span>
    </header>
    <main className="aggregate-shell">
      <div className="aggregate-intro">
        <span className="aggregate-kicker"><Calculator size={15} /> FREE STUDENT TOOL</span>
        <h1>EDUKEN Aggregate Calculator</h1>
        <p>Calculate a screening aggregate using a published institutional formula or a clearly labelled community-reported formula. Your inputs are processed on this page and are not sent to EDUKEN.</p>
      </div>
      <section className="aggregate-card" aria-labelledby="aggregate-form-title">
        <h2 id="aggregate-form-title">Calculate your score</h2>
        <label className="aggregate-field"><span>Institution / formula</span>
          <select value={school} onChange={e => { setSchool(e.target.value as SchoolKey); setShowResult(false); }}>
            <option value="unilorin">University of Ilorin — 50:30:20 (official)</option>
            <option value="fuhsi">FUHSI, Ila-Orangun — 70:30 (official)</option>
            <option value="uniben">University of Benin — 50:50 (community-reported)</option>
            <option value="custom">Custom UTME + Post-UTME weights</option>
          </select>
        </label>
        {school === 'uniben' && <p className="aggregate-helper">Multiple education sources report a 50:50 formula for UNIBEN, but we did not find an official university page confirming this weighting for 2026/2027. Treat the result as provisional and verify the current admission instructions.</p>}
        <div className="aggregate-field">
          <label htmlFor="aggregate-jamb">JAMB UTME score (out of 400)</label>
          <input id="aggregate-jamb" type="number" inputMode="numeric" min="0" max="400" value={jamb} onChange={e => { setJamb(e.target.value); setShowResult(false); }} placeholder="e.g. 250" />
        </div>
        {(school === 'unilorin' || school === 'uniben' || school === 'custom') && <>
          <div className="aggregate-field">
            <label htmlFor="aggregate-post">Post-UTME score (out of 100)</label>
            <input id="aggregate-post" type="number" min="0" max="100" value={post} onChange={e => { setPost(e.target.value); setShowResult(false); }} placeholder="Enter screening score" />
          </div>
        </>}
        {school === 'unilorin' && <div className="aggregate-field">
          <label htmlFor="aggregate-olevel">O’Level contribution (out of 20)</label>
          <input id="aggregate-olevel" type="number" min="0" max="20" value={olevelPoints} onChange={e => { setOlevelPoints(e.target.value); setShowResult(false); }} placeholder="Points based on official instructions" />
          <small>Enter the O’Level contribution according to the current official scoring instructions. EDUKEN does not guess the grade conversion.</small>
        </div>}
        {school === 'fuhsi' && <>
          <p className="aggregate-helper">Select the grades for the five required subjects listed in FUHSI’s published screening formula.</p>
          {['English Language', 'Mathematics', 'Physics', 'Chemistry', 'Biology'].map((subject, index) =>
            <label className="aggregate-field" key={subject}><span>{subject}</span>
              <select value={grades[index]} onChange={e => { setGrades(current => current.map((grade, i) => i === index ? e.target.value : grade)); setShowResult(false); }}>
                <option value="">Choose grade</option>
                {gradeOptions.map(grade => <option key={grade} value={grade}>{grade} — {gradePoints[grade]} points</option>)}
              </select>
            </label>
          )}
          <div className="aggregate-extra-grades">
            <div className="aggregate-extra-grades-heading">
              <div><strong>Additional O’Level grades</strong><small>Add other subjects to keep track of them while this page is open.</small></div>
              <button type="button" className="aggregate-add-grade" onClick={() => { setExtraGrades(current => [...current, { subject: '', grade: '' }]); setShowResult(false); }}>+ Add another grade</button>
            </div>
            {extraGrades.map((item, index) => <div className="aggregate-extra-grade-row" key={index}>
              <label className="aggregate-field"><span>Subject {index + 6}</span><input value={item.subject} onChange={e => { setExtraGrades(current => current.map((grade, i) => i === index ? { ...grade, subject: e.target.value } : grade)); setShowResult(false); }} placeholder="e.g. Economics" /></label>
              <label className="aggregate-field"><span>Grade</span><select value={item.grade} onChange={e => { setExtraGrades(current => current.map((grade, i) => i === index ? { ...grade, grade: e.target.value } : grade)); setShowResult(false); }}><option value="">Choose grade</option>{gradeOptions.map(grade => <option key={grade} value={grade}>{grade} — {gradePoints[grade]} points</option>)}</select></label>
              <button type="button" className="aggregate-remove-grade" onClick={() => { setExtraGrades(current => current.filter((_, i) => i !== index)); setShowResult(false); }} aria-label={`Remove additional subject ${index + 6}`}>Remove</button>
            </div>)}
            <p className="aggregate-helper">FUHSI’s published formula uses the five specified core subjects above. Additional grades are kept temporarily on this page and are not added to the score, so extra entries cannot inflate your aggregate. Refreshing or clearing the page removes them.</p>
          </div>
          <small>Confirm your subject and eligibility requirements with the institution before relying on this result.</small>
        </>}
        {school === 'custom' && <>
          <p className="aggregate-helper">Use only when you know the official weights. Custom mode is a user-defined estimate, not an EDUKEN-verified school formula.</p>
          <div className="aggregate-two-fields">
            <div className="aggregate-field"><label htmlFor="aggregate-jw">UTME weight (%)</label><input id="aggregate-jw" type="number" min="0" max="100" value={jambWeight} onChange={e => { setJambWeight(e.target.value); setShowResult(false); }} /></div>
            <div className="aggregate-field"><label htmlFor="aggregate-pw">Post-UTME weight (%)</label><input id="aggregate-pw" type="number" min="0" max="100" value={postWeight} onChange={e => { setPostWeight(e.target.value); setShowResult(false); }} /></div>
          </div>
          <small>Weights are normalized to 100. This simplified mode does not include O’Level or other factors unless the formula you know does not require them.</small>
        </>}
        <div className="aggregate-actions">
          <button type="button" className="aggregate-primary" disabled={!ready} onClick={() => setShowResult(true)}>Calculate aggregate <Calculator size={17} /></button>
          <button type="button" className="aggregate-secondary" onClick={clear}>Clear</button>
        </div>
        {showResult && <div className="aggregate-result" role="status" aria-live="polite">
          <span>YOUR CALCULATED AGGREGATE</span><strong>{result.total.toFixed(2)} <small>/ 100</small></strong>
          <p>This is a calculation of the inputs supplied, not a prediction or guarantee of admission.</p>
          <div className="aggregate-breakdown">{result.parts.map(part => <div key={part.label}><span>{part.label}</span><b>{part.value.toFixed(2)} / {part.max}</b></div>)}</div>
          {school === 'uniben' && <p><strong>Provisional formula:</strong> independently reported, not officially confirmed for this session.</p>}
        </div>}
      </section>
      <section className="aggregate-source">
        <h2>Formula & important notes</h2>
        {school === 'unilorin'
          ? <p>University of Ilorin’s 2026/2027 screening instructions specify UTME/A’Level (50%), Post-UTME (30%) and five relevant O’Level grades (20%). Enter the O’Level contribution using the institution’s instructions.</p>
          : school === 'fuhsi'
            ? <p>FUHSI publishes a 70% UTME + 30% O’Level model for 2026/2027, including an A1–C6 point scale for five required subjects.</p>
            : school === 'uniben'
              ? <p>Multiple independent education sources report a 50% UTME + 50% Post-UTME model for UNIBEN. The current official session formula was not found in the official material reviewed, so this is marked community-reported rather than officially verified.</p>
              : <p>Custom mode uses only the weights and scores you provide. It does not confirm that an institution accepts this formula.</p>}
        {school !== 'custom' && sources[school] && <a href={sources[school]} target="_blank" rel="noreferrer">Open source / admission portal <ExternalLink size={14} /></a>}
        <p className="aggregate-disclaimer">Admission requirements and screening methods can change by session and course. Check the institution’s current instructions before making an application decision.</p>
      </section>
      <section className="aggregate-directory" aria-labelledby="aggregate-directory-title">
        <div className="aggregate-directory-heading">
          <span className="aggregate-kicker"><ShieldCheck size={15} /> EXPANDING NATIONWIDE</span>
          <h2 id="aggregate-directory-title">Nigerian university formula directory</h2>
          <p>Search the schools we are tracking. Only schools with a usable formula can be calculated above; the rest stay visible while we compare current notices, social-media announcements and independent reports.</p>
        </div>
        <label className="aggregate-directory-search"><Search size={17} /><input value={directoryQuery} onChange={e => setDirectoryQuery(e.target.value)} placeholder="Search a university..." aria-label="Search university directory" /></label>
        <div className="aggregate-directory-filters" role="group" aria-label="Filter universities">
          <button type="button" className={directoryFilter === 'all' ? 'active' : ''} onClick={() => setDirectoryFilter('all')}>All schools ({directory.length})</button>
          <button type="button" className={directoryFilter === 'ready' ? 'active' : ''} onClick={() => setDirectoryFilter('ready')}>Formula available ({directory.filter(item => item.status !== 'review').length})</button>
          <button type="button" className={directoryFilter === 'review' ? 'active' : ''} onClick={() => setDirectoryFilter('review')}>Under verification ({directory.filter(item => item.status === 'review').length})</button>
        </div>
        <div className="aggregate-directory-list">
          {filteredDirectory.map(item => <article className="aggregate-directory-item" key={item.name}>
            <div className="aggregate-directory-item-top">
              <strong>{item.name}</strong>
              <span className={'aggregate-status ' + (item.status === 'official' ? 'is-official' : item.status === 'community' ? 'is-community' : 'is-review')}>
                {item.status === 'official' ? 'Official formula' : item.status === 'community' ? 'Community-reported' : 'Needs verification'}
              </span>
            </div>
            <p>{item.note}</p>
            {item.href && <a href={item.href} target="_blank" rel="noreferrer">Check source <ExternalLink size={13} /></a>}
          </article>)}
          {filteredDirectory.length === 0 && <p className="aggregate-helper">No schools match that search. Try a shorter name or acronym.</p>}
        </div>
        <p className="aggregate-disclaimer">Directory coverage is not a claim that every institution’s formula has been verified. We will promote entries to a calculator only when the formula and its scoring scale have enough supporting evidence.</p>
      </section>
    </main>
    <footer className="aggregate-footer">© 2026 EDUKEN CONSULT · Education. Opportunities. Your Next Move.</footer>
  </div>;
}

export function AggregateCalculatorShortcut() {
  return <a className="aggregate-shortcut" href="/aggregate-calculator" aria-label="Open EDUKEN Aggregate Calculator"><Calculator size={18} /><span>Aggregate Calculator</span></a>;
}
