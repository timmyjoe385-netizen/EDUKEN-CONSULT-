import { useEffect, useState } from 'react';
import { ArrowRight, CheckCircle2, ShieldCheck, UserRound } from 'lucide-react';
import { api, auth } from './lib/api';

type Profile = { username: string; created_at: string };

type Props = { onReady: (profile: Profile | null) => void };

export default function CbtIdentityGate({ onReady }: Props) {
  const [signedIn, setSignedIn] = useState(() => auth.isSignedIn());
  const [profile, setProfile] = useState<Profile | null>(null);
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(() => auth.isSignedIn());
  const [saving, setSaving] = useState(false);
  const [signingIn, setSigningIn] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let active = true;
    const sync = () => setSignedIn(auth.isSignedIn());
    window.addEventListener('eduken-auth-changed', sync);
    if (!auth.isSignedIn()) {
      setLoading(false);
      onReady(null);
    } else {
      api.get('/api/cbt/student-profile')
        .then(result => {
          if (!active) return;
          const next = result.data?.profile || null;
          setProfile(next);
          onReady(next);
        })
        .catch(error => {
          if (!active) return;
          setMessage(error instanceof Error ? error.message : 'We could not verify your student profile. Please try again.');
          onReady(null);
        })
        .finally(() => { if (active) setLoading(false); });
    }
    return () => {
      active = false;
      window.removeEventListener('eduken-auth-changed', sync);
    };
  }, [onReady]);

  const continueWithGoogle = async () => {
    setSigningIn(true);
    setMessage('');
    try {
      await auth.signIn();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Google sign-in could not start. Please try again.');
      setSigningIn(false);
    }
  };

  const claimUsername = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const result = await api.post('/api/cbt/student-profile', { username: username.trim() });
      const next = result.data?.profile || null;
      setProfile(next);
      setUsername('');
      onReady(next);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'That username could not be saved. Please try another.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="cbt-identity-gate" aria-labelledby="cbt-identity-title">
      <div className="cbt-identity-icon"><UserRound size={22} /></div>
      <div className="cbt-identity-content">
        <span className="cbt-eyebrow">YOUR EDUKEN STUDENT ID</span>
        <h2 id="cbt-identity-title">{profile ? 'You are ready to practise' : 'Create your student identity first'}</h2>
        {loading ? (
          <p role="status">Checking your student account…</p>
        ) : profile ? (
          <p className="cbt-identity-confirmed"><CheckCircle2 size={16} /> Signed in as <strong>@{profile.username}</strong>. This identity will follow your dashboard, results, practice history and leaderboard.</p>
        ) : !signedIn ? (
          <>
            <p>Every student needs a free EDUKEN account and a unique username before starting any practice or mock examination. Your progress will stay attached to your account.</p>
            <button type="button" className="cbt-primary-button" disabled={signingIn} onClick={() => void continueWithGoogle()}>
              <ArrowRight size={17} /> {signingIn ? 'Opening Google…' : 'Continue with Google'}
            </button>
            <small>New students can create an account with Google. Returning students can sign in with the same account.</small>
          </>
        ) : (
          <>
            <p>Choose the unique username that will appear across your CBT dashboard, results, practice history and Student Arena. Your email and other private details will not be shown publicly.</p>
            <form className="cbt-identity-form" onSubmit={claimUsername}>
              <label htmlFor="cbt-student-username">Choose your username</label>
              <div className="cbt-identity-input-row">
                <span aria-hidden="true">@</span>
                <input id="cbt-student-username" value={username} onChange={event => setUsername(event.target.value)} minLength={3} maxLength={20} pattern="[A-Za-z0-9_]{3,20}" autoComplete="off" placeholder="FutureDoctor27" required />
                <button type="submit" className="cbt-primary-button" disabled={saving || username.trim().length < 3}>{saving ? 'Saving…' : 'Save username'}</button>
              </div>
              <small>Use 3–20 letters, numbers or underscores. Usernames are unique and cannot be claimed by another student.</small>
            </form>
          </>
        )}
        {message && <p className="cbt-identity-error" role="alert">{message}</p>}
      </div>
      <div className="cbt-identity-privacy"><ShieldCheck size={16} /> One account. One student identity.</div>
    </section>
  );
}
