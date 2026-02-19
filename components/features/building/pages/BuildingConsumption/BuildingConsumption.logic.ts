import { ModalState } from "@/constants/enums";
import { House } from "@/constants/types";

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
