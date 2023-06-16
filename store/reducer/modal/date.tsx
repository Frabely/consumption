import {createSlice, PayloadAction} from "@reduxjs/toolkit";

const today = new Date();
const year = today.getFullYear();
const month = today.getMonth() + 1;
const date = today.getDate();
const dateToday: string = `${year}-${month < 10 ? `0` + month : month}-${date < 10 ? `0` + date : date}`

const DateSlice = createSlice({
    name: 'date',
    initialState: dateToday,
    reducers: {
        setDate: (state, action: PayloadAction<string>) => {
            return action.payload
        },
        setDateNow: (state) => {
            return dateToday
        },
    },
})



export const { setDate, setDateNow } = DateSlice.actions

export default DateSlice;
