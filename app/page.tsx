'use client'

import styles from '../styles/page.module.css'
import Menu from "@/components/layout/Menu";
import Display from "@/components/Display";
import {RootState} from "@/store/store";
import {useSelector} from "react-redux";
import AddData from "@/components/modals/AddData";
import Login from "@/components/Login";
import img from "@/public/bg_vert.jpg";
import Image from "next/image";
import DownloadCsv from "@/components/modals/DownloadCsv";
import {setDimension} from "@/store/reducer/dismension";
import {useEffect} from "react";
import useWindowDimensions, {useAppDispatch} from "@/constants/hooks";
export default function Home() {
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
            {state.currentUser.key ?
                <>
                    <Menu/>
                    {state.isAddingDataModalActive ? (
                        <AddData prevKilometers={state.currentCar.prevKilometer ? state.currentCar.prevKilometer : 0}/>
                    ) : null}
                    {state.isDownloadCsvModalActive ? (
                        <DownloadCsv/>
                    ) : null}
                    <Display/>
                </>
                :
                <Login/>
            }
        </div>
    )
}
