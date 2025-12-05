// src/core/domain/comparison.ts

import type { Route } from "./route";

export interface RouteComparisonEntry {
  routeId: string;
  vesselType: string;
  fuelType: string;
  year: number;
  ghgIntensity: number;
  percentDiffFromBaseline: number;
  compliant: boolean;
}

export interface RoutesComparisonResult {
  baseline: Route | null;
  comparisons: RouteComparisonEntry[];
}

