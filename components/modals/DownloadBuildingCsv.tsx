import styles from '../../styles/modals/DownloadCsv.module.css'
import globalStyles from "@/styles/GlobalStyles.module.css";
import Modal from "@/components/layout/Modal";
import {ChangeEvent, useState} from "react";
import deJson from '../../constants/de.json'
import {getFieldValuesForExport} from "@/firebase/functions";
import {DownloadBuildingCsvDto} from "@/constants/types";
import {RootState} from "@/store/store";
import {setModalStateNone} from "@/store/reducer/modalState";
import CustomButton from "@/components/layout/CustomButton";
import {ModalState} from "@/constants/enums";
import {useAppDispatch, useAppSelector} from "@/store/hooks";

export default function DownloadBuildingCsv({}: DownloadBuildingCsvProps) {
    const state: RootState = useAppSelector((state: RootState) => state)
    const dispatch = useAppDispatch()
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
            const arrayDate: string[] = event.target.value.split('-')
            setCurrentDateValue({
                year: arrayDate[0],
                month: arrayDate[1]
            })
        }
    }

    const fieldsToTxt = (fieldValuesForExport: DownloadBuildingCsvDto[]): string => {
        let txtContent: string =
            `${deJson.displayLabels.house};` +
            `${deJson.displayLabels.flat};` +
            `${deJson.displayLabels.room};` +
            `${deJson.inputLabels.fieldName};` +
            `${deJson.displayLabels.fieldValue};` +
            `${deJson.displayLabels.day}\n`
        fieldValuesForExport.forEach((fieldValueForExport) => {
            txtContent +=
                `${fieldValueForExport.house.name};` +
                `${fieldValueForExport.flat.name};` +
                `${fieldValueForExport.room.name};` +
                `${fieldValueForExport.fieldValue.field.name};` +
                `${fieldValueForExport.fieldValue.value};` +
                `${fieldValueForExport.fieldValue.day ? 
                    fieldValueForExport.fieldValue.day.getUTCDate().toString() : 
                    "-"};\n`
        })
        return txtContent.replace('.', ',')
    }

    const onDownloadCsvClickHandler = () => {
        dispatch(setModalStateNone())
        if (state.currentHouse.name) {
            getFieldValuesForExport(currentDateValue.year, currentDateValue.month, )
                .then((fieldValuesForExport) => {
                if (fieldValuesForExport.length > 0) {
                    const BOM = "\uFEFF";
                    const csvContent = BOM + fieldsToTxt(fieldValuesForExport);
                    const blob = new Blob([csvContent], {type: "text/csv;charset=utf-8;"});
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement("a");
                    link.download = `${currentDateValue.year}-${currentDateValue.month}.csv`;
                    link.href = url;
                    link.click();
                } else {
                    alert(`${deJson.messages.noDataForFollowMonthAndYearAvailable}: ${currentDateValue.year} ${currentDateValue.month}`)
                }
            })
        }
    }

    return (
        <Modal formName={`${ModalState.DownloadBuildingCsv}`}>
            <div className={styles.mainContainer}>
                <input
                    onChange={onDateInputChangeHandler}
                    value={`${currentDateValue.year}-${currentDateValue.month}`}
                    className={globalStyles.monthPicker}
                    type={"month"}/>
                <CustomButton onClick={onDownloadCsvClickHandler} label={deJson.buttonLabels.downloadCsv}/>
                <CustomButton onClick={onAbortClickHandler} label={deJson.buttonLabels.abort}/>
            </div>
        </Modal>
    )
}

export type DownloadBuildingCsvProps = {}
