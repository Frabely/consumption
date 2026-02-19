import { describe, expect, it, vi } from "vitest";
import { AUTH_SESSION_STORAGE_KEY } from "@/domain/authTargetState";
import {
  StorageEventLike,
  subscribeToAuthSessionCrossTabSync,
} from "@/domain/authCrossTabSync";

const createStorageEventTargetMock = () => {
  let listener: ((event: StorageEventLike) => void) | undefined;
  return {
    addEventListener: vi.fn(
      (_type: "storage", callback: (event: StorageEventLike) => void) => {
        listener = callback;
      },
    ),
    removeEventListener: vi.fn(
      (_type: "storage", callback: (event: StorageEventLike) => void) => {
        if (listener === callback) {
          listener = undefined;
        }
      },
    ),
    emit: (event: StorageEventLike) => listener?.(event),
  };
};

describe("subscribeToAuthSessionCrossTabSync", () => {
  it("subscribes and unsubscribes storage listener", () => {
    const eventTarget = createStorageEventTargetMock();

    const cleanup = subscribeToAuthSessionCrossTabSync({
      onSessionCleared: vi.fn(),
      eventTarget,
    });

    expect(eventTarget.addEventListener).toHaveBeenCalledWith(
      "storage",
      expect.any(Function),
    );

    cleanup();

    expect(eventTarget.removeEventListener).toHaveBeenCalledWith(
      "storage",
      expect.any(Function),
    );
  });

  it("triggers callback when auth session key is removed", () => {
    const onSessionCleared = vi.fn();
    const eventTarget = createStorageEventTargetMock();
    const cleanup = subscribeToAuthSessionCrossTabSync({
      onSessionCleared,
      eventTarget,
    });

    eventTarget.emit({
      key: AUTH_SESSION_STORAGE_KEY,
      newValue: null,
    });

    expect(onSessionCleared).toHaveBeenCalledTimes(1);
    cleanup();
  });

  it("ignores unrelated storage events", () => {
    const onSessionCleared = vi.fn();
    const eventTarget = createStorageEventTargetMock();
    const cleanup = subscribeToAuthSessionCrossTabSync({
      onSessionCleared,
      eventTarget,
    });

    eventTarget.emit({
      key: "other.key",
      newValue: null,
    });
    eventTarget.emit({
      key: AUTH_SESSION_STORAGE_KEY,
      newValue: '{"schemaVersion":1}',
    });

    expect(onSessionCleared).not.toHaveBeenCalled();
    cleanup();
  });
});
