import type { Assumptions, CalculatedResults, EquipmentRow, Project } from './types';

export interface NarrativePayload {
  project: {
    name: string;
    client: string;
    consultant: string;
    organisation: string;
    reference: string;
    status: string;
    date: string;
  };
  assumptions: {
    operatingDays: number;
    operatingHours: number;
    diversityFactor: number;
    electricityTariff: number;
    waterTariff: number;
    powerFactor: number;
    canopyCapture: number;
    dailyWaterLitres: number | null;
  };
  calculated: {
    totalConnectedLoadKW: number;
    zoneBreakdown: { zone: string; kw: number }[];
    diversifiedKW: number;
    kva: number;
    annualEnergyKWh: number;
    annualElectricityOPEX: number;
    annualWaterM3: number | null;
    annualWaterOPEX: number | null;
    totalAnnualOPEX: number | null;
    peakHeatGainKW: number | null;
    heatGainStatus: string;
    waterOPEXStatus: string;
  };
  equipmentSummary: {
    totalItems: number;
    rowsWithReviewRequired: number;
  };
}

export function buildNarrativePayload(
  project: Project,
  equipment: EquipmentRow[],
  assumptions: Assumptions,
  calculated: CalculatedResults,
): NarrativePayload {
  const rowsWithReviewRequired = calculated.heatRows.filter(
    (r) => r.status === 'review_required',
  ).length;

  return {
    project: {
      name: project.projectName,
      client: project.clientName,
      consultant: project.consultantName,
      organisation: project.organisation,
      reference: project.referenceNumber,
      status: project.reportStatus,
      date: project.date,
    },
    assumptions: {
      operatingDays: assumptions.operatingDays,
      operatingHours: calculated.operatingHours,
      diversityFactor: assumptions.diversityFactor,
      electricityTariff: assumptions.electricityTariff,
      waterTariff: assumptions.waterTariff,
      powerFactor: assumptions.powerFactor,
      canopyCapture: assumptions.canopyCapture,
      dailyWaterLitres: assumptions.dailyWaterLitres,
    },
    calculated: {
      totalConnectedLoadKW: calculated.totalConnectedLoad,
      zoneBreakdown: calculated.zoneTotals,
      diversifiedKW: calculated.diversifiedKW,
      kva: calculated.kva,
      annualEnergyKWh: calculated.annualEnergy,
      annualElectricityOPEX: calculated.annualElectricityOPEX,
      annualWaterM3: calculated.annualWaterM3,
      annualWaterOPEX: calculated.annualWaterOPEX,
      totalAnnualOPEX: calculated.totalAnnualOPEX,
      peakHeatGainKW: calculated.peakHeatGainKW,
      heatGainStatus: calculated.heatGainStatus,
      waterOPEXStatus: calculated.waterOPEXStatus,
    },
    equipmentSummary: {
      totalItems: equipment.length,
      rowsWithReviewRequired,
    },
  };
}
