import { ModalState, Role } from "@/constants/enums";
import { House } from "@/constants/types";
import { canAccessBuildingConsumptionForRole } from "@/domain/authTargetState";

/**
 * Returns whether the current user is allowed to access the building consumption feature.
 * @param userKey Current user key.
 * @param userRole Current user role.
 * @returns True when the user has access rights.
 */
export const canAccessBuildingConsumption = (
  userKey: string | undefined,
  userRole: Role | undefined,
): boolean => !!userKey && canAccessBuildingConsumptionForRole(userRole);

/**
 * Resolves which floor modal state should open for the given interaction mode.
 * @param isFloorFieldChange True when floor field edit mode is requested.
 * @returns Modal state that should be opened.
 */
export const resolveFloorModalState = (
  isFloorFieldChange: boolean,
): ModalState =>
  isFloorFieldChange ? ModalState.ChangeFloorFields : ModalState.AddFloorData;

/**
 * Resolves the back-button label based on whether a user key exists.
 * @param userKey Current user key.
 * @param labels Available label set.
 * @returns Resolved back-button label.
 */
export const resolveBackLabel = (
  userKey: string | undefined,
  labels: { back: string; backToLogin: string },
): string => (userKey ? labels.backToLogin : labels.back);

/**
 * Finds the currently selected house by name from a house collection.
 * @param houses Available houses.
 * @param currentSelectedHouseName Currently selected house name.
 * @returns Matching house or undefined.
 */
export const resolveCurrentHouseByName = (
  houses: House[],
  currentSelectedHouseName: string,
): House | undefined =>
  houses.find((house) => house.name === currentSelectedHouseName);
