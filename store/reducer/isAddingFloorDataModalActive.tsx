import {createSlice} from "@reduxjs/toolkit";


const initialState: boolean = false;

const isAddingFloorDataModalActiveSlice = createSlice({
    name: 'isAddingFloorDataModalActive',
    initialState: initialState,
    reducers: {
        invertIsAddingFloorDataModalActive: (state) => {
            return !state
        },
        closeIsAddingFloorDataModalActive: (state) => {
            return false
        },
    },
})
export const {
    invertIsAddingFloorDataModalActive,
    closeIsAddingFloorDataModalActive
} = isAddingFloorDataModalActiveSlice.actions

export default isAddingFloorDataModalActiveSlice;
