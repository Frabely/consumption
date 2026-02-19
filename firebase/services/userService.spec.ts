import {beforeEach, describe, expect, it, vi} from "vitest";
import {Role} from "@/constants/enums";

const firestoreMocks = vi.hoisted(() => ({
    collection: vi.fn(),
    query: vi.fn(),
    where: vi.fn(),
    getDocs: vi.fn()
}));

vi.mock("@firebase/firestore", () => firestoreMocks);
vi.mock("@/firebase/db", () => ({db: {}}));

describe("userService", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("returns user with mapped role when query returns a matching doc", async () => {
        const firstDoc = {
            get: vi.fn((key: string) => {
                if (key === "key") return "1234";
                if (key === "name") return "Moritz";
                if (key === "role") return Role.Admin;
                if (key === "defaultCar") return "Zoe";
                return undefined;
            })
        };
        firestoreMocks.getDocs.mockResolvedValue({empty: false, docs: [firstDoc]});

        const {checkUserId} = await import("./userService");
        const result = await checkUserId("1234");

        expect(result).toEqual({
            key: "1234",
            name: "Moritz",
            role: Role.Admin,
            defaultCar: "Zoe"
        });
    });

    it("returns undefined when query fails", async () => {
        firestoreMocks.getDocs.mockRejectedValue(new Error("firestore down"));

        const {checkUserId} = await import("./userService");
        const result = await checkUserId("1234");

        expect(result).toBeUndefined();
    });
});
