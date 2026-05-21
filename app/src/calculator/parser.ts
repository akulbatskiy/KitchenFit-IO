import type { EquipmentRow, EquipmentType, Zone } from './types';
import { ZONES } from './types';

export type ColumnKey = 'ref' | 'description' | 'qty' | 'kwEach' | 'zone';

export interface ColumnMapping {
  ref: number | null;
  description: number | null;
  qty: number | null;
  kwEach: number | null;
  zone: number | null;
}

export interface ParseResult {
  headers: string[];
  rawRows: string[][];
  mapping: ColumnMapping;
  unmapped: ColumnKey[];
}

export interface MappedRow {
  id: string;
  ref: string;
  description: string;
  qty: number;
  kwEach: number;
  zone: Zone;
  type: EquipmentType;
  parseWarning?: string;
}

export interface MapRowsResult {
  rows: MappedRow[];
  skipped: number;
}

// Header aliases used for auto-detection — order is priority
const HEADER_ALIASES: Record<ColumnKey, string[]> = {
  ref:         ['ref', 'reference', 'item no', 'item no.', 'no.', 'no', 'item ref'],
  description: ['description', 'desc', 'equipment', 'item description', 'item', 'name'],
  qty:         ['qty', 'quantity', 'count', 'no off', 'no. off', 'nr'],
  kwEach:      ['kw each', 'kw/each', 'kw', 'kilowatts', 'power (kw)', 'connected load (kw)', 'load kw', 'kw ea'],
  zone:        ['zone', 'area', 'location', 'section'],
};

function detectDelimiter(text: string): '\t' | ',' {
  const firstLine = text.split('\n')[0] ?? '';
  const tabs = (firstLine.match(/\t/g) ?? []).length;
  const commas = (firstLine.match(/,/g) ?? []).length;
  return tabs >= commas ? '\t' : ',';
}

function parseLine(line: string, delimiter: '\t' | ','): string[] {
  if (delimiter === '\t') {
    return line.split('\t').map((c) => c.trim());
  }
  // Simple CSV split — handles quoted fields
  const cells: string[] = [];
  let current = '';
  let inQuote = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuote = !inQuote;
    } else if (ch === ',' && !inQuote) {
      cells.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  cells.push(current.trim());
  return cells;
}

function detectMapping(headers: string[]): ColumnMapping {
  const normalised = headers.map((h) => h.toLowerCase().trim());
  const result: ColumnMapping = { ref: null, description: null, qty: null, kwEach: null, zone: null };

  for (const [key, aliases] of Object.entries(HEADER_ALIASES) as [ColumnKey, string[]][]) {
    for (const alias of aliases) {
      const idx = normalised.indexOf(alias);
      if (idx !== -1) {
        result[key] = idx;
        break;
      }
    }
  }
  return result;
}

export function unmappedKeys(mapping: ColumnMapping): ColumnKey[] {
  return (Object.keys(mapping) as ColumnKey[]).filter((k) => mapping[k] === null);
}

export function parseRawText(text: string): ParseResult {
  const delimiter = detectDelimiter(text);
  const lines = text
    .split('\n')
    .map((l) => l.replace(/\r$/, ''))
    .filter((l) => l.trim() !== '');

  if (lines.length === 0) {
    return { headers: [], rawRows: [], mapping: { ref: null, description: null, qty: null, kwEach: null, zone: null }, unmapped: ['ref', 'description', 'qty', 'kwEach', 'zone'] };
  }

  const headers = parseLine(lines[0], delimiter);
  const rawRows = lines.slice(1).map((l) => parseLine(l, delimiter));
  const mapping = detectMapping(headers);
  const unmapped = unmappedKeys(mapping);

  return { headers, rawRows, mapping, unmapped };
}

function matchZone(raw: string): Zone | null {
  const norm = raw.toLowerCase().trim();
  for (const zone of ZONES) {
    if (zone.toLowerCase() === norm) return zone;
  }
  return null;
}

let rowCounter = 0;
function nextId(): string {
  return `import-${++rowCounter}-${Date.now()}`;
}

export function applyMapping(rawRows: string[][], mapping: ColumnMapping): MapRowsResult {
  let skipped = 0;
  const rows: MappedRow[] = [];

  for (const cells of rawRows) {
    const get = (col: number | null) => (col !== null ? (cells[col] ?? '').trim() : '');

    const ref = get(mapping.ref);
    const description = get(mapping.description);
    const qtyRaw = get(mapping.qty);
    const kwRaw = get(mapping.kwEach);
    const zoneRaw = get(mapping.zone);

    if (!description && !ref) { skipped++; continue; }

    const qty = parseFloat(qtyRaw);
    const kwEach = parseFloat(kwRaw);

    if (isNaN(qty) || qty <= 0 || isNaN(kwEach) || kwEach <= 0) { skipped++; continue; }

    const zone = matchZone(zoneRaw) ?? 'General';
    const parseWarning = matchZone(zoneRaw) === null && zoneRaw !== ''
      ? `Zone "${zoneRaw}" not recognised — defaulted to General`
      : undefined;

    rows.push({
      id: nextId(),
      ref,
      description,
      qty,
      kwEach,
      zone,
      type: 'general',
      parseWarning,
    });
  }

  return { rows, skipped };
}
