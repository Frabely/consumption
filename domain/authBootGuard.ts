import { AUTH_STATUS, AuthStatus } from "@/domain/authTargetState";

export const shouldRenderAuthBootLoader = (authStatus: AuthStatus): boolean =>
  authStatus === AUTH_STATUS.UNKNOWN;
