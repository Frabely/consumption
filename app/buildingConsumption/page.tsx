'use client'

import styles from '@/styles/buildingConsuption/page.module.css'
import {RootState} from "@/store/store";
import {useSelector} from "react-redux";
import {setDimension} from "@/store/reducer/dismension";
import {useEffect, useRef, useState} from "react";
import useWindowDimensions, {useAppDispatch} from "@/constants/hooks";
import img from "@/public/bg_vert.jpg";
import Image from "next/image";
import {Flat, House, Room} from "@/constants/types";
import AddFloorData from "@/components/modals/AddFloorData";
import {faAdd} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import AddFloor from "@/components/modals/AddFloor";
import Link from "next/link";
import {setModalState} from "@/store/reducer/modalState";
import {ModalState} from "@/constants/enums";
import MenuBuilding from "@/components/layout/menus/MenuBuilding";
import {setIsLoading} from "@/store/reducer/isLoading";
import Loading from "@/components/Loading";
import {loadHouses} from "@/constants/constantData";
import {setIsReloadHousesNeeded} from "@/store/reducer/isReloadDataNeeded";
import {setCurrentHouse} from "@/store/reducer/currentHouse";

export default function BuildingConsumption() {
    const [flatName, setFlatName] = useState("")
    const [currentRooms, setCurrentRooms] = useState<Room[]>([])
    const state: RootState = useSelector((state: RootState) => state)
    const dispatch = useAppDispatch()
    const dimension = useWindowDimensions()
    const touchTimer = useRef<NodeJS.Timeout | undefined>(undefined);
    const [isLongTouchTriggered, setIsLongTouchTriggered] = useState(false)
    const [houseNames, setHouseNames] = useState<House[]>([])

    useEffect(() => {
        if (window)
            dispatch(setDimension(dimension))
        if (state.isReloadDataNeeded.isReloadHousesNeeded) {
            dispatch(setIsLoading(true))
            loadHouses()
                .then((houses) => {
                    dispatch(setIsReloadHousesNeeded(false))
                    dispatch(setCurrentHouse(houses[0]))
                    setHouseNames(houses)
                    dispatch(setIsLoading(false))
                })
                .catch((error) => console.log(error.messages))
        }
    });

    const onTouchStartHandler = (flat: Flat) => {
        setCurrentRooms(flat.rooms)
        setFlatName(flat.name)
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
        <div className={styles.mainContainer}>
            <Image className={styles.image} src={img} alt={''}></Image>
            {
                state.currentUser.key ?
                    (
                        <>
                            {state.isLoading ?
                                <Loading/> :
                                <>
                                    <MenuBuilding houses={houseNames}/>
                                    {state.modalState === ModalState.AddFloorData ? (
                                        <AddFloorData flatName={flatName} rooms={currentRooms}/>
                                    ) : null}
                                    {state.modalState === ModalState.AddFloor ? (
                                        <AddFloor/>
                                    ) : null}
                                    {state.modalState === ModalState.ChangeFloorFields ? (
                                        <AddFloor changingFloorData={{flatName, rooms: currentRooms}}/>
                                    ) : null}
                                    <div className={
                                        state.dimension.isHorizontal ?
                                            styles.contentContainerHor :
                                            styles.contentContainerVert}>
                                        <div onClick={
                                            () => {
                                                onAddFloorClickHandler()
                                            }}
                                             className={styles.roomsItem}>
                                            <FontAwesomeIcon icon={faAdd}/>
                                        </div>
                                        {state.currentHouse.flats.map((flat) =>
                                            <div
                                                onTouchStart={() => onTouchStartHandler(flat)}
                                                onTouchEnd={() => onTouchEndHandler()}
                                                onMouseDown={() => onTouchStartHandler(flat)}
                                                onMouseUp={() => onTouchEndHandler()}
                                                key={flat.name}
                                                className={styles.roomsItem}
                                            >
                                                <h3>{flat.name}</h3>
                                            </div>
                                        )}
                                    </div>
                                </>}
                        </>
                    )
                    :
                    <Link href={"/"}>login</Link>
            }
        </div>
    )
}
