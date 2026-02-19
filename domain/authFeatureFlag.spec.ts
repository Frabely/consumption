import { describe, expect, it } from "vitest";
import { isAuthSessionRolloutEnabled } from "@/domain/authFeatureFlag";

describe("isAuthSessionRolloutEnabled", () => {
  it("defaults to enabled when no value is provided", () => {
    expect(isAuthSessionRolloutEnabled(undefined)).toBe(true);
  });

  it("returns true for truthy values", () => {
    expect(isAuthSessionRolloutEnabled("true")).toBe(true);
    expect(isAuthSessionRolloutEnabled("1")).toBe(true);
    expect(isAuthSessionRolloutEnabled("yes")).toBe(true);
    expect(isAuthSessionRolloutEnabled("on")).toBe(true);
  });

  it("returns false for falsy values", () => {
    expect(isAuthSessionRolloutEnabled("false")).toBe(false);
    expect(isAuthSessionRolloutEnabled("0")).toBe(false);
    expect(isAuthSessionRolloutEnabled("no")).toBe(false);
    expect(isAuthSessionRolloutEnabled("off")).toBe(false);
  });

  it("treats unknown values as enabled for safe rollout default", () => {
    expect(isAuthSessionRolloutEnabled("unexpected")).toBe(true);
  });
});
