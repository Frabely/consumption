import {DB_DATA_SET_COLLECTION_KEY, DB_LOADING_STATIONS, DB_USER_COLLECTION_KEY} from "@/constants/constantData";
import firebaseApp from "@/firebase/firebase";
import {
    addDoc,
    collection,
    getDocs,
    getFirestore,
    doc,
    query,
    orderBy,
    updateDoc, where
} from "@firebase/firestore";
import {DataSet, DataSetNoId, LoadingStation, User, YearMonth} from "@/constants/types";

const db = getFirestore(firebaseApp)

export const getFullDataSet = async (passedDate?: YearMonth) => {
    const dateNow = new Date()
    const year = dateNow.getFullYear().toString();
    const month = dateNow.getMonth() + 1;
    const monthString = (month < 10 ? `0` + month : month).toString()

    const fullDataSet: DataSet[] = []
    const consumptionDataRef = collection(db,
        `${DB_DATA_SET_COLLECTION_KEY}` +
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
            if (loadingStations) {
                loadingStations.map((ls) => {
                    if (ls.id === docResult.get('loadingStationId')) {
                        const oneDataSet: DataSet = {
                            id: docResult.id,
                            date: docResult.get('date'),
                            time: docResult.get('time'),
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

export const addDataSetToCollection = (dataSet: DataSetNoId) => {
    const {date, time, kilometer, power, name, loadingStation} = dataSet
    const year: string = date.split('-')[0]
    const month: string = date.split('-')[1]
    const consumptionDataRef = collection(db, `${DB_DATA_SET_COLLECTION_KEY}/${year}/${month}`);
    const decimalPower = (Math.round(power * 100) / 100).toFixed(1)
    addDoc(consumptionDataRef, {
        date,
        time,
        kilometer,
        power: decimalPower,
        name,
        loadingStationId: loadingStation.id
    }).then().catch((error: Error) => {
        console.log(error.message)
    })
}

export const changeDataSetInCollection = (dataSet: DataSet) => {
    const year: string = dataSet.date.split('-')[0]
    const month: string = dataSet.date.split('-')[1]
    const consumptionDataRef = doc(db, `${DB_DATA_SET_COLLECTION_KEY}/${year}/${month}/${dataSet.id}`);
    const decimalPower = (Math.round(dataSet.power * 100) / 100).toFixed(1)
    updateDoc(consumptionDataRef, {
        // date: dataSet.date,
        kilometer: dataSet.kilometer,
        // name: dataSet.name,
        power: decimalPower,
        loadingStationId: dataSet.loadingStation.id
        // time: dataSet.time
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
            const oneDataSet: LoadingStation = {
                id: loadingStation.id,
                name: loadingStation.get('name')
            }
            loadingStations.push(oneDataSet)
        })
        return loadingStations
    }
}

// export const removingDataSetFromCollection = (dataSet: DataSet) => {
//     if (dataSet.id) {
//         deleteDoc(doc(db,`${DB_DATA_SET_KEY}/${dataSet.id}`)).then().catch((error: Error) => {
//             console.log(error.message)
//         })
//     }
// }
