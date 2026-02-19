import { describe, expect, it, vi } from "vitest";
import { Role } from "@/constants/enums";
import { AUTH_STATUS } from "@/domain/authTargetState";
import {
  setAuthStatusAuthenticated,
  setAuthStatusUnauthenticated,
} from "@/store/reducer/authStatus";
import { setCurrentUser } from "@/store/reducer/currentUser";
import { setCurrentCar } from "@/store/reducer/currentCar";
import {
  applyAuthStartupDecision,
  restoreAuthOnAppStart,
} from "@/domain/authStartup";
import * as restoreModule from "@/domain/authSessionRestore";
import { AuthSessionRestoreDecision } from "@/domain/authSessionRestore";

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
      reason: "missing_session",
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
    };

    const spy = vi
      .spyOn(restoreModule, "restoreAuthSessionFromStorage")
      .mockReturnValue(decision);

    restoreAuthOnAppStart({ dispatch, now: 1_700_000_000_000 });

    expect(spy).toHaveBeenCalledWith({ now: 1_700_000_000_000 });
    expect(dispatch).toHaveBeenCalledWith(setAuthStatusAuthenticated());
    spy.mockRestore();
  });
});
