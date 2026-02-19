import {
  AUTH_SESSION_EXPIRY_CHECK_INTERVAL_MS,
  isSessionExpired,
} from "@/utils/authentication/core/targetState";
import { parsePersistedAuthSession } from "@/utils/authentication/session/sessionContract";
import {
  readPersistedAuthSession,
  StorageLike,
} from "@/utils/authentication/session/sessionStorage";

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
  intervalMs = AUTH_SESSION_EXPIRY_CHECK_INTERVAL_MS,
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
