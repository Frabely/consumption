import {
    DB_BUILDING_CONSUMPTION,
    DB_DATA_FIELDS_KEY,
    DB_FIELD_VALUES,
    DB_FLATS,
    DB_HOUSES,
    DB_ROOMS
} from "@/constants/constantData";
import type {DownloadBuildingCsvDto} from "@/common/dto";
import type {Field, FieldValue, Flat, Room} from "@/common/models";
import {addDoc, collection, doc, getDoc, getDocs, limit, query, Timestamp, updateDoc, where} from "@firebase/firestore";
import {DocumentReference, QueryFieldFilterConstraint, and} from "firebase/firestore";
import {db} from "@/firebase/db";
import {getHouses} from "@/firebase/services/buildingStructureService";

type FieldValueWriteInput = {
    field: Field;
    value: number;
};

/**
 * Creates or updates a single field value document for one room field.
 * @param houseName House name owning the flat hierarchy.
 * @param flat Selected flat.
 * @param room Selected room.
 * @param field Field definition to persist.
 * @param year Target year.
 * @param month Target month.
 * @param fieldValueToSet Numeric value to store.
 * @returns Promise that resolves when the field value upsert completes.
 */
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
        const utcDate = buildUtcDate(year, month);
        const pathValues = buildFieldValuePath(year, month);
        const fieldRef = await getFieldDocumentReference(houseName, flat, room, field);

        await upsertFieldValue(pathValues, utcDate, fieldValueToSet, fieldRef, flat.id, room.id, field.id);
    } catch (error) {
        console.error(error);
    }
};

/**
 * Creates or updates multiple field value documents for one room in a single logical action.
 * @param houseName House name owning the flat hierarchy.
 * @param flat Selected flat.
 * @param room Selected room.
 * @param year Target year.
 * @param month Target month.
 * @param fieldValues List of numeric field values to persist.
 * @returns Promise that resolves when all matching field writes complete.
 */
export const setFieldValues = async (
    houseName: string,
    flat: Flat,
    room: Room,
    year: string,
    month: string,
    fieldValues: FieldValueWriteInput[]
) => {
    try {
        const utcDate = buildUtcDate(year, month);
        const pathValues = buildFieldValuePath(year, month);
        const validFieldValues = fieldValues.filter((fieldValue) => !isNaN(fieldValue.value));

        await Promise.all(validFieldValues.map(async (fieldValue) => {
            const fieldRef = await getFieldDocumentReference(houseName, flat, room, fieldValue.field);

            await upsertFieldValue(
                pathValues,
                utcDate,
                fieldValue.value,
                fieldRef,
                flat.id,
                room.id,
                fieldValue.field.id
            );
        }));
    } catch (error) {
        console.error(error);
    }
};

/**
 * Sets an existing field value document to null.
 * @param houseName House name owning the flat hierarchy.
 * @param flat Selected flat.
 * @param room Selected room.
 * @param field Field definition to clear.
 * @param year Target year.
 * @param month Target month.
 * @returns Promise that resolves when the field value has been cleared.
 */
export const deleteFieldValue = async (
    houseName: string,
    flat: Flat,
    room: Room,
    field: Field,
    year: string,
    month: string
) => {
    try {
        const pathValues = buildFieldValuePath(year, month);
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

/**
 * Loads field values for the selected month and optional hierarchy filters.
 * @param year Target year.
 * @param month Target month.
 * @param flat Optional flat filter.
 * @param room Optional room filter.
 * @param field Optional field filter.
 * @returns Field values matching the requested filters.
 */
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

/**
 * Builds export rows by matching persisted field values to the building structure.
 * @param year Target year.
 * @param month Target month.
 * @returns Export rows for all matching houses, flats, rooms and fields.
 */
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

/**
 * Builds the monthly Firestore collection path for field values.
 * @param year Target year.
 * @param month Target month.
 * @returns Monthly Firestore path for field values.
 */
const buildFieldValuePath = (year: string, month: string): string =>
    `${DB_BUILDING_CONSUMPTION}/${year}-${month}/${DB_FIELD_VALUES}`;

/**
 * Builds a UTC date anchored to the selected year and month.
 * @param year Target year.
 * @param month Target month.
 * @returns UTC date used for persisted field value timestamps.
 */
const buildUtcDate = (year: string, month: string): Date => {
    const now = new Date();

    return new Date(Date.UTC(
        parseInt(year),
        parseInt(month) - 1,
        now.getUTCDate(),
        0,
        0,
        0,
        0
    ));
};

/**
 * Resolves the Firestore document reference for a room field definition.
 * @param houseName House name owning the flat hierarchy.
 * @param flat Selected flat.
 * @param room Selected room.
 * @param field Field definition to resolve.
 * @returns Firestore field document reference.
 */
const getFieldDocumentReference = async (
    houseName: string,
    flat: Flat,
    room: Room,
    field: Field
): Promise<DocumentReference> => {
    const fieldSnapshot = await getDoc(doc(
        db,
        `${DB_HOUSES}/${houseName}/${DB_FLATS}/${flat.id}/${DB_ROOMS}/${room.id}/${DB_DATA_FIELDS_KEY}/${field.id}`
    ));

    return fieldSnapshot.ref;
};

/**
 * Creates or updates a persisted field value document.
 * @param pathValues Monthly Firestore collection path.
 * @param utcDate UTC date used for the persisted timestamp.
 * @param fieldValueToSet Numeric value to store.
 * @param fieldRef Firestore field document reference.
 * @param flatId Flat identifier.
 * @param roomId Room identifier.
 * @param fieldId Field identifier.
 * @returns Promise that resolves when the upsert completes.
 */
const upsertFieldValue = async (
    pathValues: string,
    utcDate: Date,
    fieldValueToSet: number | undefined,
    fieldRef: DocumentReference,
    flatId: string,
    roomId: string,
    fieldId: string
) => {
    const fieldQuery = query(
        collection(db, pathValues),
        where("fieldId", "==", fieldId),
        where("flatId", "==", flatId),
        where("roomId", "==", roomId),
        limit(1)
    );

    const querySnapshot = await getDocs(fieldQuery);
    if (querySnapshot.empty) {
        await addFieldValue(pathValues, utcDate, fieldValueToSet, fieldRef, flatId, roomId, fieldId);
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
};

/**
 * Creates a new persisted field value document.
 * @param pathValues Monthly Firestore collection path.
 * @param utcDate UTC date used for the persisted timestamp.
 * @param fieldValueToSet Numeric value to store.
 * @param fieldRef Firestore field document reference.
 * @param flatId Flat identifier.
 * @param roomId Room identifier.
 * @param fieldId Field identifier.
 * @returns Promise that resolves when the document has been created.
 */
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

