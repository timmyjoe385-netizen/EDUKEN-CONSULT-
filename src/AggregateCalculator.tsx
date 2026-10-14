import { useMemo, useState } from 'react';
import { ArrowLeft, Calculator, ExternalLink, GraduationCap } from 'lucide-react';

type SchoolKey = 'unilorin' | 'fuhsi' | 'custom';
const gradePoints: Record<string, number> = { A1: 8, B2: 7, B3: 6, C4: 5, C5: 4, C6: 3 };
const gradeOptions = Object.keys(gradePoints);
const sources: Record<'unilorin' | 'fuhsi', string> = {
  unilorin: 'https://www.unilorin.edu.ng/wp-content/uploads/2026/06/Pre-admission-screening-2026.pdf',
  fuhsi: 'https://fuhsi.edu.ng/admissions.html',
};
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
  const [jambWeight, setJambWeight] = useState('50');
  const [postWeight, setPostWeight] = useState('50');
  const [showResult, setShowResult] = useState(false);

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
      Boolean(post) && Number(jambWeight) + Number(postWeight) > 0);

  const clear = () => {
    setJamb(''); setPost(''); setOlevelPoints(''); setGrades(['', '', '', '', '']); setShowResult(false);
  };

  return <div className="aggregate-page">
    <header className="aggregate-topbar">
      <a href="/" className="aggregate-back"><ArrowLeft size={17} /> EDUKEN CONSULT</a>
      <span><GraduationCap size={17} /> Admission tools</span>
    </header>
    <main className="aggregate-shell">
      <div className="aggregate-intro">
        <span className="aggregate-kicker"><Calculator size={15} /> FREE STUDENT TOOL</span>
        <h1>EDUKEN Aggregate Calculator</h1>
        <p>Calculate a screening aggregate using a published institutional formula or enter weights you already know. Your inputs stay in this browser.</p>
      </div>
      <section className="aggregate-card" aria-labelledby="aggregate-form-title">
        <h2 id="aggregate-form-title">Calculate your score</h2>
        <label className="aggregate-field"><span>Institution / formula</span>
          <select value={school} onChange={e => { setSchool(e.target.value as SchoolKey); setShowResult(false); }}>
            <option value="unilorin">University of Ilorin — 50:30:20</option>
            <option value="fuhsi">FUHSI, Ila-Orangun — 70:30</option>
            <option value="custom">Custom UTME + Post-UTME weights</option>
          </select>
        </label>
        <div className="aggregate-field">
          <label htmlFor="aggregate-jamb">JAMB UTME score (out of 400)</label>
          <input id="aggregate-jamb" type="number" inputMode="numeric" min="0" max="400" value={jamb} onChange={e => { setJamb(e.target.value); setShowResult(false); }} placeholder="e.g. 250" />
        </div>
        {school === 'unilorin' && <>
          <div className="aggregate-field">
            <label htmlFor="aggregate-post">Post-UTME score (out of 100)</label>
            <input id="aggregate-post" type="number" min="0" max="100" value={post} onChange={e => { setPost(e.target.value); setShowResult(false); }} placeholder="Enter screening score" />
          </div>
          <div className="aggregate-field">
            <label htmlFor="aggregate-olevel">O’Level contribution (out of 20)</label>
            <input id="aggregate-olevel" type="number" min="0" max="20" value={olevelPoints} onChange={e => { setOlevelPoints(e.target.value); setShowResult(false); }} placeholder="Points based on official instructions" />
            <small>Enter the O’Level contribution according to the current official scoring instructions. EDUKEN does not guess the grade conversion.</small>
          </div>
        </>}
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
          <small>Confirm your subject and eligibility requirements with the institution before relying on this result.</small>
        </>}
        {school === 'custom' && <>
          <p className="aggregate-helper">Use only when you know the official weights. Custom mode is a user-defined estimate, not an EDUKEN-verified school formula.</p>
          <div className="aggregate-two-fields">
            <div className="aggregate-field"><label htmlFor="aggregate-jw">UTME weight (%)</label><input id="aggregate-jw" type="number" min="0" max="100" value={jambWeight} onChange={e => { setJambWeight(e.target.value); setShowResult(false); }} /></div>
            <div className="aggregate-field"><label htmlFor="aggregate-pw">Post-UTME weight (%)</label><input id="aggregate-pw" type="number" min="0" max="100" value={postWeight} onChange={e => { setPostWeight(e.target.value); setShowResult(false); }} /></div>
          </div>
          <div className="aggregate-field"><label htmlFor="aggregate-custom-post">Post-UTME score (out of 100)</label><input id="aggregate-custom-post" type="number" min="0" max="100" value={post} onChange={e => { setPost(e.target.value); setShowResult(false); }} placeholder="Enter screening score" /></div>
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
        </div>}
      </section>
      <section className="aggregate-source">
        <h2>Formula & important notes</h2>
        {school === 'unilorin'
          ? <p>University of Ilorin’s 2026/2027 screening instructions specify UTME/A’Level (50%), Post-UTME (30%) and five relevant O’Level grades (20%). Enter the O’Level contribution using the institution’s instructions.</p>
          : school === 'fuhsi'
            ? <p>FUHSI publishes a 70% UTME + 30% O’Level model for 2026/2027, including an A1–C6 point scale for five required subjects.</p>
            : <p>Custom mode uses only the weights and scores you provide. It does not confirm that an institution accepts this formula.</p>}
        {school !== 'custom' && <a href={sources[school]} target="_blank" rel="noreferrer">Open institution source <ExternalLink size={14} /></a>}
        <p className="aggregate-disclaimer">Admission requirements and screening methods can change by session and course. Check the institution’s official website before making an application decision.</p>
      </section>
    </main>
    <footer className="aggregate-footer">© 2026 EDUKEN CONSULT · Education. Opportunities. Your Next Move.</footer>
  </div>;
}

export function AggregateCalculatorShortcut() {
  return <a className="aggregate-shortcut" href="/aggregate-calculator" aria-label="Open EDUKEN Aggregate Calculator"><Calculator size={18} /><span>Aggregate Calculator</span></a>;
}
