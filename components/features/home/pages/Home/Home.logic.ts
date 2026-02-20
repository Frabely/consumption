import {ModalState} from "@/constants/enums";
import {Car} from "@/common/models";

export const isEvaluationTabSelected = (selectedTab: number): boolean => selectedTab === 1;

export const isAddDataModalOpen = (modalState: ModalState): boolean =>
    modalState === ModalState.AddCarData || modalState === ModalState.ChangeCarData;

export const isDownloadCsvModalOpen = (modalState: ModalState): boolean =>
    modalState === ModalState.DownloadCsv;

export const resolvePrevKilometers = (prevKilometer: number | undefined): number => prevKilometer ?? 0;

/**
 * Resolves a fully populated current-car object after auth/session restore.
 * @param carsList Available car entries with persisted kilometer values.
 * @param currentCarName Current selected car name from store.
 * @param defaultCarName Default car name from user profile.
 * @returns Matching car object or undefined when unavailable.
 */
export const resolveHydratedCurrentCar = ({
    carsList,
    currentCarName,
    defaultCarName
}: {
    carsList: Car[];
    currentCarName?: string;
    defaultCarName?: string;
}): Car | undefined => {
    const primaryName = currentCarName ?? defaultCarName;
    if (primaryName) {
        const byPrimaryName = carsList.find((car) => car.name === primaryName);
        if (byPrimaryName) {
            return byPrimaryName;
        }
    }

    if (defaultCarName) {
        const byDefaultName = carsList.find((car) => car.name === defaultCarName);
        if (byDefaultName) {
            return byDefaultName;
        }
    }

    return carsList[0];
};

