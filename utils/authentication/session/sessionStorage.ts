import { User } from "@/constants/types";
import {
  AUTH_SESSION_SCHEMA_VERSION,
  AUTH_SESSION_STORAGE_KEY,
  createRollingExpiryTimestamp,
  PersistedAuthSession,
} from "@/utils/authentication/core/targetState";

export type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

/**
 * Resolves a storage instance for persistence with browser-safe fallback handling.
 * @param storage Optional injected storage implementation.
 * @returns Storage instance or null when storage is unavailable.
 */
const resolveStorage = (storage?: StorageLike): StorageLike | null => {
  if (storage) {
    return storage;
  }

  if (typeof window !== "undefined" && window.localStorage) {
    return window.localStorage;
  }

  return null;
};

/**
 * Builds a persistable auth session payload from the current user model.
 * @param user Current user model.
 * @param now Current timestamp in milliseconds.
 * @returns Persistable auth session payload or null when required fields are missing.
 */
export const buildPersistedAuthSession = (
  user: User,
  now = Date.now(),
): PersistedAuthSession | null => {
  if (!user.key || user.role === undefined || !user.defaultCar) {
    return null;
  }

  return {
    schemaVersion: AUTH_SESSION_SCHEMA_VERSION,
    userId: user.key,
    role: user.role,
    defaultCar: user.defaultCar,
    expiresAt: createRollingExpiryTimestamp(now),
  };
};

/**
 * Persists a validated auth session payload to storage.
 * @param params Session payload and optional storage implementation.
 * @returns True when persistence succeeded.
 */
export const persistAuthSession = ({
  session,
  storage,
}: {
  session: PersistedAuthSession;
  storage?: StorageLike;
}): boolean => {
  const targetStorage = resolveStorage(storage);
  if (!targetStorage) {
    return false;
  }

  targetStorage.setItem(AUTH_SESSION_STORAGE_KEY, JSON.stringify(session));
  return true;
};

/**
 * Reads and parses the persisted auth session payload from storage.
 * @param storage Optional injected storage implementation.
 * @returns Parsed persisted payload or null when unavailable/invalid.
 */
export const readPersistedAuthSession = (
  storage?: StorageLike,
): unknown | null => {
  const targetStorage = resolveStorage(storage);
  if (!targetStorage) {
    return null;
  }

  const rawValue = targetStorage.getItem(AUTH_SESSION_STORAGE_KEY);
  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue);
  } catch {
    return null;
  }
};

/**
 * Removes the persisted auth session payload from storage.
 * @param storage Optional injected storage implementation.
 * @returns True when session cleanup succeeded.
 */
export const clearPersistedAuthSession = (storage?: StorageLike): boolean => {
  const targetStorage = resolveStorage(storage);
  if (!targetStorage) {
    return false;
  }

  targetStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
  return true;
};



