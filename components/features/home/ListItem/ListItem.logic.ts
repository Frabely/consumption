import {ModalState} from "@/constants/enums";
import {LoadingStation} from "@/common/models";
import {setIsChangingData} from "@/store/reducer/isChangingData";
import {setDate} from "@/store/reducer/modal/date";
import {setId} from "@/store/reducer/modal/id";
import {setKilometer} from "@/store/reducer/modal/kilometer";
import {setLoadingStation} from "@/store/reducer/modal/loadingStationId";
import {setPower} from "@/store/reducer/modal/power";
import {setStarted} from "@/store/reducer/modal/started";
import {setEnded} from "@/store/reducer/modal/ended";
import {setCardId} from "@/store/reducer/modal/cardId";
import {setModalState} from "@/store/reducer/modalState";
import {Role} from "@/constants/enums";
import {getDateString} from "@/utils/date/formatDate";

export type ListItemDispatchAction =
    | ReturnType<typeof setIsChangingData>
    | ReturnType<typeof setModalState>
    | ReturnType<typeof setDate>
    | ReturnType<typeof setKilometer>
    | ReturnType<typeof setPower>
    | ReturnType<typeof setStarted>
    | ReturnType<typeof setEnded>
    | ReturnType<typeof setCardId>
    | ReturnType<typeof setId>
    | ReturnType<typeof setLoadingStation>;

export type ListItemDispatch = (action: ListItemDispatchAction) => void;

const MILLISECONDS_TO_MINUTES = 60000;
const CHANGE_CAR_DATA_TIME_WINDOW_MINUTES = 5;
const LIST_ITEM_POWER_DECIMAL_PLACES = 4;

/**
 * Formats a date as local time only.
 * @param date Date to format.
 * @returns Local time string in HH:mm format.
 */
const getTimeString = (date: Date): string => {
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
};

/**
 * Formats a date as local date-time with zero-padded hours.
 * @param date Date to format.
 * @returns Local date-time string in dd.MM.yyyy HH:mm format.
 */
const getLocalDateTimeString = (date: Date): string => {
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}.${month}.${year} ${getTimeString(date)}`;
};

/**
 * Returns whether two dates share the same local calendar date.
 * @param left First date.
 * @param right Second date.
 * @returns True when both dates fall on the same local day.
 */
const isSameLocalDate = (left: Date, right: Date): boolean =>
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate();

/**
 * Returns whether the current user may edit the selected car-data entry.
 * @param input Edit-permission context including role, age and list position.
 * @returns True when the entry may be edited.
 */
export const isChangeCarDataAllowed = ({
    isFirstElement,
    dataSetDate,
    currentUserRole,
    now = new Date()
}: {
    isFirstElement: boolean;
    dataSetDate: Date;
    currentUserRole?: Role;
    now?: Date;
}): boolean => {
    if (currentUserRole === Role.Admin) {
        return true;
    }

    const diffMinutes =
        Math.floor(now.getTime() / MILLISECONDS_TO_MINUTES) -
        Math.floor(dataSetDate.getTime() / MILLISECONDS_TO_MINUTES);
    return (
        isFirstElement &&
        diffMinutes >= 0 &&
        diffMinutes < CHANGE_CAR_DATA_TIME_WINDOW_MINUTES
    );
};

/**
 * Dispatches the modal state required to edit an existing car-data entry.
 * @param input Dispatch callback and entry payload to prefill the edit modal.
 * @returns Nothing.
 */
export const dispatchChangeDataActions = ({
    dispatch,
    date,
    started,
    ended,
    cardId,
    kilometer,
    power,
    id,
    loadingStation
}: {
    dispatch: ListItemDispatch;
    date: Date;
    started?: Date;
    ended?: Date;
    cardId?: string;
    kilometer: number;
    power: number;
    id: string;
    loadingStation: LoadingStation;
}): void => {
    dispatch(setModalState(ModalState.ChangeCarData));
    dispatch(setDate(date));
    dispatch(setStarted(started));
    dispatch(setEnded(ended));
    dispatch(setCardId(cardId));
    dispatch(setKilometer(kilometer.toString()));
    dispatch(setPower(power.toString()));
    dispatch(setId(id));
    dispatch(setLoadingStation(loadingStation));
};

/**
 * Formats an optional date-time value for list-item rendering.
 * @param date Date value to format.
 * @param fallback Fallback text for missing values.
 * @returns Formatted local date-time string or fallback.
 */
export const formatListItemDateTime = (date: Date | undefined, fallback: string): string =>
    date ? getDateString(date) : fallback;

/**
 * Formats the loading-session range for list-item rendering.
 * @param started Loading-session start date.
 * @param ended Loading-session end date.
 * @param fallback Fallback text for missing values.
 * @returns Compact loading-session range string or fallback.
 */
export const formatLoadingSessionRange = (
    started: Date | undefined,
    ended: Date | undefined,
    fallback: string
): string => {
    if (!started || !ended) {
        return fallback;
    }

    if (isSameLocalDate(started, ended)) {
        return `${getLocalDateTimeString(started)} - ${getTimeString(ended)}`;
    }

    return `${getLocalDateTimeString(started)} - ${getLocalDateTimeString(ended)}`;
};

/**
 * Formats a power value for list-item rendering.
 * @param power Power value in kWh as number or legacy string.
 * @returns Power value with a stable decimal representation.
 */
export const formatListItemPower = (power: number | string): string => {
    const normalizedPower = typeof power === "number" ? power : Number.parseFloat(power);

    if (!Number.isFinite(normalizedPower)) {
        return "0.0000";
    }

    return normalizedPower.toFixed(LIST_ITEM_POWER_DECIMAL_PLACES);
};

