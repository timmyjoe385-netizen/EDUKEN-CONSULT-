import { useCallback, useEffect, useState } from 'react';
import { api, auth } from './lib/api';
import StudentProgress from './StudentProgress';

type StudentProfile = { username: string; created_at: string };
type LeaderboardRow = {
  rank: number;
  username: string;
  score: number;
  total: number;
  percentage: number;
  duration_seconds: number | null;
  submitted_at: string;
};

const SUBJECTS = [
  'Use of English', 'Mathematics', 'Biology', 'Chemistry',
  'Physics', 'Economics', 'Government', 'Literature in English',
];

export default function StudentArena() {
  const [signedIn] = useState(() => auth.isSignedIn());
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [username, setUsername] = useState('');
  const [claiming, setClaiming] = useState(false);
  const [message, setMessage] = useState('');
  const [scope, setScope] = useState<'national' | 'subject'>('national');
  const [subject, setSubject] = useState('Biology');
  const [period, setPeriod] = useState<'week' | 'all-time'>('week');
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [participantCount, setParticipantCount] = useState(0);
  const [page, setPage] = useState(0);
  const [loadingRows, setLoadingRows] = useState(false);
  const [leaderboardError, setLeaderboardError] = useState('');

  useEffect(() => {
    if (!signedIn) {
      setLoadingProfile(false);
      return;
    }
    let active = true;
    api.get('/api/cbt/student-profile')
      .then(result => {
        if (active) setProfile(result.data?.profile || null);
      })
      .catch(error => {
        if (active) setMessage(error instanceof Error ? error.message : 'Could not load your student profile.');
      })
      .finally(() => {
        if (active) setLoadingProfile(false);
      });
    return () => { active = false; };
  }, [signedIn]);

  const loadLeaderboard = useCallback(async (nextPage: number, append: boolean) => {
    setLoadingRows(true);
    setLeaderboardError('');
    const params = new URLSearchParams({
      scope,
      period,
      page: String(nextPage),
      limit: '50',
    });
    if (scope === 'subject') params.set('subject', subject);
    try {
      const result = await api.get('/api/cbt/leaderboard?' + params.toString());
      const nextRows = Array.isArray(result.data?.items) ? result.data.items : [];
      setRows(previous => append ? [...previous, ...nextRows] : nextRows);
      setParticipantCount(Number(result.data?.participantCount || 0));
      setPage(nextPage);
    } catch (error) {
      setLeaderboardError(error instanceof Error ? error.message : 'The leaderboard is temporarily unavailable.');
    } finally {
      setLoadingRows(false);
    }
  }, [scope, subject, period]);

  useEffect(() => {
    if (!profile) {
      setRows([]);
      return;
    }
    void loadLeaderboard(0, false);
  }, [profile, loadLeaderboard]);

  const claimUsername = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setClaiming(true);
    setMessage('');
    try {
      const result = await api.post('/api/cbt/student-profile', { username: username.trim() });
      setProfile(result.data?.profile || null);
      setUsername('');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not claim that username.');
    } finally {
      setClaiming(false);
    }
  };

  return (
    <section className="student-arena" aria-labelledby="student-arena-title">
      <div className="student-arena-heading">
        <div>
          <span className="cbt-eyebrow">EDUKEN STUDENT ARENA</span>
          <h2 id="student-arena-title">Your effort. Your progress. Your place. 🏆</h2>
          <p>Practise freely. Claim a free username when you are ready to compete.</p>
        </div>
        <span className="student-arena-trophy" aria-hidden="true">🏆</span>
      </div>

      {!signedIn ? (
        <div className="student-arena-gate">
          <h3>Join the competition for free</h3>
          <p>You can continue practising as a guest. To appear on the national and subject leaderboards, sign in to your EDUKEN account and claim a unique username.</p>
          <a className="student-arena-button" href="/">Go to EDUKEN to sign in</a>
          <small>Your practice access remains free. Signing in is only needed for a saved competition identity.</small>
        </div>
      ) : loadingProfile ? (
        <div className="student-arena-gate" role="status">Loading your competition profile…</div>
      ) : !profile ? (
        <div className="student-arena-gate">
          <h3>Create your free competition username</h3>
          <p>Choose a name other students will recognise. Your real name, email and phone number will not appear on the leaderboard.</p>
          <form className="student-arena-claim" onSubmit={claimUsername}>
            <label htmlFor="student-arena-username">Your username</label>
            <div className="student-arena-claim-row">
              <span aria-hidden="true">@</span>
              <input
                id="student-arena-username"
                value={username}
                onChange={event => setUsername(event.target.value)}
                minLength={3}
                maxLength={20}
                pattern="[A-Za-z0-9_]{3,20}"
                placeholder="FutureDoctor27"
                autoComplete="off"
                required
              />
              <button type="submit" disabled={claiming || username.trim().length < 3}>{claiming ? 'Saving…' : 'Claim username'}</button>
            </div>
            <small>3–20 letters, numbers or underscores. Each username can be claimed once.</small>
          </form>
          {message && <p className="student-arena-message" role="alert">{message}</p>}
        </div>
      ) : (
        <div className="student-arena-board">
          <StudentProgress />
          <div className="student-arena-welcome">
            <div><span>YOUR COMPETITION ID</span><strong>@{profile.username}</strong></div>
            <span className="student-arena-free">FREE MEMBER</span>
          </div>
          <div className="student-arena-controls">
            <div className="student-arena-tabs" role="group" aria-label="Leaderboard type">
              <button type="button" className={scope === 'national' ? 'active' : ''} onClick={() => setScope('national')}>National</button>
              <button type="button" className={scope === 'subject' ? 'active' : ''} onClick={() => setScope('subject')}>By subject</button>
            </div>
            {scope === 'subject' && (
              <label className="student-arena-select-label">Choose subject
                <select value={subject} onChange={event => setSubject(event.target.value)}>
                  {SUBJECTS.map(name => <option key={name} value={name}>{name}</option>)}
                </select>
              </label>
            )}
            <label className="student-arena-select-label">Ranking period
              <select value={period} onChange={event => setPeriod(event.target.value as 'week' | 'all-time')}>
                <option value="week">This week</option>
                <option value="all-time">All time</option>
              </select>
            </label>
          </div>
          <div className="student-arena-count">
            <strong>{participantCount.toLocaleString()} eligible students</strong>
            <span>{scope === 'national' ? 'Nationwide' : subject} · {period === 'week' ? 'This week' : 'All time'}</span>
          </div>
          {leaderboardError && <p className="student-arena-message" role="alert">{leaderboardError}</p>}
          {rows.length > 0 ? (
            <div className="student-arena-list">
              {rows.map(row => (
                <div className={'student-arena-row' + (row.username === profile.username ? ' is-you' : '')} key={row.rank + '-' + row.username}>
                  <span className="student-arena-rank">{row.rank <= 3 ? ['🥇','🥈','🥉'][row.rank - 1] : '#' + row.rank}</span>
                  <span className="student-arena-name">@{row.username}{row.username === profile.username && <small>YOU</small>}</span>
                  <strong>{Number(row.percentage).toFixed(1)}%</strong>
                  <span className="student-arena-score">{row.score}/{row.total}</span>
                </div>
              ))}
            </div>
          ) : !loadingRows && !leaderboardError ? (
            <div className="student-arena-empty">No eligible scores yet. Complete a qualifying mock or subject practice to enter the rankings.</div>
          ) : null}
          {loadingRows && <p className="student-arena-loading" role="status">Loading rankings…</p>}
          {!loadingRows && rows.length < participantCount && (
            <button className="student-arena-more" type="button" onClick={() => void loadLeaderboard(page + 1, true)}>Load more students</button>
          )}
          <small className="student-arena-note">Rankings use completed, server-graded attempts. National ranking requires a full 180-question mock; subject ranking requires at least 20 questions in that subject. Guest attempts are not ranked.</small>
        </div>
      )}
      {message && signedIn && profile && <p className="student-arena-message" role="alert">{message}</p>}
    </section>
  );
}
