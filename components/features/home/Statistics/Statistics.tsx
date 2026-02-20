import React, {ChangeEvent, useEffect, useState} from "react";
import styles from "./Statistics.module.css";
import globalStyles from "@/styles/GlobalStyles.module.css";
import {YearMonth} from "@/constants/types";
import {loadAllConsumptionDocsBetween} from "@/firebase/functions";
import de from "@/constants/de.json";
import {useAppDispatch, useAppSelector} from "@/store/hooks";
import {parseYearMonthInput} from "@/utils/building/fieldValueMapping";
import {
    calculatePriceToPay,
    getCurrentYearMonth,
    isPriceMultiplierValid,
    summarizeConsumptionDocs
} from "@/components/features/home/Statistics/Statistics.logic";
import {setIsLoading} from "@/store/reducer/isLoading";

export default function Statistics({}: StatisticsProps) {
    const dispatch = useAppDispatch();
    const currentCarName: string | undefined = useAppSelector((state) => state.currentCar.name);
    const currentYearMonth = getCurrentYearMonth();

    const [kilometersDriven, setKilometersDriven] = useState(0);
    const [kwhFueled, setKwhFueled] = useState(0);
    const [priceMultiplier, setPriceMultiplier] = useState("0.2");
    const [priceToPay, setPriceToPay] = useState(0);
    const [fromDateValue, setFromDateValue] = useState<YearMonth>({
        year: currentYearMonth.year,
        month: currentYearMonth.month
    });
    const [toDateValue, setToDateValue] = useState<YearMonth>({
        year: currentYearMonth.year,
        month: currentYearMonth.month
    });

    useEffect(() => {
        if (!currentCarName) {
            setKwhFueled(0);
            setKilometersDriven(0);
            dispatch(setIsLoading(false));
            return;
        }

        dispatch(setIsLoading(true));
        loadAllConsumptionDocsBetween(fromDateValue, toDateValue, currentCarName)
            .then((result) => {
                if (result && result.length > 0) {
                    const summary = summarizeConsumptionDocs(result);
                    setKwhFueled(summary.kwhFueled);
                    setKilometersDriven(summary.kilometersDriven);
                } else {
                    setKwhFueled(0);
                    setKilometersDriven(0);
                }
            })
            .catch((ex) => console.error(ex))
            .finally(() => dispatch(setIsLoading(false)));
    }, [currentCarName, dispatch, fromDateValue, toDateValue]);

    useEffect(() => {
        setPriceToPay(calculatePriceToPay(kwhFueled, priceMultiplier));
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

