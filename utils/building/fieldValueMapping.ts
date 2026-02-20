import { FieldValue, Flat } from "@/common/models";

/**
 * Filters all field values down to the fields of the selected room.
 * @param flat Current flat containing rooms and fields.
 * @param currentRoomId Selected room identifier.
 * @param allFieldValues Full list of available field values.
 * @returns Mapped list of room field values with null fallback for missing entries.
 */
export const filterFieldValuesByRoom = (
  flat: Flat,
  currentRoomId: string,
  allFieldValues: FieldValue[],
): FieldValue[] => {
  const room = flat.rooms.find((innerRoom) => innerRoom.id === currentRoomId);
  if (!room) {
    return [];
  }

  const valueByFieldId = new Map(
    allFieldValues.map(
      (fieldValue) => [fieldValue.field.id, fieldValue.value] as const,
    ),
  );

  return room.fields.map((field) => ({
    field,
    value: valueByFieldId.has(field.id) ? valueByFieldId.get(field.id)! : null,
  }));
};

/**
 * Parses an HTML year-month input string into structured values.
 * @param value Raw input in YYYY-MM format.
 * @returns Parsed year/month object or null when format is invalid.
 */
export const parseYearMonthInput = (
  value: string,
): { year: string; month: string } | null => {
  const [year, month] = value.split("-");
  if (!year || !month) {
    return null;
  }
  return { year, month };
};

