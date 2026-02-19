import { describe, expect, it, vi } from "vitest";
import { Role } from "@/constants/enums";
import { AUTH_STATUS } from "@/domain/authTargetState";
import {
  decideAuthSessionRestore,
  restoreAuthSessionFromStorage,
} from "@/domain/authSessionRestore";
import { StorageLike } from "@/domain/authSessionStorage";

const validSession = {
  schemaVersion: 1,
  userId: "1234",
  role: Role.Admin,
  defaultCar: "Zoe",
  expiresAt: 2_000_000_000_000,
};

describe("authSessionRestore", () => {
  it("returns unauthenticated when no session is present", () => {
    const result = decideAuthSessionRestore(null);
    expect(result).toEqual({
      status: AUTH_STATUS.UNAUTHENTICATED,
      session: null,
      shouldClearPersistedSession: false,
      reason: "missing_session",
    });
  });

  it("returns unauthenticated and clear flag for invalid session", () => {
    const result = decideAuthSessionRestore({ schemaVersion: 999 });
    expect(result.status).toBe(AUTH_STATUS.UNAUTHENTICATED);
    expect(result.reason).toBe("invalid_session");
    expect(result.shouldClearPersistedSession).toBe(true);
  });

  it("returns unauthenticated and clear flag for expired session", () => {
    const result = decideAuthSessionRestore(
      { ...validSession, expiresAt: 1_700_000_000_000 },
      1_700_000_000_001,
    );
    expect(result.status).toBe(AUTH_STATUS.UNAUTHENTICATED);
    expect(result.reason).toBe("expired_session");
    expect(result.shouldClearPersistedSession).toBe(true);
  });

  it("returns authenticated for valid non-expired session", () => {
    const result = decideAuthSessionRestore(validSession, 1_900_000_000_000);
    expect(result.status).toBe(AUTH_STATUS.AUTHENTICATED);
    expect(result.session).toEqual(validSession);
    expect(result.shouldClearPersistedSession).toBe(false);
  });

  it("accepts legacy v0 payload via migration path", () => {
    const result = decideAuthSessionRestore(
      {
        key: "1234",
        role: Role.User,
        defaultCar: "BMW",
        expiresAt: 1_900_000_000_000,
      },
      1_800_000_000_000,
    );

    expect(result.status).toBe(AUTH_STATUS.AUTHENTICATED);
    expect(result.session?.userId).toBe("1234");
    expect(result.session?.schemaVersion).toBe(1);
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

    expect(decision.reason).toBe("invalid_session");
    expect(clearSession).toHaveBeenCalledWith(storage);
  });
});
