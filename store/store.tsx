import {configureStore} from "@reduxjs/toolkit";
import modalStateSlice from "@/store/reducer/modalState";
import currentDataSetSlice from "@/store/reducer/currentDataSet";
import KilometerSlice from "@/store/reducer/modal/kilometer";
import PowerSlice from "@/store/reducer/modal/power";
import isChangingDataSlice from "@/store/reducer/isChangingData";
import IdSlice from "@/store/reducer/modal/id";
import CurrentUserSlice from "@/store/reducer/currentUser";
import LoadingStationSlice from "@/store/reducer/modal/loadingStationId";
import CurrentCarSlice from "@/store/reducer/currentCar";
import DateSlice from "@/store/reducer/modal/date";
import dimensionSlice from "@/store/reducer/dismension";
import CurrentHouseSlice from "@/store/reducer/currentHouse";
import isReloadDataNeededSlice from "@/store/reducer/isReloadDataNeeded";

export const store = configureStore({
    reducer: {
        [modalStateSlice.name]: modalStateSlice.reducer,
        [currentDataSetSlice.name]: currentDataSetSlice.reducer,
        [KilometerSlice.name]: KilometerSlice.reducer,
        [PowerSlice.name]: PowerSlice.reducer,
        [DateSlice.name]: DateSlice.reducer,
        [isChangingDataSlice.name]: isChangingDataSlice.reducer,
        [IdSlice.name]: IdSlice.reducer,
        [CurrentUserSlice.name]: CurrentUserSlice.reducer,
        [LoadingStationSlice.name]: LoadingStationSlice.reducer,
        [CurrentCarSlice.name]: CurrentCarSlice.reducer,
        [CurrentHouseSlice.name]: CurrentHouseSlice.reducer,
        [dimensionSlice.name]: dimensionSlice.reducer,
        [isReloadDataNeededSlice.name]: isReloadDataNeededSlice.reducer,
    },
    devTools: true,
    middleware: getDefaultMiddleware => getDefaultMiddleware({
        serializableCheck: false
    })
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// // Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch
