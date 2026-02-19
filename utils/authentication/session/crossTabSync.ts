import { AUTH_SESSION_STORAGE_KEY } from "@/utils/authentication/core/targetState";

export type StorageEventLike = Pick<StorageEvent, "key" | "newValue">;

export type StorageEventTargetLike = {
  addEventListener: (
    type: "storage",
    listener: (event: StorageEventLike) => void,
  ) => void;
  removeEventListener: (
    type: "storage",
    listener: (event: StorageEventLike) => void,
  ) => void;
};

/**
 * Subscribes to auth-session storage changes from other browser tabs.
 * @param params Sync subscription configuration.
 * @returns Cleanup callback to remove the storage listener.
 */
export const subscribeToAuthSessionCrossTabSync = ({
  onSessionCleared,
  eventTarget,
}: {
  onSessionCleared: () => void;
  eventTarget?: StorageEventTargetLike;
}): (() => void) => {
  if (eventTarget) {
    /**
     * Handles storage events and triggers logout sync when auth session is removed.
     * @param event Browser storage event.
     * @returns No return value.
     */
    const onStorage = (event: StorageEventLike) => {
      if (event.key !== AUTH_SESSION_STORAGE_KEY) {
        return;
      }

      if (event.newValue !== null) {
        return;
      }

      onSessionCleared();
    };

    eventTarget.addEventListener("storage", onStorage);

    return () => {
      eventTarget.removeEventListener("storage", onStorage);
    };
  }

  if (typeof window === "undefined") {
    return () => {};
  }

  /**
   * Handles storage events and triggers logout sync when the auth session is removed.
   * @param event Browser storage event.
   * @returns No return value.
   */
  const onStorage = (event: StorageEvent) => {
    if (event.key !== AUTH_SESSION_STORAGE_KEY) {
      return;
    }

    if (event.newValue !== null) {
      return;
    }

    onSessionCleared();
  };

  window.addEventListener("storage", onStorage);

  return () => {
    window.removeEventListener("storage", onStorage);
  };
};



