import {Role} from "@/constants/enums";

export const AUTH_SESSION_STORAGE_KEY = "consumption.auth.session";
export const AUTH_SESSION_SCHEMA_VERSION = 1;
export const AUTH_SESSION_TTL_DAYS = 90;
export const AUTH_SESSION_TTL_MS = AUTH_SESSION_TTL_DAYS * 24 * 60 * 60 * 1000;

export type AuthStatus = "unknown" | "authenticated" | "unauthenticated";

export type LogoutReason = "manual" | "expired" | "invalid_session";

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
    UNAUTHENTICATED: "unauthenticated"
};

export const createRollingExpiryTimestamp = (now = Date.now()): number =>
    now + AUTH_SESSION_TTL_MS;

export const isSessionExpired = (expiresAt: number, now = Date.now()): boolean =>
    expiresAt <= now;

export const canAccessBuildingConsumptionForRole = (role?: Role): boolean =>
    role === Role.Admin;
