import type {FieldValue} from "@/common/models/fieldValue";
import type {Flat} from "@/common/models/flat";
import type {House} from "@/common/models/house";
import type {Room} from "@/common/models/room";

export type DownloadBuildingCsvDto = {
    house: House;
    flat: Flat;
    room: Room;
    fieldValue: FieldValue;
};


