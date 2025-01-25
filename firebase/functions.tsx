import {
    DB_BUILDING_CONSUMPTION,
    DB_CARS, DB_DATA_FIELDS_KEY, DB_DATA_FLATS_KEY, DB_DATA_ROOMS_KEY,
    DB_DATA_SET_COLLECTION_KEY, DB_FIELD_VALUES, DB_FLATS, DB_HOUSES,
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
    getDoc,
    deleteDoc,
    CollectionReference, QueryDocumentSnapshot, DocumentReference,
} from "@firebase/firestore";
import {
    Car,
    DataSet,
    DataSetNoId, DownloadBuildingCsvDto, Field,
    Flat,
    House,
    LoadingStation,
    Room,
    User,
    YearMonth,
    FieldValue
} from "@/constants/types";
import {Role} from "@/constants/enums";
import { QueryFieldFilterConstraint, and } from "firebase/firestore";

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
            let role
            if ((result.docs[0].get('role') as number) in Role)
                role = (result.docs[0].get('role') as number) as Role
            const user: User = {
                key: result.docs[0].get('key'),
                name: result.docs[0].get('name'),
                role: role,
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

export const getFields = async (houseId: string, flatId: string, roomId: string) => {
    const fields: Field[] = []
    const FieldsCollectionRef = collection(
        db,
        `${DB_HOUSES}/${houseId}/${DB_DATA_FLATS_KEY}/${flatId}/${DB_DATA_ROOMS_KEY}/${roomId}/${DB_DATA_FIELDS_KEY}`
    );
    const qsFieldsDocs = await getDocs(FieldsCollectionRef).catch(error => {
        console.log(error.message)
    })
    if (qsFieldsDocs && !qsFieldsDocs.empty) {
        for (const field of qsFieldsDocs.docs) {
            const newField: Field = {
                id: field.id,
                name: field.get('name'),
                position: field.get('position'),
            }
            fields.push(newField)
        }
    }
    return fields
        .sort((a, b) => {
            if (a.position === undefined && b.position === undefined) return 0;
            if (a.position === undefined) return 1;
            if (b.position === undefined) return -1;
            return a.position - b.position;
        })
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
                id: room.id,
                name: room.get('name'),
                fields: await getFields(houseId, flatId, room.id),
                position: room.get('position'),
            }
            rooms.push(newRoom)
        }
    }
    return rooms
        .sort((a, b) => {
            if (a.position === undefined && b.position === undefined) return 0;
            if (a.position === undefined) return 1;
            if (b.position === undefined) return -1;
            return a.position - b.position;
        })
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
                id: flat.id,
                name: flat.get('name'),
                rooms: await getRooms(houseId, flat.id),
                position: flat.get('position'),
            }
            flats.push(newFlat)
        }
    }
    return flats
        .sort((a, b) => {
            if (a.position === undefined && b.position === undefined) return 0;
            if (a.position === undefined) return 1;
            if (b.position === undefined) return -1;
            return a.position - b.position;
        })
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
                id: house.id,
                name: house.id,
                flats: flats,
                position: house.get('position'),
            }
            houses.push(newHouse)
        }
    }
    return houses
        .sort((a, b) => {
            if (a.position === undefined && b.position === undefined) return 0;
            if (a.position === undefined) return 1;
            if (b.position === undefined) return -1;
            return a.position - b.position;
        })
}

export const createFlat = async (flat: Flat, houseName: string) => {
    try {
        const flatColRef = collection(db, `houses/${houseName}/flats`);
        const createdFlatDoc = await addDoc(flatColRef, {name: flat.name, position: flat?.position});
        const roomsCollectionRef = collection(flatColRef, `/${createdFlatDoc.id}/rooms`)
        for (const room of flat.rooms) {
            const createdRoomDoc = await addDoc(roomsCollectionRef, {name: room.name, position: room?.position});
            const fieldsCollectionRef = collection(roomsCollectionRef, `/${createdRoomDoc.id}/fields`)
            for (const field of room.fields) {
                await addDoc(fieldsCollectionRef, {name: field.name, position: field?.position});
            }
        }
    } catch (error) {
        console.error(error);
    }
}

