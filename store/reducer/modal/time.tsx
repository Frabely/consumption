import {createSlice, PayloadAction} from "@reduxjs/toolkit";

const today = new Date();
const hours = today.getHours();
const minutes = today.getMinutes();
const timeNow: string = `${hours < 10 ? `0` + hours : hours}:${minutes < 10 ? `0` + minutes : minutes}`

const TimeSlice = createSlice({
    name: 'time',
    initialState: timeNow,
    reducers: {
        setTime: (state, action: PayloadAction<string>) => {
            return action.payload
        },
        setTimeNow: (state) => {
            return timeNow
        },
    },
})



export const { setTime, setTimeNow } = TimeSlice.actions

export default TimeSlice;
