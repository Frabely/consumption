import {Timestamp} from "@firebase/firestore";
import {TimestampData} from "@/constants/types";

export const getDate = (timeStamp: TimestampData): string => {

    const date = new Timestamp(timeStamp.seconds, timeStamp.nanoseconds).toDate()
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}-${month < 10 ? `0` + month : month}-${day < 10 ? `0` + day : day}`
}

export const getTime = (timeStamp: TimestampData): string => {
    const date = new Timestamp(timeStamp.seconds, timeStamp.nanoseconds).toDate()
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return `${hours < 10 ? `0` + hours : hours}:${minutes < 10 ? `0` + minutes : minutes}`
}
