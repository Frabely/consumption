import type {Flat} from "@/common/models/flat";

export type House = {
    id: string;
    name: string;
    flats: Flat[];
    position?: number;
};


