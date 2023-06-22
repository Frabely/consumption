import {createSlice, PayloadAction} from "@reduxjs/toolkit";

const initialState: string = ''

const KilometerSlice = createSlice({
    name: 'kilometer',
    initialState: initialState,
    reducers: {
        setKilometer: (state, action: PayloadAction<string>) => {
            return action.payload
        },
    },
})


export const {setKilometer} = KilometerSlice.actions

export default KilometerSlice;
