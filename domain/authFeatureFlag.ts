const TRUTHY_ROLLOUT_VALUES = new Set(["1", "true", "yes", "on"]);
const FALSY_ROLLOUT_VALUES = new Set(["0", "false", "no", "off"]);

export const AUTH_SESSION_ROLLOUT_ENV_KEY =
  "NEXT_PUBLIC_AUTH_SESSION_ROLLOUT_ENABLED";

/**
 * Resolves whether auth-session rollout features should be active.
 * @param rawFlag Optional raw feature-flag value.
 * @returns True when rollout is enabled.
 */
export const isAuthSessionRolloutEnabled = (
  rawFlag = process.env[AUTH_SESSION_ROLLOUT_ENV_KEY],
): boolean => {
  if (rawFlag === undefined) {
    return true;
  }

  const normalized = rawFlag.trim().toLowerCase();

  if (TRUTHY_ROLLOUT_VALUES.has(normalized)) {
    return true;
  }
  if (FALSY_ROLLOUT_VALUES.has(normalized)) {
    return false;
  }

  return true;
};
