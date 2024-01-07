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
import SpeechToTextDemo from "@/components/SpeechToTextDemo";

export default function BuildingConsumption() {
    const state: RootState = useSelector((state: RootState) => state)
    const dispatch = useAppDispatch()
    const dimension = useWindowDimensions()

    useEffect(() => {
        if (window)
            dispatch(setDimension(dimension))
    })




    return (
        <div className={styles.mainContainer}>
            <Image className={styles.image} src={img} alt={''}></Image>
            {
                state.currentUser.key ?
                    (
                        <>
                            <Menu/>
                            <SpeechToTextDemo/>
                        </>
                    )
                    :
                    <Login/>
            }
        </div>
    )
}
