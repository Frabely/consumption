import {DB_DATA_SET_KEY} from "@/constants/constantData";
import firebaseApp from "@/firebase/firebase";
import {addDoc, collection, getDocs, getFirestore, Timestamp} from "@firebase/firestore";
import {DataSet} from "@/constants/types";

const db = getFirestore(firebaseApp)

export const getFullDataSet = async () => {
    const fullDataSet: DataSet[] = []
    const consumptionDataRef = collection(db, DB_DATA_SET_KEY);
    const querySnapshot = await getDocs(consumptionDataRef).catch(error => {
        console.log(error.message)
    })
    if (querySnapshot && !querySnapshot.empty) {
        querySnapshot.docs.map((docResult) => {
            const oneDataSet: DataSet = {
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
    const consumptionDataRef = collection(db, DB_DATA_SET_KEY);
    addDoc(consumptionDataRef, dataSet).then().catch((error: Error) => {
        console.log(error.message)
    })
}
