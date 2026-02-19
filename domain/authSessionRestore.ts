import {
  AUTH_STATUS,
  AuthStatus,
  isSessionExpired,
  PersistedAuthSession,
} from "@/domain/authTargetState";
import { parsePersistedAuthSession } from "@/domain/authSessionContract";
import {
  clearPersistedAuthSession,
  readPersistedAuthSession,
  StorageLike,
} from "@/domain/authSessionStorage";

export type AuthSessionRestoreFailureReason =
  | "missing_session"
  | "invalid_session"
  | "expired_session";

export type AuthSessionRestoreDecision = {
  status: AuthStatus;
  session: PersistedAuthSession | null;
  shouldClearPersistedSession: boolean;
  reason?: AuthSessionRestoreFailureReason;
};

/**
 * Decides the auth startup state based on a raw persisted session payload.
 * @param rawSession Raw persisted session payload.
 * @param now Current timestamp in milliseconds.
 * @returns Auth startup decision for restore handling.
 */
export const decideAuthSessionRestore = (
  rawSession: unknown | null,
  now = Date.now(),
): AuthSessionRestoreDecision => {
  if (rawSession === null) {
    return {
      status: AUTH_STATUS.UNAUTHENTICATED,
      session: null,
      shouldClearPersistedSession: false,
      reason: "missing_session",
    };
  }

  const parsed = parsePersistedAuthSession(rawSession);
  if (!parsed.session) {
    return {
      status: AUTH_STATUS.UNAUTHENTICATED,
      session: null,
      shouldClearPersistedSession: true,
      reason: "invalid_session",
    };
  }

  if (isSessionExpired(parsed.session.expiresAt, now)) {
    return {
      status: AUTH_STATUS.UNAUTHENTICATED,
      session: null,
      shouldClearPersistedSession: true,
      reason: "expired_session",
    };
  }

  return {
    status: AUTH_STATUS.AUTHENTICATED,
    session: parsed.session,
    shouldClearPersistedSession: false,
  };
};

/**
 * Restores auth state from storage and clears persisted session data when required.
 * @param params Restore execution parameters.
 * @returns Auth startup decision for restore handling.
 */
export const restoreAuthSessionFromStorage = ({
  storage,
  now = Date.now(),
  readSession = readPersistedAuthSession,
  clearSession = clearPersistedAuthSession,
}: {
  storage?: StorageLike;
  now?: number;
  readSession?: (storage?: StorageLike) => unknown | null;
  clearSession?: (storage?: StorageLike) => boolean;
}): AuthSessionRestoreDecision => {
  const rawSession = readSession(storage);
  const decision = decideAuthSessionRestore(rawSession, now);

  if (decision.shouldClearPersistedSession) {
    clearSession(storage);
  }

  return decision;
};
