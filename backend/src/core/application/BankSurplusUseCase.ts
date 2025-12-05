// src/core/application/BankSurplusUseCase.ts

import { RoutesRepository } from '../ports/RoutesRepository';
import { BankingRepository } from '../ports/BankingRepository';
import { BankingOperationResult } from '../domain/Banking';
import { computeCBForRoute2025 } from '../domain/Compliance';

export class BankSurplusUseCase {
  constructor(
    private readonly routesRepo: RoutesRepository,
    private readonly bankingRepo: BankingRepository
  ) {}

  async execute(shipId: string, year: number): Promise<BankingOperationResult> {
    const route = await this.routesRepo.findByRouteIdAndYear(shipId, year);
    if (!route) {
      throw new Error(`No route found for shipId=${shipId} and year=${year}`);
    }

    const cbResult = computeCBForRoute2025(
      shipId,
      year,
      route.ghgIntensity,
      route.fuelConsumption
    );

    const cb_before = cbResult.cb;

    if (cb_before <= 0) {
      throw new Error('CB is not positive; nothing to bank');
    }

    // bank full surplus
    const applied = cb_before;

    await this.bankingRepo.addEntry({
      shipId,
      year,
      amount: applied,
    });

    const entries = await this.bankingRepo.getEntries(shipId, year);
    const availableBankedAfter = entries.reduce(
      (sum, e) => sum + e.amount,
      0
    );

    return {
      shipId,
      year,
      cb_before,
      applied,
      cb_after: 0, // after banking, CB effectively 0 (we banked it)
      availableBankedAfter,
    };
  }
}
