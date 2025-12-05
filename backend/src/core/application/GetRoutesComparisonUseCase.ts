// src/core/application/GetRoutesComparisonUseCase.ts

import { RoutesRepository } from '../ports/RoutesRepository';
import {
  RouteComparisonEntry,
  RoutesComparisonResult,
} from '../domain/RouteComparison';
import { TARGET_INTENSITY_2025 } from '../../shared/constants'; // adjust path if TS complains

export class GetRoutesComparisonUseCase {
  constructor(private readonly routesRepo: RoutesRepository) {}

  async execute(): Promise<RoutesComparisonResult> {
    const { baseline, others } = await this.routesRepo.getComparisons();

    if (!baseline) {
      // if no baseline set, just return others with 0% difference and compliance vs target
      const comparisons: RouteComparisonEntry[] = others.map((route) => ({
        routeId: route.routeId,
        vesselType: route.vesselType,
        fuelType: route.fuelType,
        year: route.year,
        ghgIntensity: route.ghgIntensity,
        percentDiffFromBaseline: 0,
        compliant: route.ghgIntensity <= TARGET_INTENSITY_2025,
      }));

      return { baseline: null, comparisons };
    }

    const comparisons: RouteComparisonEntry[] = others.map((route) => {
      const percentDiff =
        ((route.ghgIntensity / baseline.ghgIntensity) - 1) * 100;

      const compliant = route.ghgIntensity <= TARGET_INTENSITY_2025;

      return {
        routeId: route.routeId,
        vesselType: route.vesselType,
        fuelType: route.fuelType,
        year: route.year,
        ghgIntensity: route.ghgIntensity,
        percentDiffFromBaseline: percentDiff,
        compliant,
      };
    });

    return {
      baseline,
      comparisons,
    };
  }
}
