// src/core/ports/BankingRepository.ts

import { BankEntry } from '../domain/Banking';

export interface BankingRepository {
  getEntries(shipId: string, year: number): Promise<BankEntry[]>;
  addEntry(entry: Omit<BankEntry, 'id' | 'createdAt'>): Promise<BankEntry>;
}
