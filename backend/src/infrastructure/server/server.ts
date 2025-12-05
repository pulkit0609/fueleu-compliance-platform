// src/infrastructure/server/server.ts

import express from 'express';
import cors from 'cors';

import { InMemoryRoutesRepository } from '../../adapters/outbound/postgres/InMemoryRoutesRepository';
import { InMemoryBankingRepository } from '../../adapters/outbound/postgres/InMemoryBankingRepository';
import { InMemoryPoolsRepository } from '../../adapters/outbound/postgres/InMemoryPoolsRepository';

import { GetRoutesUseCase } from '../../core/application/GetRoutesUseCase';
import { SetBaselineRouteUseCase } from '../../core/application/SetBaselineRouteUseCase';
import { GetRoutesComparisonUseCase } from '../../core/application/GetRoutesComparisonUseCase';
import { GetComplianceCBUseCase } from '../../core/application/GetComplianceCBUseCase';
import { GetAdjustedCBUseCase } from '../../core/application/GetAdjustedCBUseCase';
import { BankSurplusUseCase } from '../../core/application/BankSurplusUseCase';
import { ApplyBankedUseCase } from '../../core/application/ApplyBankedUseCase';
import { GetBankingRecordsUseCase } from '../../core/application/GetBankingRecordsUseCase';
import { CreatePoolUseCase } from '../../core/application/CreatePoolUseCase';

import { createRoutesRouter } from '../../adapters/inbound/http/routesRouter';
import { createComplianceRouter } from '../../adapters/inbound/http/complianceRouter';
import { createBankingRouter } from '../../adapters/inbound/http/bankingRouter';
import { createPoolsRouter } from '../../adapters/inbound/http/poolsRouter';

const app = express();
app.use(cors());
app.use(express.json());

// ---- Wiring dependencies (hexagonal style) ----
const routesRepository = new InMemoryRoutesRepository();
const bankingRepository = new InMemoryBankingRepository();
const poolsRepository = new InMemoryPoolsRepository();

const getRoutesUseCase = new GetRoutesUseCase(routesRepository);
const setBaselineRouteUseCase = new SetBaselineRouteUseCase(routesRepository);
const getRoutesComparisonUseCase = new GetRoutesComparisonUseCase(
  routesRepository
);
const getComplianceCBUseCase = new GetComplianceCBUseCase(routesRepository);
const getAdjustedCBUseCase = new GetAdjustedCBUseCase(
  routesRepository,
  bankingRepository,
  poolsRepository
);

const bankSurplusUseCase = new BankSurplusUseCase(
  routesRepository,
  bankingRepository
);
const applyBankedUseCase = new ApplyBankedUseCase(
  routesRepository,
  bankingRepository
);
const getBankingRecordsUseCase = new GetBankingRecordsUseCase(
  bankingRepository
);

const createPoolUseCase = new CreatePoolUseCase(
  routesRepository,
  bankingRepository,
  poolsRepository
);

const routesRouter = createRoutesRouter({
  getRoutesUseCase,
  setBaselineRouteUseCase,
  getRoutesComparisonUseCase,
});

const complianceRouter = createComplianceRouter({
  getComplianceCBUseCase,
  getAdjustedCBUseCase,
});

const bankingRouter = createBankingRouter({
  bankSurplusUseCase,
  applyBankedUseCase,
  getBankingRecordsUseCase,
});

const poolsRouter = createPoolsRouter({
  createPoolUseCase,
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ message: 'FuelEU Backend Running 🚢' });
});

// Mount endpoints
app.use('/routes', routesRouter);
app.use('/compliance', complianceRouter);
app.use('/banking', bankingRouter);
app.use('/pools', poolsRouter);

// ---- Start server ----
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
