import {Room} from "@/constants/types";

export const canAddRoomByName = (roomNameInput: string, rooms: Room[]): boolean =>
    roomNameInput.length > 0 && rooms.every((room) => room.name !== roomNameInput);

export const canAddFieldByName = (
    fieldNameInput: string,
    currentSelectedRoom?: Room
): boolean =>
    fieldNameInput.length > 0 &&
    !!currentSelectedRoom &&
    currentSelectedRoom.fields.every((field) => field.name !== fieldNameInput);
