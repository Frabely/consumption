import { Role } from "@/constants/enums";
import {
  AUTH_SESSION_SCHEMA_VERSION,
  PersistedAuthSession,
} from "@/domain/authTargetState";

type AuthSessionValidationIssue =
  | "not_an_object"
  | "unsupported_schema_version"
  | "invalid_user_id"
  | "invalid_role"
  | "invalid_default_car"
  | "invalid_expires_at";

export type AuthSessionValidationResult = {
  isValid: boolean;
  issues: AuthSessionValidationIssue[];
};

type LegacyAuthSessionV0 = {
  key?: unknown;
  role?: unknown;
  defaultCar?: unknown;
  expiresAt?: unknown;
};

/**
 * Returns true when a value is a non-null object record.
 * @param value Value to inspect.
 * @returns True when the value is an object record.
 */
const isObjectRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

/**
 * Validates whether the provided value maps to a supported role enum value.
 * @param value Value to validate.
 * @returns True when the value matches a valid role.
 */
const isRoleValue = (value: unknown): value is Role =>
  value === Role.None || value === Role.User || value === Role.Admin;

/**
 * Validates required session fields and returns all detected contract issues.
 * @param session Session payload record to validate.
 * @returns List of detected validation issues.
 */
const hasValidBaseFields = (
  session: Record<string, unknown>,
): AuthSessionValidationIssue[] => {
  const issues: AuthSessionValidationIssue[] = [];

  if (
    typeof session.userId !== "string" ||
    session.userId.trim().length === 0
  ) {
    issues.push("invalid_user_id");
  }
  if (!isRoleValue(session.role)) {
    issues.push("invalid_role");
  }
  if (
    typeof session.defaultCar !== "string" ||
    session.defaultCar.trim().length === 0
  ) {
    issues.push("invalid_default_car");
  }
  if (
    typeof session.expiresAt !== "number" ||
    !Number.isFinite(session.expiresAt) ||
    session.expiresAt <= 0
  ) {
    issues.push("invalid_expires_at");
  }

  return issues;
};

/**
 * Migrates raw persisted session payloads to the current schema version when possible.
 * @param raw Raw persisted session payload.
 * @returns Migrated session payload or null when migration is not possible.
 */
export const migrateAuthSessionToCurrentSchema = (
  raw: unknown,
): PersistedAuthSession | null => {
  if (!isObjectRecord(raw)) {
    return null;
  }

  if (raw.schemaVersion === AUTH_SESSION_SCHEMA_VERSION) {
    return raw as PersistedAuthSession;
  }

  // Legacy v0 support: { key, role, defaultCar, expiresAt } -> v1
  const legacy = raw as LegacyAuthSessionV0;
  if (!("schemaVersion" in raw) && typeof legacy.key === "string") {
    return {
      schemaVersion: AUTH_SESSION_SCHEMA_VERSION,
      userId: legacy.key,
      role: legacy.role as Role,
      defaultCar: legacy.defaultCar as string,
      expiresAt: legacy.expiresAt as number,
    };
  }

  return null;
};

/**
 * Validates that a session payload matches the current contract requirements.
 * @param raw Raw persisted session payload.
 * @returns Validation result including issue details.
 */
export const validateAuthSessionContract = (
  raw: unknown,
): AuthSessionValidationResult => {
  if (!isObjectRecord(raw)) {
    return { isValid: false, issues: ["not_an_object"] };
  }

  if (raw.schemaVersion !== AUTH_SESSION_SCHEMA_VERSION) {
    return { isValid: false, issues: ["unsupported_schema_version"] };
  }

  const issues = hasValidBaseFields(raw);
  return { isValid: issues.length === 0, issues };
};

/**
 * Parses, migrates and validates a persisted session payload in one step.
 * @param raw Raw persisted session payload.
 * @returns Parsed session and validation details.
 */
export const parsePersistedAuthSession = (
  raw: unknown,
): {
  session: PersistedAuthSession | null;
  validation: AuthSessionValidationResult;
} => {
  const migrated = migrateAuthSessionToCurrentSchema(raw);
  if (!migrated) {
    const validation = validateAuthSessionContract(raw);
    return {
      session: null,
      validation,
    };
  }

  const validation = validateAuthSessionContract(migrated);
  return {
    session: validation.isValid ? migrated : null,
    validation,
  };
};
