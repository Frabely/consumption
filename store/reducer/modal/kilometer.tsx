import {createSlice, PayloadAction} from "@reduxjs/toolkit";

const KilometerSlice = createSlice({
    name: 'kilometer',
    initialState: 0,
    reducers: {
        setKilometer: (state, action: PayloadAction<number>) => {
            return action.payload
        },
    },
})



export const { setKilometer } = KilometerSlice.actions

export default KilometerSlice;
