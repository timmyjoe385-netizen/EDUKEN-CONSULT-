import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, Calculator, CheckCircle2, Clock3, Flag, GraduationCap, RotateCcw, ShieldCheck, Target, X } from 'lucide-react';
import './cbt.css';
import { api } from './lib/api';

type Question = { id: string | number; subject: string; prompt: string; options: string[]; answer: number; explanation: string };

const QUESTIONS: Question[] = [
  { id: 1, subject: 'Use of English', prompt: 'Choose the word nearest in meaning to “diligent”.', options: ['Careless', 'Hardworking', 'Impatient', 'Uncertain'], answer: 1, explanation: 'Diligent means careful and hardworking.' },
  { id: 2, subject: 'Use of English', prompt: 'Choose the correctly punctuated sentence.', options: ['However I stayed at home.', 'However, I stayed at home.', 'However I, stayed at home.', 'However; I stayed, at home.'], answer: 1, explanation: 'A conjunctive adverb at the beginning of a sentence is commonly followed by a comma.' },
  { id: 3, subject: 'Mathematics', prompt: 'If 3x − 5 = 16, what is x?', options: ['5', '6', '7', '8'], answer: 2, explanation: 'Add 5 to both sides: 3x = 21. Divide by 3, so x = 7.' },
  { id: 4, subject: 'Mathematics', prompt: 'Find 15% of 240.', options: ['24', '30', '36', '40'], answer: 2, explanation: '0.15 × 240 = 36.' },
  { id: 5, subject: 'Biology', prompt: 'Which cell structure is primarily responsible for aerobic respiration?', options: ['Ribosome', 'Mitochondrion', 'Golgi apparatus', 'Cell wall'], answer: 1, explanation: 'Mitochondria are the main site of aerobic respiration in eukaryotic cells.' },
  { id: 6, subject: 'Biology', prompt: 'The basic structural and functional unit of life is the…', options: ['Tissue', 'Organ', 'Cell', 'System'], answer: 2, explanation: 'The cell is the basic structural and functional unit of living organisms.' },
  { id: 7, subject: 'Chemistry', prompt: 'What is the chemical symbol for sodium?', options: ['So', 'S', 'Na', 'N'], answer: 2, explanation: 'Sodium has the chemical symbol Na, from the Latin name natrium.' },
  { id: 8, subject: 'Chemistry', prompt: 'A solution with a pH of 3 is best described as…', options: ['Acidic', 'Neutral', 'Alkaline', 'A metal'], answer: 0, explanation: 'A pH below 7 indicates an acidic solution.' },
  { id: 9, subject: 'Physics', prompt: 'What is the SI unit of force?', options: ['Joule', 'Watt', 'Newton', 'Pascal'], answer: 2, explanation: 'Force is measured in newtons (N).' },
  { id: 10, subject: 'Physics', prompt: 'A car travels 100 metres in 5 seconds. What is its average speed?', options: ['10 m/s', '20 m/s', '25 m/s', '50 m/s'], answer: 1, explanation: 'Average speed = distance ÷ time = 100 ÷ 5 = 20 m/s.' },
  { id: 11, subject: 'Government', prompt: 'The principle of separation of powers is commonly associated with…', options: ['Montesquieu', 'Karl Marx', 'Adam Smith', 'Thomas Hobbes'], answer: 0, explanation: 'Montesquieu is strongly associated with the modern formulation of separation of powers.' },
  { id: 12, subject: 'Government', prompt: 'In a democracy, political authority ultimately derives from…', options: ['The military', 'The electorate', 'The judiciary alone', 'Traditional rulers alone'], answer: 1, explanation: 'Democratic authority is grounded in the people, expressed through constitutional processes such as elections.' },
  { id: 13, subject: 'Economics', prompt: 'The basic economic problem arises mainly because resources are…', options: ['Unlimited', 'Scarce relative to wants', 'Always free', 'Never useful'], answer: 1, explanation: 'Scarcity means available resources are limited relative to human wants.' },
  { id: 14, subject: 'Economics', prompt: 'The next best alternative forgone when a choice is made is called…', options: ['Fixed cost', 'Profit', 'Opportunity cost', 'Revenue'], answer: 2, explanation: 'Opportunity cost is the value of the next best alternative forgone.' },
  { id: 15, subject: 'Literature in English', prompt: 'A comparison using “like” or “as” is known as…', options: ['Metaphor', 'Simile', 'Irony', 'Onomatopoeia'], answer: 1, explanation: 'A simile compares two things using words such as “like” or “as”.' },
  { id: 16, subject: 'Literature in English', prompt: 'The main character in a literary work is usually called the…', options: ['Antagonist', 'Narrator', 'Protagonist', 'Audience'], answer: 2, explanation: 'The protagonist is the central character in a story or drama.' },
];