export const updateFlat = async (houseName: string, flat: Flat) => {
    try {
        const deleteUpdatePromises: Promise<void>[] = [];
        const dbFlat = await getDoc(doc(db, `${DB_HOUSES}/${houseName}/${DB_FLATS}/${flat.id}`));
        deleteUpdatePromises.push(updateDoc(dbFlat.ref, {name: flat.name, position: flat.position}))
        deleteUpdatePromises.push(updateRooms(collection(db, `${DB_HOUSES}/${houseName}/${DB_FLATS}/${flat.id}/${DB_ROOMS}`), flat.rooms))
        await Promise.all(deleteUpdatePromises);
    } catch (error) {
        console.error(error);
    }
}

export const updateRooms = async (roomsCollectionRef: CollectionReference, rooms: Room[]) => {
    try {
        const deleteUpdatePromises: Promise<void>[] = [];
        const addPromises: Promise<DocumentReference>[] = [];
        const roomsToAdd = rooms.filter((room) => room.id === "")
        const roomsToNotAddIds = rooms.filter((room) => room.id !== "").map((room) => room.id)
        const dbRooms = await getDocs(roomsCollectionRef)
        const roomsToDelete: QueryDocumentSnapshot[] = []
        const roomsToUpdate: QueryDocumentSnapshot[] = []
        dbRooms.docs.map((room) => {
            if (!roomsToNotAddIds.includes(room.id)) {
                roomsToDelete.push(room)
            } else roomsToUpdate.push(room)
        })

        for (const room of roomsToDelete) {
            deleteUpdatePromises.push(deleteDoc(room.ref))
        }
        for (const room of roomsToAdd) {
            const roomDocument = await addDoc(roomsCollectionRef, {name: room.name, position: room.position})
            room.fields.forEach((field) => {
                addPromises.push(addDoc(collection(db, roomDocument.path + `/${DB_DATA_FIELDS_KEY}`), {
                    name: field.name,
                    position: field?.position
                }))
            })
        }
        for (const dbRoom of roomsToUpdate) {
            const roomToUpdate = rooms.filter((room) => room.id === dbRoom.id)[0]
            deleteUpdatePromises.push(updateDoc(dbRoom.ref, {name: roomToUpdate.name, position: roomToUpdate.position}))
            deleteUpdatePromises.push(updateFields(collection(db, roomsCollectionRef.path + `/${roomToUpdate.id}/${DB_DATA_FIELDS_KEY}`), roomToUpdate.fields))
        }

        await Promise.all(deleteUpdatePromises);
        await Promise.all(addPromises);
    } catch (error) {
        console.error(error);
    }
}

export const updateFields = async (fieldCollectionRef: CollectionReference, fields: Field[]) => {
    try {
        const deleteUpdatePromises: Promise<void>[] = [];
        const addPromises: Promise<DocumentReference>[] = [];
        const fieldsToAdd = fields.filter((field) => field.id === "")
        const fieldsToNotAddIds = fields.filter((field) => field.id !== "").map((field) => field.id)
        const dbFields = await getDocs(fieldCollectionRef)
        const fieldsToDelete: QueryDocumentSnapshot[] = []
        const fieldsToUpdate: QueryDocumentSnapshot[] = []
        dbFields.docs.map((field) => {
            if (!fieldsToNotAddIds.includes(field.id)) {
                fieldsToDelete.push(field)
            } else fieldsToUpdate.push(field)
        })

        for (const field of fieldsToDelete) {
            deleteUpdatePromises.push(deleteDoc(field.ref))
        }
        for (const field of fieldsToAdd) {
            addPromises.push(addDoc(fieldCollectionRef, {name: field.name, position: field.position}))
        }
        for (const dbField of fieldsToUpdate) {
            const fieldToUpdate = fields.filter((field) => field.id === dbField.id)[0]
            deleteUpdatePromises.push(updateDoc(dbField.ref, {
                name: fieldToUpdate.name,
                position: fieldToUpdate.position
            }))
        }

        await Promise.all(deleteUpdatePromises);
        await Promise.all(addPromises);
    } catch (error) {
        console.error(error);
    }
}

