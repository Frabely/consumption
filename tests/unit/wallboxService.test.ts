import { describe, expect, it, vi } from "vitest";

import { getCurrentWallboxSession } from "@/services/wallboxService";

const FIXED_NOW = new Date("2026-03-23T12:00:00.000Z");
const MIN_END_OFFSET_MINUTES = 2;
const MAX_END_OFFSET_MINUTES = 15;
const MIN_CHARGING_DURATION_MINUTES = 20;
const MAX_CHARGING_DURATION_MINUTES = 480;
const MILLISECONDS_PER_MINUTE = 60 * 1000;

describe("wallboxService", () => {
  it("returns a deterministic mock session when randomness is pinned to the minimum", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(FIXED_NOW);

    const randomSpy = vi
      .spyOn(Math, "random")
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(0);

    const result = await getCurrentWallboxSession();

    expect(result).toEqual({
      reportId: 100,
      kWh: 0.77,
      started: new Date(
        FIXED_NOW.getTime() -
          (MIN_END_OFFSET_MINUTES + MIN_CHARGING_DURATION_MINUTES) *
            MILLISECONDS_PER_MINUTE,
      ),
      ended: new Date(
        FIXED_NOW.getTime() - MIN_END_OFFSET_MINUTES * MILLISECONDS_PER_MINUTE,
      ),
      CardId: "ca598b0b00000000",
    });

    expect(randomSpy).toHaveBeenCalledTimes(3);
  });

  it("returns a recent session with plausible timing and energy values", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(FIXED_NOW);

    const result = await getCurrentWallboxSession();
    const now = FIXED_NOW.getTime();
    const endOffset = now - result.ended.getTime();
    const chargingDuration = result.ended.getTime() - result.started.getTime();

    expect(result.reportId).toBe(100);
    expect(result.CardId).toBe("ca598b0b00000000");
    expect(result.started).toBeInstanceOf(Date);
    expect(result.ended).toBeInstanceOf(Date);
    expect(result.kWh).toBeGreaterThan(0);
    expect(result.kWh).toBeLessThan(99.9);
    expect(result.ended.getTime()).toBeLessThan(now);
    expect(endOffset).toBeGreaterThanOrEqual(
      MIN_END_OFFSET_MINUTES * MILLISECONDS_PER_MINUTE,
    );
    expect(endOffset).toBeLessThanOrEqual(
      MAX_END_OFFSET_MINUTES * MILLISECONDS_PER_MINUTE,
    );
    expect(result.started.getTime()).toBeLessThan(result.ended.getTime());
    expect(chargingDuration).toBeGreaterThanOrEqual(
      MIN_CHARGING_DURATION_MINUTES * MILLISECONDS_PER_MINUTE,
    );
    expect(chargingDuration).toBeLessThanOrEqual(
      MAX_CHARGING_DURATION_MINUTES * MILLISECONDS_PER_MINUTE,
    );
  });
});
