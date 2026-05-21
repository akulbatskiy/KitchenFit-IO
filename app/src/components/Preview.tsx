import { useState } from 'react';
import type { Dispatch } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { AppAction, AppState, NarrativeStatus } from '../hooks/useReport';
import type { CalculatedResults, NarrativeSections } from '../calculator/types';
import { buildNarrativePayload } from '../calculator/narrativePayload';

interface Props {
  state: AppState;
  dispatch: Dispatch<AppAction>;
}

const BURGUNDY = '#7B1C3E';
const BURGUNDY2 = '#c0456d';
const SLATE = '#94a3b8';

function fmt(n: number | null, d = 1) { return n === null ? '—' : n.toFixed(d); }
function fmtInt(n: number | null) { return n === null ? 'review required' : Math.round(n).toLocaleString('en-GB'); }
function fmtGBP(n: number | null) { return n === null ? 'review required' : '£' + Math.round(n).toLocaleString('en-GB'); }

// ── Narrative section with edit / regenerate ─────────────────────
function NarrativeSection({
  sectionKey,
  title,
  num,
  text,
  narrativeStatus,
  dispatch,
  onRegenerate,
}: {
  sectionKey: keyof NarrativeSections;
  title: string;
  num: string;
  text: string | undefined;
  narrativeStatus: NarrativeStatus;
  dispatch: Dispatch<AppAction>;
  onRegenerate: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');

  const placeholder = '[Section requires review — data incomplete]';
  const content = text ?? placeholder;
  const isEmpty = !text;

  function startEdit() {
    setDraft(content);
    setEditing(true);
  }
  function saveEdit() {
    dispatch({ type: 'UPDATE_NARRATIVE_SECTION', payload: { key: sectionKey, value: draft } });
    setEditing(false);
  }

  return (
    <section className="report-section">
      <div className="report-section-header">
        <div className="report-section-number">Section {num}</div>
        <h2>{title}</h2>
      </div>

      <div className="narrative-controls no-print">
        <button className="btn btn--ghost btn--sm" onClick={startEdit} disabled={editing}>
          Edit
        </button>
        <button
          className="btn btn--secondary btn--sm"
          onClick={onRegenerate}
          disabled={narrativeStatus === 'loading' || editing}
        >
          {narrativeStatus === 'loading' ? 'Regenerating…' : 'Regenerate this section'}
        </button>
      </div>

      {editing ? (
        <div>
          <textarea
            className="narrative-textarea"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            autoFocus
          />
          <div className="row-end" style={{ marginTop: '0.5rem' }}>
            <button className="btn btn--secondary btn--sm" onClick={() => setEditing(false)}>Cancel</button>
            <button className="btn btn--primary btn--sm" onClick={saveEdit}>Save</button>
          </div>
        </div>
      ) : (
        <p className={`report-narrative ${isEmpty ? 'report-narrative--placeholder' : ''}`}>
          {content}
        </p>
      )}
    </section>
  );
}

// ── Cover ────────────────────────────────────────────────────────
function Cover({ state }: { state: AppState }) {
  const { project: p } = state;
  return (
    <div className="report-cover">
      <div className="report-cover__logo">A</div>
      <div className="report-cover__title">Demand Profiling Report</div>
      <div className="report-cover__sub">
        {p.projectName || 'Untitled Project'}
      </div>
      <dl className="report-cover__meta">
        <dt>Client</dt>        <dd>{p.clientName || '—'}</dd>
        <dt>Consultant</dt>    <dd>{p.consultantName || '—'}</dd>
        <dt>Organisation</dt>  <dd>{p.organisation || '—'}</dd>
        <dt>Reference</dt>     <dd>{p.referenceNumber || '—'}</dd>
        <dt>Date</dt>          <dd>{p.date || '—'}</dd>
      </dl>
      <div className="report-cover__status-badge">{p.reportStatus}</div>
    </div>
  );
}

// ── Key Findings ─────────────────────────────────────────────────
function KeyFindings({ calc }: { calc: CalculatedResults }) {
  const rows = [
    ['Total connected load',         `${fmt(calc.totalConnectedLoad)} kW`],
    ['Diversified demand',           `${fmt(calc.diversifiedKW)} kW`],
    ['Apparent power',               `${fmt(calc.kva)} kVA`],
    ['Operating hours / day',        `${fmt(calc.operatingHours)} h`],
    ['Annual energy consumption',    `${fmtInt(calc.annualEnergy)} kWh`],
    ['Annual electricity OPEX',      fmtGBP(calc.annualElectricityOPEX)],
    ['Annual water OPEX',            calc.waterOPEXStatus === 'calculated' ? fmtGBP(calc.annualWaterOPEX) : 'review required'],
    ['Total annual OPEX',            calc.waterOPEXStatus === 'calculated' ? fmtGBP(calc.totalAnnualOPEX) : 'review required'],
    ['Peak heat gain (net to HVAC)', calc.heatGainStatus === 'calculated' ? `${fmt(calc.peakHeatGainKW)} kW` : 'review required'],
  ];

  return (
    <section className="report-section">
      <div className="report-section-header">
        <div className="report-section-number">Section 2</div>
        <h2>Key Findings</h2>
      </div>
      <div className="table-wrap">
        <table className="table table--kf" style={{ maxWidth: 500 }}>
          <tbody>
            {rows.map(([label, value]) => (
              <tr key={label}>
                <td>{label}</td>
                <td style={{
                  textAlign: 'right',
                  color: value === 'review required' ? 'var(--warning)' : 'var(--text)',
                  fontVariantNumeric: 'tabular-nums',
                }}>
                  {value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

// ── Equipment Register ───────────────────────────────────────────
function EquipmentRegister({ state }: { state: AppState }) {
  const { equipment, calculated: calc } = state;
  if (!calc) return null;

  const loadById = new Map(calc.equipmentLoads.map((r) => [r.rowId, r.connectedLoad]));
  const heatById = new Map(calc.heatRows.map((r) => [r.rowId, r.status]));

  const chartData = calc.zoneTotals.map((z) => ({ name: z.zone, kW: z.kw }));

  return (
    <section className="report-section">
      <div className="report-section-header">
        <div className="report-section-number">Section 5</div>
        <h2>Equipment Register</h2>
      </div>
      <div className="table-wrap">
        <table className="table table--report">
          <thead>
            <tr>
              <th>Ref</th>
              <th>Description</th>
              <th style={{ textAlign: 'right' }}>Qty</th>
              <th style={{ textAlign: 'right' }}>kW Each</th>
              <th>Zone</th>
              <th>Type</th>
              <th style={{ textAlign: 'right' }}>Load kW</th>
              <th>Heat</th>
            </tr>
          </thead>
          <tbody>
            {equipment.map((row) => (
              <tr key={row.id}>
                <td>{row.ref}</td>
                <td>{row.description}</td>
                <td style={{ textAlign: 'right' }}>{row.qty}</td>
                <td style={{ textAlign: 'right' }}>{row.kwEach}</td>
                <td>{row.zone}</td>
                <td>{row.type}</td>
                <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                  {(loadById.get(row.id) ?? 0).toFixed(1)}
                </td>
                <td>
                  {heatById.get(row.id) === 'review_required' ? (
                    <span className="badge badge--warning">review</span>
                  ) : (
                    <span className="badge badge--success">✓</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: '1rem' }}>
        <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
          Connected load by zone (kW)
        </p>
        <div className="chart-wrap">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ left: 16, right: 24 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11 }} unit=" kW" />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={110} />
              <Tooltip formatter={(v) => [typeof v === 'number' ? `${v.toFixed(1)} kW` : '—', 'Connected load']} />
              <Bar dataKey="kW" radius={[0, 3, 3, 0]}>
                {chartData.map((_, i) => (
                  <Cell key={i} fill={i % 2 === 0 ? BURGUNDY : BURGUNDY2} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}

// ── Demand Profile ───────────────────────────────────────────────
function DemandProfile({ calc }: { calc: CalculatedResults }) {
  const chartData = [
    { name: 'Connected', kW: calc.totalConnectedLoad },
    { name: 'Diversified', kW: calc.diversifiedKW },
  ];

  return (
    <section className="report-section">
      <div className="report-section-header">
        <div className="report-section-number">Section 6</div>
        <h2>Demand Profile</h2>
      </div>

      <div className="table-wrap">
        <table className="table table--report" style={{ maxWidth: 480 }}>
          <thead>
            <tr>
              <th>Parameter</th>
              <th style={{ textAlign: 'right' }}>Value</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Total connected load</td>
              <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{fmt(calc.totalConnectedLoad)} kW</td>
              <td>Sum of all equipment</td>
            </tr>
            <tr>
              <td>Diversity factor</td>
              <td style={{ textAlign: 'right' }}>{calc.diversifiedKW > 0 ? (calc.diversifiedKW / calc.totalConnectedLoad).toFixed(2) : '—'}</td>
              <td>Applied simultaneously factor</td>
            </tr>
            <tr>
              <td>Diversified demand</td>
              <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{fmt(calc.diversifiedKW)} kW</td>
              <td>Design basis for M&amp;E</td>
            </tr>
            <tr>
              <td>Apparent power (kVA)</td>
              <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{fmt(calc.kva)} kVA</td>
              <td>At power factor {(calc.diversifiedKW / calc.kva).toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="chart-wrap chart-wrap--sm" style={{ maxWidth: 360 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} unit=" kW" />
            <Tooltip formatter={(v) => [typeof v === 'number' ? `${v.toFixed(1)} kW` : '—']} />
            <Bar dataKey="kW" radius={[3, 3, 0, 0]}>
              <Cell fill={BURGUNDY} />
              <Cell fill={SLATE} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

// ── OPEX Summary ─────────────────────────────────────────────────
function OPEXSummary({ calc }: { calc: CalculatedResults }) {
  const chartData = [
    { name: 'Electricity', value: calc.annualElectricityOPEX },
    ...(calc.waterOPEXStatus === 'calculated' && calc.annualWaterOPEX !== null
      ? [{ name: 'Water', value: calc.annualWaterOPEX }]
      : []),
  ];

  return (
    <section className="report-section">
      <div className="report-section-header">
        <div className="report-section-number">Section 7</div>
        <h2>MEP OPEX Summary</h2>
      </div>

      <div className="table-wrap">
        <table className="table table--report" style={{ maxWidth: 480 }}>
          <thead>
            <tr>
              <th>Utility</th>
              <th style={{ textAlign: 'right' }}>Annual Consumption</th>
              <th style={{ textAlign: 'right' }}>Annual OPEX</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Electricity</td>
              <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                {fmtInt(calc.annualEnergy)} kWh
              </td>
              <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                {fmtGBP(calc.annualElectricityOPEX)}
              </td>
            </tr>
            <tr>
              <td>Water</td>
              <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                {calc.waterOPEXStatus === 'calculated'
                  ? `${fmt(calc.annualWaterM3, 1)} m³`
                  : <span style={{ color: 'var(--warning)' }}>review required</span>}
              </td>
              <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                {calc.waterOPEXStatus === 'calculated'
                  ? fmtGBP(calc.annualWaterOPEX)
                  : <span style={{ color: 'var(--warning)' }}>review required</span>}
              </td>
            </tr>
            <tr style={{ fontWeight: 700 }}>
              <td>Total</td>
              <td />
              <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                {calc.waterOPEXStatus === 'calculated'
                  ? fmtGBP(calc.totalAnnualOPEX)
                  : <span style={{ color: 'var(--warning)' }}>review required</span>}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {chartData.length > 0 && (
        <div className="chart-wrap chart-wrap--sm" style={{ maxWidth: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `£${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => [typeof v === 'number' ? fmtGBP(v) : '—']} />
              <Bar dataKey="value" radius={[3, 3, 0, 0]}>
                <Cell fill={BURGUNDY} />
                <Cell fill={BURGUNDY2} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}

// ── Preview root ─────────────────────────────────────────────────
export function Preview({ state, dispatch }: Props) {
  const calc = state.calculated;
  const year = new Date().getFullYear();
  const { project: p } = state;
  const filename = `${p.referenceNumber || 'REF'}_${p.projectName.replace(/\s+/g, '_') || 'Project'}_DemandProfiling_${p.date || 'undated'}.pdf`;

  function handlePDF() {
    alert(
      `Save the print dialogue as:\n\n${filename}\n\nChoose "Save as PDF" in your browser's print dialogue.`,
    );
    window.print();
  }

  async function regenerateNarrative() {
    if (!calc) return;
    dispatch({ type: 'SET_NARRATIVE_STATUS', payload: 'loading' });
    try {
      const payload = buildNarrativePayload(state.project, state.equipment, state.assumptions, calc);
      const res = await fetch('/api/generate-narrative', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const narrative = await res.json() as NarrativeSections;
      dispatch({ type: 'SET_NARRATIVE', payload: narrative });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      dispatch({ type: 'SET_NARRATIVE_ERROR', payload: msg });
    }
  }

  if (!calc) {
    return (
      <div className="container" style={{ padding: '3rem 0' }}>
        <div className="alert alert--error">Calculation results not found. Please go back and generate again.</div>
        <button className="btn btn--secondary mt-md" onClick={() => dispatch({ type: 'GO_TO', payload: 'assumptions' })}>
          ← Back to assumptions
        </button>
      </div>
    );
  }

  const narrativeSections: { key: keyof NarrativeSections; title: string; num: string }[] = [
    { key: 'executiveSummary', title: 'Introduction',                     num: '3' },
    { key: 'methodology',      title: 'Methodology & Assumptions',        num: '4' },
    { key: 'conclusions',      title: 'Conclusions & Recommendations',    num: '8' },
  ];

  return (
    <>
      {/* Print footer — fixed, only visible in print */}
      <div className="print-footer">
        Draft — prepared for consultant review | Akrive Consulting Ltd | © {year} | Subject to M&amp;E engineer verification
      </div>

      {/* Screen-only: back nav */}
      <div className="container no-print" style={{ paddingTop: '1rem' }}>
        <button className="back-link" onClick={() => dispatch({ type: 'GO_TO', payload: 'assumptions' })}>
          ← Back to assumptions
        </button>
      </div>

      {/* Report body */}
      <div className="report-wrap">
        <Cover state={state} />

        <KeyFindings calc={calc} />

        <NarrativeSection
          sectionKey="executiveSummary"
          title="Introduction"
          num="3"
          text={state.narrative?.executiveSummary}
          narrativeStatus={state.narrativeStatus}
          dispatch={dispatch}
          onRegenerate={regenerateNarrative}
        />

        {/* Section 4: Methodology — narrative + assumptions table */}
        <section className="report-section">
          <div className="report-section-header">
            <div className="report-section-number">Section 4</div>
            <h2>Methodology &amp; Assumptions</h2>
          </div>
          <div className="narrative-controls no-print">
            <button
              className="btn btn--ghost btn--sm"
              onClick={() => {
                const el = document.getElementById('methodology-edit-btn');
                if (el) (el as HTMLButtonElement).click();
              }}
              style={{ display: 'none' }}
            />
          </div>
          {state.narrative?.methodology ? (
            <p className="report-narrative" style={{ marginBottom: '1.25rem' }}>
              {state.narrative.methodology}
            </p>
          ) : (
            <p className="report-narrative report-narrative--placeholder" style={{ marginBottom: '1.25rem' }}>
              [Section requires review — data incomplete]
            </p>
          )}

          <div className="table-wrap">
            <table className="table table--report" style={{ maxWidth: 500 }}>
              <thead>
                <tr><th>Assumption</th><th style={{ textAlign: 'right' }}>Value</th></tr>
              </thead>
              <tbody>
                {[
                  ['Operating days / year',    `${state.assumptions.operatingDays} days`],
                  ['Operating window',         `${state.assumptions.operatingStart} – ${state.assumptions.operatingEnd}`],
                  ['Diversity factor',         state.assumptions.diversityFactor.toString()],
                  ['Power factor',             state.assumptions.powerFactor.toString()],
                  ['Canopy capture ratio',     state.assumptions.canopyCapture.toString()],
                  ['Electricity tariff',       `£${state.assumptions.electricityTariff}/kWh`],
                  ['Water tariff',             `£${state.assumptions.waterTariff}/m³`],
                  ['Daily water consumption',  state.assumptions.dailyWaterLitres !== null ? `${state.assumptions.dailyWaterLitres} L` : 'not provided'],
                ].map(([k, v]) => (
                  <tr key={k}>
                    <td>{k}</td>
                    <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <EquipmentRegister state={state} />

        <DemandProfile calc={calc} />

        <OPEXSummary calc={calc} />

        <NarrativeSection
          sectionKey="conclusions"
          title="Conclusions &amp; Recommendations"
          num="8"
          text={state.narrative?.conclusions}
          narrativeStatus={state.narrativeStatus}
          dispatch={dispatch}
          onRegenerate={regenerateNarrative}
        />

        <div style={{ marginTop: '2rem', padding: '0.875rem 1rem', background: 'var(--surface)', borderRadius: 'var(--radius)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Draft — prepared for consultant review | Akrive Consulting Ltd | © {year} | Subject to M&amp;E engineer verification
        </div>
      </div>

      {/* Sticky bottom bar */}
      <div className="preview-bar no-print">
        <span className="preview-bar__draft">
          Draft — subject to M&amp;E engineer verification
        </span>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {narrativeSections.some((s) => !state.narrative?.[s.key]) && state.narrativeStatus !== 'loading' && (
            <button className="btn btn--ghost btn--sm" onClick={regenerateNarrative}>
              Regenerate narrative
            </button>
          )}
          <button className="btn btn--primary" onClick={handlePDF}>
            Download PDF
          </button>
        </div>
      </div>
    </>
  );
}
