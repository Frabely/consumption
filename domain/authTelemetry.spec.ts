import { describe, expect, it, vi } from "vitest";
import {
  createAuthTelemetryEvent,
  emitAuthTelemetryEvent,
} from "@/domain/authTelemetry";

describe("authTelemetry", () => {
  it("creates normalized telemetry events", () => {
    const event = createAuthTelemetryEvent(
      "login_success",
      { userId: "1234" },
      1_700_000_000_000,
    );

    expect(event).toEqual({
      name: "login_success",
      payload: { userId: "1234" },
      at: 1_700_000_000_000,
    });
  });

  it("dispatches browser telemetry custom event", () => {
    const dispatchFn = vi.fn();

    emitAuthTelemetryEvent(
      createAuthTelemetryEvent("rehydration_success", { userId: "7777" }),
      dispatchFn,
    );

    expect(dispatchFn).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "consumption:auth-telemetry",
      }),
    );
  });
});
