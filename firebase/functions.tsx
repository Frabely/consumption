import {
    DB_CARS,
    DB_DATA_SET_COLLECTION_KEY, DB_HOUSES,
    DB_LOADING_STATIONS,
    DB_USER_COLLECTION_KEY
} from "@/constants/constantData";
import firebaseApp from "@/firebase/firebase";
import {
    addDoc,
    collection,
    getDocs,
    getFirestore,
    doc,
    query,
    orderBy,
    updateDoc, where, Timestamp
} from "@firebase/firestore";
import {Car, DataSet, DataSetNoId, House, LoadingStation, User, YearMonth} from "@/constants/types";

const db = getFirestore(firebaseApp)

export const getFullDataSet = async (carName: string, passedDate?: YearMonth) => {
    const dateNow = new Date()
    const year = dateNow.getFullYear().toString();
    const month = dateNow.getMonth() + 1;
    const monthString = (month < 10 ? `0` + month : month).toString()

    const fullDataSet: DataSet[] = []
    const consumptionDataRef = collection(db,
        `${DB_CARS}/${carName}/${DB_DATA_SET_COLLECTION_KEY}` +
        `/${passedDate ? passedDate.year : year}` +
        `/${passedDate ? passedDate.month : monthString}`
    );

    const loadingStations = await getLoadingStations()

    const queryKilometersDesc = query(consumptionDataRef, orderBy("kilometer", "desc"));
    const querySnapshot = await getDocs(queryKilometersDesc).catch(error => {
        console.log(error.message)
    })
    if (querySnapshot && !querySnapshot.empty) {
        querySnapshot.docs.map((docResult) => {
            const ts: Timestamp = docResult.get('date')
            if (loadingStations) {
                loadingStations.map((ls) => {
                    if (ls.id === docResult.get('loadingStationId')) {
                        const oneDataSet: DataSet = {
                            id: docResult.id,
                            date: ts.toDate(),
                            kilometer: docResult.get('kilometer'),
                            power: docResult.get('power'),
                            name: docResult.get('name'),
                            loadingStation: ls,
                        }
                        fullDataSet.push(oneDataSet)
                    }
                })
            }
        })
        return fullDataSet
    }
}

export const addDataSetToCollection = (carName: string, dataSet: DataSetNoId) => {
    const {date, kilometer, power, name, loadingStation} = dataSet
    const month = date.getMonth() + 1;
    const monthString = (month < 10 ? `0` + month : month).toString()
    const consumptionDataRef = collection(db,
        `${DB_CARS}/${carName}/${DB_DATA_SET_COLLECTION_KEY}/${date.getFullYear().toString()}/${monthString}`
    );
    const decimalPower = (Math.round(power * 100) / 100).toFixed(1)
    addDoc(consumptionDataRef, {
        date,
        kilometer,
        power: decimalPower,
        name,
        loadingStationId: loadingStation.id
    }).then().catch((error: Error) => {
        console.log(error.message)
    })
}

export const changeDataSetInCollection = (carName: string, date: Date, power: number, kilometer: number, loadingStation: LoadingStation, id: string) => {
    const month = date.getMonth() + 1;
    const monthString = (month < 10 ? `0` + month : month).toString()
    const consumptionDataRef = doc(db,
        `${DB_CARS}/${carName}/${DB_DATA_SET_COLLECTION_KEY}/${date.getFullYear().toString()}/${monthString}/${id}`
    );
    const decimalPower = (Math.round(power * 100) / 100).toFixed(1)
    updateDoc(consumptionDataRef, {
        kilometer: kilometer,
        power: decimalPower,
        loadingStationId: loadingStation.id
    }).then().catch((error: Error) => {
        console.log(error.message)
    })
}

export const checkUserId = async (id: string): Promise<User | undefined> => {
    const consumptionDataRef = collection(db, `${DB_USER_COLLECTION_KEY}`);
    const queryUserKey = query(consumptionDataRef, where('key', '==', id));
    return getDocs(queryUserKey).then((result) => {
        if (result && !result.empty && result.docs[0]) {
            const user: User = {
                key: result.docs[0].get('key'),
                name: result.docs[0].get('name')
            }
            return user
        }
        return undefined
    }).catch((error: Error) => {
        console.log(error.message)
        return undefined
    })
}

export const getLoadingStations = async () => {
    const loadingStations: LoadingStation[] = []
    const consumptionDataRef = collection(db, `${DB_LOADING_STATIONS}`);
    const qsDocs = await getDocs(consumptionDataRef).catch(error => {
        console.log(error.message)
    })
    if (qsDocs && !qsDocs.empty) {
        qsDocs.docs.map((loadingStation) => {
            const newLoadingStation: LoadingStation = {
                id: loadingStation.id,
                name: loadingStation.get('name')
            }
            loadingStations.push(newLoadingStation)
        })
        return loadingStations
    }
}

export const getCars = async () => {
    const cars: Car[] = []
    const carsRef = collection(db, `${DB_CARS}`);
    const qsDocs = await getDocs(carsRef).catch(error => {
        console.log(error.message)
    })
    if (qsDocs && !qsDocs.empty) {
        qsDocs.docs.map((car) => {
            const newCar: Car = {
                name: car.id,
                kilometer: car.get('kilometer'),
                prevKilometer: car.get('prevKilometer')
            }
            cars.push(newCar)
        })
        return cars
    }
}

export const getHouses = async () => {
    const houses: House[] = []
    const housesRef = collection(db, `${DB_HOUSES}`);
    const qsDocs = await getDocs(housesRef).catch(error => {
        console.log(error.message)
    })

    if (qsDocs && !qsDocs.empty) {
        qsDocs.docs.map((house) => {
            const newHouse: House = {
                name: house.id,
                flats: house.get('flats')
            }
            houses.push(newHouse)
        })
        return houses
    }
}

export const updateCarKilometer = async (carName: string, kilometer: number, prevKilometer?: number) => {
    const carsRef = doc(db, `${DB_CARS}/${carName}`);
    updateDoc(carsRef, prevKilometer ? {
        kilometer: kilometer,
        prevKilometer: prevKilometer
    } : {
        kilometer: kilometer
    }).then().catch((error: Error) => {
        console.log(error.message)
    })
}
