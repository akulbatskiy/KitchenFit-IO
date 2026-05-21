import type { EquipmentType } from './types';

interface HeatRule {
  sensible: number;
  latent: number;
  canopy: boolean;
}

export const HEAT_RULES: Partial<Record<EquipmentType, HeatRule>> = {
  combi_oven:     { sensible: 0.40, latent: 0.53, canopy: true },
  fryer:          { sensible: 0.55, latent: 0.30, canopy: true },
  induction_hob:  { sensible: 0.45, latent: 0.35, canopy: true },
  griddle:        { sensible: 0.55, latent: 0.25, canopy: true },
  dishwasher:     { sensible: 0.20, latent: 0.70, canopy: false },
  glasswasher:    { sensible: 0.20, latent: 0.70, canopy: false },
  refrigeration:  { sensible: 0.90, latent: 0.10, canopy: false },
  display_fridge: { sensible: 0.90, latent: 0.10, canopy: false },
  beverage:       { sensible: 0.50, latent: 0.40, canopy: false },
  ice_maker:      { sensible: 0.70, latent: 0.20, canopy: false },
  warmers:        { sensible: 0.75, latent: 0.10, canopy: false },
  general:        { sensible: 0.60, latent: 0.20, canopy: false },
};

export function getHeatRule(type: EquipmentType): HeatRule | null {
  if (type === 'other') return null;
  return HEAT_RULES[type] ?? null;
}
