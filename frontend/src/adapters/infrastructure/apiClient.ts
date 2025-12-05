// src/adapters/infrastructure/apiClient.ts

import { API_BASE_URL } from "../../shared/config";
import { Route } from "../../core/domain/route";
import { RoutesComparisonResult } from "../../core/domain/comparison";
import {
  ComplianceBalanceResult,
  AdjustedCBResult,
} from "../../core/domain/compliance";
import {
  BankingOperationResult,
  BankingRecordsResponse,
} from "../../core/domain/banking";
import { PoolCreationResult } from "../../core/domain/pooling";

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP error ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const apiClient = {
  async getRoutes(): Promise<Route[]> {
    const res = await fetch(`${API_BASE_URL}/routes`);
    return handleResponse<Route[]>(res);
  },

  async setBaseline(routeId: string): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/routes/${routeId}/baseline`, {
      method: "POST",
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || "Failed to set baseline");
    }
  },

  async getRoutesComparison(): Promise<RoutesComparisonResult> {
    const res = await fetch(`${API_BASE_URL}/routes/comparison`);
    return handleResponse<RoutesComparisonResult>(res);
  },

  async getComplianceCB(
    shipId: string,
    year: number
  ): Promise<ComplianceBalanceResult> {
    const params = new URLSearchParams({ shipId, year: String(year) });
    const res = await fetch(`${API_BASE_URL}/compliance/cb?${params.toString()}`);
    return handleResponse<ComplianceBalanceResult>(res);
  },

  async getAdjustedCB(
    shipId: string,
    year: number
  ): Promise<AdjustedCBResult> {
    const params = new URLSearchParams({ shipId, year: String(year) });
    const res = await fetch(
      `${API_BASE_URL}/compliance/adjusted-cb?${params.toString()}`
    );
    return handleResponse<AdjustedCBResult>(res);
  },

  async getBankingRecords(
    shipId: string,
    year: number
  ): Promise<BankingRecordsResponse> {
    const params = new URLSearchParams({ shipId, year: String(year) });
    const res = await fetch(
      `${API_BASE_URL}/banking/records?${params.toString()}`
    );
    return handleResponse<BankingRecordsResponse>(res);
  },

  async bankSurplus(
    shipId: string,
    year: number
  ): Promise<BankingOperationResult> {
    const res = await fetch(`${API_BASE_URL}/banking/bank`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shipId, year }),
    });
    return handleResponse<BankingOperationResult>(res);
  },

  async applyBanked(
    shipId: string,
    year: number,
    amount: number
  ): Promise<BankingOperationResult> {
    const res = await fetch(`${API_BASE_URL}/banking/apply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shipId, year, amount }),
    });
    return handleResponse<BankingOperationResult>(res);
  },

  async createPool(
    year: number,
    members: { shipId: string }[]
  ): Promise<PoolCreationResult> {
    const res = await fetch(`${API_BASE_URL}/pools`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ year, members }),
    });
    return handleResponse<PoolCreationResult>(res);
  },
};
