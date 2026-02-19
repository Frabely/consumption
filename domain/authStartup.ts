import { AUTH_STATUS } from "@/domain/authTargetState";
import { restoreAuthSessionFromStorage } from "@/domain/authSessionRestore";
import {
  setAuthStatusAuthenticated,
  setAuthStatusUnauthenticated,
} from "@/store/reducer/authStatus";
import { setCurrentUser } from "@/store/reducer/currentUser";
import { setCurrentCar } from "@/store/reducer/currentCar";
import { EMPTY_USER } from "@/constants/constantData";

export type AuthStartupDispatchAction =
  | ReturnType<typeof setAuthStatusAuthenticated>
  | ReturnType<typeof setAuthStatusUnauthenticated>
  | ReturnType<typeof setCurrentUser>
  | ReturnType<typeof setCurrentCar>;

export type AuthStartupDispatch = (action: AuthStartupDispatchAction) => void;

/**
 * Applies the restore decision by synchronizing auth-related slices in the store.
 * @param params Decision payload and dispatch function.
 * @returns No return value.
 */
export const applyAuthStartupDecision = ({
  decision,
  dispatch,
}: {
  decision: ReturnType<typeof restoreAuthSessionFromStorage>;
  dispatch: AuthStartupDispatch;
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
    return;
  }

  dispatch(setCurrentUser(EMPTY_USER));
  dispatch(setAuthStatusUnauthenticated());
};

/**
 * Restores persisted auth session state during app bootstrap.
 * @param params Startup restore parameters.
 * @returns No return value.
 */
export const restoreAuthOnAppStart = ({
  dispatch,
  now = Date.now(),
}: {
  dispatch: AuthStartupDispatch;
  now?: number;
}): void => {
  const decision = restoreAuthSessionFromStorage({ now });
  applyAuthStartupDecision({ decision, dispatch });
};
