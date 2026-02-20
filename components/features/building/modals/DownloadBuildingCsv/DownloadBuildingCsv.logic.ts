import type {DownloadBuildingCsvDto} from "@/common/dto";

export const buildDownloadBuildingCsvText = (
    rows: DownloadBuildingCsvDto[],
    labels: {
        house: string;
        flat: string;
        room: string;
        fieldName: string;
        fieldValue: string;
        day: string;
    }
): string => {
    let txtContent =
        `${labels.house};` +
        `${labels.flat};` +
        `${labels.room};` +
        `${labels.fieldName};` +
        `${labels.fieldValue};` +
        `${labels.day}\n`;

    rows.forEach((row) => {
        txtContent +=
            `${row.house.name};` +
            `${row.flat.name};` +
            `${row.room.name};` +
            `${row.fieldValue.field.name};` +
            `${row.fieldValue.value};` +
            `${row.fieldValue.day ? row.fieldValue.day.getUTCDate().toString() : "-"};\n`;
    });

    return txtContent.replace(".", ",");
};

