import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {House} from "@/constants/types";
import {DEFAULT_HOUSE} from "@/constants/constantData";

const CurrentHouseSlice = createSlice({
    name: 'currentHouse',
    initialState: DEFAULT_HOUSE,
    reducers: {
        setCurrentHouse: (state, action: PayloadAction<House>) => {
            return action.payload
        },
    },
})
export const {setCurrentHouse} = CurrentHouseSlice.actions

export default CurrentHouseSlice;
