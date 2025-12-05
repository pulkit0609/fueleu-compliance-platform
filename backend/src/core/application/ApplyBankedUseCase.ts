// src/core/application/ApplyBankedUseCase.ts

import { RoutesRepository } from '../ports/RoutesRepository';
import { BankingRepository } from '../ports/BankingRepository';
import { BankingOperationResult } from '../domain/Banking';
import { computeCBForRoute2025 } from '../domain/Compliance';

export class ApplyBankedUseCase {
  constructor(
    private readonly routesRepo: RoutesRepository,
    private readonly bankingRepo: BankingRepository
  ) {}

  async execute(
    shipId: string,
    year: number,
    amountToApply: number
  ): Promise<BankingOperationResult> {
    if (amountToApply <= 0) {
      throw new Error('Amount to apply must be positive');
    }

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

    if (cb_before >= 0) {
      throw new Error('Ship does not have a deficit CB; nothing to apply');
    }

    const entries = await this.bankingRepo.getEntries(shipId, year);
    const availableBanked = entries.reduce((sum, e) => sum + e.amount, 0);

    if (amountToApply > availableBanked) {
      throw new Error(
        `Amount to apply (${amountToApply}) exceeds available banked (${availableBanked})`
      );
    }

    // apply surplus: create negative bank entry
    await this.bankingRepo.addEntry({
      shipId,
      year,
      amount: -amountToApply,
    });

    const availableBankedAfter = availableBanked - amountToApply;

    const cb_after = cb_before + amountToApply;

    return {
      shipId,
      year,
      cb_before,
      applied: amountToApply,
      cb_after,
      availableBankedAfter,
    };
  }
}
