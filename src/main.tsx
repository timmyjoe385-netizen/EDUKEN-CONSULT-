import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import AggregateCalculator, { AggregateCalculatorShortcut } from './AggregateCalculator';
import './index.css';
import './aggregate.css';

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
  <StrictMode>
    {isAggregateCalculator ? <AggregateCalculator /> : <><App /><AggregateCalculatorShortcut /></>}
  </StrictMode>
);
