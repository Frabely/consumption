import React, {useEffect, useState} from 'react';
import {RootState} from "@/store/store";
import {useSelector} from "react-redux";
import {useAppDispatch} from "@/store/hooks";
import {loadMainPageData} from "@/constants/constantData";
import {setIsReloadNeeded} from "@/store/reducer/isReloadDataNeeded";
import {setIsLoading} from "@/store/reducer/isLoading";
import Loading from "@/components/Loading";
import Menu from "@/components/layout/menus/Menu";
import {HomeTabs, ModalState} from "@/constants/enums";
import AddData from "@/components/modals/AddData";
import DownloadCsv from "@/components/modals/DownloadCsv";
import Display from "@/components/Display";
import Login from "@/components/Login";
import CustomTab from "@/components/layout/CustomTab";
import Statistics from "@/components/Statistics";
import de from "@/constants/de.json"

export default function Home({}: HomeProps) {
    const state: RootState = useSelector((state: RootState) => state)
    const dispatch = useAppDispatch()
    const [selected, setSelected] = useState(0)

    useEffect(() => {
        loadMainPageData().then(() => {
            dispatch(setIsReloadNeeded({
                isReloadHousesNeeded: true,
                isReloadCarsNeeded: false,
                isReloadFieldsNeeded: true,
                isReloadDataSetNeeded: false,
                isReloadLoadingStationsNeeded: false,
            }))
            dispatch(setIsLoading(false))
        }).catch((error: Error) => {
            console.error(error.message)
        })
    }, [dispatch]);



    return (
        <>
            {state.isLoading ? <Loading/> : null}
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
                    <CustomTab
                        tabNames={[
                            de.displayLabels.enteredItems,
                            de.displayLabels.statistics]}
                        selected={selected}
                        setSelected={setSelected}/>
                    {HomeTabs.Statistics === selected ? <Display/> : <Statistics/>}
                </>
                :
                <Login/>
            }
        </>
    );
}
export type HomeProps = {

}
