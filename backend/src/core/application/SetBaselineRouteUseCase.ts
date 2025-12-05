// src/core/application/SetBaselineRouteUseCase.ts

import { RoutesRepository } from '../ports/RoutesRepository';

export class SetBaselineRouteUseCase {
  constructor(private readonly routesRepo: RoutesRepository) {}

  async execute(routeId: string): Promise<void> {
    const route = await this.routesRepo.findByRouteId(routeId);
    if (!route) {
      throw new Error(`Route with id ${routeId} not found`);
    }
    await this.routesRepo.setBaseline(routeId);
  }
}
