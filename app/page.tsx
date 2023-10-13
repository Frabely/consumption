'use client'

import styles from '../styles/page.module.css'
import Header from "@/components/layout/Header";
import Display from "@/components/Display";
import {RootState} from "@/store/store";
import {useSelector} from "react-redux";
import AddData from "@/components/modals/AddData";
import Login from "@/components/Login";
import img from "@/public/bg_vert.jpg";
import Image from "next/image";
import DownloadCsv from "@/components/modals/DownloadCsv";
export default function Home() {
    const state: RootState = useSelector((state: RootState) => state)

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
