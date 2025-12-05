# AI Agent Workflow Log

## Agents Used

- ChatGPT (OpenAI GPT-5.1 Thinking) – used as main coding assistant for:
  - Backend architecture & route/compliance logic
  - Banking & pooling domain logic
  - Frontend React + TypeScript + Tailwind dashboard
  - Documentation drafts (README, REFLECTION, this file)

## Prompts & Outputs

### Example 1 – Backend routes & comparison

**Prompt (simplified):**

> “I have this FuelEU assignment. Backend: Node + TS + hexagonal. I need `/routes`, `/routes/comparison`, baseline logic, and compliance formula. I don’t know much, give me complete files so I can just paste and run.”

**Generated output:**

- `InMemoryRoutesRepository` with seeded R001–R005 routes
- `GetRoutesUseCase`, `SetBaselineRouteUseCase`, `GetRoutesComparisonUseCase`
- `routesRouter` with:
  - `GET /routes`
  - `POST /routes/:routeId/baseline`
  - `GET /routes/comparison` (percent difference + compliant flag)
- `server.ts` wiring with hexagonal style

I copied these files into the backend, ran `npm run dev`, and verified responses with the browser (`/routes`, `/routes/comparison`).

### Example 2 – Frontend dashboard tabs

**Prompt (simplified):**

> “Frontend is Vite React + TS + Tailwind. I need a four-tab dashboard: Routes, Compare, Banking, Pooling. All data should come from my backend API endpoints. Please give me complete components and an `apiClient`.”

**Generated output:**

- `apiClient.ts` calling:
  - `/routes`, `/routes/comparison`
  - `/compliance/cb`, `/compliance/adjusted-cb`
  - `/banking/records`, `/banking/bank`, `/banking/apply`
  - `/pools`
- UI components:
  - `RoutesTab.tsx` – table + filters + “Set Baseline”
  - `CompareTab.tsx` – baseline vs others, chart + table
  - `BankingTab.tsx` – CB KPIs, bank/apply flow
  - `PoolingTab.tsx` – member selector + pool result table
  - `TabsLayout.tsx` – tab navigation
- Updated `App.tsx` to wire tabs together.

I pasted the code, started frontend and backend, and verified that each tab successfully calls the corresponding backend endpoint.

## Validation / Corrections

- **Runtime verification**  
  - Called each backend endpoint in the browser:
    - `/routes`, `/routes/comparison`
    - `/compliance/cb?shipId=R001&year=2024`
    - `/banking/records?shipId=R002&year=2024`
    - `/compliance/adjusted-cb?shipId=R001&year=2024`
  - Verified JSON structure matches what the frontend expects.

- **Fixes applied manually**
  - Adjusted TypeScript configs for both backend and frontend to remove `verbatimModuleSyntax` issues.
  - Switched Tailwind from v4 preview back to Tailwind v3 to avoid breaking changes and complex new configuration.
  - Created in-memory repositories (`InMemoryRoutesRepository`, `InMemoryBankingRepository`, `InMemoryPoolsRepository`) to replace a full PostgreSQL adapter due to time constraints, keeping the ports so a real DB can be plugged in later.

## Observations

- **Where the agent saved time**
  - Bootstrapping hexagonal backend structure and wiring use-cases and routers.
  - Translating the FuelEU spec (CB formula, banking, pooling rules) into TypeScript logic.
  - Generating React components with consistent Tailwind styling and clean state management.
  - Drafting documentation structure and content.

- **Where the agent struggled / hallucinated**
  - Tailwind CSS v4 vs v3: initial suggestions assumed older config, and I had to switch to a stable Tailwind 3 setup.
  - Some TypeScript settings (`verbatimModuleSyntax`) required manual tsconfig updates.
  - Minor path mistakes or missing domain files required manual fixes.

- **How tools were combined**
  - Used ChatGPT for:
    - Designing domain models and ports (routes, banking, pooling).
    - Writing use-case classes and in-memory adapters.
    - Writing complete React components and an API client.
    - Generating docs templates (README, AGENT_WORKFLOW, REFLECTION).
  - Used the browser and Vite’s dev overlay to quickly debug integration issues.
  - Used VS Code to manage files, resolve import paths, and quickly check TypeScript diagnostics.

## Best Practices Followed

- Kept a **hexagonal architecture** boundary:
  - `core/domain`, `core/application`, `core/ports` for business logic
  - `adapters/inbound/http` for Express routers
  - `adapters/outbound/*` for in-memory repositories
  - `infrastructure/server` for HTTP server wiring
- Used AI to:
  - Generate boilerplate and refactor code instead of writing everything from scratch.
  - Ask for **full file replacements** to avoid small incremental mistakes.
- Verified AI output:
  - By running actual endpoints and UI flows, not just trusting the snippets.
  - By adjusting tooling (Tailwind, TypeScript) when reality didn’t match the initial AI assumptions.
