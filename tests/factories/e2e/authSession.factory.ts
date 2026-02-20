import {
  buildDefaultE2EAuthSession,
  E2EAuthSession,
} from "../../fixtures/e2e/authSession.fixture";

/**
 * Creates an auth session object for e2e tests.
 * @param overrides Optional session fields to override.
 * @returns Auth session object ready for localStorage seeding.
 */
export const createE2EAuthSession = (
  overrides: Partial<E2EAuthSession> = {},
): E2EAuthSession => buildDefaultE2EAuthSession(overrides);
