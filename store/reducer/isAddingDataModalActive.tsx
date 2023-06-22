import {createSlice} from "@reduxjs/toolkit";


const initialState: boolean = false;

const isAddingDataModalActiveSlice = createSlice({
    name: 'isAddingDataModalActive',
    initialState: initialState,
    reducers: {
        invertIsAddingDataModalActive: (state) => {
            return !state
        },
        closeIsAddingDataModalActive: (state) => {
            return false
        },
    },
})
export const { invertIsAddingDataModalActive, closeIsAddingDataModalActive } = isAddingDataModalActiveSlice.actions

export default isAddingDataModalActiveSlice;
