// src/adapters/inbound/http/poolsRouter.ts

import { Router, Request, Response } from 'express';
import { CreatePoolUseCase } from '../../../core/application/CreatePoolUseCase';

interface PoolsRouterDeps {
  createPoolUseCase: CreatePoolUseCase;
}

export function createPoolsRouter(deps: PoolsRouterDeps): Router {
  const router = Router();

  // POST /pools
  // body: { "year": 2024, "members": [ { "shipId": "R001" }, { "shipId": "R002" } ] }
  router.post('/', async (req: Request, res: Response) => {
    try {
      const { year, members } = req.body as {
        year?: number;
        members?: { shipId: string }[];
      };

      if (typeof year !== 'number' || !Array.isArray(members)) {
        return res.status(400).json({
          error: 'year (number) and members (array of { shipId }) are required',
        });
      }

      const result = await deps.createPoolUseCase.execute(year, members);
      res.json(result);
    } catch (err: any) {
      console.error(err);
      res
        .status(400)
        .json({ error: err?.message ?? 'Failed to create pool' });
    }
  });

  return router;
}
