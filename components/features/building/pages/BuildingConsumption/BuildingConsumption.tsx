import React, {useEffect, useRef, useState} from 'react';
import {ModalState} from "@/constants/enums";
import Loading from "@/components/features/home/Loading";
import MenuBuilding from "@/components/features/building/MenuBuilding";
import AddFloorData from "@/components/features/building/modals/AddFloorData";
import AddFloor from "@/components/features/building/modals/AddFloor";
import styles from "./BuildingConsumption.module.css";
import {Flat, House} from "@/common/models";
import {useAppDispatch} from "@/store/hooks";
import {useAppSelector} from "@/store/hooks";
import {setIsLoading} from "@/store/reducer/isLoading";
import {loadHouses} from "@/constants/constantData";
import {setIsReloadHousesNeeded} from "@/store/reducer/isReloadDataNeeded";
import {setCurrentHouse} from "@/store/reducer/currentHouse";
import {setModalState} from "@/store/reducer/modalState";
import DownloadBuildingCsv from "@/components/features/building/modals/DownloadBuildingCsv";
import {
    selectCurrentHouse,
    selectIsLoading,
    selectIsReloadDataNeeded,
    selectModalState
} from "@/store/selectors";
import {
    resolveCurrentHouseByName,
    resolveFloorModalState
} from "@/components/features/building/pages/BuildingConsumption/BuildingConsumption.logic";

export default function BuildingConsumption({}: BuildingConsumptionProps) {
    const [currentFlat, setCurrentFlat] = useState<Flat | undefined>()
    const currentHouse = useAppSelector(selectCurrentHouse)
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
                    const currentHouseAfterReload = resolveCurrentHouseByName(houses, currentSelectedHouseName)
                    if (currentHouseAfterReload) {
                        dispatch(setCurrentHouse(currentHouseAfterReload))
                    }
                    setHouseNames(houses)
                })
                .catch((error) => console.error(error.message))
                .finally(() => dispatch(setIsLoading(false)))
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
        dispatch(setModalState(resolveFloorModalState(isFloorFliedChange)))
    }

    return (
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
    );
}

export type BuildingConsumptionProps = {}

