// src/core/application/GetAdjustedCBUseCase.ts

import { RoutesRepository } from '../ports/RoutesRepository';
import { BankingRepository } from '../ports/BankingRepository';
import { PoolsRepository } from '../ports/PoolsRepository';
import { computeCBForRoute2025 } from '../domain/Compliance';

export interface AdjustedCBResult {
  shipId: string;
  year: number;
  cb_base: number;
  bankedNet: number;
  cb_beforePooling: number;
  cb_afterPooling: number;
}

export class GetAdjustedCBUseCase {
  constructor(
    private readonly routesRepo: RoutesRepository,
    private readonly bankingRepo: BankingRepository,
    private readonly poolsRepo: PoolsRepository
  ) {}

  async execute(shipId: string, year: number): Promise<AdjustedCBResult> {
    const route = await this.routesRepo.findByRouteIdAndYear(shipId, year);
    if (!route) {
      throw new Error(`No route found for shipId=${shipId} and year=${year}`);
    }

    const cbBase = computeCBForRoute2025(
      shipId,
      year,
      route.ghgIntensity,
      route.fuelConsumption
    ).cb;

    const bankEntries = await this.bankingRepo.getEntries(shipId, year);
    const bankedNet = bankEntries.reduce((sum, e) => sum + e.amount, 0);

    const cb_beforePooling = cbBase + bankedNet;

    const poolMember = await this.poolsRepo.getLatestMemberForShip(
      shipId,
      year
    );

    const cb_afterPooling = poolMember ? poolMember.cb_after : cb_beforePooling;

    return {
      shipId,
      year,
      cb_base: cbBase,
      bankedNet,
      cb_beforePooling,
      cb_afterPooling,
    };
  }
}
