// src/adapters/inbound/http/routesRouter.ts

import { Router, Request, Response } from 'express';
import { GetRoutesUseCase } from '../../../core/application/GetRoutesUseCase';
import { SetBaselineRouteUseCase } from '../../../core/application/SetBaselineRouteUseCase';
import { GetRoutesComparisonUseCase } from '../../../core/application/GetRoutesComparisonUseCase';

interface RoutesRouterDeps {
  getRoutesUseCase: GetRoutesUseCase;
  setBaselineRouteUseCase: SetBaselineRouteUseCase;
  getRoutesComparisonUseCase: GetRoutesComparisonUseCase;
}

export function createRoutesRouter(deps: RoutesRouterDeps): Router {
  const router = Router();

  // GET /routes - list all routes
  router.get('/', async (_req: Request, res: Response) => {
    try {
      const routes = await deps.getRoutesUseCase.execute();
      res.json(routes);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch routes' });
    }
  });

  // POST /routes/:routeId/baseline - set baseline route
  router.post('/:routeId/baseline', async (req: Request, res: Response) => {
    try {
      const { routeId } = req.params;
      await deps.setBaselineRouteUseCase.execute(routeId);
      res.status(200).json({ message: `Baseline set to route ${routeId}` });
    } catch (err: any) {
      console.error(err);
      res.status(400).json({ error: err.message ?? 'Failed to set baseline' });
    }
  });

  // GET /routes/comparison - baseline vs others
  router.get('/comparison', async (_req: Request, res: Response) => {
    try {
      const result = await deps.getRoutesComparisonUseCase.execute();
      res.json(result);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to compute routes comparison' });
    }
  });

  return router;
}
