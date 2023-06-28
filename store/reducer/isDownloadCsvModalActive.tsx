import {createSlice} from "@reduxjs/toolkit";


const initialState: boolean = false;

const isDownloadCsvModalActiveSlice = createSlice({
    name: 'isDownloadCsvModalActive',
    initialState: initialState,
    reducers: {
        invertIsDownloadCsvModalActive: (state) => {
            return !state
        },
        closeIsDownloadCsvModalActive: (state) => {
            return false
        },
    },
})
export const { invertIsDownloadCsvModalActive, closeIsDownloadCsvModalActive } = isDownloadCsvModalActiveSlice.actions

export default isDownloadCsvModalActiveSlice;
