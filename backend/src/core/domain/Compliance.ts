// src/core/domain/Compliance.ts

import { TARGET_INTENSITY_2025, ENERGY_FACTOR_MJ_PER_TON } from '../../shared/constants';

export interface ComplianceBalanceResult {
  shipId: string;
  year: number;
  actualIntensity: number;
  targetIntensity: number;
  energyInScope: number; // MJ
  cb: number; // gCO2eq
  surplus: boolean; // true if cb > 0
}

// Energy ≈ fuelConsumption × 41 000 MJ/t
export function computeEnergyInScope(fuelConsumptionTons: number): number {
  return fuelConsumptionTons * ENERGY_FACTOR_MJ_PER_TON;
}

export function computeCB(
  target: number,
  actual: number,
  fuelConsumptionTons: number
): Omit<ComplianceBalanceResult, 'shipId' | 'year'> {
  const energyInScope = computeEnergyInScope(fuelConsumptionTons);
  const cb = (target - actual) * energyInScope;

  return {
    actualIntensity: actual,
    targetIntensity: target,
    energyInScope,
    cb,
    surplus: cb > 0,
  };
}

export function computeCBForRoute2025(
  shipId: string,
  year: number,
  actualIntensity: number,
  fuelConsumptionTons: number
): ComplianceBalanceResult {
  const base = computeCB(TARGET_INTENSITY_2025, actualIntensity, fuelConsumptionTons);
  return {
    ...base,
    shipId,
    year,
  };
}
