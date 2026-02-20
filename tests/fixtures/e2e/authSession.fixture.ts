export const AUTH_SESSION_STORAGE_KEY = "consumption.auth.session";
export const E2E_MOCK_STORAGE_KEY = "consumption.e2e.mock-data";

export const E2E_SESSION_SCHEMA_VERSION = 1;
export const E2E_SESSION_DURATION_MS = 24 * 60 * 60 * 1000;
export const E2E_AUTH_PIN = "1234";

export type E2EAuthSession = {
  schemaVersion: number;
  userId: string;
  role: number;
  defaultCar: string;
  expiresAt: number;
};

/**
 * Builds the default persisted auth session payload used by e2e tests.
 * @param overrides Optional partial overrides for specific test scenarios.
 * @returns Deterministic auth session object used for localStorage seeding.
 */
export const buildDefaultE2EAuthSession = (
  overrides: Partial<E2EAuthSession> = {},
): E2EAuthSession => ({
  schemaVersion: E2E_SESSION_SCHEMA_VERSION,
  userId: "playwright-user",
  role: 2,
  defaultCar: "Zoe",
  expiresAt: Date.now() + E2E_SESSION_DURATION_MS,
  ...overrides,
});
