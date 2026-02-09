import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {Page} from "@/constants/enums";

const currentPageSlice = createSlice({
    name: 'currentPage',
    initialState: Page.Home,
    reducers: {
        setPage: (_state, action: PayloadAction<Page>) => {
            return action.payload
        },
    },
})
export const {setPage} = currentPageSlice.actions

export default currentPageSlice;
