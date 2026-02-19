import { Page, Role } from "@/constants/enums";
import { AUTH_STATUS, AuthStatus, canAccessBuildingConsumptionForRole } from "@/domain/authTargetState";

export type AuthPageGuardInput = {
  authStatus: AuthStatus;
  requestedPage: Page;
  userKey: string | undefined;
  userRole: Role | undefined;
};

/**
 * Resolves which top-level page is allowed for the current auth context.
 * @param input Guard input with auth state and requested page.
 * @returns Allowed top-level page.
 */
export const resolveGuardedPage = ({
  authStatus,
  requestedPage,
  userKey,
  userRole,
}: AuthPageGuardInput): Page => {
  if (authStatus !== AUTH_STATUS.AUTHENTICATED || !userKey) {
    return Page.Home;
  }

  if (
    requestedPage === Page.BuildingConsumption &&
    !canAccessBuildingConsumptionForRole(userRole)
  ) {
    return Page.Home;
  }

  return requestedPage;
};
