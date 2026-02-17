import {
    DB_DATA_FIELDS_KEY,
    DB_DATA_FLATS_KEY,
    DB_DATA_ROOMS_KEY,
    DB_FLATS,
    DB_HOUSES,
    DB_ROOMS
} from "@/constants/constantData";
import {Field, Flat, House, Room} from "@/constants/types";
import {
    addDoc,
    CollectionReference,
    collection,
    deleteDoc,
    doc,
    DocumentReference,
    getDoc,
    getDocs,
    QueryDocumentSnapshot,
    updateDoc
} from "@firebase/firestore";
import {db} from "@/firebase/db";

export const getFields = async (houseId: string, flatId: string, roomId: string) => {
    const fields: Field[] = [];
    const fieldsCollectionRef = collection(
        db,
        `${DB_HOUSES}/${houseId}/${DB_DATA_FLATS_KEY}/${flatId}/${DB_DATA_ROOMS_KEY}/${roomId}/${DB_DATA_FIELDS_KEY}`
    );
    const qsFieldsDocs = await getDocs(fieldsCollectionRef).catch(error => {
        console.error(error.message);
    });
    if (qsFieldsDocs && !qsFieldsDocs.empty) {
        for (const field of qsFieldsDocs.docs) {
            const newField: Field = {
                id: field.id,
                name: field.get("name"),
                position: field.get("position")
            };
            fields.push(newField);
        }
    }
    return fields.sort((a, b) => {
        if (a.position === undefined && b.position === undefined) return 0;
        if (a.position === undefined) return 1;
        if (b.position === undefined) return -1;
        return a.position - b.position;
    });
};

export const getRooms = async (houseId: string, flatId: string) => {
    const rooms: Room[] = [];
    const roomsRef = collection(
        db,
        `${DB_HOUSES}/${houseId}/${DB_DATA_FLATS_KEY}/${flatId}/${DB_DATA_ROOMS_KEY}`
    );
    const qsRoomsDocs = await getDocs(roomsRef).catch(error => {
        console.error(error.message);
    });
    if (qsRoomsDocs && !qsRoomsDocs.empty) {
        for (const room of qsRoomsDocs.docs) {
            const newRoom: Room = {
                id: room.id,
                name: room.get("name"),
                fields: await getFields(houseId, flatId, room.id),
                position: room.get("position")
            };
            rooms.push(newRoom);
        }
    }
    return rooms.sort((a, b) => {
        if (a.position === undefined && b.position === undefined) return 0;
        if (a.position === undefined) return 1;
        if (b.position === undefined) return -1;
        return a.position - b.position;
    });
};

export const getFlats = async (houseId: string) => {
    const flats: Flat[] = [];
    const flatsRef = collection(db, `${DB_HOUSES}/${houseId}/${DB_DATA_FLATS_KEY}`);
    const qsFlatDocs = await getDocs(flatsRef).catch(error => {
        console.error(error.message);
    });
    if (qsFlatDocs && !qsFlatDocs.empty) {
        for (const flat of qsFlatDocs.docs) {
            const newFlat: Flat = {
                id: flat.id,
                name: flat.get("name"),
                rooms: await getRooms(houseId, flat.id),
                position: flat.get("position")
            };
            flats.push(newFlat);
        }
    }
    return flats.sort((a, b) => {
        if (a.position === undefined && b.position === undefined) return 0;
        if (a.position === undefined) return 1;
        if (b.position === undefined) return -1;
        return a.position - b.position;
    });
};

export const getHouses = async () => {
    const houses: House[] = [];
    const housesRef = collection(db, `${DB_HOUSES}`);
    const qsDocs = await getDocs(housesRef).catch(error => {
        console.error(error.message);
    });

    if (qsDocs && !qsDocs.empty) {
        for (const house of qsDocs.docs) {
            const flats = await getFlats(house.id);
            const newHouse: House = {
                id: house.id,
                name: house.id,
                flats,
                position: house.get("position")
            };
            houses.push(newHouse);
        }
    }
    return houses.sort((a, b) => {
        if (a.position === undefined && b.position === undefined) return 0;
        if (a.position === undefined) return 1;
        if (b.position === undefined) return -1;
        return a.position - b.position;
    });
};

