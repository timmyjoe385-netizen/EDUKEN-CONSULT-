import { useEffect, useMemo, useState } from 'react';
import { api } from './lib/api';

type Attempt = {
  mode: string;
  subject: string;
  score: number;
  total: number;
  submitted_at: string;
  duration_seconds: number | null;
};
type ArenaSummary = {
  national_rank: number | null;
  best_mock_score: number | null;
  best_mock_total: number | null;
  best_mock_percentage: number | null;
  attempts_count: number;
  questions_attempted: number;
  overall_accuracy: number;
  recent_accuracy: number | null;
  previous_accuracy: number | null;
  improvement_percentage_points: number | null;
};

export default function StudentProgress() {
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [summary, setSummary] = useState<ArenaSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    Promise.all([
      api.get('/api/cbt/attempts'),
      api.get('/api/cbt/arena/summary'),
    ])
      .then(([history, overview]) => {
        if (!active) return;
        const items = Array.isArray(history.data?.items) ? history.data.items : [];
        setAttempts(items.filter((item: Attempt) =>
          Number.isFinite(Number(item.score)) &&
          Number.isFinite(Number(item.total)) &&
          Number(item.total) > 0
        ));
        setSummary(overview.data?.summary || null);
      })
      .catch(reason => {
        if (active) setError(reason instanceof Error ? reason.message : 'Your progress is temporarily unavailable.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  const summaryFallback = useMemo(() => {
    const questions = attempts.reduce((sum, item) => sum + Number(item.total), 0);
    const correct = attempts.reduce((sum, item) => sum + Number(item.score), 0);
    const best = attempts.reduce((value, item) => Math.max(value, Number(item.score) / Number(item.total) * 100), 0);
    const subjects = new Set(attempts.map(item => item.subject).filter(Boolean));
    return {
      count: attempts.length,
      questions,
      accuracy: questions ? correct / questions * 100 : 0,
      best,
      subjects: subjects.size,
    };
  }, [attempts]);

  const accuracy = summary ? Number(summary.overall_accuracy || 0) : summaryFallback.accuracy;
  const questions = summary ? Number(summary.questions_attempted || 0) : summaryFallback.questions;
  const attemptsCount = summary ? Number(summary.attempts_count || 0) : summaryFallback.count;
  const improvement = summary?.improvement_percentage_points;

  return (
    <section className="student-progress" aria-labelledby="student-progress-title">
      <div className="student-progress-heading">
        <div>
          <span className="cbt-eyebrow">YOUR LEARNING DASHBOARD</span>
          <h3 id="student-progress-title">Your progress so far</h3>
          <p>Personal performance and ranking from your saved, server-graded attempts.</p>
        </div>
      </div>
      {loading ? (
        <p className="student-progress-status" role="status">Loading your progress…</p>
      ) : error ? (
        <p className="student-arena-message" role="alert">{error}</p>
      ) : attempts.length === 0 ? (
        <div className="student-arena-empty">Your progress will appear here after you complete a practice session while signed in. Guest practice remains available, but guest attempts are not attached to your competition profile.</div>
      ) : (
        <>
          <div className="student-progress-metrics">
            <article><span>National rank</span><strong>{summary?.national_rank ? '#' + Number(summary.national_rank).toLocaleString() : '—'}</strong></article>
            <article><span>Best 180-question mock</span><strong>{summary?.best_mock_percentage != null ? Number(summary.best_mock_percentage).toFixed(1) + '%' : '—'}</strong></article>
            <article><span>Overall accuracy</span><strong>{accuracy.toFixed(1)}%</strong></article>
            <article><span>Questions attempted</span><strong>{questions.toLocaleString()}</strong></article>
          </div>
          <div className="student-progress-trend">
            <span><strong>Improvement</strong><small>Latest 5 attempts compared with the previous 5</small></span>
            <strong className={improvement == null ? '' : Number(improvement) > 0 ? 'positive' : Number(improvement) < 0 ? 'negative' : ''}>
              {improvement == null ? 'Not enough attempts yet' : (Number(improvement) > 0 ? '+' : '') + Number(improvement).toFixed(1) + ' percentage points'}
            </strong>
          </div>
          <div className="student-progress-recent">
            <div className="student-progress-recent-heading">
              <strong>Recent practice</strong>
              <span>{summaryFallback.subjects} {summaryFallback.subjects === 1 ? 'subject' : 'subjects'} covered · {attemptsCount.toLocaleString()} saved attempts</span>
            </div>
            {attempts.slice(0, 5).map((item, index) => {
              const percentage = Number(item.score) / Number(item.total) * 100;
              return (
                <div className="student-progress-attempt" key={item.submitted_at + '-' + index}>
                  <span><strong>{item.subject || (item.mode === 'mock' ? 'Mixed mock' : 'Practice')}</strong><small>{new Date(item.submitted_at).toLocaleDateString()}</small></span>
                  <span className="student-progress-result"><strong>{percentage.toFixed(1)}%</strong><small>{item.score}/{item.total}</small></span>
                </div>
              );
            })}
          </div>
        </>
      )}
      <small className="student-progress-footnote">Rank is based on your best qualifying 180-question mock. Progress includes saved attempts only, not guest or local sample sessions.</small>
    </section>
  );
}
