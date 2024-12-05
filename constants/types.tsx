export type DataSet = {
    id: string,
    kilometer: number,
    power: number,
    name: string,
    date: Date,
    loadingStation: LoadingStation
}

export type DataSetNoId = {
    kilometer: number,
    power: number,
    name: string,
    date: Date,
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

export type Language =
    {
    [index: string]:any
    "head": {
        [index: string]: any
        "title": string
    },
    "menu": {
        [index: string]: any
        "addData": string
    },
    "displayLabels": {
        [index: string]: any
        "local": string,
        "UTC": string,
        "kilometer": string,
        "kilometerShort": string,
        "power": string,
        "powerShort": string,
        "loadingStation": string,
        "name": string,
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
    "floorLabels": {
        [index: string]: any
        "groundFloorLeft": string,
        "groundFloorRight": string,
        "firstFloorLeft": string,
        "firstFloorRight": string,
        "SecondFloorLeft": string,
        "SecondFloorRight": string
    },
    "dataSet": {
        [index: string]: any
        "date": string,
        "time": string,
        "utcDate": string,
        "utcTime": string,
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
export type Dimension = {
    height: number,
    width: number,
    isHorizontal: boolean
}


export type Car = {
    name: string,
    kilometer?: number,
    prevKilometer?: number
}

export type House = {
    name: string,
    flats: Flat[]
}

export type Flat = {
    name: string,
    rooms: Room[]
}

export type Room = {
    name: string,
    fields: NumberDictionary
}

export type NumberDictionary = {
    [index: string]: number | null;
}

export type ChangingFloor = {
    flatName: string
    rooms: Room[],
}

export type ReloadNeeded = {
    isReloadHousesNeeded: boolean,
    isReloadCarsNeeded: boolean,
    isReloadFieldsNeeded: boolean,
}
