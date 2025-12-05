// src/adapters/outbound/postgres/InMemoryBankingRepository.ts

import { BankingRepository } from '../../../core/ports/BankingRepository';
import { BankEntry } from '../../../core/domain/Banking';

export class InMemoryBankingRepository implements BankingRepository {
  private entries: BankEntry[] = [];
  private seq = 1;

  async getEntries(shipId: string, year: number): Promise<BankEntry[]> {
    return this.entries.filter(
      (e) => e.shipId === shipId && e.year === year
    );
  }

  async addEntry(
    entry: Omit<BankEntry, 'id' | 'createdAt'>
  ): Promise<BankEntry> {
    const newEntry: BankEntry = {
      id: this.seq++,
      createdAt: new Date(),
      ...entry,
    };
    this.entries.push(newEntry);
    return newEntry;
  }
}
