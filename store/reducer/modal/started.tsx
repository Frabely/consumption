import {createSlice, PayloadAction} from "@reduxjs/toolkit";

const StartedSlice = createSlice({
    name: "started",
    initialState: null as Date | null,
    reducers: {
        setStarted: (_state, action: PayloadAction<Date | null | undefined>) => {
            return action.payload ?? null
        },
    },
})

export const {setStarted} = StartedSlice.actions

export default StartedSlice
