export type AuthTelemetryEventName =
  | "login_success"
  | "login_rejected"
  | "rehydration_success"
  | "rehydration_fallback"
  | "session_invalidated"
  | "session_validation_unavailable"
  | "logout";

export type AuthTelemetryPayload = {
  reason?: string;
  userId?: string;
  source?: string;
  message?: string;
};

export type AuthTelemetryEvent = {
  name: AuthTelemetryEventName;
  payload?: AuthTelemetryPayload;
  at: number;
};

export type AuthTelemetryEmitter = (event: AuthTelemetryEvent) => void;
export type TelemetryDispatchFn = (event: Event) => boolean;

/**
 * Emits auth telemetry as a browser custom event when available.
 * @param event Telemetry event payload.
 * @param dispatchFn Optional event dispatch function override.
 * @returns No return value.
 */
export const emitAuthTelemetryEvent = (
  event: AuthTelemetryEvent,
  dispatchFn?: TelemetryDispatchFn,
): void => {
  const resolvedDispatchFn =
    dispatchFn ??
    (typeof window !== "undefined"
      ? window.dispatchEvent.bind(window)
      : undefined);
  if (!resolvedDispatchFn) {
    return;
  }

  resolvedDispatchFn(
    new CustomEvent<AuthTelemetryEvent>("consumption:auth-telemetry", {
      detail: event,
    }),
  );
};

/**
 * Creates a normalized telemetry event object.
 * @param name Telemetry event name.
 * @param payload Optional telemetry payload.
 * @param now Optional timestamp in milliseconds.
 * @returns Normalized telemetry event.
 */
export const createAuthTelemetryEvent = (
  name: AuthTelemetryEventName,
  payload?: AuthTelemetryPayload,
  now = Date.now(),
): AuthTelemetryEvent => ({
  name,
  payload,
  at: now,
});
