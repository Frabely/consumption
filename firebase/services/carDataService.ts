import {
    DB_CARS,
    DB_DATA_SET_COLLECTION_KEY
} from "@/constants/constantData";
import {DataSet, DataSetNoId, LoadingStation, YearMonth} from "@/common/models";
import {addDoc, collection, doc, getDocs, orderBy, query, updateDoc} from "@firebase/firestore";
import {db} from "@/firebase/db";
import {getLoadingStations} from "@/firebase/services/loadingStationService";

type FirestoreTimestampLike = {
    toDate: () => Date;
};

type ChangeDataSetInput = Pick<
    DataSet,
    "id" | "date" | "power" | "kilometer" | "loadingStation" | "started" | "ended"
>;

type ConsumptionDocumentData = Record<string, unknown> & {
    power: number | string;
    kilometer: number;
    date?: Date;
    started?: Date;
    ended?: Date;
};

type ConsumptionDocumentBetweenMonths = {
    year: string;
    month: string;
    id: string;
    data: ConsumptionDocumentData;
};

const POWER_DECIMAL_PLACES = 4;

/**
 * Formats a persisted power value with a stable decimal precision.
 * @param power Power value in kWh.
 * @returns Stringified power value with configured decimal places.
 */
const formatPersistedPower = (power: number): string =>
    power.toFixed(POWER_DECIMAL_PLACES);

/**
 * Resolves an optional Firestore timestamp-like value to a Date instance.
 * @param value Firestore field value or undefined.
 * @returns Converted Date value when available.
 */
const resolveOptionalDate = (value: unknown): Date | undefined => {
    if (value instanceof Date) {
        return value;
    }

    if (
        value &&
        typeof value === "object" &&
        "toDate" in value &&
        typeof (value as FirestoreTimestampLike).toDate === "function"
    ) {
        return (value as FirestoreTimestampLike).toDate();
    }

    return undefined;
};

/**
 * Maps a Firestore document to a typed dataset with optional session timestamps.
 * @param dataSource Firestore document exposing `get`.
 * @param id Document identifier.
 * @param loadingStation Resolved loading station object.
 * @returns Typed dataset for UI consumption.
 */
const mapFirestoreDocumentToDataSet = (
    dataSource: {get: (field: string) => unknown},
    id: string,
    loadingStation: LoadingStation
): DataSet => ({
    id,
    date: resolveOptionalDate(dataSource.get("date")) ?? new Date(0),
    kilometer: dataSource.get("kilometer") as number,
    power: dataSource.get("power") as number,
    name: dataSource.get("name") as string,
    started: resolveOptionalDate(dataSource.get("started")),
    ended: resolveOptionalDate(dataSource.get("ended")),
    loadingStation
});

/**
 * Loads all dataset entries for a car within the requested month.
 * @param carName Car name used as Firestore document id.
 * @param passedDate Optional year-month filter for historic data.
 * @returns Dataset entries with resolved loading stations or undefined when no documents exist.
 */
export const getFullDataSet = async (carName: string, passedDate?: YearMonth): Promise<DataSet[] | undefined> => {
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
            if (loadingStations) {
                const loadingStation = loadingStations.find((ls: LoadingStation) => ls.id === docResult.get("loadingStationId"));
                if (loadingStation) {
                    fullDataSet.push(mapFirestoreDocumentToDataSet(docResult, docResult.id, loadingStation));
                }
            }
        });
        return fullDataSet;
    }
};

/**
 * Loads all consumption documents between two inclusive year-month values.
 * @param from Start year-month.
 * @param to End year-month.
 * @param carName Car name used as Firestore document id.
 * @returns Firestore documents sorted by kilometer with optional session timestamps resolved to Date.
 */
export const loadAllConsumptionDocsBetween = async (
    from: YearMonth,
    to: YearMonth,
    carName: string
): Promise<ConsumptionDocumentBetweenMonths[]> => {
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
                data: {
                    ...(d.data() as ConsumptionDocumentData),
                    date: resolveOptionalDate(d.get("date")),
                    started: resolveOptionalDate(d.get("started")),
                    ended: resolveOptionalDate(d.get("ended"))
                } satisfies ConsumptionDocumentData
            }));
        })
    );

    return perMonth.flat().sort((a, b) => Number(a.data.kilometer) - Number(b.data.kilometer));
};

/**
 * Adds a dataset entry to the monthly Firestore collection for the selected car.
 * @param carName Car name used as Firestore document id.
 * @param dataSet Dataset payload to persist.
 * @returns Promise that resolves when the document has been created.
 */
export const addDataSetToCollection = async (carName: string, dataSet: DataSetNoId): Promise<void> => {
    const {date, kilometer, power, name, loadingStation, started, ended} = dataSet;
    const month = date.getMonth() + 1;
    const monthString = (month < 10 ? `0${month}` : month).toString();
    const consumptionDataRef = collection(db,
        `${DB_CARS}/${carName}/${DB_DATA_SET_COLLECTION_KEY}/${date.getFullYear().toString()}/${monthString}`
    );
    await addDoc(consumptionDataRef, {
        date,
        kilometer,
        power: formatPersistedPower(power),
        name,
        loadingStationId: loadingStation.id,
        ...(started ? {started} : {}),
        ...(ended ? {ended} : {})
    }).catch((error: Error) => {
        console.error(error.message);
        throw error;
    });
};

/**
 * Updates an existing dataset entry inside the monthly Firestore collection.
 * @param carName Car name used as Firestore document id.
 * @param dataSet Dataset update payload.
 * @returns Promise that resolves when the document has been updated.
 */
export const changeDataSetInCollection = async (
    carName: string,
    dataSet: ChangeDataSetInput
): Promise<void> => {
    const {date, power, kilometer, loadingStation, id, started, ended} = dataSet;
    const month = date.getMonth() + 1;
    const monthString = (month < 10 ? `0${month}` : month).toString();
    const consumptionDataRef = doc(db,
        `${DB_CARS}/${carName}/${DB_DATA_SET_COLLECTION_KEY}/${date.getFullYear().toString()}/${monthString}/${id}`
    );
    await updateDoc(consumptionDataRef, {
        kilometer,
        power: formatPersistedPower(power),
        loadingStationId: loadingStation.id,
        ...(started ? {started} : {}),
        ...(ended ? {ended} : {})
    }).catch((error: Error) => {
        console.error(error.message);
        throw error;
    });
};

/**
 * Updates the persisted kilometer value for a car.
 * @param carName Car name used as Firestore document id.
 * @param kilometer Current kilometer value.
 * @param prevKilometer Optional previous kilometer value.
 * @returns Promise that resolves when the document has been updated.
 */
export const updateCarKilometer = async (carName: string, kilometer: number, prevKilometer?: number): Promise<void> => {
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

