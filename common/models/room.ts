import type {Field} from "@/common/models/field";

export type Room = {
    id: string;
    name: string;
    fields: Field[];
    position?: number;
};


