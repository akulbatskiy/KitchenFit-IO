import { type Dispatch, useState } from 'react';
import type { AppAction, AppState } from '../hooks/useReport';
import type { ColumnKey, ColumnMapping } from '../calculator/parser';
import { applyMapping, parseRawText, unmappedKeys } from '../calculator/parser';
import { calculateConnectedLoad } from '../calculator/calculator';
import {
  EQUIPMENT_TYPE_LABELS,
  EQUIPMENT_TYPES,
  ZONES,
  type EquipmentRow,
  type EquipmentType,
  type Zone,
} from '../calculator/types';

const COLUMN_LABELS: Record<ColumnKey, string> = {
  ref: 'Ref',
  description: 'Description',
  qty: 'Qty',
  kwEach: 'kW Each',
  zone: 'Zone',
};

let idCounter = 0;
function newId() { return `row-${++idCounter}-${Date.now()}`; }

function blankRow(): EquipmentRow {
  return { id: newId(), ref: '', description: '', qty: 1, kwEach: 0, zone: 'General', type: 'general' };
}

interface Props {
  state: AppState;
  dispatch: Dispatch<AppAction>;
}

// ── Step 1: Paste ────────────────────────────────────────────────
function PasteStep({ state, dispatch }: Props) {
  const [error, setError] = useState<string | null>(null);

  function handleConfirm() {
    setError(null);
    const text = state.rawText.trim();
    if (!text) { setError('Paste your equipment schedule first.'); return; }

    const result = parseRawText(text);
    if (result.rawRows.length === 0) { setError('No data rows detected. Check the pasted text.'); return; }

    dispatch({ type: 'SET_PARSE_RESULT', payload: result });

    if (result.unmapped.length === 0) {
      const { rows } = applyMapping(result.rawRows, result.mapping);
      dispatch({ type: 'SET_EQUIPMENT', payload: rows });
      dispatch({ type: 'SET_IMPORT_STEP', payload: 'table' });
    } else {
      dispatch({ type: 'SET_IMPORT_STEP', payload: 'mapping' });
    }
  }

  return (
    <div className="stack" style={{ gap: '1rem' }}>
      <div className="form-group">
        <label className="form-label" htmlFor="schedule-paste">
          Paste your equipment schedule here
        </label>
        <textarea
          id="schedule-paste"
          className="form-textarea"
          style={{ minHeight: 200 }}
          value={state.rawText}
          onChange={(e) => dispatch({ type: 'SET_RAW_TEXT', payload: e.target.value })}
          placeholder="Copy and paste rows from Excel or Google Sheets"
          spellCheck={false}
        />
        <span className="form-hint">Expected columns: Ref, Description, Qty, kW Each, Zone</span>
      </div>

      {error && <div className="alert alert--error">{error}</div>}

      <div className="row-end">
        <button className="btn btn--secondary" onClick={() => dispatch({ type: 'GO_TO', payload: 'landing' })}>
          Cancel
        </button>
        <button className="btn btn--primary" onClick={handleConfirm} disabled={!state.rawText.trim()}>
          Confirm import →
        </button>
      </div>
    </div>
  );
}

// ── Step 2: Column mapping ───────────────────────────────────────
function MappingStep({ state, dispatch }: Props) {
  const headers = state.parseResult?.headers ?? [];

  function updateMapping(key: ColumnKey, idx: number | null) {
    dispatch({ type: 'SET_IMPORT_MAPPING', payload: { ...state.importMapping, [key]: idx } });
  }

  function handleConfirm() {
    if (!state.parseResult) return;
    const still = unmappedKeys(state.importMapping).filter((k) => k !== 'ref' && k !== 'zone');
    if (still.length > 0) return;
    const { rows } = applyMapping(state.parseResult.rawRows, state.importMapping);
    dispatch({ type: 'SET_EQUIPMENT', payload: rows });
    dispatch({ type: 'SET_IMPORT_STEP', payload: 'table' });
  }

  const required: ColumnKey[] = ['description', 'qty', 'kwEach'];
  const allRequiredMapped = required.every((k) => state.importMapping[k] !== null);

  return (
    <div className="stack" style={{ gap: '1rem' }}>
      <div className="alert alert--info">
        Some columns could not be detected automatically. Map them below.
      </div>

      <div className="card">
        {(Object.keys(COLUMN_LABELS) as ColumnKey[]).map((key) => (
          <div className="mapping-row" key={key}>
            <span className="mapping-col-label">
              {COLUMN_LABELS[key]}
              {required.includes(key) && <span style={{ color: 'var(--error)' }}> *</span>}
            </span>
            <span className="mapping-col-arrow">→</span>
            <select
              className="form-select"
              value={state.importMapping[key] ?? ''}
              onChange={(e) => {
                const v = e.target.value;
                updateMapping(key, v === '' ? null : Number(v));
              }}
            >
              <option value="">— not mapped —</option>
              {headers.map((h, i) => (
                <option key={i} value={i}>{h || `Column ${i + 1}`}</option>
              ))}
            </select>
          </div>
        ))}
      </div>

      <div className="row-end">
        <button className="btn btn--secondary" onClick={() => dispatch({ type: 'SET_IMPORT_STEP', payload: 'paste' })}>
          ← Back
        </button>
        <button className="btn btn--primary" disabled={!allRequiredMapped} onClick={handleConfirm}>
          Confirm mapping →
        </button>
      </div>
    </div>
  );
}

