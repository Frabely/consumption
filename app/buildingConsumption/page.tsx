'use client'

import styles from '@/styles/buildingConsuption/page.module.css'
import {RootState} from "@/store/store";
import {useSelector} from "react-redux";
import {setDimension} from "@/store/reducer/dismension";
import {useEffect, useState} from "react";
import useWindowDimensions, {useAppDispatch} from "@/constants/hooks";
import img from "@/public/bg_vert.jpg";
import Image from "next/image";
import Login from "@/components/Login";
import Menu from "@/components/layout/Menu";
import de from '../../constants/de.json'
import {Language, Room} from "@/constants/types";
import AddFloorData from "@/components/modals/AddFloorData";
import {invertIsAddingFloorDataModalActive} from "@/store/reducer/isAddingFloorDataModalActive";
import {faAdd} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

export default function BuildingConsumption() {
    const language: Language = de
    const initRooms: Room[] = []
    const [isAddingFloorItem, setIsAddingFloorItem] = useState(false)
    const [flatName, setFlatName] = useState("")
    const [currentRooms, setCurrentRooms] = useState(initRooms)
    const state: RootState = useSelector((state: RootState) => state)
    const dispatch = useAppDispatch()
    const dimension = useWindowDimensions()

    useEffect(() => {
        if (window)
            dispatch(setDimension(dimension))
    })

    const onFloorClickHandler = (isAddingItem: boolean = false, flatName: string = "", rooms: Room[] = []) => {
        setIsAddingFloorItem(isAddingItem)
        setFlatName(flatName)
        setCurrentRooms(rooms)
        dispatch(invertIsAddingFloorDataModalActive())
    }

    return (
        <div className={styles.mainContainer}>
            <Image className={styles.image} src={img} alt={''}></Image>
            {
                state.currentUser.key ?
                    (<>
                        <Menu/>
                        {state.isAddingFloorDataModalActive ? (
                            <AddFloorData isAddingFloorItem={isAddingFloorItem} floorNameParam={flatName} rooms={currentRooms}/>
                        ) : null}
                        <div className={
                            state.dimension.isHorizontal ?
                                styles.contentContainerHor :
                                styles.contentContainerVert}>
                            <div onClick={
                                () => {
                                    onFloorClickHandler(true)
                                }}
                                 className={styles.roomsItem}>
                                <FontAwesomeIcon icon={faAdd}/>
                            </div>
                            {state.currentHouse.flats.map((flat) =>
                                <div onClick={
                                    () => {
                                        onFloorClickHandler(false, flat.name, flat.rooms)
                                    }} key={flat.name}
                                     className={styles.roomsItem}>{flat.name}</div>
                            )}
                        </div>
                    </>)
                    :
                    <Login/>
            }
        </div>
    )
}
