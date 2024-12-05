'use client'

import styles from '@/styles/buildingConsuption/page.module.css'
import {RootState} from "@/store/store";
import {useSelector} from "react-redux";
import {setDimension} from "@/store/reducer/dismension";
import {useEffect, useRef, useState} from "react";
import useWindowDimensions, {useAppDispatch} from "@/constants/hooks";
import img from "@/public/bg_vert.jpg";
import Image from "next/image";
import {Flat, Room} from "@/constants/types";
import AddFloorData from "@/components/modals/AddFloorData";
import {faAdd} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import AddFloor from "@/components/modals/AddFloor";
import Link from "next/link";
import {setModalState} from "@/store/reducer/modalState";
import {ModalState} from "@/constants/enums";
import MenuBuilding from "@/components/layout/menus/MenuBuilding";

export default function BuildingConsumption() {
    const [flatName, setFlatName] = useState("")
    const [currentRooms, setCurrentRooms] = useState<Room[]>([])
    const state: RootState = useSelector((state: RootState) => state)
    const dispatch = useAppDispatch()
    const dimension = useWindowDimensions()
    const touchTimer = useRef<NodeJS.Timeout | undefined>(undefined);
    const [isLongTouchTriggered, setIsLongTouchTriggered] = useState(false)

    useEffect(() => {
        if (state.isReloadDataNeeded.isReloadHousesNeeded)
        {

        }
    }, []);

    const onTouchStartHandler = (flat: Flat) => {
        touchTimer.current = setTimeout(() => {
            setIsLongTouchTriggered(true)
            onFloorClickHandler(true, flat.name, flat.rooms);
        }, 500);
    };

    const onTouchEndHandler = (flat: Flat) => {
        if (touchTimer.current) {
            clearTimeout(touchTimer.current);
            touchTimer.current = undefined;
            if (!isLongTouchTriggered)
                onFloorClickHandler(false, flat.name, flat.rooms)
            setIsLongTouchTriggered(false)
        }
    };

    useEffect(() => {
        if (window)
            dispatch(setDimension(dimension))
    })

    const onAddFloorClickHandler = () => {
        dispatch(setModalState(ModalState.AddFloor))
    }

    const onFloorClickHandler = (isFloorFliedChange: boolean, flatName: string, rooms: Room[]) => {
        setFlatName(flatName)
        setCurrentRooms(rooms)
        isFloorFliedChange ?
            dispatch(setModalState(ModalState.ChangeFloorFields)) :
            dispatch(setModalState(ModalState.AddFloorData))
    }

    return (
        <div className={styles.mainContainer}>
            <Image className={styles.image} src={img} alt={''}></Image>
            {
                state.currentUser.key ?
                    (<>
                        <MenuBuilding/>
                        {state.modalState === ModalState.AddFloorData ? (
                            <AddFloorData flatName={flatName} rooms={currentRooms}/>
                        ) : null}
                        {state.modalState === ModalState.AddFloor ? (
                            <AddFloor/>
                        ) : null}
                        {state.modalState === ModalState.ChangeFloorFields ? (
                            <AddFloor changingFloorData={{flatName,rooms: currentRooms}}/>
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
                                    // onClick={
                                    // () => {
                                    //     onFloorClickHandler(false, flat.name, flat.rooms)
                                    // }}
                                    onTouchStart={() => {onTouchStartHandler(flat)}}
                                    onTouchEnd={() => {onTouchEndHandler(flat)}}
                                    key={flat.name}
                                    className={styles.roomsItem}
                                >
                                    {flat.name}
                                </div>
                            )}
                        </div>
                    </>)
                    :
                    <Link href={"/"}>login</Link>
            }
        </div>
    )
}
