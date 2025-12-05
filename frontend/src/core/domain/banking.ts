// src/core/domain/banking.ts

export interface BankEntry {
  id: number;
  createdAt: string;
  shipId: string;
  year: number;
  amount: number;
}

export interface BankingRecordsResponse {
  records: BankEntry[];
  totalBanked: number;
}

export interface BankingOperationResult {
  shipId: string;
  year: number;
  cb_before: number;
  applied: number;
  cb_after: number;
  availableBankedAfter: number;
}
