// src/core/application/CreatePoolUseCase.ts

import { RoutesRepository } from '../ports/RoutesRepository';
import { BankingRepository } from '../ports/BankingRepository';
import { PoolsRepository } from '../ports/PoolsRepository';
import { PoolCreationResult } from '../domain/Pooling';
import { computeCBForRoute2025 } from '../domain/Compliance';

export class CreatePoolUseCase {
  constructor(
    private readonly routesRepo: RoutesRepository,
    private readonly bankingRepo: BankingRepository,
    private readonly poolsRepo: PoolsRepository
  ) {}

  /**
   * membersInput: array of { shipId: string }
   * We compute cb_before as:
   *   base CB (from route) + sum(bank_entries.amount)
   */
  async execute(
    year: number,
    membersInput: { shipId: string }[]
  ): Promise<PoolCreationResult> {
    if (membersInput.length < 2) {
      throw new Error('Pool must have at least 2 members');
    }

    // Compute cb_before for each ship (including banking)
    const members = [];
    for (const m of membersInput) {
      const route = await this.routesRepo.findByRouteIdAndYear(
        m.shipId,
        year
      );
      if (!route) {
        throw new Error(
          `No route found for shipId=${m.shipId} and year=${year}`
        );
      }

      const cbBase = computeCBForRoute2025(
        m.shipId,
        year,
        route.ghgIntensity,
        route.fuelConsumption
      ).cb;

      const bankEntries = await this.bankingRepo.getEntries(m.shipId, year);
      const bankNet = bankEntries.reduce((sum, e) => sum + e.amount, 0);

      const cb_before = cbBase + bankNet;

      members.push({
        shipId: m.shipId,
        year,
        cb_before,
        cb_after: cb_before,
      });
    }

    const poolSumBefore = members.reduce((sum, m) => sum + m.cb_before, 0);

    if (poolSumBefore < 0) {
      throw new Error('Pool invalid: sum(adjustedCB) < 0');
    }

    // Greedy allocation: move surplus to deficits
    // Prepare indexes
    const surplusIndexes = members
      .map((m, idx) => ({ idx, cb: m.cb_after }))
      .filter((x) => x.cb > 0)
      .sort((a, b) => b.cb - a.cb); // desc

    const deficitIndexes = members
      .map((m, idx) => ({ idx, cb: m.cb_after }))
      .filter((x) => x.cb < 0)
      .sort((a, b) => a.cb - b.cb); // most negative first

    for (const deficitInfo of deficitIndexes) {
      let deficitIdx = deficitInfo.idx;
      let deficit = -members[deficitIdx].cb_after; // positive amount needed

      if (deficit <= 0) continue;

      for (const surplusInfo of surplusIndexes) {
        if (deficit <= 0) break;

        const surplusIdx = surplusInfo.idx;
        let available = members[surplusIdx].cb_after;

        if (available <= 0) continue;

        const transfer = Math.min(available, deficit);

        // Transfer from surplus to deficit
        members[surplusIdx].cb_after -= transfer;
        members[deficitIdx].cb_after += transfer;

        available -= transfer;
        deficit -= transfer;
      }
    }

    const poolSumAfter = members.reduce((sum, m) => sum + m.cb_after, 0);

    if (poolSumAfter < 0) {
      throw new Error('Pool invalid after allocation: pool sum < 0');
    }

    // Check constraints:
    // - deficit ship cannot exit worse (cb_after >= cb_before for negative ones)
    // - surplus ship cannot exit negative (cb_after >= 0 for positive ones)
    for (const m of members) {
      if (m.cb_before < 0 && m.cb_after < m.cb_before) {
        throw new Error(
          `Deficit ship ${m.shipId} would exit worse (cb_after < cb_before)`
        );
      }
      if (m.cb_before > 0 && m.cb_after < 0) {
        throw new Error(
          `Surplus ship ${m.shipId} would exit negative (cb_after < 0)`
        );
      }
    }

    // Persist pool + members
    const { poolId, members: storedMembers } = await this.poolsRepo.createPool(
      year,
      members
    );

    return {
      poolId,
      year,
      members: storedMembers.map((m) => ({
        shipId: m.shipId,
        year: m.year,
        cb_before: m.cb_before,
        cb_after: m.cb_after,
      })),
      poolSumBefore,
      poolSumAfter,
    };
  }
}
