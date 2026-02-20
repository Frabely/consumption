import {
  buildDefaultE2EAuthSession,
  E2EAuthSession,
} from "../../fixtures/e2e/authSession.fixture";

/**
 * Represents deterministic mock-server data used in e2e and integration tests.
 */
export type E2EMockServerState = {
  authSession: E2EAuthSession;
  cars: readonly string[];
};

/**
 * Creates deterministic e2e mock-server state used by tests as a single source.
 * @param authSessionOverrides Optional auth session overrides.
 * @returns Deterministic mock server state snapshot.
 */
export const createE2EMockServerState = (
  authSessionOverrides: Partial<E2EAuthSession> = {},
): E2EMockServerState => ({
  authSession: buildDefaultE2EAuthSession(authSessionOverrides),
  cars: ["Zoe", "BMW"] as const,
});
