import { describe, expect, it } from "vitest";
import { Page, Role } from "@/constants/enums";
import { AUTH_STATUS } from "@/domain/authTargetState";
import { resolveGuardedPage } from "@/domain/authPageGuard";

describe("resolveGuardedPage", () => {
  it("returns home while auth status is unknown", () => {
    expect(
      resolveGuardedPage({
        authStatus: AUTH_STATUS.UNKNOWN,
        requestedPage: Page.BuildingConsumption,
        userKey: "abc",
        userRole: Role.Admin,
      }),
    ).toBe(Page.Home);
  });

  it("returns home while unauthenticated", () => {
    expect(
      resolveGuardedPage({
        authStatus: AUTH_STATUS.UNAUTHENTICATED,
        requestedPage: Page.BuildingConsumption,
        userKey: undefined,
        userRole: undefined,
      }),
    ).toBe(Page.Home);
  });

  it("returns requested page for authenticated user on home", () => {
    expect(
      resolveGuardedPage({
        authStatus: AUTH_STATUS.AUTHENTICATED,
        requestedPage: Page.Home,
        userKey: "abc",
        userRole: Role.User,
      }),
    ).toBe(Page.Home);
  });

  it("returns building page for authenticated admin", () => {
    expect(
      resolveGuardedPage({
        authStatus: AUTH_STATUS.AUTHENTICATED,
        requestedPage: Page.BuildingConsumption,
        userKey: "abc",
        userRole: Role.Admin,
      }),
    ).toBe(Page.BuildingConsumption);
  });

  it("falls back to home for authenticated non-admin on building page", () => {
    expect(
      resolveGuardedPage({
        authStatus: AUTH_STATUS.AUTHENTICATED,
        requestedPage: Page.BuildingConsumption,
        userKey: "abc",
        userRole: Role.User,
      }),
    ).toBe(Page.Home);
  });
});
