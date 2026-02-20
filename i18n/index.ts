import commonDe from "@/i18n/de/common.json";
import homeDe from "@/i18n/de/home.json";
import buildingDe from "@/i18n/de/building.json";
import errorsDe from "@/i18n/de/errors.json";

export const de = {
    ...commonDe,
    ...homeDe,
    ...buildingDe,
    ...errorsDe
} as const;

export type Translations = typeof de;

export default de;


