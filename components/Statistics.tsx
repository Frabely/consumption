import React, {ChangeEvent, useEffect, useState} from 'react';
import styles from '../styles/Statistics.module.css'
import globalStyles from "@/styles/GlobalStyles.module.css";
import {YearMonth} from "@/constants/types";
import {getFullDataSet} from "@/firebase/functions";
import {RootState} from "@/store/store";
import {useSelector} from "react-redux";
import de from "@/constants/de.json"

export default function Statistics({}: StatisticsProps) {
    const state: RootState = useSelector((state: RootState) => state)
    const isHorizontal: boolean = useSelector((state: RootState) => state.dimension.isHorizontal)

    //Todo create date input
    const date = new Date()
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const monthString: string = month < 10 ? `0` + month : month.toString()

    const [kilometersDriven, setKilometersDriven] = useState(0)
    const [kwhFueled, setKwhFueled] = useState(0)
    const [priceMultiplier, setPriceMultiplier] = useState("0.2")
    const [priceToPay, setPriceToPay] = useState(0)
    const [currentDateValue, setCurrentDateValue] = useState<YearMonth>({
        year: year.toString(),
        month: monthString
    })

    useEffect(() => {
        getFullDataSet(state.currentCar.name, currentDateValue).then((dataSet) => {
            if (dataSet && dataSet.length > 0)
            {
                let kwh = 0
                dataSet.map((dataItem) => {
                    kwh += parseFloat(dataItem.power.toString())
                })
                setKwhFueled(kwh)
                if (isPowerValid(priceMultiplier))
                    setPriceToPay(kwh * parseFloat(priceMultiplier) ?? 1)
                setKilometersDriven(dataSet[0].kilometer - dataSet[dataSet.length-1].kilometer)
            } else {
                setKwhFueled(0)
                setPriceToPay(0)
                setKilometersDriven(0)
            }
        }).catch((e: Error) => console.log(e.message))
    }, [state.currentCar.name, currentDateValue, priceMultiplier]);

    const onDateInputChangeHandler = async (event: ChangeEvent<HTMLInputElement>) => {
        if (event.target.value !== '') {
            const arrayDate: string[] = event.target.value.split('-')
            const yearMonth = {
                year: arrayDate[0],
                month: arrayDate[1]
            }
            setCurrentDateValue(yearMonth)
        }
    }

    function isPowerValid(power: string) {
        const powerNumber = parseFloat(power)
        if (powerNumber !== undefined && !Number.isNaN(powerNumber)) {
            return powerNumber < 100 && powerNumber > 0;
        }
    }

    return (
        <div className={styles.mainContainer}>
            <div>
                <div className={styles.inputContainer}>
                    <div>{de.inputLabels.date}:</div>
                    <input
                        onChange={onDateInputChangeHandler}
                        value={`${currentDateValue.year}-${currentDateValue.month}`}
                        className={globalStyles.monthPicker}
                        style={{width: "10rem"}}
                        type={"month"}/>
                </div>
                <div className={styles.inputContainer}>
                    <div>{de.inputLabels.priceMultiplier}:</div>
                    <input
                        onChange={(e) => setPriceMultiplier(e.target.value)}
                        value={priceMultiplier}
                        className={`${styles.input} ${isPowerValid(priceMultiplier) ? styles.inputValid : styles.inputInvalid}`}
                        min={0.01}
                        max={99.99}
                        step={0.01}
                        type={"number"}/>
                </div>
            </div>

            <div className={isHorizontal ? styles.infoFieldContainerHor : styles.infoFieldContainerVert}>
                <div>{de.displayLabels.kilometersDriven}:</div>
                <div>{kilometersDriven} km</div>
                <div>{de.displayLabels.kwhFueled}:</div>
                <div>{kwhFueled.toFixed(2)} kWh</div>
                <div>{de.displayLabels.currentPriceToPay}:</div>
                <div>{priceToPay.toFixed(2)} €</div>
            </div>
        </div>
    );
}

export type StatisticsProps = {

}
