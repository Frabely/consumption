import React, {useEffect, useState} from 'react';
import {useAppDispatch} from "@/store/hooks";
import {useAppSelector} from "@/store/hooks";
import {loadMainPageData} from "@/constants/constantData";
import {setIsReloadNeeded} from "@/store/reducer/isReloadDataNeeded";
import {setIsLoading} from "@/store/reducer/isLoading";
import Loading from "@/components/features/home/Loading";
import Menu from "@/components/layout/menus/Menu";
import {ModalState} from "@/constants/enums";
import AddData from "@/components/modals/AddData";
import DownloadCsv from "@/components/modals/DownloadCsv";
import Display from "@/components/features/home/Display";
import Login from "@/components/features/home/Login";
import CustomTab from "@/components/layout/CustomTab";
import Statistics from "@/components/features/home/Statistics";
import de from "@/constants/de.json"
import styles from "@/styles/pages/Home.module.css";
import {
    selectCurrentCar,
    selectCurrentUser,
    selectIsLoading,
    selectModalState
} from "@/store/selectors";

export default function Home({}: HomeProps) {
    const isLoading = useAppSelector(selectIsLoading)
    const currentUser = useAppSelector(selectCurrentUser)
    const modalState = useAppSelector(selectModalState)
    const currentCar = useAppSelector(selectCurrentCar)
    const dispatch = useAppDispatch()
    const [selected, setSelected] = useState(0)
    const isEvaluationTab = selected === 1

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
            {isLoading ? <Loading/> : null}
            {currentUser.key ?
                <>
                    <Menu/>
                    {modalState === ModalState.AddCarData || modalState === ModalState.ChangeCarData ? (
                        <AddData
                            prevKilometers={currentCar.prevKilometer ? currentCar.prevKilometer : 0}/>
                    ) : null}
                    {modalState === ModalState.DownloadCsv ? (
                        <DownloadCsv/>
                    ) : null}
                    <div className={styles.homeViewport}>
                        <section className={`${styles.glassPanel} ${isEvaluationTab ? styles.glassPanelContentHeight : ""}`}>
                            <CustomTab
                                tabNames={[
                                    de.displayLabels.enteredItems,
                                    de.displayLabels.statistics]}
                                selected={selected}
                                setSelected={setSelected}/>
                            <div className={`${styles.tabContent} ${isEvaluationTab ? styles.tabContentAuto : ""}`}>
                                {isEvaluationTab ? <Statistics/> : <Display/>}
                            </div>
                        </section>
                    </div>
                </>
                :
                <Login/>
            }
        </>
    );
}
export type HomeProps = {

}
