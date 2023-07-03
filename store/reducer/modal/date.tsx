import {createSlice, PayloadAction} from "@reduxjs/toolkit";

const today: Date = new Date();

const DateSlice = createSlice({
    name: 'date',
    initialState: today,
    reducers: {
        setDate: (state, action: PayloadAction<Date>) => {
            return action.payload
        },
        setDateNow: () => {
            return new Date()
        },
    },
})



export const { setDate, setDateNow } = DateSlice.actions

export default DateSlice;
