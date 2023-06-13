import {createSlice} from "@reduxjs/toolkit";


const initialState: boolean = false;

const isAddingDataModalActiveSlice = createSlice({
    name: 'isAddingDataModalActive',
    initialState: initialState,
    reducers: {
        invertIsAddingDataModalActive: (state) => {
            return !state
        },
        // closeAddingDataModal: (state) => {
        //     return false
        // },
    },
})
export const { invertIsAddingDataModalActive } = isAddingDataModalActiveSlice.actions

export default isAddingDataModalActiveSlice;
