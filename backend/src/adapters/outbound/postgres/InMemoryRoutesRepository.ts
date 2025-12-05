// src/adapters/outbound/postgres/InMemoryRoutesRepository.ts

import { RoutesRepository } from '../../../core/ports/RoutesRepository';
import { Route } from '../../../core/domain/Route';

export class InMemoryRoutesRepository implements RoutesRepository {
  private routes: Route[] = [
    {
      id: 1,
      routeId: 'R001',
      vesselType: 'Container',
      fuelType: 'HFO',
      year: 2024,
      ghgIntensity: 91.0,
      fuelConsumption: 5000,
      distance: 12000,
      totalEmissions: 4500,
      isBaseline: true, // initial baseline
    },
    {
      id: 2,
      routeId: 'R002',
      vesselType: 'BulkCarrier',
      fuelType: 'LNG',
      year: 2024,
      ghgIntensity: 88.0,
      fuelConsumption: 4800,
      distance: 11500,
      totalEmissions: 4200,
      isBaseline: false,
    },
    {
      id: 3,
      routeId: 'R003',
      vesselType: 'Tanker',
      fuelType: 'MGO',
      year: 2024,
      ghgIntensity: 93.5,
      fuelConsumption: 5100,
      distance: 12500,
      totalEmissions: 4700,
      isBaseline: false,
    },
    {
      id: 4,
      routeId: 'R004',
      vesselType: 'RoRo',
      fuelType: 'HFO',
      year: 2025,
      ghgIntensity: 89.2,
      fuelConsumption: 4900,
      distance: 11800,
      totalEmissions: 4300,
      isBaseline: false,
    },
    {
      id: 5,
      routeId: 'R005',
      vesselType: 'Container',
      fuelType: 'LNG',
      year: 2025,
      ghgIntensity: 90.5,
      fuelConsumption: 4950,
      distance: 11900,
      totalEmissions: 4400,
      isBaseline: false,
    },
  ];

  async getAll(): Promise<Route[]> {
    return this.routes;
  }

  async findByRouteId(routeId: string): Promise<Route | null> {
    const route = this.routes.find((r) => r.routeId === routeId);
    return route ?? null;
  }

  async findByRouteIdAndYear(routeId: string, year: number): Promise<Route | null> {
    const route = this.routes.find((r) => r.routeId === routeId && r.year === year);
    return route ?? null;
  }

  async setBaseline(routeId: string): Promise<void> {
    this.routes = this.routes.map((r) => ({
      ...r,
      isBaseline: r.routeId === routeId,
    }));
  }

  async getBaseline(): Promise<Route | null> {
    const baseline = this.routes.find((r) => r.isBaseline);
    return baseline ?? null;
  }

  async getComparisons(): Promise<{ baseline: Route | null; others: Route[] }> {
    const baseline = await this.getBaseline();
    const others = baseline
      ? this.routes.filter((r) => r.routeId !== baseline.routeId)
      : this.routes;
    return { baseline, others };
  }
}
