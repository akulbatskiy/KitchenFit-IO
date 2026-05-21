import { useEffect, useRef } from 'react';
import type { Dispatch } from 'react';
import type { AppAction, AppState } from '../hooks/useReport';
import { calculate } from '../calculator/calculator';
import { buildNarrativePayload } from '../calculator/narrativePayload';
import type { NarrativeSections } from '../calculator/types';

interface Props {
  state: AppState;
  dispatch: Dispatch<AppAction>;
}

function fmt(n: number | null, decimals = 1): string {
  if (n === null) return 'review required';
  return n.toFixed(decimals);
}
function fmtGBP(n: number | null): string {
  if (n === null) return 'review required';
  return '£' + Math.round(n).toLocaleString('en-GB');
}

export function Generate({ state, dispatch }: Props) {
  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;

    // 1. Run deterministic calculation
    const calculated = calculate(state.equipment, state.assumptions);
    dispatch({ type: 'SET_CALCULATED', payload: calculated });
    dispatch({ type: 'SET_NARRATIVE_STATUS', payload: 'loading' });

    // 2. Request Claude narrative
    const payload = buildNarrativePayload(
      state.project,
      state.equipment,
      state.assumptions,
      calculated,
    );

    fetch('/api/generate-narrative', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error((body as { error?: string }).error ?? `HTTP ${res.status}`);
        }
        return res.json() as Promise<NarrativeSections>;
      })
      .then((narrative) => {
        dispatch({ type: 'SET_NARRATIVE', payload: narrative });
        dispatch({ type: 'GO_TO', payload: 'preview' });
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        dispatch({ type: 'SET_NARRATIVE_ERROR', payload: msg });
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const calc = state.calculated;
  const narrativeStatus = state.narrativeStatus;
  const narrativeError = state.narrativeError;

  return (
    <main className="page">
      <div className="container">
        <div className="page-header">
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem' }}>
            Generating report…
          </h1>

          <div className="card" style={{ maxWidth: 560 }}>
            <ul className="checkpoint-list">
              {/* Equipment processed */}
              <li className="checkpoint">
                <span className={`cp-icon ${calc ? 'cp-icon--ok' : 'cp-icon--spin'}`}>
                  {calc ? '✓' : '◌'}
                </span>
                <span className="cp-text">
                  {calc
                    ? `Equipment schedule processed — ${fmt(calc.totalConnectedLoad)} kW connected`
                    : 'Processing equipment schedule…'}
                </span>
              </li>

              {/* Zone totals */}
              {calc && (
                <li className="checkpoint">
                  <span className="cp-icon cp-icon--ok">✓</span>
                  <div>
                    <span className="cp-text">Zone totals</span>
                    <div className="cp-sub">
                      {calc.zoneTotals.map((z) => `${z.zone} ${fmt(z.kw)} kW`).join(' · ')}
                    </div>
                  </div>
                </li>
              )}

              {/* Diversity */}
              {calc && (
                <li className="checkpoint">
                  <span className="cp-icon cp-icon--ok">✓</span>
                  <span className="cp-text">
                    Diversity applied — {fmt(calc.diversifiedKW)} kW / {fmt(calc.kva)} kVA
                  </span>
                </li>
              )}

              {/* OPEX */}
              {calc && (
                <li className="checkpoint">
                  <span className="cp-icon cp-icon--ok">✓</span>
                  <span className="cp-text">
                    Annual OPEX estimated — {fmtGBP(calc.annualElectricityOPEX)} electricity
                    {calc.waterOPEXStatus === 'calculated'
                      ? ` + ${fmtGBP(calc.annualWaterOPEX)} water`
                      : ' · water review required'}
                  </span>
                </li>
              )}

              {/* Heat gain */}
              {calc && (
                <li className="checkpoint">
                  <span className={`cp-icon ${calc.heatGainStatus === 'calculated' ? 'cp-icon--ok' : 'cp-icon--warn'}`}>
                    {calc.heatGainStatus === 'calculated' ? '✓' : '⚠'}
                  </span>
                  <span className="cp-text">
                    {calc.heatGainStatus === 'calculated'
                      ? `Heat gain — ${fmt(calc.peakHeatGainKW)} kW peak net to HVAC`
                      : 'Heat gain — review required (unmapped equipment types)'}
                  </span>
                </li>
              )}

              {/* Narrative */}
              {calc && (
                <li className="checkpoint">
                  <span className={`cp-icon ${
                    narrativeStatus === 'done'  ? 'cp-icon--ok' :
                    narrativeStatus === 'error' ? 'cp-icon--warn' :
                    'cp-icon--spin'
                  }`}>
                    {narrativeStatus === 'done' ? '✓' : narrativeStatus === 'error' ? '⚠' : '◌'}
                  </span>
                  <span className="cp-text">
                    {narrativeStatus === 'done'    ? 'Report narrative generated' :
                     narrativeStatus === 'error'   ? 'Narrative generation failed' :
                                                     'Generating report narrative…'}
                  </span>
                </li>
              )}
            </ul>

            {/* Error state */}
            {narrativeStatus === 'error' && (
              <div style={{ marginTop: '1rem' }}>
                <div className="alert alert--error" style={{ marginBottom: '1rem' }}>
                  <strong>Narrative could not be generated:</strong> {narrativeError}
                  {narrativeError?.includes('fetch') || narrativeError?.includes('network') ? (
                    <span style={{ display: 'block', marginTop: '0.25rem', fontSize: '0.8rem' }}>
                      Run <code>vercel dev</code> locally to enable the Claude API route.
                    </span>
                  ) : null}
                </div>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  You can still preview the report — narrative sections will show placeholder text.
                </p>
                <button
                  className="btn btn--primary"
                  onClick={() => dispatch({ type: 'GO_TO', payload: 'preview' })}
                >
                  Continue to preview →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
