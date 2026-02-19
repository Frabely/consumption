export const LOGIN_ERROR_CODES = {
  LOGIN_UNAVAILABLE: "login_unavailable",
  USER_NOT_FOUND: "user_not_found",
} as const;

export const SESSION_VALIDATION_ERROR_CODES = {
  SESSION_VALIDATION_UNAVAILABLE: "session_validation_unavailable",
  BACKEND_USER_MISSING: "backend_user_missing",
} as const;

export const AUTH_SESSION_CONTRACT_ISSUES = {
  NOT_AN_OBJECT: "not_an_object",
  UNSUPPORTED_SCHEMA_VERSION: "unsupported_schema_version",
  INVALID_USER_ID: "invalid_user_id",
  INVALID_ROLE: "invalid_role",
  INVALID_DEFAULT_CAR: "invalid_default_car",
  INVALID_EXPIRES_AT: "invalid_expires_at",
} as const;

export const AUTH_SESSION_RESTORE_FAILURE_REASONS = {
  MISSING_SESSION: "missing_session",
  INVALID_SESSION: "invalid_session",
  EXPIRED_SESSION: "expired_session",
} as const;

export type AuthSessionValidationIssue =
  (typeof AUTH_SESSION_CONTRACT_ISSUES)[keyof typeof AUTH_SESSION_CONTRACT_ISSUES];

export type AuthSessionRestoreFailureReason =
  (typeof AUTH_SESSION_RESTORE_FAILURE_REASONS)[keyof typeof AUTH_SESSION_RESTORE_FAILURE_REASONS];
