import {faFileCsv, faHouse, faPowerOff} from "@fortawesome/free-solid-svg-icons";
import {House} from "@/constants/types";
import {ActionMenuItem} from "@/components/shared/navigation/ActionMenu";

export type BuildingMenuLabels = {
    home: string;
    logout: string;
    downloadCsv: string;
};

export const buildBuildingMenuActions = ({
    labels,
    onHome,
    onLogout,
    onExportCsv
}: {
    labels: BuildingMenuLabels;
    onHome: () => void;
    onLogout: () => void;
    onExportCsv: () => void;
}): ActionMenuItem[] => [
    {
        id: "home",
        label: labels.home,
        icon: faHouse,
        onClick: onHome
    },
    {
        id: "logout",
        label: labels.logout,
        icon: faPowerOff,
        onClick: onLogout
    },
    {
        id: "downloadBuildingCsv",
        label: labels.downloadCsv,
        icon: faFileCsv,
        onClick: onExportCsv
    }
];

export const resolveSelectedHouse = (houses: House[], value: string): House | undefined =>
    houses.find((house) => house.name === value);

export const resolveDefaultHouseName = (currentHouseName: string | undefined, houses: House[]): string =>
    currentHouseName ?? houses[0]?.name ?? "";
