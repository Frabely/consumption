import {
    DB_CARS,
    DB_DATA_SET_COLLECTION_KEY
} from "@/constants/constantData";
import {DataSet, DataSetNoId, LoadingStation, YearMonth} from "@/constants/types";
import {addDoc, collection, doc, getDocs, orderBy, query, updateDoc} from "@firebase/firestore";
import {Timestamp} from "firebase/firestore";
import {db} from "@/firebase/db";
import {getLoadingStations} from "@/firebase/services/loadingStationService";

export const getFullDataSet = async (carName: string, passedDate?: YearMonth) => {
    const dateNow = new Date();
    const year = dateNow.getFullYear().toString();
    const month = dateNow.getMonth() + 1;
    const monthString = (month < 10 ? `0${month}` : month).toString();

    const fullDataSet: DataSet[] = [];
    const consumptionDataRef = collection(db,
        `${DB_CARS}/${carName}/${DB_DATA_SET_COLLECTION_KEY}` +
        `/${passedDate ? passedDate.year : year}` +
        `/${passedDate ? passedDate.month : monthString}`
    );

    const loadingStations = await getLoadingStations();
    const queryKilometersDesc = query(consumptionDataRef, orderBy("kilometer", "desc"));
    const querySnapshot = await getDocs(queryKilometersDesc).catch(error => {
        console.error(error.message);
    });

    if (querySnapshot && !querySnapshot.empty) {
        querySnapshot.docs.map((docResult) => {
            const ts: Timestamp = docResult.get("date");
            if (loadingStations) {
                loadingStations.map((ls: LoadingStation) => {
                    if (ls.id === docResult.get("loadingStationId")) {
                        const oneDataSet: DataSet = {
                            id: docResult.id,
                            date: ts.toDate(),
                            kilometer: docResult.get("kilometer"),
                            power: docResult.get("power"),
                            name: docResult.get("name"),
                            loadingStation: ls
                        };
                        fullDataSet.push(oneDataSet);
                    }
                });
            }
        });
        return fullDataSet;
    }
};

export const loadAllConsumptionDocsBetween = async (
    from: YearMonth,
    to: YearMonth,
    carName: string
) => {
    const yearMonths = monthsBetween(from, to);

    const perMonth = await Promise.all(
        yearMonths.map(async (yearMonth) => {
            const colRef = collection(db,
                `${DB_CARS}/${carName}/${DB_DATA_SET_COLLECTION_KEY}` +
                `/${yearMonth.year}` +
                `/${(Number(yearMonth.month) < 10 ? `0${yearMonth.month}` : yearMonth.month)}`
            );
            const snap = await getDocs(colRef);
            return snap.docs.map((d) => ({
                year: yearMonth.year,
                month: yearMonth.month,
                id: d.id,
                data: d.data() as DataSet
            }));
        })
    );

    return perMonth.flat().sort((a, b) => a.data.kilometer - b.data.kilometer);
};

export const addDataSetToCollection = async (carName: string, dataSet: DataSetNoId) => {
    const {date, kilometer, power, name, loadingStation} = dataSet;
    const month = date.getMonth() + 1;
    const monthString = (month < 10 ? `0${month}` : month).toString();
    const consumptionDataRef = collection(db,
        `${DB_CARS}/${carName}/${DB_DATA_SET_COLLECTION_KEY}/${date.getFullYear().toString()}/${monthString}`
    );
    const decimalPower = (Math.round(power * 100) / 100).toFixed(1);
    await addDoc(consumptionDataRef, {
        date,
        kilometer,
        power: decimalPower,
        name,
        loadingStationId: loadingStation.id
    }).catch((error: Error) => {
        console.error(error.message);
        throw error;
    });
};

export const changeDataSetInCollection = async (
    carName: string,
    date: Date,
    power: number,
    kilometer: number,
    loadingStation: LoadingStation,
    id: string
) => {
    const month = date.getMonth() + 1;
    const monthString = (month < 10 ? `0${month}` : month).toString();
    const consumptionDataRef = doc(db,
        `${DB_CARS}/${carName}/${DB_DATA_SET_COLLECTION_KEY}/${date.getFullYear().toString()}/${monthString}/${id}`
    );
    const decimalPower = (Math.round(power * 100) / 100).toFixed(1);
    await updateDoc(consumptionDataRef, {
        kilometer,
        power: decimalPower,
        loadingStationId: loadingStation.id
    }).catch((error: Error) => {
        console.error(error.message);
        throw error;
    });
};

export const updateCarKilometer = async (carName: string, kilometer: number, prevKilometer?: number) => {
    const carsRef = doc(db, `${DB_CARS}/${carName}`);
    await updateDoc(carsRef, prevKilometer ? {
        kilometer,
        prevKilometer
    } : {
        kilometer
    }).catch((error: Error) => {
        console.error(error.message);
        throw error;
    });
};

const monthsBetween = (from: YearMonth, to: YearMonth): YearMonth[] => {
    let year = Number(from.year);
    let month = Number(from.month);

    const endYear = Number(to.year);
    const endMonth = Number(to.month);

    const allMonthsBetween: YearMonth[] = [];
    while (year < endYear || (year === endYear && month <= endMonth)) {
        allMonthsBetween.push({year: String(year), month: String(month)});
        month += 1;
        if (month === 13) {
            month = 1;
            year += 1;
        }
    }
    return allMonthsBetween;
};
