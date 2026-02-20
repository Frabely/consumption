# Test Structure

- `tests/unit/`: unit-focused tests for domain, utility and service logic.
- `tests/integration/`: integration tests for orchestration and cross-module flows.
- `tests/fixtures/`: shared test data fixtures.
- `tests/factories/`: object builders/factories for test setup.
- `tests/helpers/`: reusable test helpers and wrappers.
- `tests/mocks/server/`: centralized mock server and API handlers.

## Execution
- `npm run test:unit` runs only unit tests in `tests/unit/**`.
- `npm run test:integration` runs only integration tests in `tests/integration/**`.
- `npm run test:e2e` runs only browser e2e tests from `e2e/**`.
- `npm run test` runs the complete Vitest scope (excluding `e2e/**`) via `vitest.all.config.mjs`.
- `npm run test:coverage` creates a Vitest coverage report.

## Setup
- Unit setup is configured in `vitest.unit.config.mjs` via `tests/helpers/vitest/setup.unit.ts`
- Integration setup is configured in `vitest.integration.config.mjs` via `tests/helpers/vitest/setup.integration.ts`
- E2E session seeding: `tests/helpers/e2e/authSessionSeed.ts`

