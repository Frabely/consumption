import styles from '../../styles/modals/DownloadCsv.module.css'
import globalStyles from "@/styles/GlobalStyles.module.css";
import Modal from "@/components/shared/overlay/Modal";
import {ChangeEvent, useState} from "react";
import deJson from '../../constants/de.json'
import {getFieldValuesForExport} from "@/firebase/functions";
import {DownloadBuildingCsvDto} from "@/constants/types";
import {setModalStateNone} from "@/store/reducer/modalState";
import {ModalState} from "@/constants/enums";
import {useAppDispatch, useAppSelector} from "@/store/hooks";
import {selectCurrentHouse} from "@/store/selectors";
import {parseYearMonthInput} from "@/domain/fieldValueMapping";

export default function DownloadBuildingCsv({}: DownloadBuildingCsvProps) {
    const currentHouse = useAppSelector(selectCurrentHouse)
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
            const parsed = parseYearMonthInput(event.target.value)
            if (parsed) {
                setCurrentDateValue(parsed)
            }
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
        if (currentHouse.name) {
            getFieldValuesForExport(currentDateValue.year, currentDateValue.month)
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
        <Modal formName={`${ModalState.DownloadBuildingCsv}`} title={deJson.buttonLabels.downloadCsv}>
            <div className={styles.mainContainer}>
                <div className={styles.headerArea}>
                    <span className={styles.contextLabel}>{deJson.displayLabels.house}:</span>
                    <strong className={styles.contextValue}>{currentHouse.name ?? "-"}</strong>
                </div>
                <div className={styles.inputRow}>
                    <span className={styles.label}>{deJson.inputLabels.date}</span>
                    <input
                        onChange={onDateInputChangeHandler}
                        value={`${currentDateValue.year}-${currentDateValue.month}`}
                        className={`${globalStyles.monthPicker} ${styles.monthInput}`}
                        type={"month"}
                    />
                </div>
                <div className={styles.actionRow}>
                    <button type={"button"} className={styles.secondaryButton} onClick={onAbortClickHandler}>
                        {deJson.buttonLabels.abort}
                    </button>
                    <button type={"button"} className={styles.primaryButton} onClick={onDownloadCsvClickHandler}>
                        {deJson.buttonLabels.downloadCsv}
                    </button>
                </div>
            </div>
        </Modal>
    )
}

export type DownloadBuildingCsvProps = {}
