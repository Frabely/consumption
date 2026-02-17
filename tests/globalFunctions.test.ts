import {describe, expect, it} from "vitest";
import {getDateString, getUTCDateString} from "@/constants/globalFunctions";

describe("globalFunctions", () => {
    it("formats local dates as dd.mm.yyyy h:mm with zero-padded day/month/minutes", () => {
        const date = new Date(2026, 0, 2, 5, 7, 0, 0);
        expect(getDateString(date)).toBe("02.01.2026 5:07");
    });

    it("formats UTC dates as dd.mm.yyyy h:mm with zero-padded day/month/minutes", () => {
        const date = new Date(Date.UTC(2026, 10, 9, 4, 3, 0, 0));
        expect(getUTCDateString(date)).toBe("09.11.2026 4:03");
    });
});
