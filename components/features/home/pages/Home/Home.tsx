import React, {useEffect, useState} from 'react';
import {useAppDispatch} from "@/store/hooks";
import {useAppSelector} from "@/store/hooks";
import {cars, loadMainPageData} from "@/constants/constantData";
import {setIsReloadNeeded} from "@/store/reducer/isReloadDataNeeded";
import {setIsLoading} from "@/store/reducer/isLoading";
import Loading from "@/components/features/home/Loading";
import Menu from "@/components/features/home/Menu";
import AddData from "@/components/features/home/modals/AddData";
import DownloadCsv from "@/components/features/home/modals/DownloadCsv";
import Display from "@/components/features/home/Display";
import Login from "@/components/features/home/Login";
import CustomTab from "@/components/shared/navigation/CustomTab";
import Statistics from "@/components/features/home/Statistics";
import de from "@/i18n"
import styles from "./Home.module.css";
import {
    selectCurrentCar,
    selectCurrentUser,
    selectIsLoading,
    selectModalState
} from "@/store/selectors";
import {
    isAddDataModalOpen,
    isDownloadCsvModalOpen,
    isEvaluationTabSelected,
    resolveHydratedCurrentCar,
    resolvePrevKilometers
} from "@/components/features/home/pages/Home/Home.logic";
import {setCurrentCar} from "@/store/reducer/currentCar";

export default function Home({}: HomeProps) {
    const isLoading = useAppSelector(selectIsLoading)
    const currentUser = useAppSelector(selectCurrentUser)
    const modalState = useAppSelector(selectModalState)
    const currentCar = useAppSelector(selectCurrentCar)
    const dispatch = useAppDispatch()
    const [selected, setSelected] = useState(0)
    const isEvaluationTab = isEvaluationTabSelected(selected)

    useEffect(() => {
        dispatch(setIsLoading(true))
        loadMainPageData().then(() => {
            dispatch(setIsReloadNeeded({
                isReloadHousesNeeded: true,
                isReloadCarsNeeded: false,
                isReloadFieldsNeeded: true,
                isReloadDataSetNeeded: false,
                isReloadLoadingStationsNeeded: false,
            }))
        }).catch((error: Error) => {
            console.error(error.message)
        }).finally(() => {
            dispatch(setIsLoading(false))
        })
    }, [dispatch]);

    useEffect(() => {
        if (isLoading) {
            return
        }
        if (!currentUser.key) {
            return
        }
        if (currentCar.kilometer !== undefined) {
            return
        }

        const hydratedCurrentCar = resolveHydratedCurrentCar({
            carsList: cars,
            currentCarName: currentCar.name,
            defaultCarName: currentUser.defaultCar
        })
        if (!hydratedCurrentCar) {
            return
        }
        dispatch(setCurrentCar(hydratedCurrentCar))
    }, [currentCar.kilometer, currentCar.name, currentUser.defaultCar, currentUser.key, dispatch, isLoading]);



    return (
        <>
            {isLoading ? <Loading/> : null}
            {currentUser.key ?
                <>
                    <Menu/>
                    {isAddDataModalOpen(modalState) ? (
                        <AddData
                            prevKilometers={resolvePrevKilometers(currentCar.prevKilometer)}/>
                    ) : null}
                    {isDownloadCsvModalOpen(modalState) ? (
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

