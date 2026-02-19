import { AUTH_STATUS, AuthStatus } from "@/domain/authTargetState";

/**
 * Returns true while auth bootstrap is unresolved and a loader should be rendered.
 * @param authStatus Current auth status value.
 * @returns True when the auth boot loader should be shown.
 */
export const shouldRenderAuthBootLoader = (authStatus: AuthStatus): boolean =>
  authStatus === AUTH_STATUS.UNKNOWN;
