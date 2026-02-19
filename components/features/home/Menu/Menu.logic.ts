import {faFileCsv, faHouseFire, faPowerOff} from "@fortawesome/free-solid-svg-icons";
import {Role} from "@/constants/enums";
import {Car} from "@/constants/types";
import {ActionMenuItem} from "@/components/shared/navigation/ActionMenu";

export type HomeMenuLabels = {
    logout: string;
    downloadCsv: string;
    buildingConsumption: string;
};

export const buildHomeMenuActions = ({
    role,
    labels,
    onLogout,
    onExportCsv,
    onBuildingConsumption
}: {
    role?: Role;
    labels: HomeMenuLabels;
    onLogout: () => void;
    onExportCsv: () => void;
    onBuildingConsumption: () => void;
}): ActionMenuItem[] => {
    const menuActions: ActionMenuItem[] = [
        {
            id: "logout",
            label: labels.logout,
            icon: faPowerOff,
            onClick: onLogout
        },
        {
            id: "downloadCsv",
            label: labels.downloadCsv,
            icon: faFileCsv,
            onClick: onExportCsv
        }
    ];

    if (role === Role.Admin) {
        menuActions.push({
            id: "buildingConsumption",
            label: labels.buildingConsumption,
            icon: faHouseFire,
            onClick: onBuildingConsumption
        });
    }

    return menuActions;
};

export const resolveSelectedCar = (cars: Car[], value: string): Car | undefined =>
    cars.find((car) => car.name === value);

export const resolveDefaultCarName = (currentCarName: string | undefined, cars: Car[]): string =>
    currentCarName ?? cars[0]?.name ?? "";
