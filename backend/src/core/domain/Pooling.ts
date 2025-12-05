// src/core/domain/Pooling.ts

export interface PoolMember {
  poolId: number;
  shipId: string;
  year: number;
  cb_before: number;
  cb_after: number;
}

export interface PoolCreationResult {
  poolId: number;
  year: number;
  members: {
    shipId: string;
    year: number;
    cb_before: number;
    cb_after: number;
  }[];
  poolSumBefore: number;
  poolSumAfter: number;
}
