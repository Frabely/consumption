import { cars } from "@/constants/constantData";
import { CarNames } from "@/constants/enums";
import { Car, User } from "@/constants/types";
import { checkUserId } from "@/firebase/functions";
import { setCurrentCar } from "@/store/reducer/currentCar";
import { setCurrentUser } from "@/store/reducer/currentUser";
import { setAuthStatusAuthenticated } from "@/store/reducer/authStatus";
import {
  buildPersistedAuthSession,
  persistAuthSession,
} from "@/domain/authSessionStorage";
import { isAuthSessionRolloutEnabled } from "@/domain/authFeatureFlag";

export type LoginDispatchAction =
  | ReturnType<typeof setCurrentCar>
  | ReturnType<typeof setCurrentUser>
  | ReturnType<typeof setAuthStatusAuthenticated>;

export type LoginDispatch = (action: LoginDispatchAction) => void;

export type CheckUserIdFn = (id: string) => Promise<User | undefined>;
export type BuildPersistedAuthSessionFn = (
  user: User,
  now?: number,
) => ReturnType<typeof buildPersistedAuthSession>;
export type PersistAuthSessionFn = (params: {
  session: NonNullable<ReturnType<typeof buildPersistedAuthSession>>;
}) => boolean;

export type HandleLoginInputParams = {
  input: string;
  dispatch: LoginDispatch;
  checkUserIdFn?: CheckUserIdFn;
  buildPersistedAuthSessionFn?: BuildPersistedAuthSessionFn;
  persistAuthSessionFn?: PersistAuthSessionFn;
  isSessionRolloutEnabledFn?: () => boolean;
};

/**
 * Returns true when the login PIN input has reached full length.
 * @param input Raw login PIN input string.
 * @returns True when the input is complete.
 */
export const isCompleteLoginInput = (input: string): boolean =>
  input.length === 4;

/**
 * Resolves the preferred login car from user preference with a Zoe fallback.
 * @param user Authenticated user payload.
 * @param availableCars Available cars for selection.
 * @returns Selected car or undefined when no fallback exists.
 */
export const resolveLoginCar = (
  user: User,
  availableCars: Car[] = cars,
): Car | undefined => {
  const defaultCar = availableCars.find((car) => car.name === user.defaultCar);
  if (defaultCar) {
    return defaultCar;
  }

  return availableCars.find((car) => car.name === CarNames.Zoe);
};

/**
 * Processes login input, resolves user/car, persists session and updates auth state.
 * @param params Login handling parameters and dependency overrides.
 * @returns Promise that resolves when login side effects finish.
 */
export const handleLoginInput = async ({
  input,
  dispatch,
  checkUserIdFn = checkUserId,
  buildPersistedAuthSessionFn = buildPersistedAuthSession,
  persistAuthSessionFn = persistAuthSession,
  isSessionRolloutEnabledFn = isAuthSessionRolloutEnabled,
}: HandleLoginInputParams): Promise<void> => {
  if (!isCompleteLoginInput(input)) {
    return;
  }

  const user = await checkUserIdFn(input);
  if (!user) {
    return;
  }

  const car = resolveLoginCar(user);
  if (car) {
    dispatch(setCurrentCar(car));
  }

  const sessionUser: User = {
    ...user,
    defaultCar: car?.name ?? user.defaultCar,
  };
  if (isSessionRolloutEnabledFn()) {
    const session = buildPersistedAuthSessionFn(sessionUser);
    if (session) {
      persistAuthSessionFn({ session });
    }
  }

  dispatch(setCurrentUser(user));
  dispatch(setAuthStatusAuthenticated());
};