const SUBJECTS = [
  { name: 'Use of English', short: 'ENG', detail: 'Comprehension, vocabulary and grammar', icon: 'A' },
  { name: 'Mathematics', short: 'MTH', detail: 'Numbers, algebra and problem solving', icon: '÷' },
  { name: 'Biology', short: 'BIO', detail: 'Cells, organisms and life processes', icon: '◉' },
  { name: 'Chemistry', short: 'CHM', detail: 'Matter, reactions and calculations', icon: '⚗' },
  { name: 'Physics', short: 'PHY', detail: 'Motion, energy and measurement', icon: '∿' },
  { name: 'Government', short: 'GOV', detail: 'Political systems and institutions', icon: '§' },
  { name: 'Economics', short: 'ECO', detail: 'Scarcity, markets and choices', icon: '₦' },
  { name: 'Literature in English', short: 'LIT', detail: 'Literary forms and techniques', icon: '✦' },
];

type Attempt = { date: string; mode: string; subject: string; score: number; total: number };

export default function CbtPage() {
  const [publishedQuestions, setPublishedQuestions] = useState<Question[] | null>(null);
  const [questionLoadError, setQuestionLoadError] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState('Use of English');
  const [mode, setMode] = useState<'practice' | 'mock'>('practice');
  const [practiceQuestionCount, setPracticeQuestionCount] = useState(10);
  const [mockQuestionCount, setMockQuestionCount] = useState(8);
  const [mockSubjects, setMockSubjects] = useState<string[]>(['Biology', 'Chemistry', 'Physics']);
  const [started, setStarted] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [flagged, setFlagged] = useState<Array<string | number>>([]);
  const [sessionQuestions, setSessionQuestions] = useState<Question[]>([]);
  const [attemptToken, setAttemptToken] = useState<string | null>(null);
  const [serverResult, setServerResult] = useState<any>(null);
  const [localFallbackSession, setLocalFallbackSession] = useState(false);
  const [starting, setStarting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [startError, setStartError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const finishRef = useRef<() => void>(() => {});
  const autoSubmitRetriesRef = useRef(0);
  const autoSubmitRetryTimerRef = useRef<number | null>(null);
  // Use an absolute deadline so background tabs or a throttled mobile browser cannot pause exam time.
  const deadlineRef = useRef<number | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(15 * 60);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [calculatorOpen, setCalculatorOpen] = useState(false);
  const [calcDisplay, setCalcDisplay] = useState('0');
  const [calcStored, setCalcStored] = useState<number | null>(null);
  const [calcOperator, setCalcOperator] = useState<string | null>(null);
  const [calcReset, setCalcReset] = useState(false);

  const calculatorNumber = () => Number(calcDisplay);
  const calculatorDigit = (digit: string) => {
    if (calcReset || calcDisplay === '0' || calcDisplay === 'Error') {
      setCalcDisplay(digit);
    } else if (calcDisplay.length < 16) {
      setCalcDisplay(calcDisplay + digit);
    }
    setCalcReset(false);
  };
  const calculatorDecimal = () => {
    if (calcReset || calcDisplay === 'Error') {
      setCalcDisplay('0.');
      setCalcReset(false);
    } else if (!calcDisplay.includes('.')) {
      setCalcDisplay(calcDisplay + '.');
    }
  };
  const calculatorClear = () => {
    setCalcDisplay('0');
    setCalcStored(null);
    setCalcOperator(null);
    setCalcReset(false);
  };
  const calculatorBackspace = () => {
    if (calcReset || calcDisplay === 'Error' || calcDisplay.length <= 1 || (calcDisplay.length === 2 && calcDisplay.startsWith('-'))) {
      setCalcDisplay('0');
    } else {
      setCalcDisplay(calcDisplay.slice(0, -1));
    }
    setCalcReset(false);
  };
  const calculatorFormat = (value: number) => {
    if (!Number.isFinite(value)) return 'Error';
    return String(Number(value.toPrecision(10)));
  };
  const calculatorApplyOperator = (operator: string) => {
    const currentValue = calculatorNumber();
    if (!Number.isFinite(currentValue)) return;
    if (calcStored !== null && calcOperator && !calcReset) {
      const result = calcOperator === '+' ? calcStored + currentValue
        : calcOperator === '−' ? calcStored - currentValue
        : calcOperator === '×' ? calcStored * currentValue
        : currentValue === 0 ? NaN : calcStored / currentValue;
      const formatted = calculatorFormat(result);
      setCalcDisplay(formatted);
      setCalcStored(formatted === 'Error' ? null : Number(formatted));
    } else {
      setCalcStored(currentValue);
    }
    setCalcOperator(operator);
    setCalcReset(true);
  };
  const calculatorEquals = () => {
    if (calcStored === null || !calcOperator) return;
    const currentValue = calculatorNumber();
    const result = calcOperator === '+' ? calcStored + currentValue
      : calcOperator === '−' ? calcStored - currentValue
      : calcOperator === '×' ? calcStored * currentValue
      : currentValue === 0 ? NaN : calcStored / currentValue;
    setCalcDisplay(calculatorFormat(result));
    setCalcStored(null);
    setCalcOperator(null);
    setCalcReset(true);
  };
  const calculatorUnary = (operation: 'sqrt' | 'square' | 'percent' | 'sign') => {
    const value = calculatorNumber();
    const result = operation === 'sqrt' ? (value < 0 ? NaN : Math.sqrt(value))
      : operation === 'square' ? value * value
      : operation === 'percent' ? value / 100
      : value * -1;
    setCalcDisplay(calculatorFormat(result));
    setCalcReset(true);
  };

  useEffect(() => {
    let active = true;
    api.get('/api/cbt/questions')
      .then((result) => {
        if (!active) return;
        const rows = Array.isArray(result.data?.items) ? result.data.items : [];
        const mapped: Question[] = rows.map((row: any, index: number) => ({
          id: String(row.id || index + 1),
          subject: String(row.subject || ''),
          prompt: String(row.question_text || ''),
          options: ['A', 'B', 'C', 'D'].map(key => String(row.options?.[key] || '')),
          answer: -1,
          explanation: '',
        })).filter((question: Question) => question.subject && question.prompt && question.options.every(Boolean));
        if (mapped.length === 0) {
          // An empty published bank is not a usable server-backed student experience.
          // Keep original questions available as clearly labelled local practice until
          // an administrator publishes reviewed questions.
          setPublishedQuestions(QUESTIONS);
          setQuestionLoadError(true);
          return;
        }
        setPublishedQuestions(mapped);
      })
      .catch(() => {
        if (!active) return;
        // Keep the original sample set available when the question API cannot be reached.
        setPublishedQuestions(QUESTIONS);
        setQuestionLoadError(true);
      });
    return () => { active = false; };
  }, []);

  const questionPool = publishedQuestions ?? [];
  const poolForSelection = useMemo(
    () => mode === 'mock' ? questionPool : questionPool.filter(question => question.subject === selectedSubject),
    [mode, selectedSubject, questionPool]
  );
  const activeQuestions = sessionQuestions.length ? sessionQuestions : poolForSelection;
  const question = activeQuestions[current];
  const calculatorAllowed = Boolean(question && ['Mathematics', 'Physics', 'Chemistry', 'Economics'].includes(question.subject));
  const correctCount = serverResult ? Number(serverResult.score || 0) : activeQuestions.filter(item => item.answer >= 0 && answers[String(item.id)] === item.answer).length;
  const answeredCount = activeQuestions.filter(item => answers[String(item.id)] !== undefined).length;
  const percent = serverResult ? Number(serverResult.percent || 0) : activeQuestions.length ? Math.round((correctCount / activeQuestions.length) * 100) : 0;

  useEffect(() => {
    if (!calculatorAllowed) setCalculatorOpen(false);
  }, [calculatorAllowed]);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem('eduken-cbt-attempts-v1');
      if (saved) setAttempts(JSON.parse(saved).slice(0, 5));
    } catch { /* Practice remains available if local storage is blocked. */ }
    let active = true;
    api.get('/api/cbt/attempts').then((result) => {
      if (!active || !Array.isArray(result.data?.items)) return;
      const remote: Attempt[] = result.data.items.map((item: any) => ({
        date: String(item.submitted_at || ''),
        mode: String(item.mode || 'practice'),
        subject: String(item.subject || ''),
        score: Number(item.score || 0),
        total: Number(item.total || 0),
      }));
      setAttempts(previous => {
        const combined = [...remote, ...previous].filter((item, index, all) =>
          all.findIndex(other => other.date === item.date && other.mode === item.mode && other.subject === item.subject && other.score === item.score && other.total === item.total) === index
        );
        return combined.slice(0, 10);
      });
    }).catch(() => { /* Signed-out practice keeps browser-local history. */ });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!started || submitted) return;
    let timer: number | undefined;
    const updateRemaining = () => {
      const deadline = deadlineRef.current;
      if (deadline === null) return;
      const remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setSecondsLeft(previous => previous === remaining ? previous : remaining);
      if (remaining === 0 && timer !== undefined) window.clearInterval(timer);
    };
    timer = window.setInterval(updateRemaining, 250);
    document.addEventListener('visibilitychange', updateRemaining);
    updateRemaining();
    return () => {
      if (timer !== undefined) window.clearInterval(timer);
      document.removeEventListener('visibilitychange', updateRemaining);
    };
  }, [started, submitted]);

  useEffect(() => {
    if (started && !submitted && secondsLeft === 0) finishRef.current();
  }, [secondsLeft, started, submitted]);

  useEffect(() => () => {
    if (autoSubmitRetryTimerRef.current !== null) window.clearTimeout(autoSubmitRetryTimerRef.current);
  }, []);

  useEffect(() => {
    if (!submitted || activeQuestions.length === 0) return;
    const result: Attempt = {
      date: String(serverResult?.submittedAt || new Date().toISOString()),
      mode,
      subject: mode === 'mock' ? 'Mixed mock' : selectedSubject,
      score: correctCount,
      total: activeQuestions.length,
    };
    setAttempts(previous => {
      const next = [result, ...previous].slice(0, 10);
      try { window.localStorage.setItem('eduken-cbt-attempts-v1', JSON.stringify(next)); } catch { /* Optional history. */ }
      return next;
    });
    // The server already persisted and graded authenticated/guest attempt sessions. Browser history remains a convenience.
  // Save exactly once for each submitted session.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submitted]);

  const begin = async (nextMode: 'practice' | 'mock', subject = selectedSubject, requestedCount = (nextMode === 'mock' ? mockQuestionCount : practiceQuestionCount)) => {
    setStarting(true);
    setStartError('');
    setSubmitError('');
    autoSubmitRetriesRef.current = 0;
    if (autoSubmitRetryTimerRef.current !== null) {
      window.clearTimeout(autoSubmitRetryTimerRef.current);
      autoSubmitRetryTimerRef.current = null;
    }
    setMode(nextMode);
    setSelectedSubject(subject);
    setAnswers({});
    setFlagged([]);
    setCurrent(0);
    setSubmitted(false);
    setStarted(false);
    setSessionQuestions([]);
    setAttemptToken(null);
    setServerResult(null);
    setLocalFallbackSession(false);

    let nextQuestions: Question[] = [];
    let durationSeconds = nextMode === 'mock' ? 30 * 60 : 15 * 60;
    let serverDeadline: number | null = null;
    if (questionLoadError) {
      nextQuestions = (nextMode === 'mock' ? QUESTIONS.filter(question => ['Use of English', ...mockSubjects].includes(question.subject)) : QUESTIONS.filter(question => question.subject === subject)).slice(0, requestedCount);
      if (nextQuestions.length < requestedCount) {
        setStartError(`Only ${nextQuestions.length} local sample questions are available for this selection; ${requestedCount} were requested. Choose a smaller sample set.`);
        setStarting(false);
        return;
      }
      setLocalFallbackSession(true);
    } else {
      try {
        const response = await api.post('/api/cbt/start', { mode: nextMode, subject, questionCount: requestedCount, subjectCombination: nextMode === 'mock' ? mockSubjects : undefined });
        const data = response.data || {};
        if (!Array.isArray(data.questions) || !data.questions.length || typeof data.attemptToken !== 'string') {
          throw new Error('No published questions are available for this selection yet.');
        }
        nextQuestions = data.questions.map((row: any, index: number) => ({
          id: String(row.id || index + 1),
          subject: String(row.subject || subject),
          prompt: String(row.prompt || ''),
          options: Array.isArray(row.options) ? row.options.map((option: unknown) => String(option)) : [],
          answer: -1,
          explanation: '',
        })).filter((item: Question) => item.prompt && item.options.length === 4 && item.options.every(Boolean));
        if (!nextQuestions.length) throw new Error('The question set could not be prepared. Please try again.');
        setAttemptToken(data.attemptToken);
        durationSeconds = Number(data.durationSeconds) || durationSeconds;
        const serverExpiry = Date.parse(String(data.expiresAt || ''));
        // Server expiry includes the 15-second submission grace; align the visible timer to the actual exam duration.
        if (Number.isFinite(serverExpiry)) serverDeadline = serverExpiry - 15_000;
      } catch (e) {
        setStartError(e instanceof Error ? e.message : 'Could not start practice. Please try again.');
        setStarting(false);
        return;
      }
    }

    if (!nextQuestions.length) {
      setStartError('No starter questions are available for this subject yet.');
      setStarting(false);
      return;
    }
    // Shuffle question order once per attempt; keep each question's option order and answer mapping intact.
    for (let i = nextQuestions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [nextQuestions[i], nextQuestions[j]] = [nextQuestions[j], nextQuestions[i]];
    }
    setSessionQuestions(nextQuestions);
    deadlineRef.current = serverDeadline ?? (Date.now() + durationSeconds * 1000);
    setSecondsLeft(durationSeconds);
    setStarted(true);
    setStarting(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const finish = async () => {
    if (submitting || submitted) return;
    if (!attemptToken || localFallbackSession) {
      setSubmitted(true);
      return;
    }
    setSubmitting(true);
    setSubmitError('');
    try {
      const submittedAnswers = Object.fromEntries(activeQuestions.map(item => [
        String(item.id),
        answers[String(item.id)] === undefined ? null : answers[String(item.id)],
      ]));
      const response = await api.post('/api/cbt/submit', { attemptToken, answers: submittedAnswers });
      const data = response.data || {};
      if (!Array.isArray(data.review)) throw new Error('The result could not be verified. Please retry submission.');
      const reviewedQuestions: Question[] = data.review.map((item: any) => ({
        id: String(item.id),
        subject: String(item.subject || ''),
        prompt: String(item.prompt || ''),
        options: Array.isArray(item.options) ? item.options.map((option: unknown) => String(option)) : [],
        answer: ['A', 'B', 'C', 'D'].indexOf(String(item.correctOption || '').toUpperCase()),
        explanation: String(item.explanation || ''),
      }));
      setSessionQuestions(reviewedQuestions);
      setServerResult({
        score: Number(data.score || 0),
        total: Number(data.total || reviewedQuestions.length),
        percent: Number(data.percent || 0),
        submittedAt: String(data.submittedAt || new Date().toISOString()),
      });
      setSubmitted(true);
      autoSubmitRetriesRef.current = 0;
      if (autoSubmitRetryTimerRef.current !== null) {
        window.clearTimeout(autoSubmitRetryTimerRef.current);
        autoSubmitRetryTimerRef.current = null;
      }
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : 'Could not submit practice. Please try again.');
      // When the exam clock has expired, retry transient failures automatically. The server
      // treats repeated submissions idempotently, so a lost response is safe to retry.
      if (secondsLeft === 0 && attemptToken && autoSubmitRetriesRef.current < 3 && autoSubmitRetryTimerRef.current === null) {
        autoSubmitRetriesRef.current += 1;
        autoSubmitRetryTimerRef.current = window.setTimeout(() => {
          autoSubmitRetryTimerRef.current = null;
          finishRef.current();
        }, 1500);
      }
    } finally {
      setSubmitting(false);
    }
  };
  finishRef.current = () => { void finish(); };
  const formatTime = (value: number) => String(Math.floor(value / 60)).padStart(2, '0') + ':' + String(value % 60).padStart(2, '0');

  if (started && question && !submitted) {
    return (
      <div className="cbt-page">
        <header className="cbt-topbar">
          <a className="cbt-brand" href="/"><span className="cbt-brand-mark">E</span><span>EDUKEN <b>CBT</b></span></a>
          <div className={secondsLeft < 120 ? 'cbt-timer urgent' : 'cbt-timer'}><Clock3 size={17} /> {formatTime(secondsLeft)}</div>
        </header>
        <main className="cbt-exam-wrap">
          <div className="cbt-exam-heading">
            <div><span className="cbt-eyebrow">{mode === 'mock' ? 'MIXED MOCK TEST' : 'SUBJECT PRACTICE'}</span><h1>{mode === 'mock' ? 'JAMB-style practice mock' : selectedSubject}</h1><p>Independent practice by EDUKEN CONSULT. Not affiliated with JAMB.</p></div>
            <div className="cbt-exam-tools">{calculatorAllowed && <button className="cbt-calculator-trigger" onClick={() => setCalculatorOpen(true)}><Calculator size={16} /> Calculator</button>}<button className="cbt-quiet-button" onClick={() => { if (window.confirm('Leave this practice session? Your current answers will be lost.')) { setStarted(false); setSubmitted(false); } }}><ArrowLeft size={16} /> Exit</button></div>
          </div>
          <div className="cbt-exam-progress"><span style={{ width: ((current + 1) / activeQuestions.length * 100) + '%' }} /></div>
          <div className="cbt-exam-grid">
            <section className="cbt-question-card">
              <div className="cbt-question-meta"><span>Question {current + 1} of {activeQuestions.length}</span><button className={flagged.includes(question.id) ? 'cbt-flag active' : 'cbt-flag'} onClick={() => setFlagged(old => old.includes(question.id) ? old.filter(id => id !== question.id) : [...old, question.id])}><Flag size={15} /> {flagged.includes(question.id) ? 'Flagged' : 'Review later'}</button></div>
              <h2>{question.prompt}</h2>
              <div className="cbt-options">
                {question.options.map((option, index) => <button key={option} className={answers[String(question.id)] === index ? 'cbt-option selected' : 'cbt-option'} onClick={() => setAnswers(old => ({ ...old, [String(question.id)]: index }))}><span>{String.fromCharCode(65 + index)}</span><b>{option}</b>{answers[question.id] === index ? <CheckCircle2 size={18} /> : null}</button>)}
              </div>
              <div className="cbt-question-actions">
                <button className="cbt-secondary-button" disabled={current === 0} onClick={() => setCurrent(value => value - 1)}>Previous</button>
                {current < activeQuestions.length - 1 ? <button className="cbt-primary-button" onClick={() => setCurrent(value => value + 1)}>Next question <ArrowRight size={16} /></button> : <button className="cbt-primary-button" onClick={() => void finish()} disabled={submitting}>{submitting ? 'Submitting…' : 'Submit practice'} <CheckCircle2 size={16} /></button>}
              </div>
            </section>
            <aside className="cbt-question-nav">
              <h3>Question navigator</h3><p>{answeredCount} answered · {flagged.length} flagged</p>
              <div className="cbt-number-grid">{activeQuestions.map((item, index) => <button key={item.id} aria-label={'Go to question ' + (index + 1)} className={index === current ? 'current' : answers[String(item.id)] !== undefined ? 'answered' : flagged.includes(item.id) ? 'flagged' : ''} onClick={() => setCurrent(index)}>{index + 1}</button>)}</div>
              <div className="cbt-legend"><span><i className="answered" /> Answered</span><span><i className="flagged" /> Flagged</span><span><i className="current" /> Current</span></div>
              <button className="cbt-submit-wide" onClick={() => void finish()} disabled={submitting}>{submitting ? 'Submitting…' : 'Finish and see results'}</button>
              <small>{localFallbackSession ? 'Offline starter mode: this small original sample set is bundled with the page and is not secure exam content. Results are calculated in your browser. Sign in and use the published question service for server-graded attempts.' : 'The answer key stays server-side until submission. Sign in to save progress to your account; guest history stays in this browser.'}</small>
              {submitError && <p className="cbt-disclaimer" role="alert">{submitError}</p>}
            </aside>
          </div>
          {calculatorOpen && (
            <div className="cbt-calculator-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) setCalculatorOpen(false); }}>
              <section className="cbt-calculator" role="dialog" aria-modal="true" aria-label="Practice calculator">
                <header><div><Calculator size={18} /><div><strong>Calculator</strong><small>For calculation practice</small></div></div><button aria-label="Close calculator" onClick={() => setCalculatorOpen(false)}><X size={19} /></button></header>
                <div className="cbt-calculator-display" aria-live="polite">{calcDisplay}</div>
                <div className="cbt-calculator-keys">
                  <button className="utility" onClick={() => calculatorUnary('sqrt')}>√</button>
                  <button className="utility" onClick={() => calculatorUnary('square')}>x²</button>
                  <button className="utility" onClick={() => calculatorUnary('percent')}>%</button>
                  <button className="utility" onClick={calculatorBackspace}>⌫</button>
                  <button className="utility" onClick={calculatorClear}>AC</button>
                  {['7','8','9','÷','4','5','6','×','1','2','3','−','±','0','.','+'].map(key => (
                    <button key={key} className={['÷','×','−','+'].includes(key) ? 'operator' : ''} onClick={() => {
                      if (/^\d$/.test(key)) calculatorDigit(key);
                      else if (key === '.') calculatorDecimal();
                      else if (key === '±') calculatorUnary('sign');
                      else calculatorApplyOperator(key);
                    }}>{key}</button>
                  ))}
                  <button className="equals" onClick={calculatorEquals}>=</button>
                </div>
                <p>Use only when permitted by the practice test instructions.</p>
              </section>
            </div>
          )}
        </main>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="cbt-page">
        <header className="cbt-topbar"><a className="cbt-brand" href="/"><span className="cbt-brand-mark">E</span><span>EDUKEN <b>CBT</b></span></a><a className="cbt-back-link" href="/"><ArrowLeft size={16} /> EDUKEN home</a></header>
        <main className="cbt-results-wrap">
          <section className="cbt-result-hero"><div className="cbt-result-icon"><Target size={28} /></div><span className="cbt-eyebrow">PRACTICE COMPLETE</span><h1>{percent >= 70 ? 'Good work. Keep building.' : 'Every attempt is progress.'}</h1><p>{mode === 'mock' ? 'Mixed JAMB-style mock' : selectedSubject} · {activeQuestions.length} questions</p><div className="cbt-score-ring"><strong>{percent}%</strong><span>Score</span></div><div className="cbt-result-stats"><div><strong>{correctCount}</strong><span>Correct</span></div><div><strong>{activeQuestions.length - correctCount}</strong><span>Incorrect / skipped</span></div><div><strong>{answeredCount}</strong><span>Attempted</span></div></div><button className="cbt-primary-button" onClick={() => void begin(mode, selectedSubject)}><RotateCcw size={16} /> Try again</button><button className="cbt-secondary-button" onClick={() => { setStarted(false); setSubmitted(false); setSessionQuestions([]); setAttemptToken(null); setServerResult(null); setLocalFallbackSession(false); setStartError(''); }}>Choose another practice</button></section>
          <section className="cbt-review-card"><div className="cbt-review-heading"><div><span className="cbt-eyebrow">LEARN FROM YOUR ANSWERS</span><h2>Answer review</h2></div><span>{correctCount}/{activeQuestions.length} correct</span></div>{activeQuestions.map((item, index) => <article className="cbt-review-item" key={item.id}><div className="cbt-review-question"><span className={answers[item.id] === item.answer ? 'correct' : 'incorrect'}>{answers[item.id] === item.answer ? '✓' : '!'}</span><div><b>{index + 1}. {item.prompt}</b><p>Your answer: {answers[item.id] === undefined ? 'Not answered' : item.options[answers[item.id]]}</p><p>Correct answer: <strong>{item.options[item.answer]}</strong></p><small>{item.explanation}</small></div></div></article>)}</section>
        </main>
      </div>
    );
  }

  return (
    <div className="cbt-page">
      <header className="cbt-topbar"><a className="cbt-brand" href="/"><span className="cbt-brand-mark">E</span><span>EDUKEN <b>CBT</b></span></a><nav className="cbt-top-links"><a href="#subjects">Subjects</a><a href="#how-it-works">How it works</a><a href="/">Main website</a></nav><a className="cbt-mobile-home" href="/">Home</a></header>
      <main>
        <section className="cbt-hero">
          <div className="cbt-hero-copy"><span className="cbt-eyebrow"><span /> JAMB PREPARATION STARTS HERE</span><h1>Prepare with purpose.<br /><em>Practise with confidence.</em></h1><p>Build your confidence with focused subject practice, timed mock tests and clear explanations — designed for Nigerian students preparing for entrance examinations.</p><div className="cbt-hero-actions"><button className="cbt-primary-button" disabled={starting || !questionPool.some(question => question.subject === selectedSubject)} onClick={() => void begin('practice', selectedSubject)}><BookOpen size={17} /> {starting ? 'Starting…' : 'Start free practice'}</button><button className="cbt-secondary-button" disabled={starting || !questionPool.length} onClick={() => void begin('mock', 'Use of English')}><Clock3 size={17} /> {starting ? 'Starting…' : 'Try a timed mock'}</button></div>{startError && <p className="cbt-disclaimer" role="alert">{startError}</p>}<div className="cbt-trust-row"><span><ShieldCheck size={16} /> Free starter practice</span><span><CheckCircle2 size={16} /> Instant results</span></div></div>
          <div className="cbt-hero-visual"><div className="cbt-visual-orbit" /><div className="cbt-preview-panel"><div className="cbt-preview-top"><span>EDUKEN CBT</span><span className="cbt-live-pill">PRACTICE</span></div><div className="cbt-preview-title">Your next step<br /><b>starts here.</b></div><div className="cbt-preview-metrics"><div><BookOpen size={18} /><b>Subject practice</b><small>Learn topic by topic</small></div><div><Target size={18} /><b>Timed mock tests</b><small>Build exam confidence</small></div></div><div className="cbt-preview-footer"><span><CheckCircle2 size={15} /> Answer explanations</span><span>Built for mobile</span></div></div><div className="cbt-floating-note"><GraduationCap size={19} /><span><b>Stay consistent</b><small>One practice at a time</small></span></div></div>
        </section>
        <section className="cbt-subject-section" id="subjects"><div className="cbt-section-heading"><div><span className="cbt-eyebrow">CHOOSE YOUR SUBJECT</span><h2>Start where you need it most.</h2></div><p>Choose a subject to practise, or take a mixed mock to check your current understanding.</p></div>{questionLoadError && <p className="cbt-disclaimer" role="status">The published question bank is empty or unavailable, so original starter samples are being used in local practice mode. Subject practice contains 2 sample questions; mixed practice contains up to 16. These sample results are not server-graded or saved to your account.</p>}{publishedQuestions !== null && !questionLoadError && questionPool.length === 0 && <p className="cbt-disclaimer" role="status">No questions have been published yet. Your admin can add and approve questions in the CBT Question Bank.</p>}<div className="cbt-practice-count"><label htmlFor="cbt-practice-count">Questions per subject practice</label><select id="cbt-practice-count" className="cbt-count-select" value={questionLoadError ? 2 : ([5, 10, 20, 40, 50].includes(practiceQuestionCount) ? practiceQuestionCount : 10)} onChange={event => setPracticeQuestionCount(Number(event.target.value))}>{questionLoadError ? <option value={2}>2 sample questions (local)</option> : <><option value={5}>5 questions</option><option value={10}>10 questions</option><option value={20}>20 questions</option><option value={40}>40 questions</option><option value={50}>50 questions</option></>}</select></div><div className="cbt-subject-picker"><div className="cbt-subject-picker-copy"><label htmlFor="cbt-subject-select">Choose a subject to practise</label><p>{SUBJECTS.find(subject => subject.name === selectedSubject)?.detail || "Choose a subject to begin focused practice."}</p></div><select id="cbt-subject-select" className="cbt-count-select cbt-subject-select" value={selectedSubject} onChange={event => setSelectedSubject(event.target.value)}>{SUBJECTS.map(subject => <option key={subject.name} value={subject.name}>{subject.name}</option>)}</select><button className="cbt-primary-button" disabled={starting || !questionPool.some(question => question.subject === selectedSubject)} onClick={() => void begin("practice", selectedSubject, questionLoadError ? 2 : practiceQuestionCount)}><BookOpen size={16} /> {starting ? "Starting…" : "Practise selected subject"} <ArrowRight size={15} /></button></div><div className="cbt-mock-banner"><div><span className="cbt-eyebrow">READY FOR A CHALLENGE?</span><h3>Build your mixed mock.</h3><p>Use of English is included automatically. Select exactly three additional subjects.</p><div className="cbt-mock-subjects">{SUBJECTS.filter(subject => subject.name !== 'Use of English').map(subject => <label key={subject.name} className="cbt-mock-subject-option"><input type="checkbox" checked={mockSubjects.includes(subject.name)} onChange={event => setMockSubjects(previous => event.target.checked ? (previous.length < 3 ? [...previous, subject.name] : previous) : previous.filter(name => name !== subject.name)} />{subject.name}</label>)}</div><label className="cbt-count-label" htmlFor="cbt-mock-count">Questions per mock</label><select id="cbt-mock-count" className="cbt-count-select" value={questionLoadError ? (mockQuestionCount === 8 ? 8 : 10) : ([10, 20, 40, 100, 180].includes(mockQuestionCount) ? mockQuestionCount : 10)} onChange={event => setMockQuestionCount(Number(event.target.value))}>{questionLoadError ? <><option value={8}>8 sample questions (selected subjects)</option><option value={10}>10 sample questions</option></> : <><option value={10}>10 questions</option><option value={20}>20 questions</option><option value={40}>40 questions</option><option value={100}>100 questions</option><option value={180}>180 questions — full mock</option></>}</select></div><button className="cbt-primary-button" disabled={!questionPool.length || mockSubjects.length !== 3 || starting} onClick={() => begin('mock', 'Use of English', questionLoadError ? (mockQuestionCount === 8 ? 8 : 10) : ([10, 20, 40, 100, 180].includes(mockQuestionCount) ? mockQuestionCount : 10))}>Start mixed mock <ArrowRight size={16} /></button></div></section>
        <section className="cbt-how-section" id="how-it-works"><div className="cbt-section-heading"><div><span className="cbt-eyebrow">A SIMPLE ROUTINE</span><h2>Practise. Review. Improve.</h2></div></div><div className="cbt-steps"><article><span>01</span><h3>Choose a subject</h3><p>Focus on one subject or use the mixed starter mock.</p></article><article><span>02</span><h3>Answer at your pace</h3><p>Navigate questions, change answers and flag items to revisit.</p></article><article><span>03</span><h3>Learn from results</h3><p>See your score, correct answers and explanations immediately.</p></article></div><div className="cbt-disclaimer"><ShieldCheck size={18} /><p>EDUKEN CBT is an independent practice resource and is not affiliated with or endorsed by JAMB. Questions shown from the question bank are published only after admin review. If the service is unavailable in preview, original starter samples may be shown; this is not a complete past-question bank or a prediction of the official examination.</p></div></section>
        {attempts.length > 0 && <section className="cbt-history-section"><div className="cbt-section-heading"><div><span className="cbt-eyebrow">YOUR RECENT PRACTICE</span><h2>Keep your momentum.</h2></div></div><div className="cbt-history-list">{attempts.map((attempt, index) => <div className="cbt-history-row" key={attempt.date + index}><span>{attempt.subject}</span><b>{Math.round(attempt.score / attempt.total * 100)}%</b><small>{new Date(attempt.date).toLocaleDateString()}</small></div>)}</div></section>}
      </main>
      <footer className="cbt-footer"><a className="cbt-brand" href="/"><span className="cbt-brand-mark">E</span><span>EDUKEN <b>CONSULT</b></span></a><span>Learn with purpose. Prepare with confidence.</span><a href="/">Return to EDUKEN CONSULT <ArrowRight size={15} /></a></footer>
    </div>
  );
}
