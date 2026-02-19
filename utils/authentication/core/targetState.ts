import { Role } from "@/constants/enums";
import {
  AUTH_SESSION_EXPIRY_CHECK_INTERVAL_MS,
  AUTH_SESSION_SCHEMA_VERSION,
  AUTH_SESSION_STORAGE_KEY,
  AUTH_SESSION_TTL_DAYS,
  AUTH_SESSION_TTL_MS,
} from "@/utils/authentication/constants/sessionConfig";
import {
  LOGOUT_REASONS,
  LogoutReason,
} from "@/utils/authentication/constants/logoutReasons";

export {
  AUTH_SESSION_EXPIRY_CHECK_INTERVAL_MS,
  AUTH_SESSION_SCHEMA_VERSION,
  AUTH_SESSION_STORAGE_KEY,
  AUTH_SESSION_TTL_DAYS,
  AUTH_SESSION_TTL_MS,
  LOGOUT_REASONS,
};
export type { LogoutReason };

export type AuthStatus = "unknown" | "authenticated" | "unauthenticated";

export type PersistedAuthSession = {
  schemaVersion: number;
  userId: string;
  role: Role;
  defaultCar: string;
  expiresAt: number;
};

export const AUTH_STATUS: Record<Uppercase<AuthStatus>, AuthStatus> = {
  UNKNOWN: "unknown",
  AUTHENTICATED: "authenticated",
  UNAUTHENTICATED: "unauthenticated",
};

/**
 * Creates a rolling expiry timestamp based on the configured session TTL.
 * @param now Current timestamp in milliseconds.
 * @returns Expiry timestamp in milliseconds.
 */
export const createRollingExpiryTimestamp = (now = Date.now()): number =>
  now + AUTH_SESSION_TTL_MS;

/**
 * Checks whether a persisted session has already expired.
 * @param expiresAt Persisted session expiry timestamp.
 * @param now Current timestamp in milliseconds.
 * @returns True when the session is expired.
 */
export const isSessionExpired = (
  expiresAt: number,
  now = Date.now(),
): boolean => expiresAt <= now;

/**
 * Returns whether the given role can access the building consumption area.
 * @param role Role value to validate.
 * @returns True when the role has building access.
 */
export const canAccessBuildingConsumptionForRole = (role?: Role): boolean =>
  role === Role.Admin;