export const createFlat = async (flat: Flat, houseName: string) => {
    try {
        const flatColRef = collection(db, `${DB_HOUSES}/${houseName}/${DB_FLATS}`);
        const createdFlatDoc = await addDoc(flatColRef, {name: flat.name, position: flat?.position});
        const roomsCollectionRef = collection(flatColRef, `/${createdFlatDoc.id}/${DB_ROOMS}`);
        for (const room of flat.rooms) {
            const createdRoomDoc = await addDoc(roomsCollectionRef, {name: room.name, position: room?.position});
            const fieldsCollectionRef = collection(roomsCollectionRef, `/${createdRoomDoc.id}/${DB_DATA_FIELDS_KEY}`);
            for (const field of room.fields) {
                await addDoc(fieldsCollectionRef, {name: field.name, position: field?.position});
            }
        }
    } catch (error) {
        console.error(error);
    }
};

export const updateFlat = async (houseName: string, flat: Flat) => {
    try {
        const deleteUpdatePromises: Promise<void>[] = [];
        const dbFlat = await getDoc(doc(db, `${DB_HOUSES}/${houseName}/${DB_FLATS}/${flat.id}`));
        deleteUpdatePromises.push(updateDoc(dbFlat.ref, {name: flat.name, position: flat.position}));
        deleteUpdatePromises.push(updateRooms(collection(db, `${DB_HOUSES}/${houseName}/${DB_FLATS}/${flat.id}/${DB_ROOMS}`), flat.rooms));
        await Promise.all(deleteUpdatePromises);
    } catch (error) {
        console.error(error);
    }
};

export const updateRooms = async (roomsCollectionRef: CollectionReference, rooms: Room[]) => {
    try {
        const deleteUpdatePromises: Promise<void>[] = [];
        const addPromises: Promise<DocumentReference>[] = [];
        const roomsToAdd = rooms.filter((room) => room.id === "");
        const roomsToNotAddIds = rooms.filter((room) => room.id !== "").map((room) => room.id);
        const dbRooms = await getDocs(roomsCollectionRef);
        const roomsToDelete: QueryDocumentSnapshot[] = [];
        const roomsToUpdate: QueryDocumentSnapshot[] = [];
        dbRooms.docs.map((room) => {
            if (!roomsToNotAddIds.includes(room.id)) {
                roomsToDelete.push(room);
            } else {
                roomsToUpdate.push(room);
            }
        });

        for (const room of roomsToDelete) {
            deleteUpdatePromises.push(deleteDoc(room.ref));
        }
        for (const room of roomsToAdd) {
            const roomDocument = await addDoc(roomsCollectionRef, {name: room.name, position: room.position});
            room.fields.forEach((field) => {
                addPromises.push(addDoc(collection(db, `${roomDocument.path}/${DB_DATA_FIELDS_KEY}`), {
                    name: field.name,
                    position: field?.position
                }));
            });
        }
        for (const dbRoom of roomsToUpdate) {
            const roomToUpdate = rooms.filter((room) => room.id === dbRoom.id)[0];
            deleteUpdatePromises.push(updateDoc(dbRoom.ref, {name: roomToUpdate.name, position: roomToUpdate.position}));
            deleteUpdatePromises.push(updateFields(collection(db, `${roomsCollectionRef.path}/${roomToUpdate.id}/${DB_DATA_FIELDS_KEY}`), roomToUpdate.fields));
        }

        await Promise.all(deleteUpdatePromises);
        await Promise.all(addPromises);
    } catch (error) {
        console.error(error);
    }
};

export const updateFields = async (fieldCollectionRef: CollectionReference, fields: Field[]) => {
    try {
        const deleteUpdatePromises: Promise<void>[] = [];
        const addPromises: Promise<DocumentReference>[] = [];
        const fieldsToAdd = fields.filter((field) => field.id === "");
        const fieldsToNotAddIds = fields.filter((field) => field.id !== "").map((field) => field.id);
        const dbFields = await getDocs(fieldCollectionRef);
        const fieldsToDelete: QueryDocumentSnapshot[] = [];
        const fieldsToUpdate: QueryDocumentSnapshot[] = [];
        dbFields.docs.map((field) => {
            if (!fieldsToNotAddIds.includes(field.id)) {
                fieldsToDelete.push(field);
            } else {
                fieldsToUpdate.push(field);
            }
        });

        for (const field of fieldsToDelete) {
            deleteUpdatePromises.push(deleteDoc(field.ref));
        }
        for (const field of fieldsToAdd) {
            addPromises.push(addDoc(fieldCollectionRef, {name: field.name, position: field.position}));
        }
        for (const dbField of fieldsToUpdate) {
            const fieldToUpdate = fields.filter((field) => field.id === dbField.id)[0];
            deleteUpdatePromises.push(updateDoc(dbField.ref, {
                name: fieldToUpdate.name,
                position: fieldToUpdate.position
            }));
        }

        await Promise.all(deleteUpdatePromises);
        await Promise.all(addPromises);
    } catch (error) {
        console.error(error);
    }
};
