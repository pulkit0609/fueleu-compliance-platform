// src/core/ports/RoutesRepository.ts

import { Route } from '../domain/Route';

export interface RoutesRepository {
  getAll(): Promise<Route[]>;
  findByRouteId(routeId: string): Promise<Route | null>;
  findByRouteIdAndYear(routeId: string, year: number): Promise<Route | null>;
  setBaseline(routeId: string): Promise<void>;
  getBaseline(): Promise<Route | null>;
  getComparisons(): Promise<{ baseline: Route | null; others: Route[] }>;
}
