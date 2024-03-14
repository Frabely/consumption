'use client'

import styles from '@/styles/buildingConsuption/page.module.css'
import {RootState} from "@/store/store";
import {useSelector} from "react-redux";
import {setDimension} from "@/store/reducer/dismension";
import {useEffect} from "react";
import useWindowDimensions, {useAppDispatch} from "@/constants/hooks";
import img from "@/public/bg_vert.jpg";
import Image from "next/image";
import Login from "@/components/Login";
import Menu from "@/components/layout/Menu";
import de from '../../constants/de.json'
import {Language} from "@/constants/types";
import AddFloorData from "@/components/modals/AddFloorData";
import {invertIsAddingFloorDataModalActive} from "@/store/reducer/isAddingFloorDataModalActive";

export default function BuildingConsumption() {
    const language: Language = de
    const state: RootState = useSelector((state: RootState) => state)
    const dispatch = useAppDispatch()
    const dimension = useWindowDimensions()
    state.currentHouse.flats

    useEffect(() => {
        if (window)
            dispatch(setDimension(dimension))
    })

    const onFloorClickHandler = () => {
        dispatch(invertIsAddingFloorDataModalActive())
    }


    return (
        <div className={styles.mainContainer}>
            <Image className={styles.image} src={img} alt={''}></Image>
            {
                state.currentUser.key ?
                    (
                        <>
                            <Menu/>
                            {state.isAddingFloorDataModalActive ? (
                                <AddFloorData/>
                            ) : null}
                            <div className={
                                state.dimension.isHorizontal ?
                                    styles.contentContainerHor :
                                    styles.contentContainerVert}>
                                {state.currentHouse.flats.map((flat) =>
                                    <div onClick={onFloorClickHandler} key={flat.name}
                                         className={styles.roomsItem}>{flat.name}</div>
                                )}
                            </div>
                        </>
                    )
                    :
                    <Login/>
            }
        </div>
    )
}
