import type { BrowserContext, Page } from "@playwright/test";
import {
  AUTH_SESSION_STORAGE_KEY,
  E2E_MOCK_STORAGE_KEY,
  E2EAuthSession,
} from "@/tests/fixtures/e2e/authSession.fixture";
import { createE2EAuthSession } from "@/tests/factories/e2e/authSession.factory";

type InitScriptTarget = Pick<BrowserContext, "addInitScript"> | Pick<Page, "addInitScript">;

/**
 * Seeds auth session and e2e mock-mode marker into localStorage before app boot.
 * @param target Page or browser context that supports addInitScript.
 * @param sessionOverrides Optional overrides for the seeded auth session.
 * @returns Promise resolved when init script registration has completed.
 */
export const seedAuthSession = async (
  target: InitScriptTarget,
  sessionOverrides: Partial<E2EAuthSession> = {},
): Promise<void> => {
  const seededSession = createE2EAuthSession(sessionOverrides);

  await target.addInitScript(
    ({ authSessionKey, authSessionValue, mockStorageKey }) => {
      window.localStorage.setItem(authSessionKey, authSessionValue);
      window.localStorage.setItem(mockStorageKey, "1");
    },
    {
      authSessionKey: AUTH_SESSION_STORAGE_KEY,
      authSessionValue: JSON.stringify(seededSession),
      mockStorageKey: E2E_MOCK_STORAGE_KEY,
    },
  );
};
