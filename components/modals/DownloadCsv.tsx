import styles from '../../styles/modals/DownloadCsv.module.css'
import Modal from "@/components/layout/Modal";
import {ChangeEvent, useState} from "react";
import de from '../../constants/de.json'
import {useDispatch, useSelector} from "react-redux";
import {closeIsDownloadCsvModalActive} from "@/store/reducer/isDownloadCsvModalActive";
import {getFullDataSet} from "@/firebase/functions";
import {DataSet} from "@/constants/types";
import {RootState} from "@/store/store";

export default function DownloadCsv({}: DownloadCsvProps) {
    const state: RootState = useSelector((state: RootState) => state)
    const dispatch = useDispatch()
    const date = new Date()
    const year = date.getFullYear()
    const month = date.getMonth()+1
    const monthString : string = month < 10 ? `0` + month : month.toString()

    const [currentDateValue, setCurrentDateValue] = useState({
        year: year.toString(),
        month: monthString
    })

    const onAbortClickHandler = () => {
        dispatch(closeIsDownloadCsvModalActive())
    }

    const onDateInputChangeHandler = (event: ChangeEvent<HTMLInputElement>) => {
        if (event.target.value !== '') {
            const arrayDate: string[] = event.target.value.split('-')
            setCurrentDateValue({
                year: arrayDate[0],
                month: arrayDate[1]
            })
        }
    }

    const dataSetArrayToTxt = (dataSetArray: DataSet[]): string => {
        let txtContent = `${de.dataSet.date};${de.dataSet.time};${de.dataSet.kilometer};${de.dataSet.power};${de.dataSet.name}\n`
        dataSetArray.forEach((dataSet: DataSet) => {
            txtContent += `${dataSet.date};${dataSet.time};${dataSet.kilometer};${dataSet.power};${dataSet.name} \n`
        })
        txtContent = txtContent.replaceAll(".", ",")
        return txtContent
    }

    const onDownloadCsvClickHandler = () => {
        dispatch(closeIsDownloadCsvModalActive())
        if (state.currentCar.name) {
        getFullDataSet(state.currentCar.name,{year: currentDateValue.year, month: currentDateValue.month}).then((dataSetArray) => {
            if (dataSetArray) {
                const blob = new Blob([dataSetArrayToTxt(dataSetArray)], { type: "text/plain" });
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.download = `${currentDateValue.year}-${currentDateValue.month}.csv`;
                link.href = url;
                link.click();
            }
            else {
                alert(`${de.messages.noDataForFollowMonthAndYearAvailable}: ${currentDateValue.year} ${currentDateValue.month}`)
            }
        })
        }
    }
    return (
        <Modal formName={'DownloadCsv'}>
            <input onChange={onDateInputChangeHandler} value={`${currentDateValue.year}-${currentDateValue.month}`} className={styles.input} type={"month"}/>
            <button onClick={onDownloadCsvClickHandler} className={styles.button}>{de.buttonLabels.downloadCsv}</button>
            <button onClick={onAbortClickHandler} className={styles.button}>{de.buttonLabels.abort}</button>
        </Modal>
    )
}

export type DownloadCsvProps = {}
