import React, {useEffect} from 'react';
import {RootState} from "@/store/store";
import {useSelector} from "react-redux";
import {useAppDispatch} from "@/constants/hooks";
import {cars, DEFAULT_CAR, loadMainPageData} from "@/constants/constantData";
import {setCurrentCar} from "@/store/reducer/currentCar";
import {setIsReloadNeeded} from "@/store/reducer/isReloadDataNeeded";
import {setIsLoading} from "@/store/reducer/isLoading";
import Loading from "@/components/Loading";
import Menu from "@/components/layout/menus/Menu";
import {ModalState} from "@/constants/enums";
import AddData from "@/components/modals/AddData";
import DownloadCsv from "@/components/modals/DownloadCsv";
import Display from "@/components/Display";
import Login from "@/components/Login";

export default function Home({}: HomeProps) {
    const state: RootState = useSelector((state: RootState) => state)
    const dispatch = useAppDispatch()

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

    return (
        <>
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
        </>
    );
}
export type HomeProps = {

}
