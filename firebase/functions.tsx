import {DB_DATA_SET_KEY} from "@/constants/constantData";
import firebaseApp from "@/firebase/firebase";
import {addDoc, collection, getDocs, getFirestore, deleteDoc, doc, query, orderBy} from "@firebase/firestore";
import {DataSet} from "@/constants/types";

const db = getFirestore(firebaseApp)

export const getFullDataSet = async () => {
    const fullDataSet: DataSet[] = []
    const consumptionDataRef = collection(db, DB_DATA_SET_KEY);

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

export const addDataSetToCollection = (dataSet: DataSet) => {
    const {date, time, kilometer, power, name} = dataSet
    const consumptionDataRef = collection(db, DB_DATA_SET_KEY);
    addDoc(consumptionDataRef, {date, time, kilometer, power, name}).then().catch((error: Error) => {
        console.log(error.message)
    })
}

export const removingDataSetFromCollection = (dataSet: DataSet) => {
    if (dataSet.id) {
        deleteDoc(doc(db,`${DB_DATA_SET_KEY}/${dataSet.id}`)).then().catch((error: Error) => {
            console.log(error.message)
        })
    }
}
