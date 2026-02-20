import type {Room} from "@/common/models/room";

export type Flat = {
    id: string;
    name: string;
    rooms: Room[];
    position?: number;
};


