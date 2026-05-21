import type { Dispatch } from 'react';
import type { AppAction } from '../hooks/useReport';

interface Props {
  dispatch: Dispatch<AppAction>;
}

export function Landing({ dispatch }: Props) {
  return (
    <main className="page">
      <div className="container">
        <div className="landing-hero">
          <p className="header__brand" style={{ marginBottom: '1.5rem' }}>
            Demand Profiling Report Generator
          </p>
          <h1>Generate a Demand Profiling Report</h1>
          <p>
            Paste an equipment schedule and create a consultant-ready draft in minutes.
          </p>
          <div className="landing-ctas">
            <button
              className="btn btn--primary"
              onClick={() => dispatch({ type: 'LOAD_SAMPLE' })}
            >
              Try sample report
            </button>
            <button
              className="btn btn--secondary"
              onClick={() => dispatch({ type: 'GO_TO', payload: 'import' })}
            >
              Start with my schedule
            </button>
          </div>
        </div>

        <div className="card" style={{ maxWidth: 600, margin: '0 auto' }}>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            <strong style={{ color: 'var(--text)', display: 'block', marginBottom: '0.375rem' }}>
              What this tool does
            </strong>
            Turns a kitchen equipment schedule into a structured Demand Profiling Report — including
            connected loads, diversified demand, zone totals, OPEX estimates, and heat gain
            assessment. Calculations are deterministic. Narrative sections are drafted by Claude and
            are for consultant review only.
          </p>
          <div
            className="alert alert--info"
            style={{ marginTop: '1rem', fontSize: '0.8rem' }}
          >
            Draft output only — subject to M&amp;E engineer verification. Not certified
            engineering advice.
          </div>
        </div>
      </div>
    </main>
  );
}
