import { describe, expect, it } from "vitest";
import { AUTH_STATUS } from "@/utils/authentication/core/targetState";
import { shouldRenderAuthBootLoader } from "@/utils/authentication/guards/bootGuard";

describe("authBootGuard", () => {
  it("returns true only for unknown auth status", () => {
    expect(shouldRenderAuthBootLoader(AUTH_STATUS.UNKNOWN)).toBe(true);
    expect(shouldRenderAuthBootLoader(AUTH_STATUS.AUTHENTICATED)).toBe(false);
    expect(shouldRenderAuthBootLoader(AUTH_STATUS.UNAUTHENTICATED)).toBe(false);
  });
});



