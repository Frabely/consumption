'use client'

import styles from '../styles/page.module.css'
import Menu from "@/components/layout/menus/Menu";
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
import {cars, DEFAULT_CAR, loadMainPageData} from "@/constants/constantData";
import {setCurrentCar} from "@/store/reducer/currentCar";
import {ModalState} from "@/constants/enums";
import {setIsReloadNeeded} from "@/store/reducer/isReloadDataNeeded";
import Loading from "@/components/Loading";
import {setIsLoading} from "@/store/reducer/isLoading";

export default function Home() {
    const state: RootState = useSelector((state: RootState) => state)
    const dispatch = useAppDispatch()
    const dimension = useWindowDimensions()

    useEffect(() => {
        loadMainPageData().then(() => {
            dispatch(setCurrentCar(cars.filter(car => car.name === DEFAULT_CAR.name)[0]))
            dispatch(setIsReloadNeeded({
                isReloadHousesNeeded: true,
                isReloadCarsNeeded: false,
                isReloadFieldsNeeded: true,
                isReloadDataSetNeeded: false,
                isReloadLoadingStationsNeeded: false,
            }))
            dispatch(setIsLoading(false))
        }).catch((error: Error) => {
            console.log(error.message)
        })
    }, [dispatch]);

    useEffect(() => {
        if (window)
            dispatch(setDimension(dimension))
    })


    return (
        <div className={styles.mainContainer}>
            <Image className={styles.image} src={img} alt={''}></Image>
            {state.isLoading ?
                <Loading/> :
                <>
                    {state.currentUser.key ?
                        <>
                            <Menu/>
                            {state.modalState === ModalState.AddCarData || state.modalState === ModalState.ChangeCarData ? (
                                <AddData
                                    prevKilometers={state.currentCar.prevKilometer ? state.currentCar.prevKilometer : 0}/>
                            ) : null}
                            {state.modalState === ModalState.DownloadCsv ? (
                                <DownloadCsv/>
                            ) : null}
                            <Display/>
                        </>
                        :
                        <Login/>
                    }
                </>
            }
        </div>
    )
}
