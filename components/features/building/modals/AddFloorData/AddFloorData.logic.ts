import {Room} from "@/common/models";

export const isFieldValueValid = (value: string | null): boolean =>
    !!value && !isNaN(Number(value));

export const resolveRoomByName = (rooms: Room[], value: string): Room | undefined =>
    rooms.find((room) => room.name === value);

