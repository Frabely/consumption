import {FieldValue, Flat} from "@/constants/types";

export const filterFieldValuesByRoom = (
    flat: Flat,
    currentRoomId: string,
    allFieldValues: FieldValue[]
): FieldValue[] => {
    const room = flat.rooms.find((innerRoom) => innerRoom.id === currentRoomId);
    if (!room) {
        return [];
    }

    const valueByFieldId = new Map(
        allFieldValues.map((fieldValue) => [fieldValue.field.id, fieldValue.value] as const)
    );

    return room.fields.map((field) => ({
        field,
        value: valueByFieldId.has(field.id) ? valueByFieldId.get(field.id)! : null
    }));
};

export const parseYearMonthInput = (value: string): {year: string; month: string} | null => {
    const [year, month] = value.split("-");
    if (!year || !month) {
        return null;
    }
    return {year, month};
};