// ── Step 3: Editable table ───────────────────────────────────────
function TableStep({ state, dispatch }: Props) {
  const rows = state.equipment;

  const totalLoad = rows.reduce((s, r) => s + calculateConnectedLoad(r), 0);
  const zoneCount = new Set(rows.map((r) => r.zone)).size;
  const reviewRows = rows.filter((r) => r.type === 'other' || !r.type).length;

  function updateRow(id: string, patch: Partial<EquipmentRow>) {
    dispatch({ type: 'UPDATE_ROW', payload: { id, patch } });
  }

  return (
    <div className="stack" style={{ gap: '1rem' }}>
      <div className="import-summary">
        Connected load detected:{' '}
        <strong>{totalLoad.toFixed(1)} kW</strong> across{' '}
        <strong>{zoneCount} zone{zoneCount !== 1 ? 's' : ''}</strong>
        {reviewRows > 0 && (
          <span className="badge badge--warning" style={{ marginLeft: '0.75rem' }}>
            {reviewRows} row{reviewRows !== 1 ? 's' : ''} need type
          </span>
        )}
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th style={{ width: 80 }}>Ref</th>
              <th>Description</th>
              <th style={{ width: 55 }}>Qty</th>
              <th style={{ width: 75 }}>kW Each</th>
              <th style={{ width: 150 }}>Zone</th>
              <th style={{ width: 160 }}>Type</th>
              <th style={{ width: 75 }}>Load kW</th>
              <th style={{ width: 40 }}></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const load = calculateConnectedLoad(row);
              const needsType = row.type === 'other';
              return (
                <tr key={row.id}>
                  <td>
                    <input
                      value={row.ref}
                      onChange={(e) => updateRow(row.id, { ref: e.target.value })}
                    />
                  </td>
                  <td>
                    <input
                      value={row.description}
                      onChange={(e) => updateRow(row.id, { description: e.target.value })}
                      style={{ minWidth: 160 }}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      min={1}
                      value={row.qty}
                      onChange={(e) => updateRow(row.id, { qty: Number(e.target.value) })}
                      style={{ minWidth: 50 }}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      min={0}
                      step={0.1}
                      value={row.kwEach}
                      onChange={(e) => updateRow(row.id, { kwEach: Number(e.target.value) })}
                      style={{ minWidth: 60 }}
                    />
                  </td>
                  <td>
                    <select
                      value={row.zone}
                      onChange={(e) => updateRow(row.id, { zone: e.target.value as Zone })}
                    >
                      {ZONES.map((z) => <option key={z} value={z}>{z}</option>)}
                    </select>
                  </td>
                  <td>
                    <select
                      value={row.type}
                      onChange={(e) => updateRow(row.id, { type: e.target.value as EquipmentType })}
                      style={{ borderColor: needsType ? 'var(--warning)' : undefined }}
                    >
                      {EQUIPMENT_TYPES.map((t) => (
                        <option key={t} value={t}>{EQUIPMENT_TYPE_LABELS[t]}</option>
                      ))}
                    </select>
                    {needsType && (
                      <span className="badge badge--warning" style={{ marginTop: 3 }}>
                        review required
                      </span>
                    )}
                  </td>
                  <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                    {load.toFixed(1)}
                  </td>
                  <td>
                    <button
                      className="btn btn--xs"
                      style={{ color: 'var(--error)', background: 'none', border: 'none' }}
                      onClick={() => dispatch({ type: 'DELETE_ROW', payload: row.id })}
                      title="Remove row"
                    >
                      ×
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <button
          className="btn btn--secondary btn--sm"
          onClick={() => dispatch({ type: 'ADD_ROW', payload: blankRow() })}
        >
          + Add row
        </button>
        <div className="row-end">
          <button className="btn btn--secondary" onClick={() => dispatch({ type: 'SET_IMPORT_STEP', payload: 'paste' })}>
            ← Re-import
          </button>
          <button
            className="btn btn--primary"
            disabled={rows.length === 0}
            onClick={() => dispatch({ type: 'GO_TO', payload: 'assumptions' })}
          >
            Continue to assumptions →
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Root import component ────────────────────────────────────────
export function Import({ state, dispatch }: Props) {
  const stepLabels = ['1. Paste', '2. Map columns', '3. Review'];
  const stepIndex = state.importStep === 'paste' ? 0 : state.importStep === 'mapping' ? 1 : 2;

  return (
    <main className="page">
      <div className="container">
        <div className="page-header">
          <button className="back-link" onClick={() => dispatch({ type: 'GO_TO', payload: 'landing' })}>
            ← Back
          </button>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.25rem' }}>
            Import Equipment Schedule
          </h1>
          <div className="row" style={{ gap: '1.25rem', marginTop: '0.75rem' }}>
            {stepLabels.map((label, i) => (
              <span
                key={label}
                style={{
                  fontSize: '0.8rem',
                  fontWeight: i === stepIndex ? 700 : 400,
                  color: i === stepIndex ? 'var(--burgundy)' : 'var(--text-faint)',
                }}
              >
                {label}
              </span>
            ))}
          </div>
        </div>

        {state.importStep === 'paste'   && <PasteStep   state={state} dispatch={dispatch} />}
        {state.importStep === 'mapping' && <MappingStep state={state} dispatch={dispatch} />}
        {state.importStep === 'table'   && <TableStep   state={state} dispatch={dispatch} />}
      </div>
    </main>
  );
}
