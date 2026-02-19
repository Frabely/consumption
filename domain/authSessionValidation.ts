import { checkUserId } from "@/firebase/functions";
import { User } from "@/constants/types";
import { setCurrentUser } from "@/store/reducer/currentUser";
import { setCurrentCar } from "@/store/reducer/currentCar";
import { setAuthStatusUnauthenticated } from "@/store/reducer/authStatus";
import {
  clearPersistedAuthSession,
  buildPersistedAuthSession,
  persistAuthSession,
} from "@/domain/authSessionStorage";
import { EMPTY_USER } from "@/constants/constantData";

export type SessionValidationResult =
  | { status: "valid"; user: User }
  | { status: "invalid" }
  | { status: "unavailable"; message: string };

export type CheckUserIdFn = (id: string) => Promise<User | undefined>;

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
      error instanceof Error ? error.message : "session_validation_unavailable";
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

export const applySessionValidationResult = ({
  result,
  dispatch,
  clearSessionFn = clearPersistedAuthSession,
  buildSessionFn = buildPersistedAuthSession,
  persistSessionFn = persistAuthSession,
}: {
  result: SessionValidationResult;
  dispatch: SessionValidationDispatch;
  clearSessionFn?: () => boolean;
  buildSessionFn?: typeof buildPersistedAuthSession;
  persistSessionFn?: typeof persistAuthSession;
}): void => {
  if (result.status === "invalid") {
    clearSessionFn();
    dispatch(setCurrentUser(EMPTY_USER));
    dispatch(setAuthStatusUnauthenticated());
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
