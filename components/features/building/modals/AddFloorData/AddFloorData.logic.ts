import type {FieldValue, Room, YearMonth} from "@/common/models";
import type {DachsAutofillValues} from "@/components/features/building/modals/AddFloorData/AddFloorData.dachsService";
import {
    DACHS_AUTOFILL_FIELD_MAPPING,
    DACHS_TARGET_FLAT_NAME,
    DACHS_TARGET_HOUSE_NAME,
    DACHS_TARGET_ROOM_NAME,
    MONTH_NUMBER_OFFSET
} from "@/components/features/building/modals/AddFloorData/AddFloorData.constants";

/**
 * Validates whether a field value can be persisted as a number.
 * @param value Current field value from the form state.
 * @returns True when the value is present and numeric.
 */
export const isFieldValueValid = (value: string | number | null): boolean =>
    value !== null && value !== "" && !isNaN(Number(value));

/**
 * Resolves a room by its display name.
 * @param rooms Available room list of the selected flat.
 * @param value Room name selected by the user.
 * @returns Matching room or undefined when none exists.
 */
export const resolveRoomByName = (rooms: Room[], value: string): Room | undefined =>
    rooms.find((room) => room.name === value);

/**
 * Checks whether the Dachs autofill action should be shown for the current context.
 * @param houseName Selected house name.
 * @param flatName Selected flat name.
 * @param room Active room in the dialog.
 * @returns True when the dialog matches the supported Dachs target and has mappable fields.
 */
export const shouldShowDachsAutofill = (
    houseName: string,
    flatName: string,
    room: Room
): boolean =>
    houseName === DACHS_TARGET_HOUSE_NAME &&
    flatName === DACHS_TARGET_FLAT_NAME &&
    room.name === DACHS_TARGET_ROOM_NAME &&
    room.fields.some((field) => field.name in DACHS_AUTOFILL_FIELD_MAPPING);

/**
 * Maps normalized Dachs values onto the current field list without clearing unmatched entries.
 * @param currentFieldValues Current room field values shown in the dialog.
 * @param dachsValues Normalized Dachs values from the import service.
 * @returns Updated field values and the subset that should be persisted.
 */
export const mapDachsValuesToFieldValues = (
    currentFieldValues: FieldValue[],
    dachsValues: DachsAutofillValues
): {
    updatedFieldValues: FieldValue[];
    importedFieldValues: FieldValue[];
} => {
    const importedFieldValues: FieldValue[] = [];

    const updatedFieldValues = currentFieldValues.map((fieldValue) => {
        const mappedKey = DACHS_AUTOFILL_FIELD_MAPPING[fieldValue.field.name as keyof typeof DACHS_AUTOFILL_FIELD_MAPPING];
        if (!mappedKey) {
            return fieldValue;
        }

        const importedValue = dachsValues[mappedKey];
        if (importedValue === undefined) {
            return fieldValue;
        }

        const updatedFieldValue = {
            ...fieldValue,
            value: importedValue.toString()
        };
        importedFieldValues.push(updatedFieldValue);
        return updatedFieldValue;
    });

    return {
        updatedFieldValues,
        importedFieldValues
    };
};

/**
 * Replaces the cached field values of one room while preserving values of other rooms.
 * @param allFieldValues All currently cached field values across the flat.
 * @param roomFieldValues Updated field values for the active room.
 * @param room Active room whose field values should be replaced.
 * @returns Combined field values with the active room values replaced.
 */
export const mergeRoomFieldValues = (
    allFieldValues: FieldValue[],
    roomFieldValues: FieldValue[],
    room: Room
): FieldValue[] => {
    const roomFieldIds = new Set(room.fields.map((field) => field.id));
    const otherFieldValues = allFieldValues.filter((fieldValue) => !roomFieldIds.has(fieldValue.field.id));

    return [...otherFieldValues, ...roomFieldValues];
};


