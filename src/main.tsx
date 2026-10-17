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
      document.documentElement.dataset.theme =
        preference === 'system' ? (media.matches ? 'dark' : 'light') : preference;
    };
    applyStandaloneTheme();
    if (preference === 'system') {
      media.addEventListener('change', applyStandaloneTheme);
    }
  } catch {
    document.documentElement.dataset.theme = 'light';
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isAggregateCalculator ? <AggregateCalculator /> : <><App /><AggregateCalculatorShortcut /></>}
  </StrictMode>
);
