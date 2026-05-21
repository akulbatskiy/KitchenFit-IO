import { describe, it, expect } from 'vitest';
import { calculate, calculateConnectedLoad, calculateZoneTotals } from './calculator';
import type { Assumptions, EquipmentRow } from './types';
import { DEFAULT_ASSUMPTIONS } from './types';

const baseAssumptions: Assumptions = {
  ...DEFAULT_ASSUMPTIONS,
  dailyWaterLitres: 4190,
};

function makeRow(
  overrides: Partial<EquipmentRow> & Pick<EquipmentRow, 'qty' | 'kwEach'>,
): EquipmentRow {
  return {
    id: overrides.id ?? 'r1',
    ref: overrides.ref ?? 'EQ-001',
    description: overrides.description ?? 'Item',
    zone: overrides.zone ?? 'Hot Production',
    type: overrides.type ?? 'general',
    qty: overrides.qty,
    kwEach: overrides.kwEach,
  };
}

describe('calculateConnectedLoad', () => {
  it('multiplies qty by kwEach', () => {
    expect(calculateConnectedLoad(makeRow({ qty: 3, kwEach: 10 }))).toBe(30);
  });

  it('rounds to 2 decimal places', () => {
    expect(calculateConnectedLoad(makeRow({ qty: 3, kwEach: 1.333 }))).toBe(4);
  });
});

describe('calculateZoneTotals', () => {
  it('groups rows by zone', () => {
    const rows: EquipmentRow[] = [
      makeRow({ id: 'r1', qty: 2, kwEach: 10, zone: 'Hot Production', type: 'general' }),
      makeRow({ id: 'r2', qty: 1, kwEach: 5, zone: 'Dishwash', type: 'dishwasher' }),
      makeRow({ id: 'r3', qty: 3, kwEach: 10, zone: 'Hot Production', type: 'fryer' }),
    ];
    const totals = calculateZoneTotals(rows);
    const hp = totals.find((z) => z.zone === 'Hot Production');
    const dw = totals.find((z) => z.zone === 'Dishwash');
    expect(hp?.kw).toBe(50);
    expect(dw?.kw).toBe(5);
  });
});

describe('calculate — AC-06 Ground Floor sample verification', () => {
  // AC-06: 194.0 kW total connected load (GF only sample)
  // diversified = 194.0 * 0.65 = 126.1 kW
  // kVA = 126.1 / 0.90 = 140.11 kVA
  // annual electricity OPEX = 126.1 * 10 * 250 * 0.22 = £69,355/year

  const gfRows: EquipmentRow[] = [
    makeRow({ id: 'r1', qty: 1, kwEach: 194, zone: 'Hot Production', type: 'general' }),
  ];

  it('calculates diversified demand', () => {
    const result = calculate(gfRows, { ...baseAssumptions, dailyWaterLitres: null });
    expect(result.totalConnectedLoad).toBe(194);
    expect(result.diversifiedKW).toBe(126.1);
  });

  it('calculates kVA', () => {
    const result = calculate(gfRows, { ...baseAssumptions, dailyWaterLitres: null });
    expect(result.kva).toBe(140.11);
  });

  it('calculates annual electricity OPEX', () => {
    // 126.1 kW * 10 hours * 250 days * £0.22/kWh = £69,355
    const result = calculate(gfRows, { ...baseAssumptions, dailyWaterLitres: null });
    expect(result.annualElectricityOPEX).toBe(69355);
  });
});

describe('calculate — operating hours', () => {
  it('calculates operating hours from start/end strings', () => {
    const rows = [makeRow({ qty: 1, kwEach: 10 })];
    const result = calculate(rows, baseAssumptions);
    expect(result.operatingHours).toBe(10); // 07:00 to 17:00
  });

  it('clamps to zero when end is before start', () => {
    const rows = [makeRow({ qty: 1, kwEach: 10 })];
    const result = calculate(rows, {
      ...baseAssumptions,
      operatingStart: '17:00',
      operatingEnd: '07:00',
    });
    expect(result.operatingHours).toBe(0);
    expect(result.dailyEnergy).toBe(0);
    expect(result.annualElectricityOPEX).toBe(0);
  });
});

describe('calculate — water OPEX', () => {
  it('calculates water OPEX when dailyWaterLitres is set', () => {
    const rows = [makeRow({ qty: 1, kwEach: 10 })];
    const result = calculate(rows, { ...baseAssumptions, dailyWaterLitres: 4190 });
    // 4190 * 250 / 1000 = 1047.5 m3
    expect(result.annualWaterM3).toBe(1047.5);
    // 1047.5 * 4.45 = 4661.38
    expect(result.annualWaterOPEX).toBe(4661.38);
    expect(result.waterOPEXStatus).toBe('calculated');
  });

  it('shows review_required when dailyWaterLitres is null', () => {
    const rows = [makeRow({ qty: 1, kwEach: 10 })];
    const result = calculate(rows, { ...baseAssumptions, dailyWaterLitres: null });
    expect(result.annualWaterM3).toBeNull();
    expect(result.annualWaterOPEX).toBeNull();
    expect(result.totalAnnualOPEX).toBeNull();
    expect(result.waterOPEXStatus).toBe('review_required');
  });
});

describe('calculate — heat gain', () => {
  it('calculates heat gain for known types', () => {
    const rows = [makeRow({ id: 'r1', qty: 1, kwEach: 10, type: 'fryer' })];
    const result = calculate(rows, baseAssumptions);
    expect(result.heatGainStatus).toBe('calculated');
    expect(result.peakHeatGainKW).not.toBeNull();
    // fryer: sensible 0.55 * (1 - 0.65); latent 0.30 per kW
    // 10 kW: sensible net = round2(10 * 0.55 * 0.35) = 1.92 (IEEE 754: 1-0.65 is just below 0.35)
    // latent = 3.0; total = 4.92
    expect(result.peakHeatGainKW).toBe(4.92);
  });

  it('sets review_required for other type', () => {
    const rows = [makeRow({ id: 'r1', qty: 1, kwEach: 10, type: 'other' })];
    const result = calculate(rows, baseAssumptions);
    expect(result.heatGainStatus).toBe('review_required');
    expect(result.peakHeatGainKW).toBeNull();
  });

  it('sets review_required when any row is other', () => {
    const rows = [
      makeRow({ id: 'r1', qty: 1, kwEach: 10, type: 'fryer' }),
      makeRow({ id: 'r2', qty: 1, kwEach: 5, type: 'other' }),
    ];
    const result = calculate(rows, baseAssumptions);
    expect(result.heatGainStatus).toBe('review_required');
    expect(result.peakHeatGainKW).toBeNull();
  });

  it('does not apply canopy capture to non-canopy equipment', () => {
    const rows = [makeRow({ id: 'r1', qty: 1, kwEach: 10, type: 'refrigeration' })];
    const result = calculate(rows, baseAssumptions);
    // refrigeration: sensible 0.90, latent 0.10, canopy false — no capture applied
    // sensible net = 10 * 0.90 = 9.0; latent = 10 * 0.10 = 1.0; total = 10.0
    expect(result.peakHeatGainKW).toBe(10);
    expect(result.heatGainStatus).toBe('calculated');
  });
});
