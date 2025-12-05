// src/core/domain/pooling.ts

export interface PoolMemberResult {
  shipId: string;
  year: number;
  cb_before: number;
  cb_after: number;
}

export interface PoolCreationResult {
  poolId: number;
  year: number;
  members: PoolMemberResult[];
  poolSumBefore: number;
  poolSumAfter: number;
}
