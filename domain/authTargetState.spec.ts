import {describe, expect, it} from "vitest";
import {Role} from "@/constants/enums";
import {
    AUTH_SESSION_SCHEMA_VERSION,
    AUTH_SESSION_STORAGE_KEY,
    AUTH_SESSION_TTL_DAYS,
    AUTH_SESSION_TTL_MS,
    AUTH_STATUS,
    canAccessBuildingConsumptionForRole,
    createRollingExpiryTimestamp,
    isSessionExpired
} from "@/domain/authTargetState";

describe("authTargetState", () => {
    it("defines stable session constants", () => {
        expect(AUTH_SESSION_STORAGE_KEY).toBe("consumption.auth.session");
        expect(AUTH_SESSION_SCHEMA_VERSION).toBe(1);
        expect(AUTH_SESSION_TTL_DAYS).toBe(90);
        expect(AUTH_SESSION_TTL_MS).toBe(90 * 24 * 60 * 60 * 1000);
    });

    it("exposes auth status values", () => {
        expect(AUTH_STATUS.UNKNOWN).toBe("unknown");
        expect(AUTH_STATUS.AUTHENTICATED).toBe("authenticated");
        expect(AUTH_STATUS.UNAUTHENTICATED).toBe("unauthenticated");
    });

    it("creates rolling expiry timestamp based on now", () => {
        const now = 1_700_000_000_000;
        expect(createRollingExpiryTimestamp(now)).toBe(now + AUTH_SESSION_TTL_MS);
    });

    it("detects session expiry with inclusive boundary", () => {
        const now = 1_700_000_000_000;
        expect(isSessionExpired(now, now)).toBe(true);
        expect(isSessionExpired(now - 1, now)).toBe(true);
        expect(isSessionExpired(now + 1, now)).toBe(false);
    });

    it("allows building consumption access only for admin role", () => {
        expect(canAccessBuildingConsumptionForRole(Role.Admin)).toBe(true);
        expect(canAccessBuildingConsumptionForRole(Role.User)).toBe(false);
        expect(canAccessBuildingConsumptionForRole(undefined)).toBe(false);
    });
});
