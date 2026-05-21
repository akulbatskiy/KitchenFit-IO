export type EquipmentType =
  | 'combi_oven'
  | 'fryer'
  | 'induction_hob'
  | 'griddle'
  | 'dishwasher'
  | 'glasswasher'
  | 'refrigeration'
  | 'display_fridge'
  | 'beverage'
  | 'ice_maker'
  | 'warmers'
  | 'general'
  | 'other';

export type Zone =
  | 'Hot Production'
  | 'Servery FOH'
  | 'Kitchen BOH'
  | 'Preparation'
  | 'Dishwash'
  | 'Beverages'
  | 'General';

export type ReportStatus = 'Draft' | 'Issued for MEP Design' | 'Final';

export interface EquipmentRow {
  id: string;
  ref: string;
  description: string;
  qty: number;
  kwEach: number;
  zone: Zone;
  type: EquipmentType;
}

export interface Project {
  projectName: string;
  clientName: string;
  consultantName: string;
  organisation: string;
  referenceNumber: string;
  reportStatus: ReportStatus;
  date: string;
}

export interface Assumptions {
  operatingDays: number;
  operatingStart: string;
  operatingEnd: string;
  diversityFactor: number;
  electricityTariff: number;
  waterTariff: number;
  powerFactor: number;
  canopyCapture: number;
  dailyWaterLitres: number | null;
}

export interface ZoneTotal {
  zone: Zone;
  kw: number;
}

export type HeatGainStatus = 'calculated' | 'review_required';
export type WaterOPEXStatus = 'calculated' | 'review_required';

export interface EquipmentHeatResult {
  rowId: string;
  connectedLoad: number;
  sensibleKW: number | null;
  latentKW: number | null;
  netToHvacKW: number | null;
  status: HeatGainStatus;
}

export interface CalculatedResults {
  equipmentLoads: { rowId: string; connectedLoad: number }[];
  totalConnectedLoad: number;
  zoneTotals: ZoneTotal[];
  diversifiedKW: number;
  kva: number;
  operatingHours: number;
  dailyEnergy: number;
  annualEnergy: number;
  annualElectricityOPEX: number;
  annualWaterM3: number | null;
  annualWaterOPEX: number | null;
  totalAnnualOPEX: number | null;
  peakHeatGainKW: number | null;
  heatGainStatus: HeatGainStatus;
  waterOPEXStatus: WaterOPEXStatus;
  heatRows: EquipmentHeatResult[];
}

export interface NarrativeSections {
  methodology: string;
  executiveSummary: string;
  assumptions: string;
  conclusions: string;
}

export interface Report {
  project: Project;
  equipment: EquipmentRow[];
  assumptions: Assumptions;
  calculated: CalculatedResults;
  narrative: NarrativeSections | null;
}

export const EQUIPMENT_TYPES: EquipmentType[] = [
  'combi_oven',
  'fryer',
  'induction_hob',
  'griddle',
  'dishwasher',
  'glasswasher',
  'refrigeration',
  'display_fridge',
  'beverage',
  'ice_maker',
  'warmers',
  'general',
  'other',
];

export const EQUIPMENT_TYPE_LABELS: Record<EquipmentType, string> = {
  combi_oven: 'Combi Oven',
  fryer: 'Fryer',
  induction_hob: 'Induction Hob',
  griddle: 'Griddle',
  dishwasher: 'Dishwasher',
  glasswasher: 'Glasswasher',
  refrigeration: 'Refrigeration',
  display_fridge: 'Display Fridge',
  beverage: 'Beverage',
  ice_maker: 'Ice Maker',
  warmers: 'Warmers',
  general: 'General',
  other: 'Other',
};

export const ZONES: Zone[] = [
  'Hot Production',
  'Servery FOH',
  'Kitchen BOH',
  'Preparation',
  'Dishwash',
  'Beverages',
  'General',
];

export const DEFAULT_ASSUMPTIONS: Assumptions = {
  operatingDays: 250,
  operatingStart: '07:00',
  operatingEnd: '17:00',
  diversityFactor: 0.65,
  electricityTariff: 0.22,
  waterTariff: 4.45,
  powerFactor: 0.90,
  canopyCapture: 0.65,
  dailyWaterLitres: null,
};
