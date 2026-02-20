import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {User} from "@/common/models";
import {EMPTY_USER} from "@/constants/constantData";

const CurrentUserSlice = createSlice({
    name: 'currentUser',
    initialState: EMPTY_USER,
    reducers: {
        setCurrentUser: (_state, action: PayloadAction<User>) => {
            return action.payload
        },
    },
})
export const {setCurrentUser} = CurrentUserSlice.actions

export default CurrentUserSlice;

