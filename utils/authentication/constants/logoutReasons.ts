export const LOGOUT_REASONS = {
  MANUAL: "manual",
  EXPIRED: "expired",
  INVALID_SESSION: "invalid_session",
} as const;

export type LogoutReason = (typeof LOGOUT_REASONS)[keyof typeof LOGOUT_REASONS];
