import { User } from "@/constants/types";
import {
  AUTH_SESSION_SCHEMA_VERSION,
  AUTH_SESSION_STORAGE_KEY,
  createRollingExpiryTimestamp,
  PersistedAuthSession,
} from "@/domain/authTargetState";

export type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

const resolveStorage = (storage?: StorageLike): StorageLike | null => {
  if (storage) {
    return storage;
  }

  if (typeof window !== "undefined" && window.localStorage) {
    return window.localStorage;
  }

  return null;
};

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

export const clearPersistedAuthSession = (storage?: StorageLike): boolean => {
  const targetStorage = resolveStorage(storage);
  if (!targetStorage) {
    return false;
  }

  targetStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
  return true;
};
