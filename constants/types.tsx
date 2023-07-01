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

export type Language = {
    [index: string]:any
    "head": {
        [index: string]: any
        "title": string
    },
    "menu": {
        [index: string]: any
        "addData": string
    },
    "measureUnits": {
        [index: string]: any
        "local": string,
        "UTC": string,
        "kilometer": string,
        "power": string,
        "time": string
    },
    "inputLabels": {
        [index: string]: any
        "date": string,
        "kilometer": string,
        "power": string,
        "name": string,
        "userID": string,
    },
    "buttonLabels": {
        [index: string]: any
        "addData": string,
        "changeData": string,
        "abort": string,
        "downloadCsv": string
    },
    "dataSet": {
        [index: string]: any
        "date": string,
        "time": string,
        "kilometer": string,
        "power": string,
        "name": string,
    },
    "messages": {
        [index: string]: any
        "noDataForFollowMonthAndYearAvailable": string
    },
    "loadingStation": {
        [index: string]: any
        "carport": string,
        "frontDoor": string,
        "official": string
    }

}
