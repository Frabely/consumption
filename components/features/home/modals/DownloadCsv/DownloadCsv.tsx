import styles from './DownloadCsv.module.css'
import globalStyles from "@/styles/GlobalStyles.module.css";
import Modal from "@/components/shared/overlay/Modal";
import {ChangeEvent, useState} from "react";
import deJson from '@/i18n'
import {getFullDataSet} from "@/firebase/functions";
import type {Translations} from "@/i18n/types";
import {setModalStateNone} from "@/store/reducer/modalState";
import {ModalState} from "@/constants/enums";
import {useAppDispatch, useAppSelector} from "@/store/hooks";
import {selectCurrentCar} from "@/store/selectors";
import {parseYearMonthInput} from "@/utils/building/fieldValueMapping";
import {setIsLoading} from "@/store/reducer/isLoading";
import {buildDownloadCsvText} from "@/components/features/home/modals/DownloadCsv/DownloadCsv.logic";

export default function DownloadCsv({}: DownloadCsvProps) {
    const currentCar = useAppSelector(selectCurrentCar)
    const dispatch = useAppDispatch()
    const de: Translations = deJson
    //Todo create date input
    const date = new Date()
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const monthString: string = month < 10 ? `0` + month : month.toString()

    const [currentDateValue, setCurrentDateValue] = useState({
        year: year.toString(),
        month: monthString
    })

    const onAbortClickHandler = () => {
        dispatch(setModalStateNone())
    }

    const onDateInputChangeHandler = (event: ChangeEvent<HTMLInputElement>) => {
        if (event.target.value !== '') {
            const parsed = parseYearMonthInput(event.target.value)
            if (parsed) {
                setCurrentDateValue(parsed)
            }
        }
    }

    const onDownloadCsvClickHandler = () => {
        dispatch(setModalStateNone())
        dispatch(setIsLoading(true))
        if (currentCar.name) {
            getFullDataSet(currentCar.name, {
                year: currentDateValue.year,
                month: currentDateValue.month
            }).then((dataSetArray) => {
                if (dataSetArray) {
                    const blob = new Blob([buildDownloadCsvText(dataSetArray, {
                        loadingStationId: de.dataSet.loadingStationId,
                        date: de.dataSet.date,
                        time: de.dataSet.time,
                        utcDate: de.dataSet.utcDate,
                        utcTime: de.dataSet.utcTime,
                        kilometer: de.dataSet.kilometer,
                        power: de.dataSet.power,
                        name: de.dataSet.name,
                        startedAt: de.dataSet.startedAt,
                        endedAt: de.dataSet.endedAt,
                        cardId: de.dataSet.cardId
                    })], {type: "text/plain"});
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement("a");
                    link.download = `${currentDateValue.year}-${currentDateValue.month}.csv`;
                    link.href = url;
                    link.click();
                } else {
                    alert(`${de.messages.noDataForFollowMonthAndYearAvailable}: ${currentDateValue.year} ${currentDateValue.month}`)
                }
            }).finally(() => dispatch(setIsLoading(false)))
        } else {
            dispatch(setIsLoading(false))
        }
    }
    return (
        <Modal formName={`${ModalState.DownloadCsv}`} title={de.buttonLabels.downloadCsv}>
            <div className={styles.mainContainer}>
                <div className={styles.headerArea}>
                    <span className={styles.contextLabel}>{de.inputLabels.currentSelectedCar}:</span>
                    <strong className={styles.contextValue}>{currentCar.name ?? "-"}</strong>
                </div>
                <div className={styles.inputRow}>
                    <span className={styles.label}>{de.inputLabels.date}</span>
                    <input
                        onChange={onDateInputChangeHandler}
                        value={`${currentDateValue.year}-${currentDateValue.month}`}
                        className={`${globalStyles.monthPicker} ${styles.monthInput}`}
                        type={"month"}
                    />
                </div>
                <div className={styles.actionRow}>
                    <button type={"button"} className={styles.secondaryButton} onClick={onAbortClickHandler}>
                        {de.buttonLabels.abort}
                    </button>
                    <button type={"button"} className={styles.primaryButton} onClick={onDownloadCsvClickHandler}>
                        {de.buttonLabels.downloadCsv}
                    </button>
                </div>
            </div>
        </Modal>
    )
}

export type DownloadCsvProps = {}




