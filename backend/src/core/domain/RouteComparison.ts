// src/core/domain/RouteComparison.ts

import { Route } from './Route';

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
