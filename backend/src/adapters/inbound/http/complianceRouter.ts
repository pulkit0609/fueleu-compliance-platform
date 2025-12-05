// src/adapters/inbound/http/complianceRouter.ts

import { Router, Request, Response } from 'express';
import { GetComplianceCBUseCase } from '../../../core/application/GetComplianceCBUseCase';
import { GetAdjustedCBUseCase } from '../../../core/application/GetAdjustedCBUseCase';

interface ComplianceRouterDeps {
  getComplianceCBUseCase: GetComplianceCBUseCase;
  getAdjustedCBUseCase: GetAdjustedCBUseCase;
}

export function createComplianceRouter(deps: ComplianceRouterDeps): Router {
  const router = Router();

  // GET /compliance/cb?shipId=R001&year=2024
  router.get('/cb', async (req: Request, res: Response) => {
    try {
      const shipId = req.query.shipId as string | undefined;
      const yearParam = req.query.year as string | undefined;

      if (!shipId || !yearParam) {
        return res
          .status(400)
          .json({ error: 'shipId and year are required query params' });
      }

      const year = Number(yearParam);
      if (Number.isNaN(year)) {
        return res.status(400).json({ error: 'year must be a number' });
      }

      const cbResult = await deps.getComplianceCBUseCase.execute(
        shipId,
        year
      );
      res.json(cbResult);
    } catch (err: any) {
      console.error(err);
      res
        .status(400)
        .json({ error: err?.message ?? 'Failed to compute compliance balance' });
    }
  });

  // GET /compliance/adjusted-cb?shipId=R001&year=2024
  router.get('/adjusted-cb', async (req: Request, res: Response) => {
    try {
      const shipId = req.query.shipId as string | undefined;
      const yearParam = req.query.year as string | undefined;

      if (!shipId || !yearParam) {
        return res
          .status(400)
          .json({ error: 'shipId and year are required query params' });
      }

      const year = Number(yearParam);
      if (Number.isNaN(year)) {
        return res.status(400).json({ error: 'year must be a number' });
      }

      const result = await deps.getAdjustedCBUseCase.execute(shipId, year);
      res.json(result);
    } catch (err: any) {
      console.error(err);
      res
        .status(400)
        .json({ error: err?.message ?? 'Failed to compute adjusted CB' });
    }
  });

  return router;
}
