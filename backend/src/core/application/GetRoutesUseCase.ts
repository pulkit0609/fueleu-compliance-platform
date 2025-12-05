// src/core/application/GetRoutesUseCase.ts

import { RoutesRepository } from '../ports/RoutesRepository';
import { Route } from '../domain/Route';

export class GetRoutesUseCase {
  constructor(private readonly routesRepo: RoutesRepository) {}

  async execute(): Promise<Route[]> {
    return this.routesRepo.getAll();
  }
}
