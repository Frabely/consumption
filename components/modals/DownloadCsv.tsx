import styles from '../../styles/modals/DownloadCsv.module.css'
import Modal from "@/components/layout/Modal";
import {ChangeEvent, useState} from "react";
import de from '../../constants/de.json'
import {useDispatch} from "react-redux";
import {closeIsDownloadCsvModalActive} from "@/store/reducer/isDownloadCsvModalActive";
import {getFullDataSet} from "@/firebase/functions";
import {DataSet} from "@/constants/types";

export default function DownloadCsv({}: DownloadCsvProps) {
    const dispatch = useDispatch()
    const date = new Date()
    const year = date.getFullYear()
    const month = date.getMonth()+1
    const monthString : string = month < 10 ? `0` + month : month.toString()

    const [currentDateValue, setCurrentDateValue] = useState({
        year: year.toString(),
        month: monthString
    })

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
        let txtContent = `${de.dataSet.date},${de.dataSet.time},${de.dataSet.kilometer},${de.dataSet.power},${de.dataSet.name}\n`
        dataSetArray.forEach((dataSet: DataSet) => {
            txtContent += `${dataSet.date},${dataSet.time},${dataSet.kilometer},${dataSet.power},${dataSet.name} \n`
        })
        return txtContent
    }

    const onDownloadCsvClickHandler = () => {
        dispatch(closeIsDownloadCsvModalActive())
        getFullDataSet({year: currentDateValue.year, month: currentDateValue.month}).then((dataSetArray) => {
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
    return (
        <Modal formName={'DownloadCsv'}>
            <input onChange={onDateInputChangeHandler} value={`${currentDateValue.year}-${currentDateValue.month}`} className={styles.input} type={"month"}/>
            <button onClick={onDownloadCsvClickHandler} className={styles.button}>{de.buttonLabels.downloadCsv}</button>
        </Modal>
    )
}

export type DownloadCsvProps = {}
