import { clearPersistedAuthSession } from "@/utils/authentication/session/sessionStorage";
import { setCurrentUser } from "@/store/reducer/currentUser";
import { setModalStateNone } from "@/store/reducer/modalState";
import { setPage } from "@/store/reducer/currentPage";
import { Page } from "@/constants/enums";
import { EMPTY_USER } from "@/constants/constantData";
import { setAuthStatusUnauthenticated } from "@/store/reducer/authStatus";
import { setDataSetArray } from "@/store/reducer/currentDataSet";
import {
  createAuthTelemetryEvent,
  emitAuthTelemetryEvent,
} from "@/utils/authentication/telemetry/telemetry";
import { LogoutReason } from "@/utils/authentication/core/targetState";

export type AuthLogoutDispatchAction =
  | ReturnType<typeof setCurrentUser>
  | ReturnType<typeof setModalStateNone>
  | ReturnType<typeof setPage>
  | ReturnType<typeof setAuthStatusUnauthenticated>
  | ReturnType<typeof setDataSetArray>;

export type AuthLogoutDispatch = (action: AuthLogoutDispatchAction) => void;

/**
 * Executes a full auth logout flow including session cleanup and navigation reset.
 * @param params Logout execution parameters.
 * @returns No return value.
 */
export const performAuthLogout = ({
  dispatch,
  clearSessionFn = clearPersistedAuthSession,
  resetDataSet = false,
  reason = "manual",
  emitTelemetryEvent = emitAuthTelemetryEvent,
}: {
  dispatch: AuthLogoutDispatch;
  clearSessionFn?: () => boolean;
  resetDataSet?: boolean;
  reason?: LogoutReason;
  emitTelemetryEvent?: typeof emitAuthTelemetryEvent;
}): void => {
  dispatch(setCurrentUser(EMPTY_USER));
  dispatch(setModalStateNone());
  dispatch(setAuthStatusUnauthenticated());
  if (resetDataSet) {
    dispatch(setDataSetArray([]));
  }
  dispatch(setPage(Page.Home));
  clearSessionFn();
  emitTelemetryEvent(
    createAuthTelemetryEvent("logout", {
      reason,
    }),
  );
};



