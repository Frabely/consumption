import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/firebase/functions", () => ({
  getCars: vi.fn(),
  getHouses: vi.fn(),
  getLoadingStations: vi.fn(),
}));

describe("constantData", () => {
  beforeEach(async () => {
    vi.resetModules();
  });

  it("ensureCarsLoaded returns cached cars without fetching", async () => {
    const constantData = await import("@/constants/constantData");
    constantData.cars.splice(0, constantData.cars.length, {
      name: "Zoe",
      kilometer: 12000,
      prevKilometer: 11900,
    });

    const getCarsFn = vi.fn();
    const result = await constantData.ensureCarsLoaded({ getCarsFn });

    expect(getCarsFn).not.toHaveBeenCalled();
    expect(result).toHaveLength(1);
    expect(result[0]?.name).toBe("Zoe");
  });

  it("ensureCarsLoaded fetches and stores cars when cache is empty", async () => {
    const constantData = await import("@/constants/constantData");
    constantData.cars.splice(0, constantData.cars.length);

    const getCarsFn = vi.fn().mockResolvedValue([
      { name: "BMW", kilometer: 45000, prevKilometer: 44900 },
    ]);

    const result = await constantData.ensureCarsLoaded({ getCarsFn });

    expect(getCarsFn).toHaveBeenCalledTimes(1);
    expect(result).toHaveLength(1);
    expect(constantData.cars[0]?.name).toBe("BMW");
  });

  it("loadMainPageData sets loading stations, cars and default car", async () => {
    const constantData = await import("@/constants/constantData");

    const resultStations = [{ id: "s1", name: "carport" }];
    const resultCars = [
      { name: "BMW", kilometer: 45000, prevKilometer: 44900 },
      { name: "Zoe", kilometer: 12000, prevKilometer: 11900 },
    ];

    const { getLoadingStations, getCars } = await import("@/firebase/functions");
    vi.mocked(getLoadingStations).mockResolvedValueOnce(resultStations as never);
    vi.mocked(getCars).mockResolvedValueOnce(resultCars as never);

    await constantData.loadMainPageData();

    expect(constantData.loadingStations).toEqual(resultStations);
    expect(constantData.cars).toEqual(resultCars);
    expect(constantData.DEFAULT_CAR.name).toBe("Zoe");
  });
});
