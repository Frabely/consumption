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

describe("authStartup", () => {
  it("applies authenticated startup decision", () => {
    const dispatch = vi.fn();
    const decision = {
      status: AUTH_STATUS.AUTHENTICATED as const,
      session: {
        schemaVersion: 1,
        userId: "1234",
        role: Role.Admin,
        defaultCar: "Zoe",
        expiresAt: 2_000_000_000_000,
      },
      shouldClearPersistedSession: false,
    };

    applyAuthStartupDecision({ decision, dispatch });

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
  });

  it("applies unauthenticated startup decision", () => {
    const dispatch = vi.fn();
    const decision = {
      status: AUTH_STATUS.UNAUTHENTICATED as const,
      session: null,
      shouldClearPersistedSession: false,
      reason: "missing_session" as const,
    };

    applyAuthStartupDecision({ decision, dispatch });

    expect(dispatch).toHaveBeenCalledWith(setAuthStatusUnauthenticated());
    expect(dispatch).toHaveBeenCalledWith(setCurrentUser({}));
  });

  it("restores on app start via storage decision", () => {
    const dispatch = vi.fn();
    const decision = {
      status: AUTH_STATUS.AUTHENTICATED as const,
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
