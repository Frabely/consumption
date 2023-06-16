import {createSlice, PayloadAction} from "@reduxjs/toolkit";

const PowerSlice = createSlice({
    name: 'power',
    initialState: 0,
    reducers: {
        setPower: (state, action: PayloadAction<number>) => {
            return action.payload
        },
    },
})



export const { setPower } = PowerSlice.actions

export default PowerSlice;
