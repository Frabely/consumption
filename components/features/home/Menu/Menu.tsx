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
import { performAuthLogout } from "@/domain/authLogout";

export default function Menu({}: MenuProps) {
  const language = de;
  const dispatch = useAppDispatch();
  const currentUserRole: Role | undefined = useAppSelector(
    (state: RootState) => state.currentUser.role,
  );
  const currentCarName: string | undefined = useAppSelector(
    (state: RootState) => state.currentCar.name,
  );

  const onAddDataClickHandler = () => {
    dispatch(setModalStateNone());
    dispatch(setIsChangingData(false));
    dispatch(setModalState(ModalState.AddCarData));
  };

  const onLogoutHandler = () => {
    performAuthLogout({ dispatch, resetDataSet: true });
  };

  const onExportAsCsvClickHandler = () => {
    dispatch(setModalStateNone());
    dispatch(setModalState(ModalState.DownloadCsv));
  };

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
