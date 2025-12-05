// src/core/domain/compliance.ts

export interface ComplianceBalanceResult {
  shipId: string;
  year: number;
  actualIntensity: number;
  targetIntensity: number;
  energyInScope: number;
  cb: number;
  surplus: boolean;
}

export interface AdjustedCBResult {
  shipId: string;
  year: number;
  cb_base: number;
  bankedNet: number;
  cb_beforePooling: number;
  cb_afterPooling: number;
}
