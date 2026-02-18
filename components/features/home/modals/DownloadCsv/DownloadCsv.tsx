import styles from './DownloadCsv.module.css'
import globalStyles from "@/styles/GlobalStyles.module.css";
import Modal from "@/components/shared/overlay/Modal";
import {ChangeEvent, useState} from "react";
import deJson from '@/constants/de.json'
import {getFullDataSet} from "@/firebase/functions";
import {DataSet, Language} from "@/constants/types";
import {getDateString, getUTCDateString} from "@/constants/globalFunctions";
import {setModalStateNone} from "@/store/reducer/modalState";
import {ModalState} from "@/constants/enums";
import {useAppDispatch, useAppSelector} from "@/store/hooks";
import {selectCurrentCar} from "@/store/selectors";
import {parseYearMonthInput} from "@/domain/fieldValueMapping";

export default function DownloadCsv({}: DownloadCsvProps) {
    const currentCar = useAppSelector(selectCurrentCar)
    const dispatch = useAppDispatch()
    const de: Language = deJson
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

    const dataSetArrayToTxt = (dataSetArray: DataSet[]): string => {
        let txtContent: string =
            `${de.dataSet.loadingStationId};${de.dataSet.date};` +
            `${de.dataSet.time};${de.dataSet.utcDate};${de.dataSet.utcTime};${de.dataSet.kilometer};` +
            `${de.dataSet.power};${de.dataSet.name}\n`
        dataSetArray.forEach((dataSet: DataSet) => {
            const yearMonthDay: string = getDateString(dataSet.date).split(' ')[0]
            const hoursMinutes: string = getDateString(dataSet.date).split(' ')[1]
            const utcYearMonthDay: string = getUTCDateString(dataSet.date).split(' ')[0]
            const utcHoursMinutes: string = getUTCDateString(dataSet.date).split(' ')[1]
            txtContent +=
                `${dataSet.loadingStation.id};${yearMonthDay};` +
                `${hoursMinutes};${utcYearMonthDay};${utcHoursMinutes};${dataSet.kilometer};` +
                `${dataSet.power.toString().replace('.', ',')};${dataSet.name} \n`
        })
        return txtContent
    }

    const onDownloadCsvClickHandler = () => {
        dispatch(setModalStateNone())
        if (currentCar.name) {
            getFullDataSet(currentCar.name, {
                year: currentDateValue.year,
                month: currentDateValue.month
            }).then((dataSetArray) => {
                if (dataSetArray) {
                    const blob = new Blob([dataSetArrayToTxt(dataSetArray)], {type: "text/plain"});
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement("a");
                    link.download = `${currentDateValue.year}-${currentDateValue.month}.csv`;
                    link.href = url;
                    link.click();
                } else {
                    alert(`${de.messages.noDataForFollowMonthAndYearAvailable}: ${currentDateValue.year} ${currentDateValue.month}`)
                }
            })
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
