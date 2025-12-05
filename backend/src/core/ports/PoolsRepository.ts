// src/core/ports/PoolsRepository.ts

import { PoolMember } from '../domain/Pooling';

export interface PoolsRepository {
  createPool(
    year: number,
    members: { shipId: string; cb_before: number; cb_after: number }[]
  ): Promise<{ poolId: number; members: PoolMember[] }>;

  getLatestMemberForShip(
    shipId: string,
    year: number
  ): Promise<PoolMember | null>;
}
