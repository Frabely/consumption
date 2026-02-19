import { checkUserId } from "@/firebase/functions";
import { User } from "@/constants/types";
import { setCurrentUser } from "@/store/reducer/currentUser";
import { setCurrentCar } from "@/store/reducer/currentCar";
import { setAuthStatusUnauthenticated } from "@/store/reducer/authStatus";
import {
  clearPersistedAuthSession,
  buildPersistedAuthSession,
  persistAuthSession,
} from "@/utils/authentication/session/sessionStorage";
import { SESSION_VALIDATION_ERROR_CODES } from "@/utils/authentication/constants/errorCodes";
import { EMPTY_USER } from "@/constants/constantData";
import {
  createAuthTelemetryEvent,
  emitAuthTelemetryEvent,
} from "@/utils/authentication/telemetry/telemetry";

export type SessionValidationResult =
  | { status: "valid"; user: User }
  | { status: "invalid" }
  | { status: "unavailable"; message: string };

export type CheckUserIdFn = (id: string) => Promise<User | undefined>;

/**
 * Validates whether the currently active session user is still valid in backend state.
 * @param params Validation input parameters.
 * @returns Validation result describing active-session status.
 */
export const validateActiveSession = async ({
  userId,
  checkUserIdFn = checkUserId,
}: {
  userId: string;
  checkUserIdFn?: CheckUserIdFn;
}): Promise<SessionValidationResult> => {
  try {
    const user = await checkUserIdFn(userId);
    if (!user) {
      return { status: "invalid" };
    }
    return { status: "valid", user };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : SESSION_VALIDATION_ERROR_CODES.SESSION_VALIDATION_UNAVAILABLE;
    return { status: "unavailable", message };
  }
};

export type SessionValidationDispatchAction =
  | ReturnType<typeof setCurrentUser>
  | ReturnType<typeof setCurrentCar>
  | ReturnType<typeof setAuthStatusUnauthenticated>;

export type SessionValidationDispatch = (
  action: SessionValidationDispatchAction,
) => void;

/**
 * Applies session validation outcomes to store state and persisted session storage.
 * @param params Validation result and side-effect dependencies.
 * @returns No return value.
 */
export const applySessionValidationResult = ({
  result,
  dispatch,
  clearSessionFn = clearPersistedAuthSession,
  buildSessionFn = buildPersistedAuthSession,
  persistSessionFn = persistAuthSession,
  emitTelemetryEvent = emitAuthTelemetryEvent,
}: {
  result: SessionValidationResult;
  dispatch: SessionValidationDispatch;
  clearSessionFn?: () => boolean;
  buildSessionFn?: typeof buildPersistedAuthSession;
  persistSessionFn?: typeof persistAuthSession;
  emitTelemetryEvent?: typeof emitAuthTelemetryEvent;
}): void => {
  if (result.status === "invalid") {
    clearSessionFn();
    dispatch(setCurrentUser(EMPTY_USER));
    dispatch(setAuthStatusUnauthenticated());
    emitTelemetryEvent(
      createAuthTelemetryEvent("session_invalidated", {
        reason: SESSION_VALIDATION_ERROR_CODES.BACKEND_USER_MISSING,
      }),
    );
    return;
  }

  if (result.status === "unavailable") {
    emitTelemetryEvent(
      createAuthTelemetryEvent("session_validation_unavailable", {
        message: result.message,
      }),
    );
    return;
  }

  if (result.status === "valid") {
    dispatch(setCurrentUser(result.user));
    if (result.user.defaultCar) {
      dispatch(setCurrentCar({ name: result.user.defaultCar }));
    }
    const session = buildSessionFn(result.user);
    if (session) {
      persistSessionFn({ session });
    }
  }
};

/**
 * Runs active-session validation and directly applies its state side effects.
 * @param params Validation execution parameters.
 * @returns Validation result describing active-session status.
 */
export const validateAndApplyActiveSession = async ({
  userId,
  dispatch,
  checkUserIdFn = checkUserId,
}: {
  userId: string;
  dispatch: SessionValidationDispatch;
  checkUserIdFn?: CheckUserIdFn;
}): Promise<SessionValidationResult> => {
  const result = await validateActiveSession({ userId, checkUserIdFn });
  applySessionValidationResult({ result, dispatch });
  return result;
};
