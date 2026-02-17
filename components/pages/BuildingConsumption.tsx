import React, {useEffect, useRef, useState} from 'react';
import {ModalState, Page, Role} from "@/constants/enums";
import Loading from "@/components/Loading";
import MenuBuilding from "@/components/layout/menus/MenuBuilding";
import AddFloorData from "@/components/modals/AddFloorData";
import AddFloor from "@/components/modals/AddFloor";
import styles from "@/styles/pages/BuildingConsumption.module.css";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faAdd} from "@fortawesome/free-solid-svg-icons";
import de from "@/constants/de.json";
import {Flat, House} from "@/constants/types";
import {RootState} from "@/store/store";
import {useSelector} from "react-redux";
import {useAppDispatch} from "@/store/hooks";
import {setIsLoading} from "@/store/reducer/isLoading";
import {loadHouses} from "@/constants/constantData";
import {setIsReloadHousesNeeded} from "@/store/reducer/isReloadDataNeeded";
import {setCurrentHouse} from "@/store/reducer/currentHouse";
import {setModalState} from "@/store/reducer/modalState";
import {setPage} from "@/store/reducer/currentPage";
import DownloadBuildingCsv from "@/components/modals/DownloadBuildingCsv";

export default function BuildingConsumption({}: BuildingConsumptionProps) {
    const [currentFlat, setCurrentFlat] = useState<Flat | undefined>()
    const state: RootState = useSelector((state: RootState) => state)
    const dispatch = useAppDispatch()
    const touchTimer = useRef<NodeJS.Timeout | undefined>(undefined);
    const [isLongTouchTriggered, setIsLongTouchTriggered] = useState(false)
    const [houseNames, setHouseNames] = useState<House[]>([])

    useEffect(() => {
        if (state.isReloadDataNeeded.isReloadHousesNeeded) {
            dispatch(setIsLoading(true))
            const currentSelectedHouseName = state.currentHouse.name
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
    });

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
                state.currentUser.key && state.currentUser.role === Role.Admin ?
                    (
                        <>
                            {state.isLoading ? <Loading/> : null }
                            <MenuBuilding houses={houseNames}/>
                            {state.modalState === ModalState.AddFloorData && currentFlat ? (
                                <AddFloorData flat={currentFlat}/>
                            ) : null}
                            {state.modalState === ModalState.AddFloor ? (
                                <AddFloor newFlatPosition={state.currentHouse.flats.length}/>
                            ) : null}
                            {state.modalState === ModalState.ChangeFloorFields ? (
                                <AddFloor currentFlat={currentFlat}/>
                            ) : null}
                            {state.modalState === ModalState.DownloadBuildingCsv ? (
                                <DownloadBuildingCsv/>
                            ) : null}
                            <div className={
                                state.dimension.isHorizontal ?
                                    styles.contentContainerHor :
                                    styles.contentContainerVert}>
                                <div onClick={
                                    () => {
                                        onAddFloorClickHandler()
                                    }}
                                     className={styles.flatsItem}
                                     style={state.currentHouse.flats.length < 4 ? {height: '50%'} : {}}>
                                    <FontAwesomeIcon icon={faAdd}/>
                                </div>
                                {state.currentHouse.flats.map((flat) =>
                                    <div
                                        onTouchStart={() => onTouchStartHandler(flat)}
                                        onTouchEnd={() => onTouchEndHandler()}
                                        onMouseDown={() => onTouchStartHandler(flat)}
                                        onMouseUp={() => onTouchEndHandler()}
                                        key={flat.name}
                                        className={styles.flatsItem}
                                        style={state.currentHouse.flats.length < 4 ? {height: '50%'} : {}}
                                    >
                                        <h3 className={styles.flatsItemTitle}>{flat.name}</h3>
                                    </div>
                                )}
                            </div>
                        </>
                    )
                    :
                    <button
                        className={styles.backToLoginButton} onClick={() => {
                        dispatch(setPage(Page.Home))
                    }}>
                        {state.currentUser.key ?
                            de.displayLabels.backToLogin :
                            de.displayLabels.back}
                    </button>
            }
        </>
    );
}

export type BuildingConsumptionProps = {}
