'use client'

import styles from '@/styles/buildingConsuption/page.module.css'
import {RootState} from "@/store/store";
import {useSelector} from "react-redux";
import {setDimension} from "@/store/reducer/dismension";
import {useEffect, useState} from "react";
import useWindowDimensions, {useAppDispatch} from "@/constants/hooks";
import img from "@/public/bg_vert.jpg";
import Image from "next/image";
import Menu from "@/components/layout/Menu";
import {Room} from "@/constants/types";
import AddFloorData from "@/components/modals/AddFloorData";
import {invertIsAddingFloorDataModalActive} from "@/store/reducer/isAddingFloorDataModalActive";
import {faAdd} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import AddFloor from "@/components/modals/AddFloor";
import Link from "next/link";


export default function BuildingConsumption() {
    const [isAddingFloorItem, setIsAddingFloorItem] = useState(false)
    const [flatName, setFlatName] = useState("")
    const [currentRooms, setCurrentRooms] = useState<Room[]>([])
    const state: RootState = useSelector((state: RootState) => state)
    const dispatch = useAppDispatch()
    const dimension = useWindowDimensions()

    useEffect(() => {
        if (window)
            dispatch(setDimension(dimension))
        // loadAllData().then(() => {
        //     dispatch(setCurrentCar(cars.filter(car => car.name === DEFAULT_CAR.name)[0]))
        //     dispatch(setCurrentHouse(houses.filter(house => house.name === DEFAULT_HOUSE.name)[0]))
        // }).catch((error: Error) => {
        //     console.log(error.message)
        // })
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
                        {state.isAddingFloorDataModalActive && !isAddingFloorItem ? (
                            <AddFloorData flatName={flatName} rooms={currentRooms}/>
                        ) : null}
                        {state.isAddingFloorDataModalActive && isAddingFloorItem ? (
                            <AddFloor/>
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
                    <Link href={"/"}>login</Link>
            }
        </div>
    )
}
