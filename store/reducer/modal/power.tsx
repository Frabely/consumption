import {createSlice, PayloadAction} from "@reduxjs/toolkit";

const PowerSlice = createSlice({
    name: 'power',
    initialState: '',
    reducers: {
        setPower: (state, action: PayloadAction<string>) => {
            return action.payload

        },
    },
})


export const {setPower} = PowerSlice.actions

export default PowerSlice;
