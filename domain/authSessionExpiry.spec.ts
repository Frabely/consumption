import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  hasPersistedSessionExpired,
  startSessionExpiryWatcher,
} from "@/domain/authSessionExpiry";
import { Role } from "@/constants/enums";

describe("authSessionExpiry", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("detects expired persisted sessions", () => {
    const readSession = vi.fn().mockReturnValue({
      schemaVersion: 1,
      userId: "1234",
      role: Role.Admin,
      defaultCar: "Zoe",
      expiresAt: 100,
    });

    expect(hasPersistedSessionExpired({ now: 101, readSession })).toBe(true);
    expect(hasPersistedSessionExpired({ now: 99, readSession })).toBe(false);
  });

  it("returns false for missing or invalid sessions", () => {
    const missing = vi.fn().mockReturnValue(null);
    const invalid = vi.fn().mockReturnValue({ schemaVersion: 999 });

    expect(hasPersistedSessionExpired({ readSession: missing })).toBe(false);
    expect(hasPersistedSessionExpired({ readSession: invalid })).toBe(false);
  });

  it("triggers onExpire once when session expires", () => {
    const onExpire = vi.fn();
    const readSession = vi.fn().mockReturnValue({
      schemaVersion: 1,
      userId: "1234",
      role: Role.User,
      defaultCar: "BMW",
      expiresAt: 1_000,
    });
    let now = 900;
    const stop = startSessionExpiryWatcher({
      onExpire,
      intervalMs: 100,
      readSession,
      nowFn: () => now,
    });

    expect(onExpire).not.toHaveBeenCalled();
    now = 1_100;
    vi.advanceTimersByTime(100);
    expect(onExpire).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(300);
    expect(onExpire).toHaveBeenCalledTimes(1);
    stop();
  });
});
