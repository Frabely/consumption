import React, {ChangeEvent, useEffect, useState} from 'react';
import styles from '../styles/Statistics.module.css'
import globalStyles from "@/styles/GlobalStyles.module.css";
import {YearMonth} from "@/constants/types";
import {getFullDataSet} from "@/firebase/functions";
import {RootState} from "@/store/store";
import {useSelector} from "react-redux";

export default function Statistics({}: StatisticsProps) {
    const state: RootState = useSelector((state: RootState) => state)

    //Todo create date input
    const date = new Date()
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const monthString: string = month < 10 ? `0` + month : month.toString()

    const [kilometersDriven, setKilometersDriven] = useState(0)
    const [kwhFueled, setKwhFueled] = useState(0)
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
                setPriceToPay(kwh * 0.2)
                setKilometersDriven(dataSet[0].kilometer - dataSet[dataSet.length-1].kilometer)
            } else {
                setKwhFueled(0)
                setPriceToPay(0)
                setKilometersDriven(0)
            }
        }).catch((e: Error) => console.log(e.message))
    }, [state.currentCar.name, currentDateValue]);

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

    return (
        <>
            <input
                onChange={onDateInputChangeHandler}
                value={`${currentDateValue.year}-${currentDateValue.month}`}
                className={globalStyles.monthPicker}
                type={"month"}/>
            <div>kilometersDriven: {kilometersDriven} km</div>
            <div>kwhFueled: {kwhFueled} kWh</div>
            <div>priceToPay: {priceToPay} €</div>
        </>
    );
}

export type StatisticsProps = {

}
