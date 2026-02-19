import React from "react";
import { RootState } from "@/store/store";
import { faAdd } from "@fortawesome/free-solid-svg-icons";
import { setModalState, setModalStateNone } from "@/store/reducer/modalState";
import { setCurrentHouse } from "@/store/reducer/currentHouse";
import { setIsLoading } from "@/store/reducer/isLoading";
import { House } from "@/constants/types";
import { setPage } from "@/store/reducer/currentPage";
import { ModalState, Page } from "@/constants/enums";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import de from "@/constants/de.json";
import ActionMenu from "@/components/shared/navigation/ActionMenu";
import {
  buildBuildingMenuActions,
  resolveDefaultHouseName,
  resolveSelectedHouse,
} from "@/components/features/building/MenuBuilding/MenuBuilding.logic";
import { performAuthLogout } from "@/domain/authLogout";

/**
 * Renders the building menu and handles building-specific navigation actions.
 * @param props Component props.
 * @returns Rendered building menu component.
 */
export default function MenuBuilding({
  houses,
  onAddFloor,
}: MenuBuildingProps) {
  const language = de;
  const dispatch = useAppDispatch();
  const currentHouseName: string | undefined = useAppSelector(
    (state: RootState) => state.currentHouse.name,
  );

  /**
   * Logs out the active user from the building context.
   * @returns No return value.
   */
  const onLogoutHandler = () => {
    performAuthLogout({ dispatch });
  };

  /**
   * Navigates back to home and refreshes loading state.
   * @returns No return value.
   */
  const onHomePageClickHandler = () => {
    dispatch(setModalStateNone());
    dispatch(setIsLoading(true));
    dispatch(setPage(Page.Home));
  };

  /**
   * Updates the selected house in store when selection changes.
   * @param value Selected house label value.
   * @returns No return value.
   */
  const onHouseChangeHandler = (value: string) => {
    const selectedHouse = resolveSelectedHouse(houses, value);
    if (selectedHouse) {
      dispatch(setCurrentHouse(selectedHouse));
    }
  };

  /**
   * Opens the building CSV export modal.
   * @returns No return value.
   */
  const onExportAsCsvClickHandler = () => {
    dispatch(setModalStateNone());
    dispatch(setModalState(ModalState.DownloadBuildingCsv));
  };

  const menuActions = buildBuildingMenuActions({
    labels: {
      home: language.buttonLabels.home,
      logout: language.buttonLabels.logout,
      downloadCsv: language.buttonLabels.downloadCsv,
    },
    onHome: onHomePageClickHandler,
    onLogout: onLogoutHandler,
    onExportCsv: onExportAsCsvClickHandler,
  });

  return (
    <ActionMenu
      actions={menuActions}
      selectConfig={{
        onChange: onHouseChangeHandler,
        defaultValue: resolveDefaultHouseName(currentHouseName, houses),
        options: houses.map((house) => house.name),
        direction: "up",
      }}
      primaryAction={{
        icon: faAdd,
        onClick: onAddFloor,
      }}
    />
  );
}

export type MenuBuildingProps = {
  houses: House[];
  onAddFloor: () => void;
};
