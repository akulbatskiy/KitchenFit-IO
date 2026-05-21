import { describe, it, expect } from 'vitest';
import { parseRawText, applyMapping, unmappedKeys } from './parser';

const TSV_WITH_HEADERS = `Ref\tDescription\tQty\tkW Each\tZone
GF-01\tCombi Oven\t3\t12\tHot Production
GF-02\tFryer\t2\t15\tDishwash`;

const CSV_WITH_HEADERS = `Ref,Description,Qty,kW Each,Zone
GF-01,Combi Oven,3,12,Hot Production
GF-02,Fryer,2,15,Dishwash`;

const TSV_ALIAS_HEADERS = `Item Ref\tItem Description\tQuantity\tKW\tArea
A1\tOven\t1\t10\tHot Production`;

const TSV_MISSING_ZONE = `Ref\tDescription\tQty\tkW Each
GF-01\tCombi Oven\t3\t12`;

describe('parseRawText — delimiter detection', () => {
  it('detects tab delimiter', () => {
    const result = parseRawText(TSV_WITH_HEADERS);
    expect(result.mapping.ref).not.toBeNull();
    expect(result.rawRows).toHaveLength(2);
  });

  it('detects comma delimiter', () => {
    const result = parseRawText(CSV_WITH_HEADERS);
    expect(result.mapping.ref).not.toBeNull();
    expect(result.rawRows).toHaveLength(2);
  });
});

describe('parseRawText — header detection', () => {
  it('maps standard headers', () => {
    const result = parseRawText(TSV_WITH_HEADERS);
    expect(result.mapping.ref).toBe(0);
    expect(result.mapping.description).toBe(1);
    expect(result.mapping.qty).toBe(2);
    expect(result.mapping.kwEach).toBe(3);
    expect(result.mapping.zone).toBe(4);
    expect(result.unmapped).toHaveLength(0);
  });

  it('maps alias headers', () => {
    const result = parseRawText(TSV_ALIAS_HEADERS);
    expect(result.unmapped).toHaveLength(0);
  });

  it('identifies unmapped columns', () => {
    const result = parseRawText(TSV_MISSING_ZONE);
    expect(result.unmapped).toContain('zone');
  });
});

describe('applyMapping — row conversion', () => {
  it('converts TSV rows correctly', () => {
    const parsed = parseRawText(TSV_WITH_HEADERS);
    const { rows, skipped } = applyMapping(parsed.rawRows, parsed.mapping);
    expect(skipped).toBe(0);
    expect(rows).toHaveLength(2);
    expect(rows[0].ref).toBe('GF-01');
    expect(rows[0].description).toBe('Combi Oven');
    expect(rows[0].qty).toBe(3);
    expect(rows[0].kwEach).toBe(12);
    expect(rows[0].zone).toBe('Hot Production');
    expect(rows[0].type).toBe('general');
  });

  it('defaults unrecognised zone to General with a warning', () => {
    const parsed = parseRawText(TSV_WITH_HEADERS);
    // Override zone column value to something unrecognised
    const fakeRows = [['X-01', 'Widget', '1', '5', 'Basement']];
    const { rows } = applyMapping(fakeRows, parsed.mapping);
    expect(rows[0].zone).toBe('General');
    expect(rows[0].parseWarning).toMatch(/not recognised/i);
  });

  it('skips rows with invalid qty or kW', () => {
    const fakeRows = [['X-01', 'Bad Row', 'abc', 'xyz', 'General']];
    const parsed = parseRawText(TSV_WITH_HEADERS);
    const { rows, skipped } = applyMapping(fakeRows, parsed.mapping);
    expect(rows).toHaveLength(0);
    expect(skipped).toBe(1);
  });

  it('skips entirely blank rows', () => {
    const fakeRows = [['', '', '', '', '']];
    const parsed = parseRawText(TSV_WITH_HEADERS);
    const { skipped } = applyMapping(fakeRows, parsed.mapping);
    expect(skipped).toBe(1);
  });
});

describe('unmappedKeys', () => {
  it('returns empty array when all columns are mapped', () => {
    const parsed = parseRawText(TSV_WITH_HEADERS);
    expect(unmappedKeys(parsed.mapping)).toHaveLength(0);
  });

  it('returns missing columns', () => {
    const parsed = parseRawText(TSV_MISSING_ZONE);
    expect(unmappedKeys(parsed.mapping)).toContain('zone');
  });
});
