import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import AggregateCalculator, { AggregateCalculatorShortcut } from './AggregateCalculator';
import './index.css';
import './aggregate.css';

const isAggregateCalculator = window.location.pathname.replace(/\/+$/, '').endsWith('/aggregate-calculator');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isAggregateCalculator ? <AggregateCalculator /> : <><App /><AggregateCalculatorShortcut /></>}
  </StrictMode>
);
