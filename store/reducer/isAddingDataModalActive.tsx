import {createSlice} from "@reduxjs/toolkit";


const initialState: boolean = false;

const isAddingDataModalActiveSlice = createSlice({
    name: 'isAddingDataModalActive',
    initialState: initialState,
    reducers: {
        invertIsAddingDataModalActive: (state) => {
            return !state
        },
    },
})
export const { invertIsAddingDataModalActive } = isAddingDataModalActiveSlice.actions

export default isAddingDataModalActiveSlice;
