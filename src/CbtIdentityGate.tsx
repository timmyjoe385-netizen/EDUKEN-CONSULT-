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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accountMode, setAccountMode] = useState<'signup' | 'signin'>('signup');
  const [message, setMessage] = useState('');

  useEffect(() => {
    let active = true;
    const loadProfile = () => {
      if (!auth.isSignedIn()) {
        setSignedIn(false);
        setProfile(null);
        setLoading(false);
        onReady(null);
        return;
      }
      setSignedIn(true);
      setLoading(true);
      api.get('/api/cbt/student-profile')
        .then(result => {
          if (!active) return;
          const nextProfile = result.data?.profile || null;
          setProfile(nextProfile);
          onReady(nextProfile);
        })
        .catch(error => {
          if (!active) return;
          setMessage(error instanceof Error ? error.message : 'We could not verify your student profile. Please try again.');
          onReady(null);
        })
        .finally(() => { if (active) setLoading(false); });
    };
    window.addEventListener('eduken-auth-changed', loadProfile);
    loadProfile();
    return () => {
      active = false;
      window.removeEventListener('eduken-auth-changed', loadProfile);
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

  const continueWithEmail = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSigningIn(true);
    setMessage('');
    try {
      if (accountMode === 'signup') {
        const result = await auth.signUpWithPassword(email.trim(), password);
        if (result.confirmationRequired) {
          setAccountMode('signin');
          setMessage('Account created. Check your email to confirm it, then sign in here to choose your username.');
        } else {
          setMessage('Account created. Now choose your free, unique student username.');
        }
      } else {
        await auth.signInWithPassword(email.trim(), password);
        setSignedIn(true);
        setLoading(true);
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Your account could not be verified. Please try again.');
    } finally {
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
      // Re-mount the Arena and progress dashboard against the newly saved profile.
      window.location.reload();
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
        <h2 id="cbt-identity-title">{profile ? 'Your student identity is ready' : 'Create your free student identity'}</h2>
        {loading ? (
          <p role="status">Checking your student account…</p>
        ) : profile ? (
          <p className="cbt-identity-confirmed"><CheckCircle2 size={16} /> Signed in as <strong>@{profile.username}</strong>. This identity will follow your dashboard, results, practice history and leaderboard.</p>
        ) : !signedIn ? (
          <>
            <p>Before starting any CBT practice or mock, create or access your free EDUKEN account and choose a unique username. No payment is required.</p>
            <button type="button" className="cbt-primary-button" disabled={signingIn} onClick={() => void continueWithGoogle()}>
              <ArrowRight size={17} /> {signingIn ? 'Opening Google…' : 'Continue with Google'}
            </button>
            <small>Google is one sign-in option. You can also create or access your account using your email address.</small>
            <form className="cbt-identity-form" onSubmit={continueWithEmail}>
              <label htmlFor="cbt-identity-email">Email address</label>
              <input id="cbt-identity-email" type="email" value={email} onChange={event => setEmail(event.target.value)} autoComplete="email" required />
              <label htmlFor="cbt-identity-password">Password</label>
              <input id="cbt-identity-password" type="password" value={password} onChange={event => setPassword(event.target.value)} minLength={8} autoComplete={accountMode === 'signup' ? 'new-password' : 'current-password'} required />
              <button type="submit" className="cbt-primary-button" disabled={signingIn || !email.trim() || password.length < 8}>{signingIn ? 'Please wait…' : accountMode === 'signup' ? 'Create free account' : 'Sign in with email'}</button>
              <small>{accountMode === 'signup' ? 'Use at least 8 characters. You may need to confirm your email before continuing.' : 'Sign in with the email and password for your EDUKEN account.'}</small>
              <button type="button" className="cbt-text-button" onClick={() => { setAccountMode(accountMode === 'signup' ? 'signin' : 'signup'); setMessage(''); }}>{accountMode === 'signup' ? 'Already have an account? Sign in' : 'New to EDUKEN? Create an account'}</button>
            </form>
          </>
        ) : (
          <>
            <p>Choose the free, unique username that will identify you throughout CBT practice, mock examinations, your dashboard, results and leaderboard. Your email and private details will not be shown publicly.</p>
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
