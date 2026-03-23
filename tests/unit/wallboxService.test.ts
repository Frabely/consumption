import { describe, expect, it, vi } from "vitest";

import {
  getLatestCarportWallboxSession,
  getLatestEntranceWallboxSession,
  resolveWallboxSessionEndpoint,
} from "@/services/wallboxService";

describe("wallboxService", () => {
  it("fetches the latest entrance session and converts millisecond timestamps to Date", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        reportId: 102,
        kWh: 4089.6,
        started: 1774263256033,
        ended: 1774269951033,
        CardId: "047c337ada488000",
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await getLatestEntranceWallboxSession();

    expect(fetchMock).toHaveBeenCalledWith(
      "https://f233.ahecht.de/api/v1/sessions/entrance/latest",
      { cache: "no-store" },
    );
    expect(result).toEqual({
      reportId: 102,
      kWh: 4.0896,
      started: new Date(1774263256033),
      ended: new Date(1774269951033),
      CardId: "047c337ada488000",
    });
  });

  it("fetches the latest carport session via the station-specific helper", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        reportId: 101,
        kWh: 12.5,
        started: 1774260000,
        ended: 1774263600,
        CardId: "carport-card",
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await getLatestCarportWallboxSession();

    expect(fetchMock).toHaveBeenCalledWith(
      "https://f233.ahecht.de/api/v1/sessions/carport/latest",
      { cache: "no-store" },
    );
    expect(result.kWh).toBe(0.0125);
    expect(result.started).toEqual(new Date(1774260000 * 1000));
    expect(result.ended).toEqual(new Date(1774263600 * 1000));
  });

  it("throws when the wallbox API responds with a non-success status", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 503,
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(getLatestEntranceWallboxSession()).rejects.toThrow(
      "Wallbox session request failed with status 503",
    );
  });

  it("resolves absolute endpoint paths for each wallbox station", () => {
    expect(resolveWallboxSessionEndpoint("entrance")).toBe(
      "https://f233.ahecht.de/api/v1/sessions/entrance/latest",
    );
    expect(resolveWallboxSessionEndpoint("carport")).toBe(
      "https://f233.ahecht.de/api/v1/sessions/carport/latest",
    );
  });
});
