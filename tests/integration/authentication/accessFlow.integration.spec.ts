import { describe, expect, it, vi } from "vitest";
import { Page, Role } from "@/constants/enums";
import { restoreAuthSessionFromStorage } from "@/utils/authentication/session/startup";
import { resolveGuardedPage } from "@/utils/authentication/guards/pageGuard";
import { AUTH_STATUS } from "@/utils/authentication/core/targetState";
import { applyAuthStartupDecision } from "@/utils/authentication/session/startup";
import { setAuthStatusAuthenticated } from "@/store/reducer/authStatus";
import { setCurrentCar } from "@/store/reducer/currentCar";
import { setCurrentUser } from "@/store/reducer/currentUser";
import { StorageLike } from "@/utils/authentication/session/sessionStorage";

const createMemoryStorage = (): StorageLike => {
  const store = new Map<string, string>();
  return {
    getItem: (key: string) => (store.has(key) ? store.get(key)! : null),
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
  };
};

describe("auth access flow integration", () => {
  it("restores valid admin session and allows building page", () => {
    const now = 1_700_000_000_000;
    const storage = createMemoryStorage();
    storage.setItem(
      "consumption.auth.session",
      JSON.stringify({
        schemaVersion: 1,
        userId: "admin-1",
        role: Role.Admin,
        defaultCar: "Zoe",
        expiresAt: now + 60_000,
      }),
    );

    const decision = restoreAuthSessionFromStorage({ storage, now });
    const dispatch = vi.fn();
    applyAuthStartupDecision({
      decision,
      dispatch,
      emitTelemetryEvent: vi.fn(),
    });

    expect(decision.status).toBe(AUTH_STATUS.AUTHENTICATED);
    expect(dispatch).toHaveBeenCalledWith(
      setCurrentUser({
        key: "admin-1",
        role: Role.Admin,
        defaultCar: "Zoe",
      }),
    );
    expect(dispatch).toHaveBeenCalledWith(setCurrentCar({ name: "Zoe" }));
    expect(dispatch).toHaveBeenCalledWith(setAuthStatusAuthenticated());

    const guardedPage = resolveGuardedPage({
      authStatus: AUTH_STATUS.AUTHENTICATED,
      requestedPage: Page.BuildingConsumption,
      userKey: "admin-1",
      userRole: Role.Admin,
    });
    expect(guardedPage).toBe(Page.BuildingConsumption);
  });

  it("redirects non-admin user to home after successful restore", () => {
    const now = 1_700_000_000_000;
    const storage = createMemoryStorage();
    storage.setItem(
      "consumption.auth.session",
      JSON.stringify({
        schemaVersion: 1,
        userId: "user-1",
        role: Role.User,
        defaultCar: "BMW",
        expiresAt: now + 60_000,
      }),
    );

    const decision = restoreAuthSessionFromStorage({ storage, now });
    expect(decision.status).toBe(AUTH_STATUS.AUTHENTICATED);

    const guardedPage = resolveGuardedPage({
      authStatus: AUTH_STATUS.AUTHENTICATED,
      requestedPage: Page.BuildingConsumption,
      userKey: "user-1",
      userRole: Role.User,
    });
    expect(guardedPage).toBe(Page.Home);
  });

  it("cleans expired session and resolves unauthenticated home fallback", () => {
    const now = 1_700_000_000_000;
    const storage = createMemoryStorage();
    storage.setItem(
      "consumption.auth.session",
      JSON.stringify({
        schemaVersion: 1,
        userId: "user-1",
        role: Role.Admin,
        defaultCar: "Zoe",
        expiresAt: now - 1,
      }),
    );

    const decision = restoreAuthSessionFromStorage({ storage, now });
    expect(decision.status).toBe(AUTH_STATUS.UNAUTHENTICATED);
    expect(storage.getItem("consumption.auth.session")).toBeNull();

    const guardedPage = resolveGuardedPage({
      authStatus: AUTH_STATUS.UNAUTHENTICATED,
      requestedPage: Page.BuildingConsumption,
      userKey: undefined,
      userRole: undefined,
    });
    expect(guardedPage).toBe(Page.Home);
  });
});
