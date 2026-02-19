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
} from "@/utils/authentication/session/sessionStorage";
import { LOGIN_ERROR_CODES } from "@/utils/authentication/constants/errorCodes";
import {
  createAuthTelemetryEvent,
  emitAuthTelemetryEvent,
} from "@/utils/authentication/telemetry/telemetry";

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
  emitTelemetryEvent?: typeof emitAuthTelemetryEvent;
};

export type LoginAttemptResult =
  | { status: "incomplete" }
  | { status: "success" }
  | { status: "rejected" }
  | { status: "unavailable"; message: string };

/**
 * Returns true when the login PIN input has reached full length.
 * @param input Raw login PIN input string.
 * @returns True when the input is complete.
 */
export const isCompleteLoginInput = (input: string): boolean =>
  input.length === 4;

/**
 * Resolves which PIN slot should be visually focused.
 * @param input Current PIN input value.
 * @returns Zero-based slot index.
 */
export const resolveActivePinSlotIndex = (input: string): number =>
  input.length >= 4 ? 3 : input.length;

/**
 * Appends a single character to PIN input while respecting the 4-char limit.
 * @param input Current PIN input value.
 * @param character Character to append.
 * @returns Next PIN input value.
 */
export const appendPinCharacter = (
  input: string,
  character: string,
): string => {
  if (!character || input.length >= 4) {
    return input;
  }
  return `${input}${character}`.slice(0, 4);
};

/**
 * Removes the last character from PIN input.
 * @param input Current PIN input value.
 * @returns Next PIN input value.
 */
export const removeLastPinCharacter = (input: string): string =>
  input.length === 0 ? input : input.slice(0, -1);

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
 * @returns Login attempt result for UI feedback and flow handling.
 */
export const handleLoginInput = async ({
  input,
  dispatch,
  checkUserIdFn = checkUserId,
  buildPersistedAuthSessionFn = buildPersistedAuthSession,
  persistAuthSessionFn = persistAuthSession,
  emitTelemetryEvent = emitAuthTelemetryEvent,
}: HandleLoginInputParams): Promise<LoginAttemptResult> => {
  if (!isCompleteLoginInput(input)) {
    return { status: "incomplete" };
  }

  let user: User | undefined;
  try {
    user = await checkUserIdFn(input);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : LOGIN_ERROR_CODES.LOGIN_UNAVAILABLE;
    emitTelemetryEvent(
      createAuthTelemetryEvent("session_validation_unavailable", {
        message,
      }),
    );
    return { status: "unavailable", message };
  }

  if (!user) {
    emitTelemetryEvent(
      createAuthTelemetryEvent("login_rejected", {
        reason: LOGIN_ERROR_CODES.USER_NOT_FOUND,
      }),
    );
    return { status: "rejected" };
  }

  const car = resolveLoginCar(user);
  if (car) {
    dispatch(setCurrentCar(car));
  }

  const sessionUser: User = {
    ...user,
    defaultCar: car?.name ?? user.defaultCar,
  };
  const session = buildPersistedAuthSessionFn(sessionUser);
  if (session) {
    persistAuthSessionFn({ session });
  }

  dispatch(setCurrentUser(sessionUser));
  dispatch(setAuthStatusAuthenticated());
  emitTelemetryEvent(
    createAuthTelemetryEvent("login_success", {
      userId: user.key,
    }),
  );
  return { status: "success" };
};
