'use client'

import styles from '../styles/page.module.css'
import Header from "@/components/layout/Header";
import Display from "@/components/Display";
import {RootState} from "@/store/store";
import {useDispatch, useSelector} from "react-redux";
import AddData from "@/components/modals/AddData";
import {getFullDataSet} from "@/firebase/functions";
import {setDataSetArray} from "@/store/reducer/currentDataSet";
import {useEffect} from "react";
import {setKilometer} from "@/store/reducer/modal/kilometer";
import Login from "@/components/Login";
import img from "@/public/electric-car-2783573.jpg";
import Image from "next/image";
import DownloadCsv from "@/components/modals/DownloadCsv";

export default function Home() {
    const dispatch = useDispatch()
    const state: RootState = useSelector((state: RootState) => state)
    useEffect(() => {
        if (!state.isAddingDataModalActive)
            getFullDataSet().then((dataSet) => {
                    if (dataSet) {
                        dispatch(setDataSetArray(dataSet))
                    }
                }
            ).catch((error) => {
                console.log(error.message)
            })
        else if (state.currentCar.kilometer)
            dispatch(setKilometer(state.currentCar.kilometer.toString()))
    }, [state.isAddingDataModalActive])

    return (
        <div className={styles.mainContainer}>
            <Image className={styles.image} src={img} alt={''}></Image>
            {state.currentUser.key ?
                <>
                    <Header/>
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
