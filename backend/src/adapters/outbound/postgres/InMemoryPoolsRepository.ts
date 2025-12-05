// src/adapters/outbound/postgres/InMemoryPoolsRepository.ts

import { PoolsRepository } from '../../../core/ports/PoolsRepository';
import { PoolMember } from '../../../core/domain/Pooling';

export class InMemoryPoolsRepository implements PoolsRepository {
  private pools: { id: number; year: number }[] = [];
  private members: PoolMember[] = [];
  private poolSeq = 1;

  async createPool(
    year: number,
    members: { shipId: string; cb_before: number; cb_after: number }[]
  ): Promise<{ poolId: number; members: PoolMember[] }> {
    const poolId = this.poolSeq++;
    this.pools.push({ id: poolId, year });

    const storedMembers: PoolMember[] = members.map((m) => ({
      poolId,
      shipId: m.shipId,
      year,
      cb_before: m.cb_before,
      cb_after: m.cb_after,
    }));

    this.members.push(...storedMembers);

    return { poolId, members: storedMembers };
  }

  async getLatestMemberForShip(
    shipId: string,
    year: number
  ): Promise<PoolMember | null> {
    const candidates = this.members.filter(
      (m) => m.shipId === shipId && m.year === year
    );

    if (candidates.length === 0) return null;

    // last one in array is latest
    return candidates[candidates.length - 1];
  }
}
