import { useEffect, useMemo, useState } from 'react';
import { api } from './lib/api';

type SubjectScore = { subject: string; score: number; total: number; percentage: number; submitted_at: string };
type Attempt = { mode: string; subject: string; score: number; total: number; percentage: number; duration_seconds: number | null; submitted_at: string };
type Student = {
  username: string;
  joined_at: string;
  last_active_at: string | null;
  attempts_count: number;
  questions_attempted: number;
  average_accuracy: number;
  recent_accuracy: number | null;
  improvement_points: number | null;
  active_sessions: number;
  subjects: SubjectScore[];
  attempts: Attempt[];
};
type MonitoringData = { generated_at: string; totals: { students: number; active_students_7d: number; attempts: number; average_accuracy: number }; students: Student[] };

const percent = (value: number) => Number(value || 0).toFixed(1) + '%';
const dateLabel = (value?: string | null) => value ? new Date(value).toLocaleString() : 'No activity yet';

export default function CbtMonitoringAdmin() {
  const [data, setData] = useState<MonitoringData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [period, setPeriod] = useState('all');
  const [selected, setSelected] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await api.get('/api/admin/cbt-monitoring');
      setData(result.data as MonitoringData);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'CBT monitoring could not be loaded.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const visibleStudents = useMemo(() => {
    const cutoff = period === '7' ? Date.now() - 7 * 86400000 : period === '30' ? Date.now() - 30 * 86400000 : 0;
    return (data?.students || []).filter(student => {
      const matches = student.username.toLowerCase().includes(search.trim().toLowerCase());
      const recentEnough = !cutoff || (student.last_active_at && new Date(student.last_active_at).getTime() >= cutoff);
      return matches && recentEnough;
    });
  }, [data, search, period]);

  const activeStudent = visibleStudents.find(student => student.username === selected) || null;

  return (
    <section className="analytics-panel cbt-monitoring-panel" aria-label="CBT student monitoring">
      <div className="analytics-toolbar">
        <div>
          <span className="tag">PRIVATE ADMIN REPORT · CBT ACTIVITY</span>
          <p>Track registered CBT usernames, saved practice, subject performance and recent activity. Guest sessions are not included.</p>
          {data?.generated_at ? <small>Updated {dateLabel(data.generated_at)}</small> : null}
        </div>
        <button className="primary" type="button" onClick={() => void load()} disabled={loading}>{loading ? 'Refreshing…' : '↻ Refresh'}</button>
      </div>
      {error ? <div className="analytics-error" role="alert"><b>Monitoring data could not load</b><p>{error}</p></div> : null}
      {loading && !data ? <div className="admin-empty">Loading student CBT records…</div> : null}
      {data ? (
        <>
          <div className="analytics-cards">
            <article><span>Registered CBT students</span><strong>{data.totals.students}</strong><small>Username profiles</small></article>
            <article><span>Active in 7 days</span><strong>{data.totals.active_students_7d}</strong><small>At least one recorded session</small></article>
            <article><span>Completed attempts</span><strong>{data.totals.attempts}</strong><small>Saved and graded</small></article>
            <article><span>Average accuracy</span><strong>{percent(data.totals.average_accuracy)}</strong><small>Across completed attempts</small></article>
          </div>
          <div className="analytics-toolbar cbt-monitoring-filters">
            <input aria-label="Search student username" placeholder="Search by CBT username…" value={search} onChange={event => setSearch(event.target.value)} />
            <select aria-label="Filter student activity" value={period} onChange={event => setPeriod(event.target.value)}>
              <option value="all">All students</option><option value="7">Active in 7 days</option><option value="30">Active in 30 days</option>
            </select>
          </div>
          <div className="cbt-monitoring-table-wrap">
            <table className="cbt-monitoring-table">
              <thead><tr><th>Student username</th><th>Attempts</th><th>Questions</th><th>Average</th><th>Last activity</th><th>Details</th></tr></thead>
              <tbody>
                {visibleStudents.map(student => (
                  <tr key={student.username}>
                    <td><strong>@{student.username}</strong></td>
                    <td>{student.attempts_count}</td>
                    <td>{student.questions_attempted.toLocaleString()}</td>
                    <td>{percent(student.average_accuracy)}</td>
                    <td>{student.last_active_at ? new Date(student.last_active_at).toLocaleDateString() : '—'}</td>
                    <td><button className="secondary" type="button" onClick={() => setSelected(current => current === student.username ? null : student.username)}>{selected === student.username ? 'Close' : 'View'}</button></td>
                  </tr>
                ))}
                {!visibleStudents.length ? <tr><td colSpan={6}>No students match this search or activity filter.</td></tr> : null}
              </tbody>
            </table>
          </div>
          {activeStudent ? (
            <div className="analytics-card cbt-monitoring-detail">
              <div className="analytics-toolbar"><div><h3>@{activeStudent.username}</h3><small>Joined {dateLabel(activeStudent.joined_at)}</small></div><button className="secondary" type="button" onClick={() => setSelected(null)}>Close details</button></div>
              <div className="analytics-cards">
                <article><span>Overall accuracy</span><strong>{percent(activeStudent.average_accuracy)}</strong></article>
                <article><span>Recent accuracy</span><strong>{activeStudent.recent_accuracy == null ? '—' : percent(activeStudent.recent_accuracy)}</strong></article>
                <article><span>Improvement</span><strong>{activeStudent.improvement_points == null ? '—' : (activeStudent.improvement_points > 0 ? '+' : '') + activeStudent.improvement_points.toFixed(1) + ' pts'}</strong></article>
                <article><span>Unfinished sessions</span><strong>{activeStudent.active_sessions}</strong></article>
              </div>
              <h4>Subject performance · weakest first</h4>
              {activeStudent.subjects.length ? activeStudent.subjects.map(subject => (
                <div className="analytics-row" key={subject.subject}><span>{subject.subject}</span><b>{percent(subject.percentage)} ({subject.score}/{subject.total})</b></div>
              )) : <p>No subject-level score breakdown has been recorded yet.</p>}
              <h4>Recent completed attempts</h4>
              {activeStudent.attempts.length ? activeStudent.attempts.slice(0, 10).map((attempt, index) => (
                <div className="analytics-row" key={attempt.submitted_at + '-' + index}>
                  <span>{attempt.subject || (attempt.mode === 'mock' ? 'Mixed mock' : 'Practice')} · {new Date(attempt.submitted_at).toLocaleString()}</span>
                  <b>{percent(attempt.percentage)} ({attempt.score}/{attempt.total})</b>
                </div>
              )) : <p>No completed attempts yet.</p>}
              <small>Subject weaknesses are based on saved subject scores. Topic-level diagnosis is not shown because the current reporting records do not store a verified topic score summary.</small>
            </div>
          ) : null}
          {!visibleStudents.length ? null : <p className="analytics-privacy">Showing {visibleStudents.length} of {data.students.length} registered CBT students. Only existing registered usernames and CBT performance records are shown.</p>}
        </>
      ) : null}
    </section>
  );
}
