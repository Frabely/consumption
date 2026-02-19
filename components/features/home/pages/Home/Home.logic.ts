import {ModalState} from "@/constants/enums";

export const isEvaluationTabSelected = (selectedTab: number): boolean => selectedTab === 1;

export const isAddDataModalOpen = (modalState: ModalState): boolean =>
    modalState === ModalState.AddCarData || modalState === ModalState.ChangeCarData;

export const isDownloadCsvModalOpen = (modalState: ModalState): boolean =>
    modalState === ModalState.DownloadCsv;

export const resolvePrevKilometers = (prevKilometer: number | undefined): number => prevKilometer ?? 0;
