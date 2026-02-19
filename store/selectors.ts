import {RootState} from "@/store/store";

export const selectCurrentPage = (state: RootState) => state.currentPage;
export const selectModalState = (state: RootState) => state.modalState;
export const selectCurrentUser = (state: RootState) => state.currentUser;
export const selectCurrentCar = (state: RootState) => state.currentCar;
export const selectCurrentHouse = (state: RootState) => state.currentHouse;
export const selectDimension = (state: RootState) => state.dimension;
export const selectCurrentDataSet = (state: RootState) => state.currentDataSet;
export const selectIsLoading = (state: RootState) => state.isLoading;
export const selectIsReloadDataNeeded = (state: RootState) => state.isReloadDataNeeded;
export const selectKilometer = (state: RootState) => state.kilometer;
export const selectPower = (state: RootState) => state.power;
export const selectLoadingStation = (state: RootState) => state.loadingStation;
export const selectDate = (state: RootState) => state.date;
export const selectId = (state: RootState) => state.id;
export const selectIsChangingData = (state: RootState) => state.isChangingData;
export const selectAuthStatus = (state: RootState) => state.authStatus;
