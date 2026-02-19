import {
    DB_BUILDING_CONSUMPTION,
    DB_DATA_FIELDS_KEY,
    DB_FIELD_VALUES,
    DB_FLATS,
    DB_HOUSES,
    DB_ROOMS
} from "@/constants/constantData";
import {DownloadBuildingCsvDto, Field, FieldValue, Flat, Room} from "@/constants/types";
import {addDoc, collection, doc, getDoc, getDocs, limit, query, Timestamp, updateDoc, where} from "@firebase/firestore";
import {DocumentReference, QueryFieldFilterConstraint, and} from "firebase/firestore";
import {db} from "@/firebase/db";
import {getHouses} from "@/firebase/services/buildingStructureService";

export const setFieldValue = async (
    houseName: string,
    flat: Flat,
    room: Room,
    field: Field,
    year: string,
    month: string,
    fieldValueToSet?: number
) => {
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
            `${DB_HOUSES}/${houseName}/${DB_FLATS}/${flat.id}/${DB_ROOMS}/${room.id}/${DB_DATA_FIELDS_KEY}/${field.id}`
        ));

        const fieldQuery = query(
            collection(db, pathValues),
            where("fieldId", "==", field.id),
            where("flatId", "==", flat.id),
            where("roomId", "==", room.id),
            limit(1)
        );

        const querySnapshot = await getDocs(fieldQuery);
        if (querySnapshot.empty) {
            await addFieldValue(pathValues, utcDate, fieldValueToSet, fieldRef.ref, flat.id, room.id, field.id);
        } else {
            const documentSnapshot = querySnapshot.docs[0];
            await updateDoc(
                documentSnapshot.ref,
                {
                    day: Timestamp.fromDate(utcDate),
                    value: fieldValueToSet
                }
            );
        }
    } catch (error) {
        console.error(error);
    }
};

export const deleteFieldValue = async (
    houseName: string,
    flat: Flat,
    room: Room,
    field: Field,
    year: string,
    month: string
) => {
    try {
        const pathValues = `${DB_BUILDING_CONSUMPTION}/${year}-${month}/${DB_FIELD_VALUES}`;
        const fieldRef = await getDoc(doc(
            db,
            `${DB_HOUSES}/${houseName}/${DB_FLATS}/${flat.id}/${DB_ROOMS}/${room.id}/${DB_DATA_FIELDS_KEY}/${field.id}`
        ));

        const fieldQuery = query(
            collection(db, pathValues),
            where("field", "==", fieldRef.ref),
            limit(1)
        );

        const querySnapshot = await getDocs(fieldQuery);
        if (!querySnapshot.empty) {
            const documentSnapshot = querySnapshot.docs[0];
            await updateDoc(
                documentSnapshot.ref,
                {
                    value: null
                }
            );
        }
    } catch (error) {
        console.error(error);
    }
};

export const getFieldValues = async (
    year: string,
    month: string,
    flat?: Flat,
    room?: Room,
    field?: Field
) => {
    try {
        const resultFields: FieldValue[] = [];
        const fieldValueCollectionRef = collection(db, `${DB_BUILDING_CONSUMPTION}/${year}-${month}/${DB_FIELD_VALUES}`);
        const whereStatements: QueryFieldFilterConstraint[] = [];
        if (flat) whereStatements.push(where("flatId", "==", flat.id));
        if (room) whereStatements.push(where("roomId", "==", room.id));
        if (field) whereStatements.push(where("fieldId", "==", field.id));
        const fieldValueQuery = query(fieldValueCollectionRef, and(...whereStatements));
        const allFields = await getDocs(fieldValueQuery);
        for (const fieldValue of allFields.docs) {
            const fieldDoc = await getDoc(fieldValue.get("field"));
            resultFields.push(
                {
                    field: {
                        id: fieldDoc.id,
                        name: fieldDoc.get("name"),
                        position: fieldDoc.get("position")
                    },
                    day: fieldValue.get("day").toDate(),
                    value: fieldValue.get("value")
                }
            );
        }
        return resultFields;
    } catch (error) {
        console.error(error);
        return [];
    }
};

export const getFieldValuesForExport = async (year: string, month: string) => {
    try {
        const houses = await getHouses();
        const fieldValues = await getFieldValues(year, month);
        const resultDownloadBuildingCsvDto: DownloadBuildingCsvDto[] = [];
        houses.map((house) => {
            house.flats.map((flat) => {
                flat.rooms.map((room) => {
                    room.fields.map((innerField) => {
                        fieldValues.map((fieldValue) => {
                            if (innerField.id === fieldValue.field.id) {
                                resultDownloadBuildingCsvDto.push({
                                    house,
                                    flat,
                                    room,
                                    fieldValue
                                });
                            }
                        });
                    });
                });
            });
        });
        return resultDownloadBuildingCsvDto;
    } catch (error) {
        console.error(error);
        return [];
    }
};

const addFieldValue = async (
    pathValues: string,
    utcDate: Date,
    fieldValueToSet: number | undefined,
    fieldRef: DocumentReference,
    flatId: string,
    roomId: string,
    fieldId: string
) => {
    await addDoc(
        collection(db, pathValues),
        {
            day: Timestamp.fromDate(utcDate),
            value: fieldValueToSet,
            field: fieldRef,
            flatId,
            roomId,
            fieldId
        }
    );
};