export const setFieldValue = async (
    houseName: string,
    flat: Flat,
    room: Room,
    field: Field,
    year: string,
    month: string,
    fieldValueToSet?: number) => {
    try {
        const now = new Date();
        const utcDate = new Date(Date.UTC(
            parseInt(year),
            parseInt(month) - 1,
            now.getUTCDate(),
            0,
            0,
            0,
            0
        ));
        const pathValues = `${DB_BUILDING_CONSUMPTION}/${year}-${month}/${DB_FIELD_VALUES}`;
        const fieldRef = await getDoc(doc(
            db,
            `${DB_HOUSES}/${houseName}/${DB_FLATS}/${flat.id}/${DB_ROOMS}/${room.id}/${DB_DATA_FIELDS_KEY}/${field.id}`,
        ))
        const documentSnapshot = await getDoc(doc(db, pathValues, `/${field.id}`))
        if (!documentSnapshot.exists()) {
            await addDoc(
                collection(db, pathValues),
                {
                    day: Timestamp.fromDate(utcDate),
                    value: fieldValueToSet,
                    field: fieldRef.ref,
                    flatId: flat.id,
                    roomId: room.id,
                    fieldId: field.id
                });
        } else {
            await updateDoc(
                documentSnapshot.ref,
                {
                    day: Timestamp.fromDate(utcDate),
                    value: fieldValueToSet,
                });
        }
    } catch (error) {
        console.error(error);
    }
}

export const getFieldValues = async (
    year: string,
    month: string,
    flat?: Flat,
    room?: Room,
    field?: Field) => {
    try {
        const resultFields: FieldValue[] = []
        const fieldValueCollectionRef = collection(db, `${DB_BUILDING_CONSUMPTION}/${year}-${month}/${DB_FIELD_VALUES}`);
        const whereStatements: QueryFieldFilterConstraint[] = []
        if (flat)
            whereStatements.push(where("flatId", "==", flat.id));
        if (room)
            whereStatements.push(where("roomId", "==", room.id));
        if (field)
            whereStatements.push(where("fieldId", "==", field.id));
        const fieldValueQuery = query(fieldValueCollectionRef, and(...whereStatements))
        const allFields = await getDocs(fieldValueQuery);
        for (const fieldValue of allFields.docs) {
            const fieldDoc = await getDoc(fieldValue.get("field"))
            resultFields.push(
                {
                    field: {
                        id: fieldDoc.id,
                        name: fieldDoc.get("name"),
                        position: fieldDoc.get("position"),
                    },
                    day: fieldValue.get("day").toDate(),
                    value: fieldValue.get("value")
                })
        }
        return resultFields
    } catch (error) {
        console.error(error);
        return []
    }
}

export const getFieldValuesForExport = async (year: string, month: string) => {
    try {
        const houses: House[] = await getHouses()
        const fieldValues: FieldValue[] = await getFieldValues(year, month)
        const resultDownloadBuildingCsvDto: DownloadBuildingCsvDto[] = []
        houses.map((house) => {
            house.flats.map((flat) => {
                flat.rooms.map((room) => {
                    room.fields.map((field) => {
                        fieldValues.map((fieldValue) => {
                            if (field.id === fieldValue.field.id)
                                resultDownloadBuildingCsvDto.push(
                                    {
                                        house,
                                        flat,
                                        room,
                                        fieldValue: fieldValue,
                                    })
                        })
                    })
                })
            })
        })

        return resultDownloadBuildingCsvDto
    } catch (error) {
        console.error(error);
        return []
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
