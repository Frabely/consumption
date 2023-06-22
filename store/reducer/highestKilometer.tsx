import {createSlice, PayloadAction} from "@reduxjs/toolkit";

const initialState: number = 0;

const HighestKilometerSlice = createSlice({
    name: 'highestKilometer',
    initialState: initialState,
    reducers: {
        setHighestKilometer: (state, action: PayloadAction<number>) => {
            return action.payload
        },
    },
})
export const { setHighestKilometer } = HighestKilometerSlice.actions

export default HighestKilometerSlice;
