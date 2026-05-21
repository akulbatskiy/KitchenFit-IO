import type {
  Assumptions,
  CalculatedResults,
  EquipmentHeatResult,
  EquipmentRow,
  ZoneTotal,
} from './types';
import { getHeatRule } from './heatRules';

function parseTimeToHours(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h + m / 60;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function calculateConnectedLoad(row: EquipmentRow): number {
  return round2(row.qty * row.kwEach);
}

export function calculateZoneTotals(
  rows: EquipmentRow[],
): ZoneTotal[] {
  const map = new Map<string, number>();
  for (const row of rows) {
    const load = calculateConnectedLoad(row);
    map.set(row.zone, (map.get(row.zone) ?? 0) + load);
  }
  return Array.from(map.entries()).map(([zone, kw]) => ({
    zone: zone as ZoneTotal['zone'],
    kw: round2(kw),
  }));
}

export function calculateHeatGain(
  rows: EquipmentRow[],
  canopyCapture: number,
): {
  heatRows: EquipmentHeatResult[];
  peakHeatGainKW: number | null;
  status: 'calculated' | 'review_required';
} {
  let totalSensible = 0;
  let totalLatent = 0;
  let hasReviewRequired = false;

  const heatRows: EquipmentHeatResult[] = rows.map((row) => {
    const connectedLoad = calculateConnectedLoad(row);
    const rule = getHeatRule(row.type);

    if (rule === null) {
      hasReviewRequired = true;
      return {
        rowId: row.id,
        connectedLoad,
        sensibleKW: null,
        latentKW: null,
        netToHvacKW: null,
        status: 'review_required',
      };
    }

    const kw = connectedLoad;
    const sensibleKW = round2(kw * rule.sensible * (rule.canopy ? 1 - canopyCapture : 1));
    const latentKW = round2(kw * rule.latent);

    totalSensible += sensibleKW;
    totalLatent += latentKW;

    return {
      rowId: row.id,
      connectedLoad,
      sensibleKW,
      latentKW,
      netToHvacKW: round2(sensibleKW + latentKW),
      status: 'calculated',
    };
  });

  return {
    heatRows,
    peakHeatGainKW: hasReviewRequired ? null : round2(totalSensible + totalLatent),
    status: hasReviewRequired ? 'review_required' : 'calculated',
  };
}

export function calculate(
  rows: EquipmentRow[],
  assumptions: Assumptions,
): CalculatedResults {
  const equipmentLoads = rows.map((row) => ({
    rowId: row.id,
    connectedLoad: calculateConnectedLoad(row),
  }));

  const totalConnectedLoad = round2(
    equipmentLoads.reduce((sum, r) => sum + r.connectedLoad, 0),
  );

  const zoneTotals = calculateZoneTotals(rows);

  const diversifiedKW = round2(totalConnectedLoad * assumptions.diversityFactor);
  const kva = round2(diversifiedKW / assumptions.powerFactor);

  const startH = parseTimeToHours(assumptions.operatingStart);
  const endH = parseTimeToHours(assumptions.operatingEnd);
  const operatingHours = round2(endH - startH);

  const dailyEnergy = round2(diversifiedKW * operatingHours);
  const annualEnergy = round2(dailyEnergy * assumptions.operatingDays);
  const annualElectricityOPEX = round2(annualEnergy * assumptions.electricityTariff);

  let annualWaterM3: number | null = null;
  let annualWaterOPEX: number | null = null;
  let totalAnnualOPEX: number | null = null;
  let waterOPEXStatus: CalculatedResults['waterOPEXStatus'] = 'review_required';

  if (assumptions.dailyWaterLitres !== null && assumptions.dailyWaterLitres > 0) {
    annualWaterM3 = round2((assumptions.dailyWaterLitres * assumptions.operatingDays) / 1000);
    annualWaterOPEX = round2(annualWaterM3 * assumptions.waterTariff);
    totalAnnualOPEX = round2(annualElectricityOPEX + annualWaterOPEX);
    waterOPEXStatus = 'calculated';
  }

  const { heatRows, peakHeatGainKW, status: heatGainStatus } = calculateHeatGain(
    rows,
    assumptions.canopyCapture,
  );

  return {
    equipmentLoads,
    totalConnectedLoad,
    zoneTotals,
    diversifiedKW,
    kva,
    operatingHours,
    dailyEnergy,
    annualEnergy,
    annualElectricityOPEX,
    annualWaterM3,
    annualWaterOPEX,
    totalAnnualOPEX,
    peakHeatGainKW,
    heatGainStatus,
    waterOPEXStatus,
    heatRows,
  };
}
