import { Component, StrictMode, type ErrorInfo, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import AggregateCalculator from './AggregateCalculator';
import './index.css';
import './aggregate.css';
import './platform-upgrade.css';

class RootErrorBoundary extends Component<
  { children: ReactNode },
  { error: string | null }
> {
  state = { error: null as string | null };

  static getDerivedStateFromError(error: unknown) {
    return {
      error: error instanceof Error ? error.message : String(error),
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('EDUKEN startup/render error:', error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <main
          role="alert"
          style={{
            minHeight: '100vh',
            display: 'grid',
            placeContent: 'center',
            gap: '14px',
            padding: '28px 22px',
            background: '#f8faf8',
            color: '#17211d',
            fontFamily: 'system-ui, sans-serif',
            textAlign: 'center',
          }}
        >
          <div style={{ maxWidth: '520px' }}>
            <p style={{ color: '#587064', fontWeight: 800, letterSpacing: '.12em' }}>EDUKEN CONSULT</p>
            <h1 style={{ fontSize: 'clamp(26px, 6vw, 38px)', margin: '12px 0' }}>We’re having trouble opening this page.</h1>
            <p style={{ color: '#53605a', lineHeight: 1.6 }}>The page encountered a startup error instead of loading normally. Your account and saved information have not been changed.</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              style={{ marginTop: '12px', padding: '13px 20px', border: 0, borderRadius: '9px', background: '#173f31', color: '#fff', fontWeight: 700 }}
            >
              Reload EDUKEN
            </button>
            <p style={{ marginTop: '18px', color: '#7a8780', fontSize: '12px' }}>If this continues, share this screen with EDUKEN support.</p>
          </div>
        </main>
      );
    }
    return this.props.children;
  }
}

const isAggregateCalculator = window.location.pathname.replace(/\/+$/, '').endsWith('/aggregate-calculator');

// The standalone calculator does not mount App, where the appearance preference
// is normally applied. Bootstrap the shared theme here so its CSS and controls
// resolve correctly on direct visits and reloads.
if (isAggregateCalculator) {
  try {
    const savedPreference = window.localStorage.getItem('eduken-theme');
    const preference = savedPreference === 'dark' || savedPreference === 'system'
      ? savedPreference
      : 'light';
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const applyStandaloneTheme = () => {
      const root = document.documentElement;
      const resolved = preference === 'system' ? (media.matches ? 'dark' : 'light') : preference;
      root.dataset.theme = resolved;
      root.dataset.themePreference = preference;
      root.style.colorScheme = resolved;
    };
    applyStandaloneTheme();
    if (preference === 'system') {
      media.addEventListener('change', applyStandaloneTheme);
    }
  } catch {
    // Keep the page and native form controls in the same safe light mode if
    // storage or system-theme detection is unavailable in this browser.
    const root = document.documentElement;
    root.dataset.theme = 'light';
    root.dataset.themePreference = 'light';
    root.style.colorScheme = 'light';
  }
}

createRoot(document.getElementById('root')!).render(
  <RootErrorBoundary>
    <StrictMode>
      {isAggregateCalculator ? <AggregateCalculator /> : <App />}
    </StrictMode>
  </RootErrorBoundary>
);
