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

export default function StudentProgress() {
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    api.get('/api/cbt/attempts')
      .then(result => {
        if (!active) return;
        const items = Array.isArray(result.data?.items) ? result.data.items : [];
        setAttempts(items.filter((item: Attempt) =>
          Number.isFinite(Number(item.score)) &&
          Number.isFinite(Number(item.total)) &&
          Number(item.total) > 0
        ));
      })
      .catch(reason => {
        if (active) setError(reason instanceof Error ? reason.message : 'Your progress is temporarily unavailable.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  const summary = useMemo(() => {
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

  return (
    <section className="student-progress" aria-labelledby="student-progress-title">
      <div className="student-progress-heading">
        <div>
          <span className="cbt-eyebrow">YOUR LEARNING DASHBOARD</span>
          <h3 id="student-progress-title">Your progress so far</h3>
          <p>Based on your 20 most recent saved, signed-in attempts.</p>
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
            <article><span>Saved attempts</span><strong>{summary.count}</strong></article>
            <article><span>Questions answered</span><strong>{summary.questions.toLocaleString()}</strong></article>
            <article><span>Overall accuracy</span><strong>{summary.accuracy.toFixed(1)}%</strong></article>
            <article><span>Best attempt</span><strong>{summary.best.toFixed(1)}%</strong></article>
          </div>
          <div className="student-progress-recent">
            <div className="student-progress-recent-heading">
              <strong>Recent practice</strong>
              <span>{summary.subjects} {summary.subjects === 1 ? 'subject' : 'subjects'} covered</span>
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
      <small className="student-progress-footnote">This summary uses saved attempts linked to your EDUKEN account. It does not include guest or local sample sessions.</small>
    </section>
  );
}
