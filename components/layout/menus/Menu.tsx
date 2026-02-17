'use client'

import {faAdd, faFileCsv, faHouseFire, faPowerOff} from '@fortawesome/free-solid-svg-icons'
import {setModalState, setModalStateNone} from "@/store/reducer/modalState";
import {setIsChangingData} from "@/store/reducer/isChangingData";
import {setCurrentUser} from "@/store/reducer/currentUser";
import {cars, EMPTY_USER} from "@/constants/constantData";
import {RootState} from "@/store/store";
import React from "react";
import {setCurrentCar} from "@/store/reducer/currentCar";
import {setPage} from "@/store/reducer/currentPage";
import {getCars} from "@/firebase/functions";
import {ModalState, Page, Role} from "@/constants/enums";
import {setDataSetArray} from "@/store/reducer/currentDataSet";
import {useAppDispatch, useAppSelector} from "@/store/hooks";
import de from "@/constants/de.json";
import ActionMenu, {ActionMenuItem} from "@/components/layout/menus/ActionMenu";

export default function Menu({}: MenuProps) {
    const language = de
    const dispatch = useAppDispatch()
    const currentUserRole: Role | undefined = useAppSelector((state: RootState) => state.currentUser.role)
    const currentCarName: string | undefined = useAppSelector((state: RootState) => state.currentCar.name)

    const onAddDataClickHandler = () => {
        dispatch(setModalStateNone())
        dispatch(setIsChangingData(false))
        dispatch(setModalState(ModalState.AddCarData))
    }

    const onLogoutHandler = () => {
        dispatch(setCurrentUser(EMPTY_USER))
        dispatch(setModalStateNone())
        dispatch(setPage(Page.Home))
        dispatch(setDataSetArray([]))
    }


    const onExportAsCsvClickHandler = () => {
        dispatch(setModalStateNone())
        dispatch(setModalState(ModalState.DownloadCsv))
    }

    const onCarChangeHandler = (value: string) => {
        getCars().then((result) => {
            if (result) {
                dispatch(setCurrentCar(result.filter(car => car.name === value)[0]))
            }
        }).catch((error: Error) => {
            console.error(error.message)
        })
    }

    const onBuildingConsumptionClickHandler = () => {
        dispatch(setPage(Page.BuildingConsumption))
    }

    const menuActions: ActionMenuItem[] = [
        {
            id: "logout",
            label: language.buttonLabels.logout,
            icon: faPowerOff,
            onClick: onLogoutHandler
        },
        {
            id: "downloadCsv",
            label: language.buttonLabels.downloadCsv,
            icon: faFileCsv,
            onClick: onExportAsCsvClickHandler
        }
    ]

    if (currentUserRole === Role.Admin) {
        menuActions.push({
            id: "buildingConsumption",
            label: language.buttonLabels.buildingConsumption,
            icon: faHouseFire,
            onClick: onBuildingConsumptionClickHandler
        })
    }

    return (
        <ActionMenu
            actions={menuActions}
            selectConfig={{
                onChange: onCarChangeHandler,
                defaultValue: currentCarName ?? cars[0]?.name ?? "",
                options: cars.map((car) => car.name),
                direction: "up"
            }}
            primaryAction={{
                icon: faAdd,
                onClick: onAddDataClickHandler
            }}
        />
    )
}

export type MenuProps = {}
