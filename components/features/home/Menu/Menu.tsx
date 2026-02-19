"use client";

import { faAdd } from "@fortawesome/free-solid-svg-icons";
import { setModalState, setModalStateNone } from "@/store/reducer/modalState";
import { setIsChangingData } from "@/store/reducer/isChangingData";
import { cars } from "@/constants/constantData";
import { RootState } from "@/store/store";
import React from "react";
import { setCurrentCar } from "@/store/reducer/currentCar";
import { setPage } from "@/store/reducer/currentPage";
import { getCars } from "@/firebase/functions";
import { ModalState, Page, Role } from "@/constants/enums";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import de from "@/constants/de.json";
import ActionMenu from "@/components/shared/navigation/ActionMenu";
import {
  buildHomeMenuActions,
  resolveDefaultCarName,
  resolveSelectedCar,
} from "@/components/features/home/Menu/Menu.logic";
import { performAuthLogout } from "@/utils/authentication/flow/logout";

/**
 * Renders the home action menu and coordinates menu-triggered state transitions.
 * @param props Component props.
 * @returns Rendered home action menu component.
 */
export default function Menu({}: MenuProps) {
  const language = de;
  const dispatch = useAppDispatch();
  const currentUserRole: Role | undefined = useAppSelector(
    (state: RootState) => state.currentUser.role,
  );
  const currentCarName: string | undefined = useAppSelector(
    (state: RootState) => state.currentCar.name,
  );

  /**
   * Opens the add-data modal in non-edit mode.
   * @returns No return value.
   */
  const onAddDataClickHandler = () => {
    dispatch(setModalStateNone());
    dispatch(setIsChangingData(false));
    dispatch(setModalState(ModalState.AddCarData));
  };

  /**
   * Logs out the active user from the home context.
   * @returns No return value.
   */
  const onLogoutHandler = () => {
    performAuthLogout({ dispatch, resetDataSet: true });
  };

  /**
   * Opens the CSV export modal for car consumption data.
   * @returns No return value.
   */
  const onExportAsCsvClickHandler = () => {
    dispatch(setModalStateNone());
    dispatch(setModalState(ModalState.DownloadCsv));
  };

  /**
   * Loads cars and switches the current car selection by label value.
   * @param value Selected car label value.
   * @returns No return value.
   */
  const onCarChangeHandler = (value: string) => {
    getCars()
      .then((result) => {
        if (result) {
          const selectedCar = resolveSelectedCar(result, value);
          if (selectedCar) {
            dispatch(setCurrentCar(selectedCar));
          }
        }
      })
      .catch((error: Error) => {
        console.error(error.message);
      });
  };

  /**
   * Navigates from the home area into the building consumption page.
   * @returns No return value.
   */
  const onBuildingConsumptionClickHandler = () => {
    dispatch(setPage(Page.BuildingConsumption));
  };

  const menuActions = buildHomeMenuActions({
    role: currentUserRole,
    labels: {
      logout: language.buttonLabels.logout,
      downloadCsv: language.buttonLabels.downloadCsv,
      buildingConsumption: language.buttonLabels.buildingConsumption,
    },
    onLogout: onLogoutHandler,
    onExportCsv: onExportAsCsvClickHandler,
    onBuildingConsumption: onBuildingConsumptionClickHandler,
  });

  return (
    <ActionMenu
      actions={menuActions}
      selectConfig={{
        onChange: onCarChangeHandler,
        defaultValue: resolveDefaultCarName(currentCarName, cars),
        options: cars.map((car) => car.name),
        direction: "up",
      }}
      primaryAction={{
        icon: faAdd,
        onClick: onAddDataClickHandler,
      }}
    />
  );
}

export type MenuProps = {};



