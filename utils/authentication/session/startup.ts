import {
  AUTH_STATUS,
  AuthStatus,
  isSessionExpired,
  PersistedAuthSession,
} from "@/utils/authentication/core/targetState";
import { parsePersistedAuthSession } from "@/utils/authentication/session/sessionContract";
import {
  AUTH_SESSION_RESTORE_FAILURE_REASONS,
  AuthSessionRestoreFailureReason,
} from "@/utils/authentication/constants/errorCodes";
import {
  clearPersistedAuthSession,
  readPersistedAuthSession,
  StorageLike,
} from "@/utils/authentication/session/sessionStorage";
import {
  setAuthStatusAuthenticated,
  setAuthStatusUnauthenticated,
} from "@/store/reducer/authStatus";
import { setCurrentUser } from "@/store/reducer/currentUser";
import { setCurrentCar } from "@/store/reducer/currentCar";
import { EMPTY_USER } from "@/constants/constantData";
import {
  createAuthTelemetryEvent,
  emitAuthTelemetryEvent,
} from "@/utils/authentication/telemetry/telemetry";

export type AuthStartupDispatchAction =
  | ReturnType<typeof setAuthStatusAuthenticated>
  | ReturnType<typeof setAuthStatusUnauthenticated>
  | ReturnType<typeof setCurrentUser>
  | ReturnType<typeof setCurrentCar>;

export type AuthStartupDispatch = (action: AuthStartupDispatchAction) => void;

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
      reason: AUTH_SESSION_RESTORE_FAILURE_REASONS.MISSING_SESSION,
    };
  }

  const parsed = parsePersistedAuthSession(rawSession);
  if (!parsed.session) {
    return {
      status: AUTH_STATUS.UNAUTHENTICATED,
      session: null,
      shouldClearPersistedSession: true,
      reason: AUTH_SESSION_RESTORE_FAILURE_REASONS.INVALID_SESSION,
    };
  }

  if (isSessionExpired(parsed.session.expiresAt, now)) {
    return {
      status: AUTH_STATUS.UNAUTHENTICATED,
      session: null,
      shouldClearPersistedSession: true,
      reason: AUTH_SESSION_RESTORE_FAILURE_REASONS.EXPIRED_SESSION,
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

/**
 * Applies the restore decision by synchronizing auth-related slices in the store.
 * @param params Decision payload and dispatch function.
 * @returns No return value.
 */
export const applyAuthStartupDecision = ({
  decision,
  dispatch,
  emitTelemetryEvent = emitAuthTelemetryEvent,
}: {
  decision: AuthSessionRestoreDecision;
  dispatch: AuthStartupDispatch;
  emitTelemetryEvent?: typeof emitAuthTelemetryEvent;
}): void => {
  if (decision.status === AUTH_STATUS.AUTHENTICATED && decision.session) {
    dispatch(
      setCurrentUser({
        key: decision.session.userId,
        role: decision.session.role,
        defaultCar: decision.session.defaultCar,
      }),
    );
    dispatch(setCurrentCar({ name: decision.session.defaultCar }));
    dispatch(setAuthStatusAuthenticated());
    emitTelemetryEvent(
      createAuthTelemetryEvent("rehydration_success", {
        userId: decision.session.userId,
      }),
    );
    return;
  }

  dispatch(setCurrentUser(EMPTY_USER));
  dispatch(setAuthStatusUnauthenticated());
  emitTelemetryEvent(
    createAuthTelemetryEvent("rehydration_fallback", {
      reason: decision.reason,
    }),
  );
};

/**
 * Restores persisted auth session state during app bootstrap.
 * @param params Startup restore parameters.
 * @returns No return value.
 */
export const restoreAuthOnAppStart = ({
  dispatch,
  now = Date.now(),
  restoreSessionFn = restoreAuthSessionFromStorage,
}: {
  dispatch: AuthStartupDispatch;
  now?: number;
  restoreSessionFn?: (params: { now: number }) => AuthSessionRestoreDecision;
}): void => {
  const decision = restoreSessionFn({ now });
  applyAuthStartupDecision({ decision, dispatch });
};
