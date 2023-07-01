export type DataSet = {
    id: string,
    kilometer: number,
    power: number,
    name: string,
    time: string,
    date: string,
    loadingStation: LoadingStation
}

export type DataSetNoId = {
    kilometer: number,
    power: number,
    name: string,
    time: string,
    date: string,
    loadingStation: LoadingStation
}

export type User = {
    name?: string
    key?: string
}

export type YearMonth = {
    [index: string]: string
    year: string,
    month: string
}

export type LoadingStation = {
    id: string,
    name: string
}
