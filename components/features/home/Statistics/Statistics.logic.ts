import {YearMonth} from "@/common/models";

export type ConsumptionDoc = {
    data: {
        power: number | string;
        kilometer: number;
    };
};

export type StatisticsSummary = {
    kwhFueled: number;
    kilometersDriven: number;
};

export const getCurrentYearMonth = (date: Date = new Date()): YearMonth => {
    const month = date.getMonth() + 1;
    return {
        year: date.getFullYear().toString(),
        month: month < 10 ? `0${month}` : month.toString()
    };
};

export const isPriceMultiplierValid = (value: string): boolean => {
    const number = Number.parseFloat(value.replace(",", "."));
    return !Number.isNaN(number) && number < 100 && number > 0;
};

export const normalizePriceMultiplier = (value: string): number =>
    isPriceMultiplierValid(value) ? Number(value.replace(",", ".")) : 1;

export const calculatePriceToPay = (kwhFueled: number, multiplierValue: string): number =>
    kwhFueled * normalizePriceMultiplier(multiplierValue);

export const summarizeConsumptionDocs = (docs: ConsumptionDoc[]): StatisticsSummary => {
    if (!docs.length) {
        return {kwhFueled: 0, kilometersDriven: 0};
    }

    const kwhFueled = docs.reduce((sum, item) => sum + Number(item.data.power), 0);
    const kilometersDriven = docs[docs.length - 1].data.kilometer - docs[0].data.kilometer;

    return {kwhFueled, kilometersDriven};
};

