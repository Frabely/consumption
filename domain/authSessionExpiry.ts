import { isSessionExpired } from "@/domain/authTargetState";
import { parsePersistedAuthSession } from "@/domain/authSessionContract";
import {
  readPersistedAuthSession,
  StorageLike,
} from "@/domain/authSessionStorage";

/**
 * Checks whether the persisted and parseable session has reached its expiry timestamp.
 * @param params Expiry-check parameters.
 * @returns True when the persisted session is expired.
 */
export const hasPersistedSessionExpired = ({
  now = Date.now(),
  storage,
  readSession = readPersistedAuthSession,
}: {
  now?: number;
  storage?: StorageLike;
  readSession?: (storage?: StorageLike) => unknown | null;
}): boolean => {
  const rawSession = readSession(storage);
  const parsed = parsePersistedAuthSession(rawSession);
  if (!parsed.session) {
    return false;
  }

  return isSessionExpired(parsed.session.expiresAt, now);
};

/**
 * Starts a periodic watcher that triggers exactly once when the persisted session expires.
 * @param params Watcher configuration parameters.
 * @returns Cleanup callback to stop the watcher.
 */
export const startSessionExpiryWatcher = ({
  onExpire,
  intervalMs = 60_000,
  storage,
  readSession = readPersistedAuthSession,
  nowFn = Date.now,
}: {
  onExpire: () => void;
  intervalMs?: number;
  storage?: StorageLike;
  readSession?: (storage?: StorageLike) => unknown | null;
  nowFn?: () => number;
}): (() => void) => {
  let hasTriggered = false;

  /**
   * Evaluates expiry state and invokes the expiration callback once.
   * @returns No return value.
   */
  const check = () => {
    if (hasTriggered) {
      return;
    }

    const expired = hasPersistedSessionExpired({
      now: nowFn(),
      storage,
      readSession,
    });

    if (expired) {
      hasTriggered = true;
      onExpire();
    }
  };

  check();
  const timer = setInterval(check, intervalMs);

  return () => clearInterval(timer);
};
