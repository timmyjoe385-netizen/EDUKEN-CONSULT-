import { useEffect, useMemo, useState } from 'react';
import { api } from './lib/api';

type SubjectStat = { subject: string; attempts: number; score: number; total: number; accuracy: number };
type Student = {
  user_id: string; username: string; attempts: number; questions: number; correct: number;
  accuracy: number; average_duration_seconds: number | null; last_active: string | null;
  active_days_30: number; completed_attempts: number; incomplete_attempts: number;
  subjects: SubjectStat[];
  recent: Array<{ subject: string; mode: string; score: number; total: number; submitted_at: string; duration_seconds: number | null }>;
};
type Payload = { summary: { students: number; attempts: number; questions: number; average_accuracy: number; active_7d: number; incomplete: number }; students: Student[] };

const pct = (n: number) => Number.isFinite(n) ? n.toFixed(1) + '%' : '—';
const duration = (seconds: number | null) => seconds == null ? '—' : Math.floor(seconds / 60) + 'm ' + Math.round(seconds % 60) + 's';

export default function CbtMonitoringAdmin() {
  const [data, setData] = useState<Payload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState('');
  const [sort, setSort] = useState<'recent' | 'accuracy' | 'attempts'>('recent');

  const load = async () => {
    setLoading(true); setError('');
    try {
      const result = await api.get('/api/admin/cbt-monitoring');
      setData(result.data as Payload);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not load CBT monitoring.');
    } finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, []);

  const students = useMemo(() => {
    const rows = (data?.students || []).filter(item => item.username.toLowerCase().includes(search.trim().toLowerCase()));
    return rows.sort((a, b) => sort === 'accuracy' ? b.accuracy - a.accuracy : sort === 'attempts' ? b.attempts - a.attempts : String(b.last_active || '').localeCompare(String(a.last_active || '')));
  }, [data, search, sort]);
  const current = students.find(item => item.user_id === selected) || data?.students.find(item => item.user_id === selected);

  return <section className="analytics-panel" aria-label="CBT student monitoring">
    <div className="analytics-toolbar">
      <div><span className="tag">ADMIN ONLY · STUDENT PERFORMANCE</span><p>Read-only view of saved CBT activity linked to each student's existing EDUKEN username.</p></div>
      <button className="primary" type="button" onClick={() => void load()} disabled={loading}>{loading ? 'Refreshing…' : '↻ Refresh data'}</button>
    </div>
    {error ? <div className="analytics-error" role="alert"><b>CBT monitoring could not load</b><p>{error}</p></div> : null}
    {loading && !data ? <div className="admin-empty">Loading student CBT records…</div> : null}
    {data ? <>
      <div className="student-progress-metrics">
        <article><span>Registered CBT usernames</span><strong>{data.summary.students}</strong></article>
        <article><span>Completed attempts</span><strong>{data.summary.attempts}</strong></article>
        <article><span>Questions answered</span><strong>{data.summary.questions.toLocaleString()}</strong></article>
        <article><span>Average accuracy</span><strong>{pct(data.summary.average_accuracy)}</strong></article>
        <article><span>Active in last 7 days</span><strong>{data.summary.active_7d}</strong></article>
        <article><span>Incomplete sessions</span><strong>{data.summary.incomplete}</strong></article>
      </div>
      <div className="analytics-toolbar" style={{ marginTop: 20, flexWrap: 'wrap' }}>
        <input aria-label="Search student username" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by CBT username…" />
        <select aria-label="Sort students" value={sort} onChange={e => setSort(e.target.value as typeof sort)}>
          <option value="recent">Most recently active</option><option value="accuracy">Highest accuracy</option><option value="attempts">Most attempts</option>
        </select>
      </div>
      {current ? <section className="system-settings-panel" style={{ marginTop: 18 }}>
        <div className="analytics-toolbar"><div><span className="tag">STUDENT PROFILE</span><h2>@{current.username}</h2><p>Last active: {current.last_active ? new Date(current.last_active).toLocaleString() : 'No completed activity'}</p></div><button className="secondary" type="button" onClick={() => setSelected('')}>Back to all students</button></div>
        <div className="student-progress-metrics">
          <article><span>Attempts</span><strong>{current.attempts}</strong></article><article><span>Accuracy</span><strong>{pct(current.accuracy)}</strong></article><article><span>Questions</span><strong>{current.questions.toLocaleString()}</strong></article><article><span>Active days · 30d</span><strong>{current.active_days_30}</strong></article><article><span>Average time / attempt</span><strong>{duration(current.average_duration_seconds)}</strong></article><article><span>Incomplete sessions</span><strong>{current.incomplete_attempts}</strong></article>
        </div>
        <h3>Subject performance</h3>
        {current.subjects.length ? current.subjects.map(subject => <div className="system-setting-row" key={subject.subject}><span className="system-setting-copy"><b>{subject.subject}</b><small>{subject.attempts} attempts · {subject.score}/{subject.total} correct</small></span><strong>{pct(subject.accuracy)}</strong></div>) : <p>No subject-level records yet.</p>}
        <h3>Recent completed attempts</h3>
        {current.recent.length ? current.recent.map((attempt, index) => <div className="system-setting-row" key={attempt.submitted_at + index}><span className="system-setting-copy"><b>{attempt.subject || 'Mixed mock'} · {attempt.mode}</b><small>{new Date(attempt.submitted_at).toLocaleString()} · {duration(attempt.duration_seconds)}</small></span><strong>{attempt.score}/{attempt.total} ({pct(attempt.total ? attempt.score / attempt.total * 100 : 0)})</strong></div>) : <p>No completed attempts yet.</p>}
      </section> : <div className="system-settings-list">
        {students.map(student => <button type="button" className="system-setting-row" key={student.user_id} onClick={() => setSelected(student.user_id)} style={{ width: '100%', textAlign: 'left', cursor: 'pointer' }}>
          <span className="system-setting-copy"><b>@{student.username}</b><small>{student.attempts} completed attempts · {student.questions} questions · Last active {student.last_active ? new Date(student.last_active).toLocaleDateString() : 'Never'}</small></span>
          <strong>{pct(student.accuracy)} <span aria-hidden="true">›</span></strong>
        </button>)}
        {!students.length ? <div className="admin-empty">No students match this search.</div> : null}
      </div>}
      <p className="system-settings-footnote">Performance is calculated from server-graded saved attempts. Topic-level weaknesses are not shown yet because the current subject-score records do not reliably store per-topic outcomes. Guest sessions are not attributed to student usernames.</p>
    </> : null}
  </section>;
}
