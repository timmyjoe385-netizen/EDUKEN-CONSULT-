import { useMemo, useState } from 'react';
import { ArrowLeft, Calculator, ExternalLink, GraduationCap, Search, ShieldCheck } from 'lucide-react';

type SchoolKey = 'unilorin' | 'fuhsi' | 'uniben' | 'unilag' | 'ui' | 'oau' | 'custom';
type FormulaStatus = 'official' | 'community';
const gradePoints: Record<string, number> = { A1: 8, B2: 7, B3: 6, C4: 5, C5: 4, C6: 3 };
const gradeOptions = Object.keys(gradePoints);
const sources: Partial<Record<SchoolKey, string>> = {
  unilorin: 'https://www.unilorin.edu.ng/wp-content/uploads/2026/06/Pre-admission-screening-2026.pdf',
  fuhsi: 'https://fuhsi.edu.ng/admissions.html',
  uniben: 'https://www.uniben.edu/',
  unilag: 'https://unilag.edu.ng/unilag-releases-2026-2027-utme-merit-cut-off-marks/',
  ui: 'https://admissions.ui.edu.ng/regulations',
  oau: 'https://campusai.com.ng/news/how-to-calculate-your-oau-aggregate-score-for-20262027-admission',
};
const directory = [
  { name: 'University of Ilorin (UNILORIN)', status: 'official', note: '2026/2027 formula available', href: sources.unilorin },
  { name: 'Federal University of Health Sciences, Ila-Orangun (FUHSI)', status: 'official', note: 'Published 70:30 UTME/O’Level model', href: sources.fuhsi },
  { name: 'University of Benin (UNIBEN)', status: 'community', note: '50:50 formula reported by multiple education sources; official confirmation not found', href: sources.uniben },
  { name: 'University of Lagos (UNILAG)', status: 'community', note: 'Official 2026/2027 merit cut-off marks are published; the current aggregate weighting is still unconfirmed. The calculator remains historical 50:30:20 only.', href: sources.unilag },
  { name: 'University of Ibadan (UI)', status: 'review', note: 'Official 2026/2027 admission portal lists cut-off marks and screening updates, but the aggregate formula and score conversion are not published on the page reviewed.', href: sources.ui },
  { name: 'Obafemi Awolowo University (OAU)', status: 'community', note: 'CampusAI reports 50:40:10; current official formula and O’Level conversion need confirmation', href: sources.oau },
  { name: 'Lagos State University (LASU)', status: 'review', note: 'Official 2026/2027 notice confirms point grading from UTME plus five best relevant O’Level subjects; exact point conversion still needs confirmation', href: 'https://lasu.edu.ng/home/news/read.php?id=642' },
  { name: 'Federal University of Technology, Akure (FUTA)', status: 'review', note: 'Official 2026/2027 notice confirms minimum UTME 180 and five O’Level credits; aggregate scoring conversion is not specified', href: 'https://admission.futa.edu.ng/home/news/1399' },
  { name: 'University of Nigeria, Nsukka (UNN)', status: 'review', note: 'Official 2026/2027 screening notice confirms eligibility, registration and O’Level upload requirements; it does not specify an aggregate score conversion.', href: 'https://www.unn.edu.ng/2026-2027-screening-exercise-for-admission/' },
  { name: 'Federal University Oye-Ekiti (FUOYE)', status: 'review', note: 'Official 2026/2027 guide confirms online screening and programme-specific UTME/O’Level requirements; it does not state a complete aggregate scoring conversion.', href: 'https://fuoye.edu.ng/post-utme-screening/' },
  { name: 'Federal University of Technology, Minna (FUTMINNA)', status: 'review', note: 'Official 2026/2027 notice confirms course-specific UTME cutoffs and five relevant O’Level credits; aggregate scoring conversion is not specified', href: 'https://futminna.edu.ng/2026-2027-pre-admission-screening-exercise-2026-utme-de/' },
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

const isValidScore = (value: string, max: number) => value !== '' && Number.isFinite(Number(value)) && Number(value) >= 0 && Number(value) <= max;
const isValidWholeScore = (value: string, max: number) => isValidScore(value, max) && Number.isInteger(Number(value));

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
  const [olevelWeight, setOlevelWeight] = useState('0');
  const [showResult, setShowResult] = useState(false);
  const [directoryQuery, setDirectoryQuery] = useState('');
  const [directoryFilter, setDirectoryFilter] = useState<'all' | 'ready' | 'review'>('all');
  const [intendedCourse, setIntendedCourse] = useState('');
  const [stateOfOrigin, setStateOfOrigin] = useState('');
  const [targetAggregate, setTargetAggregate] = useState('75');
  const [olevelSittings, setOlevelSittings] = useState('1');

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
    if (school === 'ui') {
      const parts = [
        { label: 'UTME contribution (reported 50%)', value: utme / 400 * 50, max: 50 },
        { label: 'Post-UTME contribution (reported 50%)', value: clamp(post, 100) / 100 * 50, max: 50 },
      ];
      return { total: parts.reduce((sum, part) => sum + part.value, 0), parts };
    }
    if (school === 'unilag') {
      const parts = [
        { label: 'UTME contribution (historical 50%)', value: utme / 400 * 50, max: 50 },
        { label: 'Post-UTME contribution (historical 30%)', value: clamp(post, 100) / 100 * 30, max: 30 },
        { label: 'O’Level contribution (manually entered out of 20)', value: clamp(olevelPoints, 20), max: 20 },
      ];
      return { total: parts.reduce((sum, part) => sum + part.value, 0), parts };
    }
    if (school === 'oau') {
      const parts = [
        { label: 'UTME contribution (reported 50%)', value: utme / 400 * 50, max: 50 },
        { label: 'Post-UTME contribution (reported 40%)', value: clamp(post, 100) / 100 * 40, max: 40 },
        { label: 'O’Level contribution (manually entered out of 10)', value: clamp(olevelPoints, 10), max: 10 },
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
    const ow = clamp(olevelWeight, 100);
    const totalWeight = jw + pw + ow || 1;
    const parts = [
      { label: 'UTME contribution', value: utme / 400 * (jw / totalWeight * 100), max: jw / totalWeight * 100 },
      { label: 'Post-UTME contribution', value: clamp(post, 100) / 100 * (pw / totalWeight * 100), max: pw / totalWeight * 100 },
      ...(ow > 0 ? [{ label: 'O’Level contribution (manual score out of 100)', value: clamp(olevelPoints, 100) / 100 * (ow / totalWeight * 100), max: ow / totalWeight * 100 }] : []),
    ];
    return { total: parts.reduce((sum, part) => sum + part.value, 0), parts };
  }, [school, jamb, post, olevelPoints, grades, jambWeight, postWeight, olevelWeight]);

  const validJamb = isValidWholeScore(jamb, 400);
  const validPost = isValidWholeScore(post, 100);
  const olevelMax = school === 'oau' ? 10 : school === 'custom' ? 100 : 20;
  const validOlevelPoints = isValidScore(olevelPoints, olevelMax);
  const validCustomWeights = isValidScore(jambWeight, 100) && isValidScore(postWeight, 100) &&
    isValidScore(olevelWeight, 100) && Number(jambWeight) + Number(postWeight) + Number(olevelWeight) > 0;
  const ready = validJamb &&
    (school === 'unilorin' ? validPost && validOlevelPoints :
      school === 'fuhsi' ? grades.every(Boolean) :
      school === 'unilag' ? validPost && validOlevelPoints :
      school === 'oau' ? validPost && validOlevelPoints :
      school === 'ui' ? false :
      school === 'uniben' ? validPost :
      validPost && validCustomWeights && (Number(olevelWeight) <= 0 || isValidScore(olevelPoints, 100)));

  const plannerPostWeight = school === 'unilorin' ? 30
    : school === 'uniben' ? 50
    : school === 'unilag' ? 30
    : school === 'oau' ? 40
    : school === 'custom'
      ? (Number(postWeight) / (Number(jambWeight) + Number(postWeight) + Number(olevelWeight) || 1)) * 100
      : 0;
  const plannerOtherContribution = result.parts
    .filter(part => !part.label.toLowerCase().includes('post-utme'))
    .reduce((sum, part) => sum + part.value, 0);
  const validTarget = isValidScore(targetAggregate, 100);
  const plannerHasRequiredInputs = validJamb && validTarget &&
    (school === 'fuhsi' ? grades.every(Boolean) :
      school === 'unilorin' || school === 'unilag' || school === 'oau'
        ? validOlevelPoints
        : school === 'custom'
          ? validCustomWeights && (Number(olevelWeight) <= 0 || isValidScore(olevelPoints, 100))
          : true);
  const requiredPostScore = plannerPostWeight > 0
    ? ((Number(targetAggregate) - plannerOtherContribution) / plannerPostWeight) * 100
    : null;

  const assessmentSubjects = school === 'fuhsi'
    ? [
        { subject: 'English Language', grade: grades[0] },
        { subject: 'Mathematics', grade: grades[1] },
        { subject: 'Physics', grade: grades[2] },
        { subject: 'Chemistry', grade: grades[3] },
        { subject: 'Biology', grade: grades[4] },
        ...extraGrades,
      ]
    : extraGrades;
  const normalizeSubjectName = (subject: string) => {
    const normalized = subject.toLowerCase().trim().replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ');
    if (normalized === 'maths' || normalized === 'math') return 'mathematics';
    if (normalized === 'english') return 'english language';
    return normalized;
  };
  const uniqueAssessmentSubjects = assessmentSubjects.filter((item, index, items) => {
    const normalized = normalizeSubjectName(item.subject);
    return normalized !== '' && items.findIndex(candidate => normalizeSubjectName(candidate.subject) === normalized) === index;
  });
  const creditSubjects = uniqueAssessmentSubjects.filter(item => Boolean(gradePoints[item.grade]));
  const hasEnglishCredit = uniqueAssessmentSubjects.some(item => normalizeSubjectName(item.subject) === 'english language' && Boolean(gradePoints[item.grade]));
  const hasMathCredit = uniqueAssessmentSubjects.some(item => normalizeSubjectName(item.subject) === 'mathematics' && Boolean(gradePoints[item.grade]));
  const hasFiveCredits = creditSubjects.length >= 5;
  const duplicateSubjectCount = assessmentSubjects.filter(item => normalizeSubjectName(item.subject) !== '').length - uniqueAssessmentSubjects.length;
  const assessmentHasSubjects = assessmentSubjects.some(item => item.subject.trim() && item.grade);

  const clear = () => {
    setJamb(''); setPost(''); setOlevelPoints(''); setGrades(['', '', '', '', '']); setExtraGrades([]); setOlevelWeight('0'); setShowResult(false); setTargetAggregate('75'); setIntendedCourse(''); setStateOfOrigin(''); setOlevelSittings('1');
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
            <option value="unilag">University of Lagos — 50:30:20 (historical; current session unverified)</option>
            <option value="ui" disabled>University of Ibadan — formula under verification</option>
            <option value="oau">Obafemi Awolowo University — 50:40:10 (community-reported)</option>
            <option value="custom">Custom UTME + Post-UTME + optional O’Level weights</option>
          </select>
        </label>
        {(school === 'unilag' || school === 'oau') && <p className="aggregate-helper">This is a provisional model based on previously published or third-party information, not a verified 2026/2027 institutional scoring rule. Confirm the current formula with the university before relying on this result.</p>}
        {school === 'uniben' && <p className="aggregate-helper">Multiple education sources report a 50:50 formula for UNIBEN, but we did not find an official university page confirming this weighting for 2026/2027. Treat the result as provisional and verify the current admission instructions.</p>}
        <div className="aggregate-field">
          <label htmlFor="aggregate-jamb">JAMB UTME score (out of 400)</label>
          <input id="aggregate-jamb" type="number" inputMode="numeric" min="0" max="400" step="1" value={jamb} onChange={e => { setJamb(e.target.value); setShowResult(false); }} placeholder="e.g. 250" />
          {jamb !== '' && !validJamb && <small role="alert">Enter a whole-number UTME score from 0 to 400.</small>}
        </div>
        {(school === 'unilorin' || school === 'uniben' || school === 'unilag' || school === 'oau' || school === 'custom') && <>
          <div className="aggregate-field">
            <label htmlFor="aggregate-post">Post-UTME score (out of 100)</label>
            <input id="aggregate-post" type="number" min="0" max={100} step="1" value={post} onChange={e => { setPost(e.target.value); setShowResult(false); }} placeholder="Enter screening score" />
          {post !== '' && !validPost && <small role="alert">Enter a whole-number Post-UTME score from 0 to 100.</small>}
          </div>
        </>}
        {(school === 'unilorin' || school === 'unilag' || school === 'oau') && <div className="aggregate-field">
          <label htmlFor="aggregate-olevel">O’Level contribution (out of {school === 'oau' ? 10 : 20})</label>
          <input id="aggregate-olevel" type="number" min="0" max={school === 'oau' ? 10 : 20} step="any" value={olevelPoints} onChange={e => { setOlevelPoints(e.target.value); setShowResult(false); }} placeholder="Enter the contribution from the applicable instructions" />
          {olevelPoints !== '' && !validOlevelPoints && <small role="alert">Enter an O’Level contribution within the displayed range.</small>}
          <small>{school === 'unilorin' ? 'Enter the O’Level contribution according to the current official scoring instructions. EDUKEN does not guess the grade conversion.' : 'Manual O’Level contribution only. This provisional formula does not guess a grade-to-point conversion.'}</small>
        </div>}
        {school !== 'fuhsi' && <div className="aggregate-extra-grades">
          <div className="aggregate-extra-grades-heading">
            <div><strong>O’Level subjects and grades (optional)</strong><small>Record your WAEC, NECO or NABTEB subjects. These entries do not change a school score unless its formula below explicitly uses them.</small></div>
            <button type="button" className="aggregate-add-grade" onClick={() => { setExtraGrades(current => [...current, { subject: '', grade: '' }]); setShowResult(false); }}>+ Add O’Level subject</button>
          </div>
          {extraGrades.map((item, index) => <div className="aggregate-extra-grade-row" key={index}>
            <label className="aggregate-field"><span>Subject {index + 1}</span><input value={item.subject} onChange={e => { setExtraGrades(current => current.map((grade, i) => i === index ? { ...grade, subject: e.target.value } : grade)); setShowResult(false); }} placeholder="e.g. English Language" /></label>
            <label className="aggregate-field"><span>Grade</span><select value={item.grade} onChange={e => { setExtraGrades(current => current.map((grade, i) => i === index ? { ...grade, grade: e.target.value } : grade)); setShowResult(false); }}><option value="">Choose grade</option>{gradeOptions.map(grade => <option key={grade} value={grade}>{grade} — {gradePoints[grade]} points</option>)}<option value="D7">D7 — below credit</option><option value="E8">E8 — below credit</option><option value="F9">F9 — below credit</option></select></label>
            <button type="button" className="aggregate-remove-grade" onClick={() => { setExtraGrades(current => current.filter((_, i) => i !== index)); setShowResult(false); }} aria-label={`Remove O’Level subject ${index + 1}`}>Remove</button>
          </div>)}
          <p className="aggregate-helper">Grades are stored temporarily in this page only. The calculator will not invent a grade conversion for schools whose current official scoring scale has not been verified.</p>
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
            <div className="aggregate-field"><label htmlFor="aggregate-jw">UTME weight (%)</label><input id="aggregate-jw" type="number" min="0" max="100" step="any" value={jambWeight} onChange={e => { setJambWeight(e.target.value); setShowResult(false); }} /></div>
            <div className="aggregate-field"><label htmlFor="aggregate-pw">Post-UTME weight (%)</label><input id="aggregate-pw" type="number" min="0" max="100" step="any" value={postWeight} onChange={e => { setPostWeight(e.target.value); setShowResult(false); }} /></div>
            <div className="aggregate-field"><label htmlFor="aggregate-ow">O’Level weight (%)</label><input id="aggregate-ow" type="number" min="0" max="100" step="any" value={olevelWeight} onChange={e => { setOlevelWeight(e.target.value); setShowResult(false); }} /></div>
          </div>
          {!validCustomWeights && <small role="alert">Enter valid weights from 0 to 100, with a combined total greater than zero.</small>}
          {Number(olevelWeight) > 0 && <div className="aggregate-field"><label htmlFor="aggregate-olevel">O’Level score / contribution (out of 100)</label><input id="aggregate-olevel" type="number" min="0" max="100" step="any" value={olevelPoints} onChange={e => { setOlevelPoints(e.target.value); setShowResult(false); }} placeholder="Enter score from the formula you are using" />{olevelPoints !== '' && !validOlevelPoints && <small role="alert">Enter an O’Level score from 0 to 100.</small>}</div>}
          <small>Weights are normalized to 100. When O’Level weight is above zero, enter the O’Level component score out of 100. This is a user-defined estimate, not a verified school formula.</small>
        </>}
        <div className="aggregate-actions">
          <button type="button" className="aggregate-primary" disabled={!ready} onClick={() => setShowResult(true)}>Calculate aggregate <Calculator size={17} /></button>
          <button type="button" className="aggregate-secondary" onClick={clear}>Clear</button>
        </div>
        {showResult && <div className="aggregate-result" role="status" aria-live="polite">
          <span>YOUR CALCULATED AGGREGATE</span><strong>{result.total.toFixed(2)} <small>/ 100</small></strong>
          <p>This is a calculation of the inputs supplied, not a prediction or guarantee of admission.</p>
          <div className="aggregate-breakdown">{result.parts.map(part => <div key={part.label}><span>{part.label}</span><b>{part.value.toFixed(2)} / {part.max}</b></div>)}</div>
          {(school === 'uniben' || school === 'oau' || school === 'unilag') && <p><strong>Provisional formula:</strong> this model is not confirmed as the university’s official 2026/2027 formula.</p>}
        </div>}
      </section>
      <section className="aggregate-olevel-assessment" aria-labelledby="aggregate-olevel-title">
        <div className="aggregate-planner-heading">
          <span className="aggregate-kicker"><ShieldCheck size={15} /> O’LEVEL READINESS CHECK</span>
          <h2 id="aggregate-olevel-title">Review your O’Level credits</h2>
          <p>Use your subject-and-grade entries above to review common screening checks. This is a basic checklist, not a course-specific eligibility decision.</p>
        </div>
        <div className="aggregate-two-fields">
          <div className="aggregate-field">
            <label htmlFor="aggregate-sittings">Number of O’Level sittings</label>
            <select id="aggregate-sittings" value={olevelSittings} onChange={e => setOlevelSittings(e.target.value)}>
              <option value="1">One sitting</option>
              <option value="2">Two sittings</option>
            </select>
          </div>
          <div className="aggregate-assessment-stat">
            <span>Credit grades entered</span>
            <strong>{creditSubjects.length}</strong>
            <small>A1–C6 counted as credit grades for this checklist.</small>
          </div>
        </div>
        <div className="aggregate-assessment-checks" aria-live="polite">
          <div className={hasFiveCredits ? 'aggregate-assessment-check is-met' : 'aggregate-assessment-check'}>
            <span>{hasFiveCredits ? '✓' : '○'}</span>
            <div><strong>{hasFiveCredits ? 'Five or more credit grades entered' : 'Five credit grades not yet recorded'}</strong><small>{hasFiveCredits ? 'You have entered at least five credit grades.' : 'Enter your subjects and grades above to review the common five-credit benchmark.'}</small></div>
          </div>
          <div className={hasEnglishCredit ? 'aggregate-assessment-check is-met' : 'aggregate-assessment-check'}>
            <span>{hasEnglishCredit ? '✓' : '○'}</span>
            <div><strong>{hasEnglishCredit ? 'English Language credit recorded' : 'English Language credit not confirmed'}</strong><small>{hasEnglishCredit ? 'An English Language credit is present in your entries.' : 'Add English Language and its grade above if you have it.'}</small></div>
          </div>
          <div className={hasMathCredit ? 'aggregate-assessment-check is-met' : 'aggregate-assessment-check'}>
            <span>{hasMathCredit ? '✓' : '○'}</span>
            <div><strong>{hasMathCredit ? 'Mathematics credit recorded' : 'Mathematics credit not confirmed'}</strong><small>{hasMathCredit ? 'A Mathematics credit is present in your entries.' : 'Add Mathematics and its grade above if you have it.'}</small></div>
          </div>
        </div>
        {duplicateSubjectCount > 0 && <p className="aggregate-helper" role="status">{duplicateSubjectCount} duplicate subject {duplicateSubjectCount === 1 ? 'entry was' : 'entries were'} found. Each distinct subject counts only once toward the credit checklist; check the subject names and grades you entered.</p>}
        <p className="aggregate-assessment-disclaimer">
          {assessmentHasSubjects
            ? `Current entry: ${olevelSittings === '1' ? 'one sitting' : 'two sittings'}. `
            : 'No subject-and-grade records are available for this checklist yet. '}
          Universities and courses can require different subjects, credit combinations, and sitting limits. This panel does not verify accreditation, subject combinations, admission cutoffs, or eligibility; check the current official requirements for your course and institution.
        </p>
      </section>
      <section className="aggregate-planner" aria-labelledby="aggregate-planner-title">
        <div className="aggregate-planner-heading">
          <span className="aggregate-kicker"><GraduationCap size={15} /> PLAN YOUR NEXT STEP</span>
          <h2 id="aggregate-planner-title">Admission planning workspace</h2>
          <p>Set your intended course and target aggregate, then estimate the Post-UTME score needed under the formula currently selected above. This is a planning estimate, not an admission decision.</p>
        </div>
        <div className="aggregate-two-fields">
          <div className="aggregate-field">
            <label htmlFor="aggregate-course">Intended course</label>
            <input id="aggregate-course" value={intendedCourse} onChange={e => setIntendedCourse(e.target.value)} placeholder="e.g. Linguistics" />
          </div>
          <div className="aggregate-field">
            <label htmlFor="aggregate-origin">State of origin (optional)</label>
            <input id="aggregate-origin" value={stateOfOrigin} onChange={e => setStateOfOrigin(e.target.value)} placeholder="e.g. Niger State" />
          </div>
          <div className="aggregate-field">
            <label htmlFor="aggregate-target">Target aggregate (out of 100)</label>
            <input id="aggregate-target" type="number" min="0" max="100" step="any" value={targetAggregate} onChange={e => setTargetAggregate(e.target.value)} />
            {targetAggregate !== '' && !validTarget && <small role="alert">Enter a target from 0 to 100.</small>}
          </div>
        </div>
        <div className="aggregate-planner-result" aria-live="polite">
          {school === 'ui'
            ? <p>Select a formula that can currently be calculated. UI remains unavailable until a reliable current scoring formula is verified.</p>
            : school === 'fuhsi'
              ? <p>FUHSI’s formula in this calculator uses UTME and five O’Level core subjects, not a Post-UTME component. Use the aggregate result above to compare your current score with your target.</p>
              : !plannerHasRequiredInputs
                ? <p>Enter valid UTME and the required score components above to calculate a target Post-UTME estimate.</p>
                : requiredPostScore === null
                  ? <p>A Post-UTME target estimate is unavailable for this formula.</p>
                  : requiredPostScore <= 0
                    ? <><strong>Your target is already covered by the other entered components.</strong><p>Based on these inputs, the target does not require additional Post-UTME points. This is only a mathematical estimate.</p></>
                    : requiredPostScore > 100
                      ? <><strong>This target is not reachable with a Post-UTME score capped at 100.</strong><p>Try a lower target or review the inputs and formula selected.</p></>
                      : <><strong>Estimated Post-UTME score needed: {requiredPostScore.toFixed(1)} / 100</strong><p>This estimate uses your current UTME and O’Level components and the selected formula’s Post-UTME weight. It assumes that the selected formula and score scale apply to your course and admission session.</p></>}
          {(intendedCourse.trim() || stateOfOrigin.trim()) && <small>Plan details: {intendedCourse.trim() || 'Course not entered'} · {stateOfOrigin.trim() || 'State not entered'}. These details are for your on-page planning only; EDUKEN has not checked course-specific subject requirements, catchment rules or eligibility from these entries.</small>}
        </div>
      </section>
      <section className="aggregate-source">
        <h2>Formula & important notes</h2>
        {school === 'unilorin'
          ? <p>University of Ilorin’s 2026/2027 screening instructions specify UTME/A’Level (50%), Post-UTME (30%) and five relevant O’Level grades (20%). Enter the O’Level contribution using the institution’s instructions.</p>
          : school === 'fuhsi'
            ? <p>FUHSI publishes a 70% UTME + 30% O’Level model for 2026/2027, including an A1–C6 point scale for five required subjects.</p>
            : school === 'uniben'
              ? <p>Multiple independent education sources report a 50% UTME + 50% Post-UTME model for UNIBEN. The current official session formula was not found in the official material reviewed, so this is marked community-reported rather than officially verified.</p>
              : school === 'unilag'
                ? <p>UNILAG’s Admissions Office lists a 50% UTME, 30% Post-UTME and 20% O’Level model for 2025/2026. The current 2026/2027 conversion has not been confirmed, so this is historical guidance only.</p>
                : school === 'ui'
                  ? <p>The University of Ibadan’s official 2026/2027 notice confirms the screening exercise but does not state the aggregate calculation. EDUKEN has disabled this calculator option until a reliable scoring formula is verified. Check the official admission notice before relying on third-party claims.</p>
                  : school === 'oau'
                    ? <p>CampusAI reports a 50:40:10 UTME/Post-UTME/O’Level weighting for OAU. Enter the Post-UTME score out of 100; the calculator converts it to a contribution out of 40. Enter the O’Level contribution out of 10 manually. OAU’s public screening notice does not reproduce the aggregate table, so treat this third-party-reported model as provisional and confirm it with the university.</p>
                    : <p>Custom mode uses the weights and scores you provide for UTME, Post-UTME and, optionally, O’Level. It does not confirm that an institution accepts this formula.</p>}
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
