import { RootState } from "@/store/store";

/**
 * Selects the currently active top-level page.
 * @param state Root redux state.
 * @returns Current page value.
 */
export const selectCurrentPage = (state: RootState) => state.currentPage;

/**
 * Selects the currently active modal state.
 * @param state Root redux state.
 * @returns Current modal state value.
 */
export const selectModalState = (state: RootState) => state.modalState;

/**
 * Selects the active user object.
 * @param state Root redux state.
 * @returns Current user payload.
 */
export const selectCurrentUser = (state: RootState) => state.currentUser;

/**
 * Selects the currently chosen car.
 * @param state Root redux state.
 * @returns Current car payload.
 */
export const selectCurrentCar = (state: RootState) => state.currentCar;

/**
 * Selects the currently chosen house.
 * @param state Root redux state.
 * @returns Current house payload.
 */
export const selectCurrentHouse = (state: RootState) => state.currentHouse;

/**
 * Selects current viewport dimension metadata.
 * @param state Root redux state.
 * @returns Dimension state value.
 */
export const selectDimension = (state: RootState) => state.dimension;

/**
 * Selects the currently loaded car data set.
 * @param state Root redux state.
 * @returns Current data-set collection.
 */
export const selectCurrentDataSet = (state: RootState) => state.currentDataSet;

/**
 * Selects global loading state.
 * @param state Root redux state.
 * @returns Loading flag.
 */
export const selectIsLoading = (state: RootState) => state.isLoading;

/**
 * Selects reload flags for remote data sources.
 * @param state Root redux state.
 * @returns Reload-needed state payload.
 */
export const selectIsReloadDataNeeded = (state: RootState) =>
  state.isReloadDataNeeded;

/**
 * Selects kilometer input state.
 * @param state Root redux state.
 * @returns Kilometer input value.
 */
export const selectKilometer = (state: RootState) => state.kilometer;

/**
 * Selects power input state.
 * @param state Root redux state.
 * @returns Power input value.
 */
export const selectPower = (state: RootState) => state.power;

/**
 * Selects loading-station input state.
 * @param state Root redux state.
 * @returns Loading-station payload.
 */
export const selectLoadingStation = (state: RootState) => state.loadingStation;

/**
 * Selects modal date state.
 * @param state Root redux state.
 * @returns Modal date value.
 */
export const selectDate = (state: RootState) => state.date;

/**
 * Selects modal id state.
 * @param state Root redux state.
 * @returns Modal identifier value.
 */
export const selectId = (state: RootState) => state.id;

/**
 * Selects whether data-edit mode is active.
 * @param state Root redux state.
 * @returns Data-edit mode flag.
 */
export const selectIsChangingData = (state: RootState) => state.isChangingData;

/**
 * Selects auth bootstrap/login status.
 * @param state Root redux state.
 * @returns Auth status value.
 */
export const selectAuthStatus = (state: RootState) => state.authStatus;
