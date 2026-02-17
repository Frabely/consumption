import React, {ChangeEvent, useEffect, useState} from "react";
import styles from "../styles/Statistics.module.css";
import globalStyles from "@/styles/GlobalStyles.module.css";
import {YearMonth} from "@/constants/types";
import {loadAllConsumptionDocsBetween} from "@/firebase/functions";
import de from "@/constants/de.json";
import {useAppSelector} from "@/store/hooks";
import {parseYearMonthInput} from "@/domain/fieldValueMapping";

export default function Statistics({}: StatisticsProps) {
    const currentCarName: string | undefined = useAppSelector((state) => state.currentCar.name);

    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const monthString: string = month < 10 ? `0${month}` : month.toString();

    const [kilometersDriven, setKilometersDriven] = useState(0);
    const [kwhFueled, setKwhFueled] = useState(0);
    const [priceMultiplier, setPriceMultiplier] = useState("0.2");
    const [priceToPay, setPriceToPay] = useState(0);
    const [fromDateValue, setFromDateValue] = useState<YearMonth>({
        year: year.toString(),
        month: monthString
    });
    const [toDateValue, setToDateValue] = useState<YearMonth>({
        year: year.toString(),
        month: monthString
    });

    useEffect(() => {
        if (!currentCarName) {
            setKwhFueled(0);
            setKilometersDriven(0);
            return;
        }

        loadAllConsumptionDocsBetween(fromDateValue, toDateValue, currentCarName)
            .then((result) => {
                if (result && result.length > 0) {
                    const kwh = result.reduce(
                        (sum, item) => sum + Number(item.data.power),
                        0
                    );
                    setKwhFueled(kwh);
                    setKilometersDriven(result[result.length - 1].data.kilometer - result[0].data.kilometer);
                } else {
                    setKwhFueled(0);
                    setKilometersDriven(0);
                }
            })
            .catch((ex) => console.error(ex));
    }, [currentCarName, fromDateValue, toDateValue]);

    useEffect(() => {
        const multiplier = isPriceMultiplierValid(priceMultiplier)
            ? Number(String(priceMultiplier).replace(",", "."))
            : 1;

        setPriceToPay(kwhFueled * multiplier);
    }, [kwhFueled, priceMultiplier]);

    const onFromDateInputChangeHandler = (event: ChangeEvent<HTMLInputElement>) => {
        if (event.target.value !== "") {
            const yearMonth = parseYearMonthInput(event.target.value);
            if (yearMonth) {
                setFromDateValue(yearMonth);
            }
        }
    };

    const onToDateInputChangeHandler = (event: ChangeEvent<HTMLInputElement>) => {
        if (event.target.value !== "") {
            const yearMonth = parseYearMonthInput(event.target.value);
            if (yearMonth) {
                setToDateValue(yearMonth);
            }
        }
    };

    const isPriceMultiplierValid = (power: string): boolean => {
        const powerNumber = Number.parseFloat(power);
        return !Number.isNaN(powerNumber) && powerNumber < 100 && powerNumber > 0;
    };

    return (
        <div className={styles.mainContainer}>
            <div className={styles.filtersCard}>
                <div className={styles.selectedContext}>
                    <span className={styles.contextLabel}>{de.inputLabels.currentSelectedCar}:</span>
                    <strong className={styles.contextValue}>{currentCarName ?? "-"}</strong>
                </div>
                <div className={styles.inputGrid}>
                    <div className={styles.inputRow}>
                        <span className={styles.label}>{de.inputLabels.from}</span>
                        <input
                            onChange={onFromDateInputChangeHandler}
                            value={`${fromDateValue.year}-${fromDateValue.month}`}
                            className={`${globalStyles.monthPicker} ${styles.monthInput}`}
                            type={"month"}
                        />
                    </div>
                    <div className={styles.inputRow}>
                        <span className={styles.label}>{de.inputLabels.to}</span>
                        <input
                            onChange={onToDateInputChangeHandler}
                            value={`${toDateValue.year}-${toDateValue.month}`}
                            className={`${globalStyles.monthPicker} ${styles.monthInput}`}
                            type={"month"}
                        />
                    </div>
                    <div className={styles.inputRow}>
                        <span className={styles.label}>{de.inputLabels.priceMultiplier}</span>
                        <input
                            onChange={(event) => setPriceMultiplier(event.target.value)}
                            value={priceMultiplier}
                            className={`${styles.input} ${isPriceMultiplierValid(priceMultiplier) ? styles.inputValid : styles.inputInvalid}`}
                            min={0.01}
                            max={99.99}
                            step={0.01}
                            type={"number"}
                        />
                    </div>
                </div>
            </div>

            <div className={styles.kpiGrid}>
                <article className={styles.kpiCard}>
                    <span className={styles.kpiLabel}>{de.displayLabels.kwhFueled}</span>
                    <span className={styles.kpiValue}>{kwhFueled.toFixed(2)} kWh</span>
                </article>
                <article className={styles.kpiCard}>
                    <span className={styles.kpiLabel}>{de.displayLabels.currentPriceToPay}</span>
                    <span className={styles.kpiValue}>{priceToPay.toFixed(2)} EUR</span>
                </article>
                <article className={styles.kpiCard}>
                    <span className={styles.kpiLabel}>{de.displayLabels.kilometersDriven}</span>
                    <span className={styles.kpiValue}>{kilometersDriven} km</span>
                </article>
            </div>
        </div>
    );
}

export type StatisticsProps = {}
