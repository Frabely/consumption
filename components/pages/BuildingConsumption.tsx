import React, {useEffect, useRef, useState} from 'react';
import {ModalState, Page, Role} from "@/constants/enums";
import Loading from "@/components/features/home/Loading";
import MenuBuilding from "@/components/layout/menus/MenuBuilding";
import AddFloorData from "@/components/modals/AddFloorData";
import AddFloor from "@/components/modals/AddFloor";
import styles from "@/styles/pages/BuildingConsumption.module.css";
import de from "@/constants/de.json";
import {Flat, House} from "@/constants/types";
import {useAppDispatch} from "@/store/hooks";
import {useAppSelector} from "@/store/hooks";
import {setIsLoading} from "@/store/reducer/isLoading";
import {loadHouses} from "@/constants/constantData";
import {setIsReloadHousesNeeded} from "@/store/reducer/isReloadDataNeeded";
import {setCurrentHouse} from "@/store/reducer/currentHouse";
import {setModalState} from "@/store/reducer/modalState";
import {setPage} from "@/store/reducer/currentPage";
import DownloadBuildingCsv from "@/components/modals/DownloadBuildingCsv";
import {
    selectCurrentHouse,
    selectCurrentUser,
    selectIsLoading,
    selectIsReloadDataNeeded,
    selectModalState
} from "@/store/selectors";

export default function BuildingConsumption({}: BuildingConsumptionProps) {
    const [currentFlat, setCurrentFlat] = useState<Flat | undefined>()
    const currentHouse = useAppSelector(selectCurrentHouse)
    const currentUser = useAppSelector(selectCurrentUser)
    const isLoading = useAppSelector(selectIsLoading)
    const modalState = useAppSelector(selectModalState)
    const isReloadDataNeeded = useAppSelector(selectIsReloadDataNeeded)
    const dispatch = useAppDispatch()
    const touchTimer = useRef<NodeJS.Timeout | undefined>(undefined);
    const [isLongTouchTriggered, setIsLongTouchTriggered] = useState(false)
    const [houseNames, setHouseNames] = useState<House[]>([])

    useEffect(() => {
        if (isReloadDataNeeded.isReloadHousesNeeded) {
            dispatch(setIsLoading(true))
            const currentSelectedHouseName = currentHouse.name
            loadHouses()
                .then((houses) => {
                    dispatch(setIsReloadHousesNeeded(false))
                    dispatch(setCurrentHouse(
                        houses.filter((house) => currentSelectedHouseName === house.name)[0])
                    )
                    setHouseNames(houses)
                    dispatch(setIsLoading(false))
                })
                .catch((error) => console.error(error.message))
        }
    }, [currentHouse.name, dispatch, isReloadDataNeeded.isReloadHousesNeeded]);

    const onTouchStartHandler = (flat: Flat) => {
        setCurrentFlat({...flat})
        touchTimer.current = setTimeout(() => {
            setIsLongTouchTriggered(true)
            onFloorClickHandler(true);
        }, 500);
    };

    const onTouchEndHandler = () => {
        if (touchTimer.current) {
            clearTimeout(touchTimer.current);
            touchTimer.current = undefined;
            if (!isLongTouchTriggered)
                onFloorClickHandler(false)
            setIsLongTouchTriggered(false)
        }
    };


    const onAddFloorClickHandler = () => {
        dispatch(setModalState(ModalState.AddFloor))
    }

    const onFloorClickHandler = (isFloorFliedChange: boolean) => {
        isFloorFliedChange ?
            dispatch(setModalState(ModalState.ChangeFloorFields)) :
            dispatch(setModalState(ModalState.AddFloorData))
    }

    return (
        <>
            {
                currentUser.key && currentUser.role === Role.Admin ?
                    (
                        <>
                            {isLoading ? <Loading/> : null }
                            <MenuBuilding houses={houseNames} onAddFloor={onAddFloorClickHandler}/>
                            {modalState === ModalState.AddFloorData && currentFlat ? (
                                <AddFloorData flat={currentFlat}/>
                            ) : null}
                            {modalState === ModalState.AddFloor ? (
                                <AddFloor newFlatPosition={currentHouse.flats.length}/>
                            ) : null}
                            {modalState === ModalState.ChangeFloorFields ? (
                                <AddFloor currentFlat={currentFlat}/>
                            ) : null}
                            {modalState === ModalState.DownloadBuildingCsv ? (
                                <DownloadBuildingCsv/>
                            ) : null}
                            <div className={styles.pageViewport}>
                                <div className={styles.flatsGrid}>
                                {currentHouse.flats.map((flat) =>
                                    <div
                                        onTouchStart={() => onTouchStartHandler(flat)}
                                        onTouchEnd={() => onTouchEndHandler()}
                                        onMouseDown={() => onTouchStartHandler(flat)}
                                        onMouseUp={() => onTouchEndHandler()}
                                        key={flat.name}
                                        className={styles.flatsItem}
                                    >
                                        <h3 className={styles.flatsItemTitle}>{flat.name}</h3>
                                    </div>
                                )}
                                </div>
                            </div>
                        </>
                    )
                    :
                    <button
                        className={styles.backToLoginButton} onClick={() => {
                        dispatch(setPage(Page.Home))
                    }}>
                        {currentUser.key ?
                            de.displayLabels.backToLogin :
                            de.displayLabels.back}
                    </button>
            }
        </>
    );
}

export type BuildingConsumptionProps = {}
