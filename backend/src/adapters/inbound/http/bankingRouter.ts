// src/adapters/inbound/http/bankingRouter.ts

import { Router, Request, Response } from 'express';
import { BankSurplusUseCase } from '../../../core/application/BankSurplusUseCase';
import { ApplyBankedUseCase } from '../../../core/application/ApplyBankedUseCase';
import { GetBankingRecordsUseCase } from '../../../core/application/GetBankingRecordsUseCase';

interface BankingRouterDeps {
  bankSurplusUseCase: BankSurplusUseCase;
  applyBankedUseCase: ApplyBankedUseCase;
  getBankingRecordsUseCase: GetBankingRecordsUseCase;
}

export function createBankingRouter(deps: BankingRouterDeps): Router {
  const router = Router();

  // GET /banking/records?shipId=R001&year=2024
  router.get('/records', async (req: Request, res: Response) => {
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

      const result = await deps.getBankingRecordsUseCase.execute(shipId, year);
      res.json(result);
    } catch (err: any) {
      console.error(err);
      res
        .status(400)
        .json({ error: err?.message ?? 'Failed to fetch banking records' });
    }
  });

  // POST /banking/bank  { "shipId": "R001", "year": 2024 }
  router.post('/bank', async (req: Request, res: Response) => {
    try {
      const { shipId, year } = req.body as { shipId?: string; year?: number };

      if (!shipId || typeof year !== 'number') {
        return res
          .status(400)
          .json({ error: 'shipId (string) and year (number) are required' });
      }

      const result = await deps.bankSurplusUseCase.execute(shipId, year);
      res.json(result);
    } catch (err: any) {
      console.error(err);
      res
        .status(400)
        .json({ error: err?.message ?? 'Failed to bank surplus' });
    }
  });

  // POST /banking/apply  { "shipId": "R001", "year": 2024, "amount": 100000 }
  router.post('/apply', async (req: Request, res: Response) => {
    try {
      const { shipId, year, amount } = req.body as {
        shipId?: string;
        year?: number;
        amount?: number;
      };

      if (!shipId || typeof year !== 'number' || typeof amount !== 'number') {
        return res.status(400).json({
          error: 'shipId (string), year (number), and amount (number) are required',
        });
      }

      const result = await deps.applyBankedUseCase.execute(
        shipId,
        year,
        amount
      );
      res.json(result);
    } catch (err: any) {
      console.error(err);
      res
        .status(400)
        .json({ error: err?.message ?? 'Failed to apply banked surplus' });
    }
  });

  return router;
}
