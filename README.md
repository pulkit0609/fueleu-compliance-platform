# FuelEU Maritime — Compliance Platform (Assignment)

Full-stack implementation of a minimal **FuelEU Maritime compliance module**.

- **Frontend:** React + TypeScript + Vite + TailwindCSS
- **Backend:** Node.js + TypeScript + Express (hexagonal architecture)
- **Data:** In-memory repositories (routes, banking, pooling), easily swappable with PostgreSQL

> NOTE: To keep implementation time reasonable, the persistence layer uses **in-memory adapters** behind ports. A PostgreSQL adapter can be added later without touching core logic.

---

## Requirements

- Node.js 18+  
- npm 9+  
- Git

## Architecture Overview

Both backend and frontend follow a **hexagonal / ports-and-adapters** layout.

### Backend Structure

```text
backend/
  src/
    core/
      domain/        # Entities and domain services (Route, Compliance, Banking, Pooling)
      application/   # Use-cases (GetRoutes, GetRoutesComparison, GetComplianceCB, BankSurplus, ApplyBanked, CreatePool)
      ports/         # Interfaces for repositories (RoutesRepository, BankingRepository, PoolsRepository)
    adapters/
      inbound/http/  # Express routers (routesRouter, complianceRouter, bankingRouter, poolsRouter)
      outbound/postgres/
                     # In-memory implementations for now (InMemoryRoutesRepository, InMemoryBankingRepository, InMemoryPoolsRepository)
    infrastructure/
      server/        # Express app wiring (server.ts)
      db/            # (placeholder for future PostgreSQL)
    shared/          # Shared constants (target intensity, etc.)

frontend/
  src/
    core/
      domain/          # TS types (Route, Comparison, Compliance, Banking, Pooling)
    adapters/
      ui/
        components/    # React components for each tab (RoutesTab, CompareTab, BankingTab, PoolingTab, TabsLayout)
      infrastructure/
        apiClient.ts   # Typed client for backend APIs
    shared/
      config.ts        # API base URL
    App.tsx            # Tab layout and main shell
    main.tsx           # React entrypoint
    index.css          # Tailwind setup & global styles


---

## Backend Endpoints

Base URL: `http://localhost:4000`

### Routes
- `GET /routes`
- `POST /routes/:routeId/baseline`
- `GET /routes/comparison`

### Compliance
- `GET /compliance/cb?shipId&year`
- `GET /compliance/adjusted-cb?shipId&year`

### Banking
- `GET /banking/records?shipId&year`
- `POST /banking/bank`
- `POST /banking/apply`

### Pooling
- `POST /pools`

---

## Compliance Formula

- Target intensity: **89.3368 gCO₂e/MJ**
- Energy: `fuelConsumption × 41000`
- Compliance Balance (CB):  
  `(Target – Actual) × Energy`

Positive CB → surplus  
Negative CB → deficit

---

## Frontend Features

Tabs in dashboard:

1. Routes — list + filters + baseline select
2. Compare — baseline vs others + compliance chart
3. Banking — CB KPIs + bank/apply actions
4. Pooling — create a valid pool and view before/after CB

---
## Requirements

- Node.js 18 or higher
- npm 9 or higher
- Git

## How to Run

### Backend
cd backend
npm install
npm run dev
Runs on: `http://localhost:4000/`

### Frontend
cd frontend
npm install
npm run dev
Runs on: `http://localhost:5173/`

> Make sure backend is running before frontend.

---

## Notes

- In-memory DB used due to assignment time limits
- Architecture supports replacing it with PostgreSQL easily

---

_Submitted by: **Pulkit Yagyasaini**_

