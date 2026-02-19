import { describe, expect, it } from "vitest";
import { Role } from "@/constants/enums";
import { AUTH_SESSION_SCHEMA_VERSION } from "@/utils/authentication/core/targetState";
import { AUTH_SESSION_CONTRACT_ISSUES } from "@/utils/authentication/constants/errorCodes";
import {
  parsePersistedAuthSession,
  validateAuthSessionContract,
} from "@/utils/authentication/session/sessionContract";

describe("authSessionContract", () => {
  const validSession = {
    schemaVersion: AUTH_SESSION_SCHEMA_VERSION,
    userId: "1234",
    role: Role.Admin,
    defaultCar: "Zoe",
    expiresAt: 2_000_000_000_000,
  };

  it("validates a correct v1 session", () => {
    const result = validateAuthSessionContract(validSession);
    expect(result).toEqual({ isValid: true, issues: [] });
  });

  it("rejects unsupported schema versions", () => {
    const result = validateAuthSessionContract({
      ...validSession,
      schemaVersion: 999,
    });
    expect(result.isValid).toBe(false);
    expect(result.issues).toContain(
      AUTH_SESSION_CONTRACT_ISSUES.UNSUPPORTED_SCHEMA_VERSION,
    );
  });

  it("rejects invalid role values", () => {
    const result = validateAuthSessionContract({ ...validSession, role: 77 });
    expect(result.isValid).toBe(false);
    expect(result.issues).toContain(AUTH_SESSION_CONTRACT_ISSUES.INVALID_ROLE);
  });

  it("parses valid payload to session", () => {
    const parsed = parsePersistedAuthSession(validSession);
    expect(parsed.session).toEqual(validSession);
    expect(parsed.validation.isValid).toBe(true);
  });

  it("parses unsupported schema as invalid", () => {
    const parsed = parsePersistedAuthSession({
      ...validSession,
      schemaVersion: 2,
    });
    expect(parsed.session).toBeNull();
    expect(parsed.validation.isValid).toBe(false);
    expect(parsed.validation.issues).toContain(
      AUTH_SESSION_CONTRACT_ISSUES.UNSUPPORTED_SCHEMA_VERSION,
    );
  });

  it("parses legacy payload as invalid", () => {
    const parsed = parsePersistedAuthSession({
      key: "7777",
      role: Role.User,
      defaultCar: "BMW",
      expiresAt: 1_900_000_000_000,
    });

    expect(parsed.session).toBeNull();
    expect(parsed.validation.isValid).toBe(false);
  });
});
