import { describe, expect, it, vi } from "vitest";
import { Role } from "@/constants/enums";
import {
  applySessionValidationResult,
  validateActiveSession,
  validateAndApplyActiveSession,
} from "@/utils/authentication/session/sessionValidation";
import { setCurrentUser } from "@/store/reducer/currentUser";
import { setCurrentCar } from "@/store/reducer/currentCar";
import { setAuthStatusUnauthenticated } from "@/store/reducer/authStatus";

describe("authSessionValidation", () => {
  it("returns invalid when backend does not know the user", async () => {
    const checkUserIdFn = vi.fn().mockResolvedValue(undefined);

    const result = await validateActiveSession({
      userId: "1234",
      checkUserIdFn,
    });

    expect(result).toEqual({ status: "invalid" });
  });

  it("returns unavailable when backend validation errors", async () => {
    const checkUserIdFn = vi.fn().mockRejectedValue(new Error("network down"));

    const result = await validateActiveSession({
      userId: "1234",
      checkUserIdFn,
    });

    expect(result).toEqual({ status: "unavailable", message: "network down" });
  });

  it("applies invalid result by clearing auth state", () => {
    const dispatch = vi.fn();
    const clearSessionFn = vi.fn(() => true);
    const emitTelemetryEvent = vi.fn();

    applySessionValidationResult({
      result: { status: "invalid" },
      dispatch,
      clearSessionFn,
      emitTelemetryEvent,
    });

    expect(clearSessionFn).toHaveBeenCalledTimes(1);
    expect(dispatch).toHaveBeenCalledWith(setCurrentUser({}));
    expect(dispatch).toHaveBeenCalledWith(setAuthStatusUnauthenticated());
    expect(emitTelemetryEvent).toHaveBeenCalledTimes(1);
  });

  it("emits telemetry for unavailable validation result", () => {
    const dispatch = vi.fn();
    const emitTelemetryEvent = vi.fn();

    applySessionValidationResult({
      result: { status: "unavailable", message: "network down" },
      dispatch,
      emitTelemetryEvent,
    });

    expect(dispatch).not.toHaveBeenCalled();
    expect(emitTelemetryEvent).toHaveBeenCalledTimes(1);
  });

  it("applies valid result by syncing user/car and persisting refreshed session", () => {
    const dispatch = vi.fn();
    const persistSessionFn = vi.fn(() => true);
    const buildSessionFn = vi.fn().mockReturnValue({
      schemaVersion: 1,
      userId: "1234",
      role: Role.Admin,
      defaultCar: "Zoe",
      expiresAt: 2_000_000_000_000,
    });
    const user = { key: "1234", role: Role.Admin, defaultCar: "Zoe" };

    applySessionValidationResult({
      result: { status: "valid", user },
      dispatch,
      buildSessionFn,
      persistSessionFn,
    });

    expect(dispatch).toHaveBeenCalledWith(setCurrentUser(user));
    expect(dispatch).toHaveBeenCalledWith(setCurrentCar({ name: "Zoe" }));
    expect(buildSessionFn).toHaveBeenCalledWith(user);
    expect(persistSessionFn).toHaveBeenCalledTimes(1);
  });

  it("validateAndApplyActiveSession validates and applies", async () => {
    const dispatch = vi.fn();
    const checkUserIdFn = vi
      .fn()
      .mockResolvedValue({ key: "7777", role: Role.User, defaultCar: "BMW" });

    const result = await validateAndApplyActiveSession({
      userId: "7777",
      dispatch,
      checkUserIdFn,
    });

    expect(result.status).toBe("valid");
    expect(dispatch).toHaveBeenCalledWith(
      setCurrentUser({ key: "7777", role: Role.User, defaultCar: "BMW" }),
    );
  });
});



