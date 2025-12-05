// src/core/application/GetBankingRecordsUseCase.ts

import { BankingRepository } from '../ports/BankingRepository';
import { BankEntry } from '../domain/Banking';

export class GetBankingRecordsUseCase {
  constructor(private readonly bankingRepo: BankingRepository) {}

  async execute(shipId: string, year: number): Promise<{
    records: BankEntry[];
    totalBanked: number;
  }> {
    const entries = await this.bankingRepo.getEntries(shipId, year);
    const totalBanked = entries.reduce((sum, e) => sum + e.amount, 0);
    return {
      records: entries,
      totalBanked,
    };
  }
}
