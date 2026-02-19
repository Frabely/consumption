import { Role } from "@/constants/enums";
import {
  AUTH_SESSION_SCHEMA_VERSION,
  PersistedAuthSession,
} from "@/utils/authentication/core/targetState";

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
  const validation = validateAuthSessionContract(raw);
  return {
    session: validation.isValid ? (raw as PersistedAuthSession) : null,
    validation,
  };
};
