import {
    DB_BUILDING_CONSUMPTION,
    DB_CARS, DB_DATA_FLATS_KEY, DB_DATA_ROOMS_KEY,
    DB_DATA_SET_COLLECTION_KEY, DB_FLATS, DB_HOUSES,
    DB_LOADING_STATIONS, DB_ROOMS,
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
    updateDoc,
    where,
    Timestamp,
    setDoc,
    getDoc,
    deleteDoc,
    deleteField,
    FieldValue,
} from "@firebase/firestore";
import {
    Car,
    DataSet,
    DataSetNoId,
    Flat,
    House,
    LoadingStation,
    NumberDictionary,
    Room,
    User,
    YearMonth
} from "@/constants/types";

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
        qsDocs.docs.forEach((car) => {
            const newCar: Car = {
                name: car.id,
                kilometer: car.get('kilometer'),
                prevKilometer: car.get('prevKilometer')
            }
            cars.push(newCar)
        })
    }
    return cars
}

export const getRooms = async (houseId: string, flatId: string) => {
    const rooms: Room[] = []
    const roomsRef = collection(
        db,
        `${DB_HOUSES}/${houseId}/${DB_DATA_FLATS_KEY}/${flatId}/${DB_DATA_ROOMS_KEY}`
    );
    const qsRoomsDocs = await getDocs(roomsRef).catch(error => {
        console.log(error.message)
    })
    if (qsRoomsDocs && !qsRoomsDocs.empty) {
        for (const room of qsRoomsDocs.docs) {
            const newRoom: Room = {
                name: room.id,
                fields: room.data()
            }
            rooms.push(newRoom)
        }
    }
    return rooms
}

export const getFlats = async (houseId: string) => {
    const flats: Flat[] = []
    const flatsRef = collection(db, `${DB_HOUSES}/${houseId}/${DB_DATA_FLATS_KEY}`);
    const qsFlatDocs = await getDocs(flatsRef).catch(error => {
        console.log(error.message)
    })
    if (qsFlatDocs && !qsFlatDocs.empty) {
        for (const flat of qsFlatDocs.docs) {
            const newFlat: Flat = {
                name: flat.id,
                rooms: await getRooms(houseId, flat.id)
            }
            flats.push(newFlat)
        }
    }
    return flats
}

export const getHouses = async () => {
    const houses: House[] = []
    const housesRef = collection(db, `${DB_HOUSES}`);
    const qsDocs = await getDocs(housesRef).catch(error => {
        console.log(error.message)
    })

    if (qsDocs && !qsDocs.empty) {
        for (const house of qsDocs.docs) {
            const flats = await getFlats(house.id)
            const newHouse: House = {
                name: house.id,
                flats: flats
            }
            houses.push(newHouse)
        }
    }
    return houses
}

export const createOrUpdateFlat = async (flat: Flat, houseName: string) => {
    try {
        const flatDocRef = doc(db, `houses/${houseName}/flats/${flat.name}`);
        await setDoc(flatDocRef, {name: flat.name}, {merge: true});
        const roomsCollectionRef = collection(flatDocRef, "rooms");
        for (const room of flat.rooms) {
            const roomDocRef = doc(roomsCollectionRef, room.name);
            await setDoc(roomDocRef, room.fields, {merge: true});
        }
    } catch (error) {
        console.error(error);
    }
}

export const updateFlatStructure = async (houseName: string, flat: Flat) => {
    try {
        const roomNames = flat.rooms.map((room) => room.name)
        const roomsString = `${DB_HOUSES}/${houseName}/${DB_FLATS}/${flat.name}/${DB_ROOMS}`
        const roomsRef = collection(db, roomsString);
        const roomsSnapshot = await getDocs(roomsRef)
        const roomsToDelete = roomsSnapshot.docs
            .filter((room) => !roomNames.includes(room.id))
        const rooms = roomsSnapshot.docs
            .filter((room) => roomNames.includes(room.id))
        for (let i = 0; i < roomsToDelete.length; i++) {
            await deleteDoc(doc(db, `${roomsString}/${roomsToDelete[i].id}`)).catch((error) => console.log(error.message))
        }

        await Promise.all(
            flat.rooms.map(async (room) => {
                const flatRoomFields = Object.keys(room.fields)
                for (let i = 0; i < rooms.length; i++) {
                    const fieldNames = Object.keys(rooms[i].data())
                    const fieldsToDelete = fieldNames.filter(item => !flatRoomFields.includes(item));
                    if (fieldsToDelete.length > 0) {
                        const deleteObject = fieldsToDelete.reduce((record: Record<string, FieldValue>, field) => {
                            record[field] = deleteField();
                            return record;
                        }, {});

                        const roomDocRef = doc(db, `${roomsString}/${rooms[i].id}`);
                        await updateDoc(roomDocRef, deleteObject)
                    }
                }
            }))
    } catch (error) {
        console.error(error);
    }
}

export const setFieldValue = async (
    houseName: string,
    flatName: string,
    roomName: string,
    fieldName: string,
    year: string,
    month: string,
    fieldValueToSet: number | null) => {
    try {
        const dateCollectionRef = doc(db, `${DB_BUILDING_CONSUMPTION}/${year}-${month}`);
        const key: string = `${houseName}#${flatName}#${roomName}#${fieldName}`
        await setDoc(dateCollectionRef, {[`${key}`]: fieldValueToSet}, {merge: true});
    } catch (error) {
        console.error(error);
    }
}

export const getFieldValues = async (
    year: string,
    month: string,
    houseName?: string,
    flatName?: string,
    roomName?: string,
    fieldName?: string) => {
    try {
        const dateCollectionRef = doc(db, `${DB_BUILDING_CONSUMPTION}/${year}-${month}`);
        const allFields = await getDoc(dateCollectionRef);
        const fields = allFields.data()
        if (!fields)
            return

        const parts: string[] = []
        if (houseName) parts.push(houseName)
        if (flatName) parts.push(flatName)
        if (roomName) parts.push(roomName)
        if (fieldName) parts.push(fieldName)

        const result: NumberDictionary = {}

        for (const [key, value] of Object.entries(fields)) {
            const keyParts = key.split("#");
            let isMatch = true;
            for (let i = 0; i < parts.length; i++) {
                if (keyParts[i] !== parts[i]) {
                    isMatch = false;
                    break;
                }
            }
            if (isMatch) {
                result[key] = !isNaN(parseInt(value)) ? parseInt(value) : null;
            }

        }

        return result
    } catch (error) {
        console.error(error);
        return
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
