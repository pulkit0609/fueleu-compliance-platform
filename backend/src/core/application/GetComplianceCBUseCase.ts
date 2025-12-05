// src/core/application/GetComplianceCBUseCase.ts

import { RoutesRepository } from '../ports/RoutesRepository';
import { ComplianceBalanceResult, computeCBForRoute2025 } from '../domain/Compliance';

export class GetComplianceCBUseCase {
  constructor(private readonly routesRepo: RoutesRepository) {}

  /**
   * For this implementation, we treat shipId as routeId.
   */
  async execute(shipId: string, year: number): Promise<ComplianceBalanceResult> {
    const route = await this.routesRepo.findByRouteIdAndYear(shipId, year);

    if (!route) {
      throw new Error(`No route found for shipId=${shipId} and year=${year}`);
    }

    const result = computeCBForRoute2025(
      shipId,
      year,
      route.ghgIntensity,
      route.fuelConsumption
    );

    return result;
  }
}
