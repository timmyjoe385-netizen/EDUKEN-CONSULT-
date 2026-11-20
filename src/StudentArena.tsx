import { useCallback, useEffect, useRef, useState } from 'react';
import { api, auth } from './lib/api';
import StudentProgress from './StudentProgress';

type StudentProfile = { username: string; created_at: string };
type WeeklyChampion = {
  category: 'top-performer' | 'most-improved' | 'most-consistent';
  username: string;
  score: number;
  total: number;
  percentage: number;
  detail: string;
  attempts_count: number;
};
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
  const [champions, setChampions] = useState<WeeklyChampion[]>([]);
  const [loadingChampions, setLoadingChampions] = useState(true);
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
  const leaderboardRequestId = useRef(0);

  useEffect(() => {
    let active = true;
    api.get('/api/cbt/arena/champions')
      .then(result => {
        if (active) setChampions(Array.isArray(result.data?.champions) ? result.data.champions : []);
      })
      .catch(() => {
        if (active) setChampions([]);
      })
      .finally(() => {
        if (active) setLoadingChampions(false);
      });
    return () => { active = false; };
  }, []);

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
    const requestId = ++leaderboardRequestId.current;
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
      if (requestId !== leaderboardRequestId.current) return;
      const nextRows = Array.isArray(result.data?.items) ? result.data.items : [];
      setRows(previous => append ? [...previous, ...nextRows] : nextRows);
      setParticipantCount(Number(result.data?.participantCount || 0));
      setPage(nextPage);
    } catch (error) {
      if (requestId === leaderboardRequestId.current) {
        setLeaderboardError(error instanceof Error ? error.message : 'The leaderboard is temporarily unavailable.');
      }
    } finally {
      if (requestId === leaderboardRequestId.current) setLoadingRows(false);
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
          <p>Build your student identity once. Use it throughout your CBT journey.</p>
        </div>
        <span className="student-arena-trophy" aria-hidden="true">🏆</span>
      </div>

      <section className="student-arena-champions" aria-label="This week's champions">
        <div className="student-arena-champions-heading">
          <div><span className="cbt-eyebrow">WEEKLY SPOTLIGHT</span><h3>This week's champions 🌟</h3></div>
          <small>Based on qualifying 180-question mocks</small>
        </div>
        {loadingChampions ? (
          <p className="student-arena-loading" role="status">Loading this week's champions…</p>
        ) : champions.length ? (
          <div className="student-arena-champion-grid">
            {(['top-performer', 'most-improved', 'most-consistent'] as const).map(category => {
              const champion = champions.find(item => item.category === category);
              const label = category === 'top-performer' ? 'Top performer' : category === 'most-improved' ? 'Most improved' : 'Most consistent';
              const icon = category === 'top-performer' ? '🏆' : category === 'most-improved' ? '📈' : '🎯';
              return (
                <article className="student-arena-champion" key={category}>
                  <span aria-hidden="true">{icon}</span>
                  <small>{label}</small>
                  {champion ? (
                    <>
                      <strong>@{champion.username}</strong>
                      <b>{Number(champion.percentage).toFixed(1)}%</b>
                      <p>{champion.detail}</p>
                    </>
                  ) : (
                    <p>Complete at least two qualifying mocks this week to be recognised.</p>
                  )}
                </article>
              );
            })}
          </div>
        ) : (
          <div className="student-arena-empty">No weekly champions yet. Complete qualifying full mocks to take a place in this week's spotlight.</div>
        )}
      </section>

      {!signedIn ? (
        <div className="student-arena-gate">
          <h3>Create your student identity to unlock the CBT.</h3>
          <p>Sign in to your free EDUKEN account and claim a unique username before starting subject practice or a mock examination. Your username follows your results and leaderboard profile.</p>
        </div>
      ) : loadingProfile ? (
        <div className="student-arena-gate" role="status">Loading your competition profile…</div>
      ) : !profile ? (
        <div className="student-arena-gate">
          <h3>Choose your free student username</h3>
          <p>Your username is required before you can access any CBT activity. Claim it in the identity section above to continue.</p>
        </div>
      ) : (
        <div className="student-arena-board">
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
          {leaderboardError && <div className="student-arena-retry"><p className="student-arena-message" role="alert">{leaderboardError}</p><button type="button" onClick={() => void loadLeaderboard(0, false)}>Try again</button></div>}
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
          <small className="student-arena-note">Rankings use completed, server-graded attempts. National ranking requires a full 180-question mock; subject ranking requires at least 20 questions in that subject. Only attempts started under a verified student username can qualify.</small>
        </div>
      )}
      {message && signedIn && profile && <p className="student-arena-message" role="alert">{message}</p>}
      {signedIn && <StudentProgress />}
    </section>
  );
}
