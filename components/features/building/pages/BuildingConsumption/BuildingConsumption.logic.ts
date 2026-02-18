import {ModalState, Role} from "@/constants/enums";
import {House} from "@/constants/types";

export const canAccessBuildingConsumption = (userKey: string | undefined, userRole: Role | undefined): boolean =>
    !!userKey && userRole === Role.Admin;

export const resolveFloorModalState = (isFloorFieldChange: boolean): ModalState =>
    isFloorFieldChange ? ModalState.ChangeFloorFields : ModalState.AddFloorData;

export const resolveBackLabel = (
    userKey: string | undefined,
    labels: {back: string; backToLogin: string}
): string => (userKey ? labels.backToLogin : labels.back);

export const resolveCurrentHouseByName = (
    houses: House[],
    currentSelectedHouseName: string
): House | undefined => houses.find((house) => house.name === currentSelectedHouseName);
