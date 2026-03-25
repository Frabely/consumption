import type {DataSet} from "@/common/models";
import {getDateString, getUTCDateString} from "@/utils/date/formatDate";

type DownloadCsvLabels = {
    loadingStationId: string;
    date: string;
    time: string;
    utcDate: string;
    utcTime: string;
    kilometer: string;
    power: string;
    name: string;
    startedAt: string;
    endedAt: string;
    cardId: string;
};

/**
 * Formats an optional session date-time for the consumption CSV export.
 * @param date Optional session date-time.
 * @returns Localized date-time string or an empty field when missing.
 */
const formatOptionalCsvDateTime = (date: Date | undefined): string =>
    date ? getDateString(date) : "";

/**
 * Formats an optional string field for the consumption CSV export.
 * @param value Optional string value.
 * @returns String value or an empty field when missing.
 */
const formatOptionalCsvString = (value: string | undefined): string =>
    value ?? "";

/**
 * Builds the semicolon-separated CSV content for consumption exports.
 * @param dataSetArray Consumption dataset rows to export.
 * @param labels Localized CSV header labels.
 * @returns Full CSV text including header row.
 */
export const buildDownloadCsvText = (
    dataSetArray: DataSet[],
    labels: DownloadCsvLabels
): string => {
    let txtContent =
        `${labels.loadingStationId};${labels.date};` +
        `${labels.time};${labels.utcDate};${labels.utcTime};${labels.kilometer};` +
        `${labels.power};${labels.name};${labels.startedAt};${labels.endedAt};${labels.cardId}\n`;

    dataSetArray.forEach((dataSet) => {
        const [yearMonthDay, hoursMinutes] = getDateString(dataSet.date).split(" ");
        const [utcYearMonthDay, utcHoursMinutes] = getUTCDateString(dataSet.date).split(" ");

        txtContent +=
            `${dataSet.loadingStation.id};${yearMonthDay};` +
            `${hoursMinutes};${utcYearMonthDay};${utcHoursMinutes};${dataSet.kilometer};` +
            `${dataSet.power.toString().replace(".", ",")};${dataSet.name};` +
            `${formatOptionalCsvDateTime(dataSet.started)};` +
            `${formatOptionalCsvDateTime(dataSet.ended)};` +
            `${formatOptionalCsvString(dataSet.cardId)}\n`;
    });

    return txtContent;
};
