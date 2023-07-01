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
import {setHighestKilometer} from "@/store/reducer/highestKilometer";
import {setKilometer} from "@/store/reducer/modal/kilometer";
import Login from "@/components/Login";
import img from "@/public/electric-car-2783573.jpg";
import Image from "next/image";
import DownloadCsv from "@/components/modals/DownloadCsv";

export default function Home() {
    const dispatch = useDispatch()
    const state: RootState = useSelector((state: RootState) => state)
    useEffect(() => {
        getFullDataSet().then((dataSet) => {
                if (dataSet) {
                    dispatch(setDataSetArray(dataSet))
                    dispatch(setHighestKilometer(dataSet[0]?.kilometer ? dataSet[0]?.kilometer : 0))
                    dispatch(setKilometer(state.highestKilometer.toString()))
                }
            }
        ).catch((error) => {
            console.log(error.message)
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.isAddingDataModalActive])

    return (
        <div className={styles.mainContainer}>
            <Image className={styles.image} src={img} alt={''}></Image>
            {state.currentUser.key ?
                <>
                    <Header/>
                    {state.isAddingDataModalActive ? (
                        <AddData prevKilometers={state.currentDataSet[1]?.kilometer ? state.currentDataSet[1]?.kilometer : 0}/>
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
