import {DB_DATA_SET_COLLECTION_KEY, DB_USER_COLLECTION_KEY} from "@/constants/constantData";
import firebaseApp from "@/firebase/firebase";
import {
    addDoc,
    collection,
    getDocs,
    getFirestore,
    deleteDoc,
    doc,
    query,
    orderBy,
    updateDoc, getDoc, where
} from "@firebase/firestore";
import {DataSet, DataSetNoId, User} from "@/constants/types";

const db = getFirestore(firebaseApp)

export const getFullDataSet = async () => {
    const fullDataSet: DataSet[] = []
    const consumptionDataRef = collection(db, DB_DATA_SET_COLLECTION_KEY);

    const queryKilometersDesc = query(consumptionDataRef, orderBy("kilometer", "desc"));
    const querySnapshot = await getDocs(queryKilometersDesc).catch(error => {
        console.log(error.message)
    })
    if (querySnapshot && !querySnapshot.empty) {
        querySnapshot.docs.map((docResult) => {
            const oneDataSet: DataSet = {
                id: docResult.id,
                date: docResult.get('date'),
                time: docResult.get('time'),
                kilometer: docResult.get('kilometer'),
                power: docResult.get('power'),
                name: docResult.get('name')
            }
            fullDataSet.push(oneDataSet)
        })
        return fullDataSet
    }
}

export const addDataSetToCollection = (dataSet: DataSetNoId) => {
    const {date, time, kilometer, power, name} = dataSet
    const consumptionDataRef = collection(db, DB_DATA_SET_COLLECTION_KEY);
    addDoc(consumptionDataRef, {date, time, kilometer, power, name}).then().catch((error: Error) => {
        console.log(error.message)
    })
}

export const changeDataSetInCollection = (dataSet: DataSet) => {
    const consumptionDataRef = doc(db, `${DB_DATA_SET_COLLECTION_KEY}/${dataSet.id}`);
    updateDoc(consumptionDataRef, {
        date: dataSet.date,
        kilometer: dataSet.kilometer,
        name: dataSet.name,
        power: dataSet.power,
        time: dataSet.time
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

// export const removingDataSetFromCollection = (dataSet: DataSet) => {
//     if (dataSet.id) {
//         deleteDoc(doc(db,`${DB_DATA_SET_KEY}/${dataSet.id}`)).then().catch((error: Error) => {
//             console.log(error.message)
//         })
//     }
// }