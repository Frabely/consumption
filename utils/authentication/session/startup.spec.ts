import { describe, expect, it, vi } from "vitest";
import { Role } from "@/constants/enums";
import { AUTH_STATUS } from "@/utils/authentication/core/targetState";
import {
  setAuthStatusAuthenticated,
  setAuthStatusUnauthenticated,
} from "@/store/reducer/authStatus";
import { setCurrentUser } from "@/store/reducer/currentUser";
import { setCurrentCar } from "@/store/reducer/currentCar";
import {
  AUTH_SESSION_RESTORE_FAILURE_REASONS,
  applyAuthStartupDecision,
  decideAuthSessionRestore,
  restoreAuthOnAppStart,
  restoreAuthSessionFromStorage,
} from "@/utils/authentication/session/startup";
import { AuthSessionRestoreDecision } from "@/utils/authentication/session/startup";
import { StorageLike } from "@/utils/authentication/session/sessionStorage";

const validSession = {
  schemaVersion: 1,
  userId: "1234",
  role: Role.Admin,
  defaultCar: "Zoe",
  expiresAt: 2_000_000_000_000,
};

describe("authStartup", () => {
  it("applies authenticated startup decision", () => {
    const dispatch = vi.fn();
    const emitTelemetryEvent = vi.fn();
    const decision = {
      status: AUTH_STATUS.AUTHENTICATED,
      session: {
        schemaVersion: 1,
        userId: "1234",
        role: Role.Admin,
        defaultCar: "Zoe",
        expiresAt: 2_000_000_000_000,
      },
      shouldClearPersistedSession: false,
    };

    applyAuthStartupDecision({ decision, dispatch, emitTelemetryEvent });

    expect(dispatch).toHaveBeenNthCalledWith(
      1,
      setCurrentUser({
        key: "1234",
        role: Role.Admin,
        defaultCar: "Zoe",
      }),
    );
    expect(dispatch).toHaveBeenNthCalledWith(2, setCurrentCar({ name: "Zoe" }));
    expect(dispatch).toHaveBeenNthCalledWith(3, setAuthStatusAuthenticated());
    expect(emitTelemetryEvent).toHaveBeenCalledTimes(1);
  });

  it("applies unauthenticated startup decision", () => {
    const dispatch = vi.fn();
    const emitTelemetryEvent = vi.fn();
    const decision: AuthSessionRestoreDecision = {
      status: AUTH_STATUS.UNAUTHENTICATED,
      session: null,
      shouldClearPersistedSession: false,
      reason: AUTH_SESSION_RESTORE_FAILURE_REASONS.MISSING_SESSION,
    };

    applyAuthStartupDecision({ decision, dispatch, emitTelemetryEvent });

    expect(dispatch).toHaveBeenCalledWith(setAuthStatusUnauthenticated());
    expect(dispatch).toHaveBeenCalledWith(setCurrentUser({}));
    expect(emitTelemetryEvent).toHaveBeenCalledTimes(1);
  });

  it("restores on app start via storage decision", () => {
    const dispatch = vi.fn();
    const decision = {
      status: AUTH_STATUS.AUTHENTICATED,
      session: {
        schemaVersion: 1,
        userId: "7777",
        role: Role.User,
        defaultCar: "BMW",
        expiresAt: 2_100_000_000_000,
      },
      shouldClearPersistedSession: false,
    } satisfies AuthSessionRestoreDecision;
    const restoreSessionFn = vi.fn(() => decision);

    restoreAuthOnAppStart({
      dispatch,
      now: 1_700_000_000_000,
      restoreSessionFn,
    });

    expect(restoreSessionFn).toHaveBeenCalledWith({ now: 1_700_000_000_000 });
    expect(dispatch).toHaveBeenCalledWith(setAuthStatusAuthenticated());
  });

  it("returns unauthenticated when no session is present", () => {
    const result = decideAuthSessionRestore(null);
    expect(result).toEqual({
      status: AUTH_STATUS.UNAUTHENTICATED,
      session: null,
      shouldClearPersistedSession: false,
      reason: AUTH_SESSION_RESTORE_FAILURE_REASONS.MISSING_SESSION,
    });
  });

  it("returns unauthenticated and clear flag for invalid session", () => {
    const result = decideAuthSessionRestore({ schemaVersion: 999 });
    expect(result.status).toBe(AUTH_STATUS.UNAUTHENTICATED);
    expect(result.reason).toBe(
      AUTH_SESSION_RESTORE_FAILURE_REASONS.INVALID_SESSION,
    );
    expect(result.shouldClearPersistedSession).toBe(true);
  });

  it("returns unauthenticated and clear flag for expired session", () => {
    const result = decideAuthSessionRestore(
      { ...validSession, expiresAt: 1_700_000_000_000 },
      1_700_000_000_001,
    );
    expect(result.status).toBe(AUTH_STATUS.UNAUTHENTICATED);
    expect(result.reason).toBe(
      AUTH_SESSION_RESTORE_FAILURE_REASONS.EXPIRED_SESSION,
    );
    expect(result.shouldClearPersistedSession).toBe(true);
  });

  it("returns authenticated for valid non-expired session", () => {
    const result = decideAuthSessionRestore(validSession, 1_900_000_000_000);
    expect(result.status).toBe(AUTH_STATUS.AUTHENTICATED);
    expect(result.session).toEqual(validSession);
    expect(result.shouldClearPersistedSession).toBe(false);
  });

  it("clears persisted session when decision requires cleanup", () => {
    const storage = {} as StorageLike;
    const clearSession = vi.fn(() => true);
    const readSession = vi.fn(() => ({ schemaVersion: 999 }));

    const decision = restoreAuthSessionFromStorage({
      storage,
      readSession,
      clearSession,
    });

    expect(decision.reason).toBe(
      AUTH_SESSION_RESTORE_FAILURE_REASONS.INVALID_SESSION,
    );
    expect(clearSession).toHaveBeenCalledWith(storage);
  });
});
