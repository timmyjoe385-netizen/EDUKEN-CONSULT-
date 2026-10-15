import { useMemo, useState } from 'react';
import { ArrowLeft, Calculator, ExternalLink, GraduationCap, Search, ShieldCheck } from 'lucide-react';

type SchoolKey = string;
type FormulaStatus = 'official' | 'community';
const gradePoints: Record<string, number> = { A1: 8, B2: 7, B3: 6, C4: 5, C5: 4, C6: 3 };
const gradeOptions = Object.keys(gradePoints);

type AggregatePart = { label: string; value: number; max: number };
const buildAggregateResult = (parts: AggregatePart[]) => ({
  total: parts.reduce((sum, part) => sum + part.value, 0),
  parts,
});
const weightedContribution = (score: number, scoreMax: number, weight: number) =>
  scoreMax > 0 ? (score / scoreMax) * weight : 0;

const fuhsiCutoffCategories = ['Merit', 'Osun', 'Oyo', 'Ondo', 'Ogun', 'Ekiti', 'Lagos'] as const;
type FuhsiCutoffCategory = typeof fuhsiCutoffCategories[number];
const fuhsiDepartmentCutoffs: Record<string, Record<FuhsiCutoffCategory, number>> = {
  'Medicine and Surgery (MBBS)': { Merit: 81.3, Osun: 80.3, Oyo: 79.7, Ondo: 79.8, Ogun: 76.1, Ekiti: 79.4, Lagos: 72.2 },
  'Nursing Science': { Merit: 75.4, Osun: 73.7, Oyo: 71.9, Ondo: 74.5, Ogun: 73.0, Ekiti: 71.3, Lagos: 70.3 },
  'Doctor of Physiotherapy (DPT)': { Merit: 73.3, Osun: 73.3, Oyo: 71.9, Ondo: 69.7, Ogun: 71.4, Ekiti: 68.0, Lagos: 68.2 },
  'Medical Laboratory Science': { Merit: 72.2, Osun: 71.4, Oyo: 70.8, Ondo: 69.4, Ogun: 70.8, Ekiti: 70.1, Lagos: 67.6 },
  'Prosthetics and Orthotics': { Merit: 65.7, Osun: 65.4, Oyo: 63.4, Ondo: 60.1, Ogun: 62.4, Ekiti: 63.7, Lagos: 61.5 },
  'Audiology': { Merit: 65.5, Osun: 65.1, Oyo: 65.1, Ondo: 63.2, Ogun: 62.5, Ekiti: 64.3, Lagos: 61.4 },
  'Pharmacology': { Merit: 64.6, Osun: 63.4, Oyo: 63.0, Ondo: 60.8, Ogun: 62.9, Ekiti: 61.5, Lagos: 56.2 },
  'Human Nutrition & Dietetics': { Merit: 61.8, Osun: 61.2, Oyo: 60.4, Ondo: 55.8, Ogun: 59.6, Ekiti: 59.7, Lagos: 51.4 },
  'Information Technology & Health Informatics': { Merit: 59.8, Osun: 59.2, Oyo: 58.2, Ondo: 57.2, Ogun: 52.9, Ekiti: 56.5, Lagos: 52.0 },
  'Environmental Health Science': { Merit: 59.3, Osun: 57.7, Oyo: 58.2, Ondo: 52.2, Ogun: 51.6, Ekiti: 56.0, Lagos: 54.1 },
  'Biochemistry': { Merit: 50.3, Osun: 50.3, Oyo: 50.3, Ondo: 50.3, Ogun: 50.3, Ekiti: 50.3, Lagos: 50.3 },
  'Microbiology': { Merit: 50.0, Osun: 50.0, Oyo: 50.0, Ondo: 50.0, Ogun: 50.0, Ekiti: 50.0, Lagos: 50.0 },
  'Biotechnology & Molecular Biology': { Merit: 50.0, Osun: 50.0, Oyo: 50.0, Ondo: 50.0, Ogun: 50.0, Ekiti: 50.0, Lagos: 50.0 },
};
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
  { name: 'University of Lagos (UNILAG)', status: 'review', note: 'Historical 50:30:20 model only; current 2026/2027 aggregate weighting is unconfirmed. Do not treat the historical calculation as current official policy.', href: sources.unilag },
  { name: 'Kwara State University (KWASU), Malete', status: 'review', note: 'Official 2026/2027 notice confirms 70% UTME/DE + 30% five relevant O’Level grades, but the notice reviewed does not publish the grade-to-point conversion needed for a complete calculator. Formula weighting confirmed; calculation scale incomplete.', href: 'https://kwasu.edu.ng/wp-content/uploads/2026/06/20262027-KWASU-POST-UTME-REGISTRATION-AND-SCREENING.pdf' },
  { name: 'Obafemi Awolowo University (OAU)', status: 'review', note: 'Third-party 50:40:10 reports are not sufficiently reconciled with current official evidence. Formula is under verification and should not be used as a trusted current-session calculation.', href: sources.oau },
  { name: 'University of Ibadan (UI)', status: 'review', note: 'Official 2026/2027 admission portal lists cut-off marks and screening updates, but the aggregate formula and score conversion are not published on the page reviewed.', href: sources.ui },
  
  { name: 'Lagos State University (LASU)', status: 'review', note: 'Official 2026/2027 notice confirms point grading from UTME plus five best relevant O’Level subjects; exact point conversion still needs confirmation', href: 'https://lasu.edu.ng/home/news/read.php?id=642' },
  { name: 'Federal University of Technology, Akure (FUTA)', status: 'review', note: 'Official 2026/2027 notice confirms minimum UTME 180 and five O’Level credits; aggregate scoring conversion is not specified', href: 'https://admission.futa.edu.ng/home/news/1399' },
  { name: 'University of Nigeria, Nsukka (UNN)', status: 'review', note: 'Official 2026/2027 screening notice confirms eligibility, registration and O’Level upload requirements; it does not specify an aggregate score conversion.', href: 'https://www.unn.edu.ng/2026-2027-screening-exercise-for-admission/' },
  { name: 'Federal University Oye-Ekiti (FUOYE)', status: 'review', note: 'Official 2026/2027 guide confirms online screening and programme-specific UTME/O’Level requirements; it does not state a complete aggregate scoring conversion.', href: 'https://fuoye.edu.ng/post-utme-screening/' },
  { name: 'Federal University of Technology, Minna (FUTMINNA)', status: 'review', note: 'Official 2026/2027 notice confirms course-specific UTME cutoffs and five relevant O’Level credits; aggregate scoring conversion is not specified', href: 'https://futminna.edu.ng/2026-2027-pre-admission-screening-exercise-2026-utme-de/' },
  { name: 'Ahmadu Bello University (ABU), Zaria', status: 'review', note: 'Current score scale and formula need confirmation' },
  { name: 'Nnamdi Azikiwe University (UNIZIK)', status: 'review', note: 'An official 2023/2024 document used 70% UTME and 30% O’Level points with a single-sitting bonus; this is historical only and the 2026/2027 formula needs confirmation', href: 'https://unizik.edu.ng/wp-content/uploads/2023/10/CALCULATION-FORMULA-USED-FOR-THE-2023-2024-POST-UTME-ADMISSIONS-SCREENING-EXERCISE1.pdf' },
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
  const [departmentCutoff, setDepartmentCutoff] = useState('');
  const [fuhsiCutoffCourse, setFuhsiCutoffCourse] = useState('');
  const [fuhsiCutoffCategory, setFuhsiCutoffCategory] = useState<FuhsiCutoffCategory>('Merit');
  const [olevelSittings, setOlevelSittings] = useState('1');

  const isGenericModel = !['unilorin', 'fuhsi', 'uniben', 'unilag'].includes(school);

  const result = useMemo(() => {
    const utme = clamp(jamb, 400);
    if (school === 'unilorin') {
      const parts = [
        { label: 'UTME contribution', value: weightedContribution(utme, 400, 50), max: 50 },
        { label: 'Post-UTME contribution', value: weightedContribution(clamp(post, 100), 100, 30), max: 30 },
        { label: 'O’Level contribution (entered out of 20)', value: clamp(olevelPoints, 20), max: 20 },
      ];
      return buildAggregateResult(parts);
    }
    if (school === 'fuhsi') {
      const olevel = grades.reduce((sum, grade) => sum + (gradePoints[grade] || 0), 0);
      const parts = [
        { label: 'UTME contribution', value: weightedContribution(utme, 400, 70), max: 70 },
        { label: 'O’Level contribution', value: weightedContribution(olevel, 40, 30), max: 30 },
      ];
      return buildAggregateResult(parts);
    }
    if (school === 'ui') {
      const parts = [
        { label: 'UTME contribution (reported 50%)', value: weightedContribution(utme, 400, 50), max: 50 },
        { label: 'Post-UTME contribution (reported 50%)', value: weightedContribution(clamp(post, 100), 100, 50), max: 50 },
      ];
      return buildAggregateResult(parts);
    }
    if (school === 'unilag') {
      const parts = [
        { label: 'UTME contribution (historical 50%)', value: weightedContribution(utme, 400, 50), max: 50 },
        { label: 'Post-UTME contribution (historical 30%)', value: weightedContribution(clamp(post, 100), 100, 30), max: 30 },
        { label: 'O’Level contribution (manually entered out of 20)', value: clamp(olevelPoints, 20), max: 20 },
      ];
      return buildAggregateResult(parts);
    }
    if (school === 'oau') {
      const parts = [
        { label: 'UTME contribution (reported 50%)', value: weightedContribution(utme, 400, 50), max: 50 },
        { label: 'Post-UTME contribution (reported 40%)', value: weightedContribution(clamp(post, 100), 100, 40), max: 40 },
        { label: 'O’Level contribution (manually entered out of 10)', value: clamp(olevelPoints, 10), max: 10 },
      ];
      return buildAggregateResult(parts);
    }
    if (school === 'uniben') {
      const parts = [
        { label: 'UTME contribution (reported 50%)', value: weightedContribution(utme, 400, 50), max: 50 },
        { label: 'Post-UTME contribution (reported 50%)', value: weightedContribution(clamp(post, 100), 100, 50), max: 50 },
      ];
      return buildAggregateResult(parts);
    }
    const jw = clamp(jambWeight, 100);
    const pw = clamp(postWeight, 100);
    const ow = clamp(olevelWeight, 100);
    const totalWeight = jw + pw + ow || 1;
    const parts = [
      { label: 'UTME contribution', value: weightedContribution(utme, 400, jw / totalWeight * 100), max: jw / totalWeight * 100 },
      { label: 'Post-UTME contribution', value: weightedContribution(clamp(post, 100), 100, pw / totalWeight * 100), max: pw / totalWeight * 100 },
      ...(ow > 0 ? [{ label: 'O’Level contribution (manual score out of 100)', value: weightedContribution(clamp(olevelPoints, 100), 100, ow / totalWeight * 100), max: ow / totalWeight * 100 }] : []),
    ];
    return buildAggregateResult(parts);
  }, [school, jamb, post, olevelPoints, grades, jambWeight, postWeight, olevelWeight]);

  const validJamb = isValidWholeScore(jamb, 400);
  const validPost = isValidWholeScore(post, 100);
  const olevelMax = school === 'custom' || isGenericModel ? 100 : 20;
  const validOlevelPoints = isValidScore(olevelPoints, olevelMax);
  const validCustomWeights = isValidScore(jambWeight, 100) && isValidScore(postWeight, 100) &&
    isValidScore(olevelWeight, 100) && Number(jambWeight) + Number(postWeight) + Number(olevelWeight) > 0;
  const validDepartmentCutoff = departmentCutoff === '' || isValidScore(departmentCutoff, 100);
  const ready = validDepartmentCutoff && validJamb &&
    (school === 'unilorin' ? validPost && validOlevelPoints :
      school === 'fuhsi' ? grades.every(Boolean) :
      school === 'unilag' ? validPost && validOlevelPoints :
      school === 'uniben' ? validPost :
      ((Number(postWeight) <= 0 || validPost) && validCustomWeights && (Number(olevelWeight) <= 0 || isValidScore(olevelPoints, 100)));

  const plannerPostWeight = school === 'unilorin' ? 30
    : school === 'uniben' ? 50
    : school === 'unilag' ? 30
    : school === 'oau' ? 0
    : isGenericModel
      ? (Number(postWeight) / (Number(jambWeight) + Number(postWeight) + Number(olevelWeight) || 1)) * 100
      : 0;
  const plannerOtherContribution = result.parts
    .filter(part => !part.label.toLowerCase().includes('post-utme'))
    .reduce((sum, part) => sum + part.value, 0);
  const validTarget = isValidScore(targetAggregate, 100);
  const plannerHasRequiredInputs = validJamb && validTarget &&
    (school === 'fuhsi' ? grades.every(Boolean) :
      school === 'oau'
        ? false
        : school === 'unilorin' || school === 'unilag'
          ? validOlevelPoints
          : isGenericModel
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
  const uniqueAssessmentSubjects = assessmentSubjects.reduce<typeof assessmentSubjects>((unique, item) => {
    const normalized = normalizeSubjectName(item.subject);
    if (normalized === '') return unique;
    const existingIndex = unique.findIndex(candidate => normalizeSubjectName(candidate.subject) === normalized);
    if (existingIndex === -1) {
      unique.push(item);
    } else if ((gradePoints[item.grade] || 0) > (gradePoints[unique[existingIndex].grade] || 0)) {
      // A duplicate cannot inflate the count, but a later valid credit should
      // not be hidden by an earlier non-credit entry for the same subject.
      unique[existingIndex] = item;
    }
    return unique;
  }, []);
  const creditSubjects = uniqueAssessmentSubjects.filter(item => Boolean(gradePoints[item.grade]));
  const hasEnglishCredit = uniqueAssessmentSubjects.some(item => normalizeSubjectName(item.subject) === 'english language' && Boolean(gradePoints[item.grade]));
  const hasMathCredit = uniqueAssessmentSubjects.some(item => normalizeSubjectName(item.subject) === 'mathematics' && Boolean(gradePoints[item.grade]));
  const hasFiveCredits = creditSubjects.length >= 5;
  const duplicateSubjectCount = assessmentSubjects.filter(item => normalizeSubjectName(item.subject) !== '').length - uniqueAssessmentSubjects.length;
  const assessmentHasSubjects = assessmentSubjects.some(item => item.subject.trim() && item.grade);

  const clear = () => {
    setJamb(''); setPost(''); setOlevelPoints(''); setGrades(['', '', '', '', '']); setExtraGrades([]); setOlevelWeight('0'); setShowResult(false); setTargetAggregate('75'); setDepartmentCutoff(''); setFuhsiCutoffCourse(''); setFuhsiCutoffCategory('Merit'); setIntendedCourse(''); setStateOfOrigin(''); setOlevelSittings('1');
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
          <select value={school} onChange={e => {
            const nextSchool = e.target.value as SchoolKey;
            setSchool(nextSchool);
            const presets: Record<string, [string, string, string]> = {
              unilag50: ['50', '50', '0'], 'ui-estimate': ['50', '50', '0'], 'oau-estimate': ['50', '40', '10'],
              'unn50': ['50', '50', '0'], 'unn90': ['90', '10', '0'], futminna: ['50', '30', '20'],
              fuoye: ['60', '40', '0'], f50: ['50', '50', '0'], 'f503020': ['50', '30', '20'],
              'f6040': ['60', '40', '0'], 'f4060': ['40', '60', '0'], 'f7525': ['75', '25', '0'],
              screen: ['70', '0', '30'], 'jambonly': ['100', '0', '0']
            };
            if (presets[nextSchool]) {
              setJambWeight(presets[nextSchool][0]);
              setPostWeight(presets[nextSchool][1]);
              setOlevelWeight(presets[nextSchool][2]);
            } else if (nextSchool === 'custom') {
              setJambWeight('50'); setPostWeight('50'); setOlevelWeight('0');
            }
            setShowResult(false);
          }}>
            <option value="unilorin">University of Ilorin (UNILORIN) — 50:30:20 (official 2026/2027)</option>
            <option value="fuhsi">Federal University of Health Sciences, Ila-Orangun (FUHSI) — 70:30 (official 2026/2027)</option>
            <option value="unilag">University of Lagos (UNILAG) — 50:30:20 (historical; current session unverified)</option>
            <option value="unilag50">UNILAG — 50:50 model (historical/unverified)</option>
            <option value="ui-estimate">University of Ibadan (UI) — 50:50 model (unverified estimate)</option>
            <option value="oau-estimate">Obafemi Awolowo University (OAU) — 50:40:10 model (unverified estimate)</option>
            <option value="unn50">University of Nigeria, Nsukka (UNN) — average model (unverified estimate)</option>
            <option value="unn90">UNN — 90:10 model (unverified estimate)</option>
            <option value="uniben">University of Benin (UNIBEN) — 50:50 (community-reported)</option>
            <option value="abu">Ahmadu Bello University (ABU), Zaria — formula needs confirmation</option>
            <option value="uniport">University of Port Harcourt (UNIPORT) — formula needs confirmation</option>
            <option value="futa">Federal University of Technology, Akure (FUTA) — formula needs confirmation</option>
            <option value="funaab">Federal University of Agriculture, Abeokuta (FUNAAB) — formula needs confirmation</option>
            <option value="futminna">Federal University of Technology, Minna (FUTMinna) — 50:30:20 model (unverified)</option>
            <option value="futo">Federal University of Technology, Owerri (FUTO) — formula needs confirmation</option>
            <option value="unizik">Nnamdi Azikiwe University (UNIZIK) — current formula needs confirmation</option>
            <option value="unical">University of Calabar (UNICAL) — formula needs confirmation</option>
            <option value="unijos">University of Jos (UNIJOS) — formula needs confirmation</option>
            <option value="buk">Bayero University Kano (BUK) — formula needs confirmation</option>
            <option value="unimaid">University of Maiduguri (UNIMAID) — formula needs confirmation</option>
            <option value="udusok">Usmanu Danfodiyo University, Sokoto (UDUSOK) — formula needs confirmation</option>
            <option value="lasu">Lagos State University (LASU) — JAMB + O’Level points (scale needs confirmation)</option>
            <option value="delsu">Delta State University (DELSU) — formula needs confirmation</option>
            <option value="eksu">Ekiti State University (EKSU) — formula needs confirmation</option>
            <option value="rsu">Rivers State University (RSU) — formula needs confirmation</option>
            <option value="imsu">Imo State University (IMSU) — formula needs confirmation</option>
            <option value="aau">Ambrose Alli University (AAU), Ekpoma — formula needs confirmation</option>
            <option value="oou">Olabisi Onabanjo University (OOU) — formula needs confirmation</option>
            <option value="esut">Enugu State University of Science and Technology (ESUT) — formula needs confirmation</option>
            <option value="tasued">Tai Solarin University of Education (TASUED) — formula needs confirmation</option>
            <option value="kwasu">Kwara State University (KWASU) — 70:30 weighting; grade scale incomplete</option>
            <option value="fuoye">Federal University Oye-Ekiti (FUOYE) — 60:40 model (unverified)</option>
            <option value="absu">Abia State University (ABSU) — formula needs confirmation</option>
            <option value="bsu">Benue State University (BSU) — formula needs confirmation</option>
            <option value="ae-funai">Alex Ekwueme Federal University, Ndufu-Alike (AE-FUNAI) — formula needs confirmation</option>
            <option value="fuotuoke">Federal University, Otuoke (FUOTUOKE) — formula needs confirmation</option>
            <option value="uniosun">Osun State University (UNIOSUN) — formula needs confirmation</option>
            <option value="bouesti">Bamidele Olumilua University of Education, Science and Technology, Ikere-Ekiti (BOUESTI) — formula needs confirmation</option>
            <option value="fud">Federal University, Dutse (FUD) — formula needs confirmation</option>
            <option value="fulafia">Federal University of Lafia (FULAFIA) — formula needs confirmation</option>
            <option value="fudma">Federal University, Dutsin-Ma (FUDMA) — formula needs confirmation</option>
            <option value="ndu">Niger Delta University (NDU) — formula needs confirmation</option>
            <option value="noun">National Open University of Nigeria (NOUN) — admission route differs</option>
            <option value="yabatech">Yaba College of Technology (YABATECH) — general estimate</option>
            <option value="fedpolyado">Federal Polytechnic, Ado-Ekiti — general estimate</option>
            <option value="fedpolybauchi">Federal Polytechnic, Bauchi — general estimate</option>
            <option value="fedpolybida">Federal Polytechnic, Bida — general estimate</option>
            <option value="fedpolyilaro">Federal Polytechnic, Ilaro — general estimate</option>
            <option value="fedpolynekede">Federal Polytechnic, Nekede — general estimate</option>
            <option value="fedpolyoffa">Federal Polytechnic, Offa — general estimate</option>
            <option value="fedpolyoko">Federal Polytechnic, Oko — general estimate</option>
            <option value="kadpoly">Kaduna Polytechnic — general estimate</option>
            <option value="auchipoly">Auchi Polytechnic — general estimate</option>
            <option value="lagospoly">Lagos State Polytechnic / LASPOTECH — general estimate</option>
            <option value="mapoly">Moshood Abiola Polytechnic (MAPOLY) — general estimate</option>
            <option value="other-state-poly">Other state polytechnics — general estimate</option>
            <option value="polyibadan">The Polytechnic, Ibadan — general estimate</option>
            <option value="kwpoly">Kwara State Polytechnic — general estimate</option>
            <option value="deltapoly">Delta State Polytechnic — general estimate</option>
            <option value="f50">Generic model — 50% JAMB + 50% Post-UTME</option>
            <option value="f503020">Generic model — 50% JAMB + 30% Post-UTME + 20% O’Level</option>
            <option value="f6040">Generic model — 60% JAMB + 40% Post-UTME</option>
            <option value="f4060">Generic model — 40% JAMB + 60% Post-UTME</option>
            <option value="f7525">Generic model — 75% JAMB + 25% screening</option>
            <option value="screen">Generic model — JAMB + O’Level points</option>
            <option value="jambonly">Generic model — JAMB score ÷ 8</option>
            <option value="custom">Custom UTME + Post-UTME + optional O’Level weights</option>
          </select>
        </label>
        {(school === 'unilag' || school === 'unilag50' || school === 'ui-estimate' || school === 'oau-estimate' || school === 'unn50' || school === 'unn90' || school === 'futminna' || school === 'fuoye') && <p className="aggregate-helper">This is a provisional or historical model, not a verified current-session institutional scoring rule. Confirm the current formula with the institution before relying on this result.</p>}
        {isGenericModel && school !== 'custom' && <p className="aggregate-helper">Your institution remains available in the list. Its current official scoring formula has not been fully verified here, so this calculator uses editable general weights only. Adjust the weights to match an official admission notice; do not treat the default estimate as the institution’s official result.</p>}
        {school === 'uniben' && <p className="aggregate-helper">Multiple education sources report a 50:50 formula for UNIBEN, but we did not find an official university page confirming this weighting for 2026/2027. Treat the result as provisional and verify the current admission instructions.</p>}
        <div className="aggregate-field">
          <label htmlFor="aggregate-jamb">JAMB UTME score (out of 400)</label>
          <input id="aggregate-jamb" type="number" inputMode="numeric" min="0" max="400" step="1" value={jamb} onChange={e => { setJamb(e.target.value); setShowResult(false); }} placeholder="e.g. 250" />
          {jamb !== '' && !validJamb && <small role="alert">Enter a whole-number UTME score from 0 to 400.</small>}
        </div>
        {(school === 'unilorin' || school === 'uniben' || school === 'unilag' || school === 'oau' || (isGenericModel && Number(postWeight) > 0)) && <>
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
        {isGenericModel && <>
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
        {school === 'fuhsi' && <div className="aggregate-two-fields">
          <div className="aggregate-field">
            <label htmlFor="fuhsi-cutoff-course">FUHSI course (2026/2027 official cut-off)</label>
            <select id="fuhsi-cutoff-course" value={fuhsiCutoffCourse} onChange={e => {
              const course = e.target.value;
              setFuhsiCutoffCourse(course);
              setDepartmentCutoff(course ? String(fuhsiDepartmentCutoffs[course][fuhsiCutoffCategory]) : '');
              setShowResult(false);
            }}>
              <option value="">Choose course to load official cut-off</option>
              {Object.keys(fuhsiDepartmentCutoffs).map(course => <option key={course} value={course}>{course}</option>)}
            </select>
          </div>
          <div className="aggregate-field">
            <label htmlFor="fuhsi-cutoff-category">Admission category</label>
            <select id="fuhsi-cutoff-category" value={fuhsiCutoffCategory} onChange={e => {
              const category = e.target.value as FuhsiCutoffCategory;
              setFuhsiCutoffCategory(category);
              if (fuhsiCutoffCourse) setDepartmentCutoff(String(fuhsiDepartmentCutoffs[fuhsiCutoffCourse][category]));
              setShowResult(false);
            }}>
              {fuhsiCutoffCategories.map(category => <option key={category} value={category}>{category === 'Merit' ? 'Merit (other states)' : category}</option>)}
            </select>
          </div>
          <p className="aggregate-helper">Official FUHSI 2026/2027 figures. Choose the category matching your admission consideration. The university’s published table does not list all states as catchment categories; if you are unsure which category applies, confirm with FUHSI before relying on this comparison.</p>
        </div>}
        <div className="aggregate-field">
          <label htmlFor="aggregate-department-cutoff">Departmental cut-off mark (optional, out of 100)</label>
          <input id="aggregate-department-cutoff" type="number" min="0" max="100" step="any" value={departmentCutoff} onChange={e => { setDepartmentCutoff(e.target.value); setShowResult(false); }} placeholder="Enter a cut-off from the official admission notice" />
          {departmentCutoff !== '' && !isValidScore(departmentCutoff, 100) && <small role="alert">Enter a departmental cut-off from 0 to 100.</small>}
          <small>Use the current official cut-off for your course and admission session. EDUKEN does not invent cut-off marks.</small>
        </div>
        <div className="aggregate-actions">
          <button type="button" className="aggregate-primary" disabled={!ready} onClick={() => setShowResult(true)}>Calculate aggregate <Calculator size={17} /></button>
          <button type="button" className="aggregate-secondary" onClick={clear}>Clear</button>
        </div>
        {showResult && <div className="aggregate-result" role="status" aria-live="polite">
          <span>YOUR CALCULATED AGGREGATE</span><strong>{result.total.toFixed(2)} <small>/ 100</small></strong>
          <p>This is a calculation of the inputs supplied, not a prediction or guarantee of admission.</p>
          <div className="aggregate-breakdown">{result.parts.map(part => <div key={part.label}><span>{part.label}</span><b>{part.value.toFixed(2)} / {part.max}</b></div>)}</div>
          {departmentCutoff !== '' && isValidScore(departmentCutoff, 100) && <div className="aggregate-helper" role="status" aria-live="polite"><strong>{result.total >= Number(departmentCutoff) ? 'At or above the cut-off entered' : 'Below the cut-off entered'}</strong><p>{result.total >= Number(departmentCutoff) ? `Your estimated aggregate is ${(result.total - Number(departmentCutoff)).toFixed(2)} point(s) ${result.total === Number(departmentCutoff) ? 'exactly at' : 'above'} the cut-off of ${Number(departmentCutoff).toFixed(2)}.` : `Your estimated aggregate is ${(Number(departmentCutoff) - result.total).toFixed(2)} point(s) below the cut-off of ${Number(departmentCutoff).toFixed(2)}.`} This comparison is not a guarantee of admission; confirm the formula, course requirements and cut-off with the institution.</p></div>}
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
                    ? <p>OAU’s formula is currently under verification because the third-party-reported weighting has not been reconciled with current official evidence. Do not rely on this model for a current admission decision.</p>
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
          <button type="button" className={directoryFilter === 'ready' ? 'active' : ''} onClick={() => setDirectoryFilter('ready')}>Usable formula (official/provisional) ({directory.filter(item => item.status === 'official' || item.status === 'community').length})</button>
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
