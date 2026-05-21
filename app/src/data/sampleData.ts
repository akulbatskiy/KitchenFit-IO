import type { Assumptions, EquipmentRow, Project } from '../calculator/types';

export const SAMPLE_PROJECT: Project = {
  projectName: 'Royal London — Demo Project',
  clientName: 'Demo Healthcare Trust',
  consultantName: 'Demo Consultant',
  organisation: 'Akrive Consulting Ltd',
  referenceNumber: 'AKR-2026-001',
  reportStatus: 'Draft',
  date: '2026-05-21',
};

// Ground Floor Main Kitchen — connected load target ~194.0 kW
// 7th Floor Ward Kitchen   — connected load target ~30.6 kW
// Combined target                                  ~224.6 kW
export const SAMPLE_EQUIPMENT: EquipmentRow[] = [
  // Ground Floor — Hot Production
  { id: 'gf-01', ref: 'GF-01', description: 'Combination Oven (10-grid)',    qty: 3, kwEach: 12.0, zone: 'Hot Production', type: 'combi_oven'    },
  { id: 'gf-02', ref: 'GF-02', description: 'Twin-tank Fryer',               qty: 2, kwEach: 15.0, zone: 'Hot Production', type: 'fryer'          },
  { id: 'gf-03', ref: 'GF-03', description: 'Induction Hob (4-zone)',        qty: 4, kwEach: 7.0,  zone: 'Hot Production', type: 'induction_hob'  },
  { id: 'gf-04', ref: 'GF-04', description: 'Contact Griddle',               qty: 1, kwEach: 10.0, zone: 'Hot Production', type: 'griddle'        },
  // Ground Floor — Servery FOH
  { id: 'gf-05', ref: 'GF-05', description: 'Heated Servery Counter',        qty: 3, kwEach: 5.0,  zone: 'Servery FOH',   type: 'warmers'        },
  // Ground Floor — Dishwash
  { id: 'gf-06', ref: 'GF-06', description: 'Pass-through Dishwasher',       qty: 1, kwEach: 20.0, zone: 'Dishwash',      type: 'dishwasher'     },
  { id: 'gf-07', ref: 'GF-07', description: 'Glasswasher',                   qty: 1, kwEach: 8.0,  zone: 'Dishwash',      type: 'glasswasher'    },
  // Ground Floor — Kitchen BOH
  { id: 'gf-08', ref: 'GF-08', description: 'Upright Refrigerator',          qty: 4, kwEach: 5.0,  zone: 'Kitchen BOH',   type: 'refrigeration'  },
  { id: 'gf-09', ref: 'GF-09', description: 'Modular Ice Maker',             qty: 1, kwEach: 5.0,  zone: 'Kitchen BOH',   type: 'ice_maker'      },
  // Ground Floor — Beverages
  { id: 'gf-10', ref: 'GF-10', description: 'Bean-to-Cup Coffee Station',    qty: 2, kwEach: 5.0,  zone: 'Beverages',     type: 'beverage'       },
  // Ground Floor — General
  { id: 'gf-11', ref: 'GF-11', description: 'Miscellaneous Small Equipment', qty: 1, kwEach: 12.0, zone: 'General',       type: 'general'        },

  // 7th Floor Ward Kitchen — Hot Production
  { id: 'w7-01', ref: 'W7-01', description: 'Combination Oven (6-grid)',     qty: 1, kwEach: 6.0,  zone: 'Hot Production', type: 'combi_oven'    },
  // 7th Floor — Dishwash
  { id: 'w7-02', ref: 'W7-02', description: 'Undercounter Dishwasher',       qty: 1, kwEach: 8.0,  zone: 'Dishwash',       type: 'dishwasher'    },
  // 7th Floor — Kitchen BOH
  { id: 'w7-03', ref: 'W7-03', description: 'Undercounter Refrigerator',     qty: 2, kwEach: 1.8,  zone: 'Kitchen BOH',    type: 'refrigeration' },
  // 7th Floor — Servery FOH
  { id: 'w7-04', ref: 'W7-04', description: 'Heated Meal Trolley',           qty: 2, kwEach: 2.5,  zone: 'Servery FOH',    type: 'warmers'       },
  // 7th Floor — Beverages
  { id: 'w7-05', ref: 'W7-05', description: 'Hot Beverage Unit',             qty: 2, kwEach: 2.0,  zone: 'Beverages',      type: 'beverage'      },
  // 7th Floor — General
  { id: 'w7-06', ref: 'W7-06', description: 'Ward Kitchen General',          qty: 1, kwEach: 4.0,  zone: 'General',        type: 'general'       },
];

export const SAMPLE_ASSUMPTIONS: Assumptions = {
  operatingDays: 250,
  operatingStart: '07:00',
  operatingEnd: '17:00',
  diversityFactor: 0.65,
  electricityTariff: 0.22,
  waterTariff: 4.45,
  powerFactor: 0.90,
  canopyCapture: 0.65,
  dailyWaterLitres: 4190,
};
