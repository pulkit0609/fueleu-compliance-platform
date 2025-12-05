// src/core/domain/Banking.ts

export interface BankEntry {
  id: number;
  shipId: string;
  year: number;
  amount: number; // gCO2eq; positive = banked, negative = applied/used
  createdAt: Date;
}

export interface BankingOperationResult {
  shipId: string;
  year: number;
  cb_before: number;
  applied: number;
  cb_after: number;
  availableBankedAfter: number;
}
