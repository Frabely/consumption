import React from 'react';
import {RootState} from "@/store/store";
import {faPowerOff, faHouse, faFileCsv, faAdd} from "@fortawesome/free-solid-svg-icons";
import {setCurrentUser} from "@/store/reducer/currentUser";
import {setModalState, setModalStateNone} from "@/store/reducer/modalState";
import {setCurrentHouse} from "@/store/reducer/currentHouse";
import {setIsLoading} from "@/store/reducer/isLoading";
import {EMPTY_USER} from "@/constants/constantData";
import {House} from "@/constants/types";
import {setPage} from "@/store/reducer/currentPage";
import {ModalState, Page} from "@/constants/enums";
import {useAppDispatch, useAppSelector} from "@/store/hooks";
import de from "@/constants/de.json";
import ActionMenu, {ActionMenuItem} from "@/components/layout/menus/ActionMenu";

export default function MenuBuilding({houses, onAddFloor}: MenuBuildingProps) {
    const language = de
    const dispatch = useAppDispatch()
    const currentHouseName: string | undefined = useAppSelector((state: RootState) => state.currentHouse.name)

    const onLogoutHandler = () => {
        dispatch(setCurrentUser(EMPTY_USER))
        dispatch(setModalStateNone())
        dispatch(setPage(Page.Home))
    }

    const onHomePageClickHandler = () => {
        dispatch(setModalStateNone())
        dispatch(setIsLoading(true))
        dispatch(setPage(Page.Home))
    }

    const onHouseChangeHandler = (value: string) => {
        dispatch(setCurrentHouse(houses.filter(house => house.name === value)[0]))
    }

    const onExportAsCsvClickHandler = () => {
        dispatch(setModalStateNone())
        dispatch(setModalState(ModalState.DownloadBuildingCsv))
    }

    const menuActions: ActionMenuItem[] = [
        {
            id: "home",
            label: language.buttonLabels.home,
            icon: faHouse,
            onClick: onHomePageClickHandler
        },
        {
            id: "logout",
            label: language.buttonLabels.logout,
            icon: faPowerOff,
            onClick: onLogoutHandler
        },
        {
            id: "downloadBuildingCsv",
            label: language.buttonLabels.downloadCsv,
            icon: faFileCsv,
            onClick: onExportAsCsvClickHandler
        }
    ]

    return (
        <ActionMenu
            actions={menuActions}
            selectConfig={{
                onChange: onHouseChangeHandler,
                defaultValue: currentHouseName ?? houses[0]?.name ?? "",
                options: houses.map((house) => house.name),
                direction: "up"
            }}
            primaryAction={{
                icon: faAdd,
                onClick: onAddFloor
            }}
        />
    );
}

export type MenuBuildingProps = {
    houses: House[],
    onAddFloor: () => void,
}
