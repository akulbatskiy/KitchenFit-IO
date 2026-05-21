import type { Dispatch } from 'react';
import type { AppAction, AppState } from '../hooks/useReport';
import type { Assumptions as AssumptionsType, Project } from '../calculator/types';

interface Props {
  state: AppState;
  dispatch: Dispatch<AppAction>;
}

export function Assumptions({ state, dispatch }: Props) {
  const { project: p, assumptions: a } = state;

  function setP(patch: Partial<Project>) {
    dispatch({ type: 'UPDATE_PROJECT', payload: patch });
  }
  function setA(patch: Partial<AssumptionsType>) {
    dispatch({ type: 'UPDATE_ASSUMPTIONS', payload: patch });
  }

  const canGenerate =
    p.projectName.trim() !== '' &&
    p.clientName.trim() !== '' &&
    p.consultantName.trim() !== '' &&
    p.referenceNumber.trim() !== '' &&
    state.equipment.length > 0;

  const from = state.equipment.length > 0 ? 'import' : null;

  return (
    <main className="page">
      <div className="container">
        <div className="page-header">
          {from && (
            <button
              className="back-link"
              onClick={() => dispatch({ type: 'GO_TO', payload: from as 'import' })}
            >
              ← Back
            </button>
          )}
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.25rem' }}>
            Confirm Project Details &amp; Assumptions
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            {state.equipment.length} equipment rows loaded.
          </p>
        </div>

        <div className="form-grid-2" style={{ gap: '1.5rem', alignItems: 'start' }}>
          {/* Left — project details */}
          <div className="card stack" style={{ gap: '0.875rem' }}>
            <p style={{ fontSize: '0.8125rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--burgundy)', marginBottom: '0.25rem' }}>
              Project Details
            </p>

            <div className="form-group">
              <label className="form-label" htmlFor="project-name">Project name *</label>
              <input className="form-input" id="project-name" value={p.projectName}
                onChange={(e) => setP({ projectName: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="client-name">Client name *</label>
              <input className="form-input" id="client-name" value={p.clientName}
                onChange={(e) => setP({ clientName: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="consultant-name">Consultant name *</label>
              <input className="form-input" id="consultant-name" value={p.consultantName}
                onChange={(e) => setP({ consultantName: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="organisation">Organisation</label>
              <input className="form-input" id="organisation" value={p.organisation}
                onChange={(e) => setP({ organisation: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="ref-number">Reference number *</label>
              <input className="form-input" id="ref-number" value={p.referenceNumber}
                onChange={(e) => setP({ referenceNumber: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="report-status">Report status</label>
              <select className="form-select" id="report-status" value={p.reportStatus}
                onChange={(e) => setP({ reportStatus: e.target.value as typeof p.reportStatus })}>
                <option>Draft</option>
                <option>Issued for MEP Design</option>
                <option>Final</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="report-date">Date</label>
              <input className="form-input" type="date" id="report-date" value={p.date}
                onChange={(e) => setP({ date: e.target.value })} />
            </div>
          </div>

          {/* Right — engineering assumptions */}
          <div className="card stack" style={{ gap: '0.875rem' }}>
            <p style={{ fontSize: '0.8125rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--burgundy)', marginBottom: '0.25rem' }}>
              Engineering Assumptions
            </p>

            <div className="form-group">
              <label className="form-label" htmlFor="op-days">Operating days / year</label>
              <input className="form-input" type="number" id="op-days" value={a.operatingDays}
                onChange={(e) => setA({ operatingDays: Number(e.target.value) })} />
            </div>
            <div className="form-grid-2" style={{ gap: '0.75rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="op-start">Operating start</label>
                <input className="form-input" type="time" id="op-start" value={a.operatingStart}
                  onChange={(e) => setA({ operatingStart: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="op-end">Operating end</label>
                <input className="form-input" type="time" id="op-end" value={a.operatingEnd}
                  onChange={(e) => setA({ operatingEnd: e.target.value })} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="diversity">Diversity factor</label>
              <input className="form-input" type="number" id="diversity" step={0.01} min={0} max={1}
                value={a.diversityFactor}
                onChange={(e) => setA({ diversityFactor: Number(e.target.value) })} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="elec-tariff">Electricity tariff £/kWh</label>
              <input className="form-input" type="number" id="elec-tariff" step={0.01} min={0}
                value={a.electricityTariff}
                onChange={(e) => setA({ electricityTariff: Number(e.target.value) })} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="water-tariff">Water tariff £/m³</label>
              <input className="form-input" type="number" id="water-tariff" step={0.01} min={0}
                value={a.waterTariff}
                onChange={(e) => setA({ waterTariff: Number(e.target.value) })} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="pf">Power factor</label>
              <input className="form-input" type="number" id="pf" step={0.01} min={0} max={1}
                value={a.powerFactor}
                onChange={(e) => setA({ powerFactor: Number(e.target.value) })} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="canopy">Canopy capture ratio</label>
              <input className="form-input" type="number" id="canopy" step={0.01} min={0} max={1}
                value={a.canopyCapture}
                onChange={(e) => setA({ canopyCapture: Number(e.target.value) })} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="water-litres">
                Daily water consumption, litres
              </label>
              <input
                className="form-input"
                type="number"
                id="water-litres"
                placeholder="Optional — leave blank if unknown"
                value={a.dailyWaterLitres ?? ''}
                onChange={(e) => setA({ dailyWaterLitres: e.target.value === '' ? null : Number(e.target.value) })}
              />
              <span className="form-hint">
                If blank, water OPEX will show <em>review required</em> in the report.
              </span>
            </div>
          </div>
        </div>

        <div className="row-end" style={{ marginTop: '1.5rem', paddingBottom: '2rem' }}>
          {!canGenerate && (
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Complete required fields (*) to continue
            </span>
          )}
          <button
            className="btn btn--primary"
            disabled={!canGenerate}
            onClick={() => dispatch({ type: 'GO_TO', payload: 'generate' })}
          >
            Generate report →
          </button>
        </div>
      </div>
    </main>
  );
}
