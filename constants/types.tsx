export type DataSet = {
    id: string,
    kilometer: number,
    power: number,
    name: string,
    time: string,
    date: string
}

export type DataSetNoId = {
    kilometer: number,
    power: number,
    name: string,
    time: string,
    date: string
}

export type User = {
    name?: string
    key?: string
}

export type YearMonth = {
    year: string,
    month: string
}
