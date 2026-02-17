import React, {ChangeEvent, useEffect, useState} from 'react';
import styles from '../styles/Statistics.module.css'
import globalStyles from "@/styles/GlobalStyles.module.css";
import {YearMonth} from "@/constants/types";
import {loadAllConsumptionDocsBetween} from "@/firebase/functions";
import de from "@/constants/de.json"
import {useAppSelector} from "@/store/hooks";

export default function Statistics({}: StatisticsProps) {
    const isHorizontal: boolean = useAppSelector((state) => state.dimension.isHorizontal)
    const currentCarName: string | undefined = useAppSelector((state) => state.currentCar.name)

    //Todo create date input
    const date = new Date()
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const monthString: string = month < 10 ? `0` + month : month.toString()

    const [kilometersDriven, setKilometersDriven] = useState(0)
    const [kwhFueled, setKwhFueled] = useState(0)
    const [priceMultiplier, setPriceMultiplier] = useState("0.2")
    const [priceToPay, setPriceToPay] = useState(0)
    const [fromDateValue, setFromDateValue] = useState<YearMonth>({
        year: year.toString(),
        month: monthString
    })
    const [toDateValue, setToDateValue] = useState<YearMonth>({
        year: year.toString(),
        month: monthString
    })

    useEffect(() => {
        loadAllConsumptionDocsBetween(fromDateValue, toDateValue, currentCarName).then((result) => {
            if (result && result.length > 0) {
                const kwh = result.reduce(
                    (sum, item) => sum + Number(item.data.power),
                    0
                );
                setKwhFueled(kwh)
                setKilometersDriven(result[result.length-1].data.kilometer - result[0].data.kilometer)
            }
            else {
                setKwhFueled(0)
                setKilometersDriven(0)
            }
        }).catch((ex) => console.error(ex))
    }, [currentCarName, fromDateValue, toDateValue]);

    useEffect(() => {
        const multiplier = isPowerValid(priceMultiplier)
            ? Number(String(priceMultiplier).replace(",", "."))
            : 1;

        setPriceToPay(kwhFueled * multiplier);
    }, [kwhFueled, priceMultiplier]);

    const onFromDateInputChangeHandler = async (event: ChangeEvent<HTMLInputElement>) => {
        if (event.target.value !== '') {
            const arrayDate: string[] = event.target.value.split('-')
            const yearMonth = {
                year: arrayDate[0],
                month: arrayDate[1]
            }
            setFromDateValue(yearMonth)
        }
    }

    const onToDateInputChangeHandler = async (event: ChangeEvent<HTMLInputElement>) => {
        if (event.target.value !== '') {
            const arrayDate: string[] = event.target.value.split('-')
            const yearMonth = {
                year: arrayDate[0],
                month: arrayDate[1]
            }
            setToDateValue(yearMonth)
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
                {isHorizontal ?
                    <div className={styles.inputContainer}>
                        <div>{de.inputLabels.currentSelectedCar}:</div>
                        <div>{currentCarName}</div>
                    </div>
                : null}
                <div className={styles.inputContainer}>
                    <div>{de.inputLabels.from}:</div>
                    <input
                        onChange={onFromDateInputChangeHandler}
                        value={`${fromDateValue.year}-${fromDateValue.month}`}
                        className={globalStyles.monthPicker}
                        style={{width: "12rem"}}
                        type={"month"}
                        max={``}/>
                </div>
                <div className={styles.inputContainer}>
                    <div>{de.inputLabels.to}:</div>
                    <input
                        onChange={onToDateInputChangeHandler}
                        value={`${toDateValue.year}-${toDateValue.month}`}
                        className={globalStyles.monthPicker}
                        style={{width: "12rem"}}
                        type={"month"}
                        max={``}/>
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
                <div>{de.displayLabels.kwhFueled}:</div>
                <div>{kwhFueled.toFixed(2)} kWh</div>
                <div>{de.displayLabels.currentPriceToPay}:</div>
                <div>{priceToPay.toFixed(2)} €</div>
                <div>{de.displayLabels.kilometersDriven}:</div>
                <div>{kilometersDriven} km</div>
            </div>
        </div>
    );
}

export type StatisticsProps = {
}
