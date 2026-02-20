import type {LoadingStation} from "@/common/models/loadingStation";

export type DataSet = {
    id: string;
    kilometer: number;
    power: number;
    name: string;
    date: Date;
    loadingStation: LoadingStation;
};

export type DataSetNoId = {
    kilometer: number;
    power: number;
    name: string;
    date: Date;
    loadingStation: LoadingStation;
};


