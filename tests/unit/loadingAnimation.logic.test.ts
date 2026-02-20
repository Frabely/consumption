import { describe, expect, it } from "vitest";
import {
  angularDistance,
  buildInitialLoadingSlots,
  LOADING_INITIAL_VISIBLE_SLOT_COUNT,
  LOADING_RESPAWN_DELAY_MS,
  LOADING_SLOT_COUNT,
  LOADING_START_ANGLE_RAD,
  normalizeAngle,
  updateLoadingSlots,
} from "@/components/features/home/Loading/Loading.logic";

describe("loading animation logic", () => {
  it("normalizes angles to the [0, 2π) range", () => {
    const fullCircle = Math.PI * 2;
    expect(normalizeAngle(fullCircle + 0.5)).toBeCloseTo(0.5);
    expect(normalizeAngle(-0.5)).toBeCloseTo(fullCircle - 0.5);
  });

  it("computes shortest angular distance", () => {
    const left = 0;
    const right = Math.PI * 1.75;
    expect(angularDistance(left, right)).toBeCloseTo(Math.PI * 0.25);
  });

  it("builds initial slots with fixed visible half-ring ahead of car", () => {
    const slots = buildInitialLoadingSlots();
    expect(slots).toHaveLength(LOADING_SLOT_COUNT);

    const visibleSlots = slots.filter((slot) => slot.isActive);
    expect(visibleSlots).toHaveLength(LOADING_INITIAL_VISIBLE_SLOT_COUNT);

    expect(slots[0].isActive).toBe(false);
    expect(slots[1].isActive).toBe(true);
    expect(slots[LOADING_INITIAL_VISIBLE_SLOT_COUNT].isActive).toBe(true);
    expect(slots[LOADING_INITIAL_VISIBLE_SLOT_COUNT + 1].isActive).toBe(false);
  });

  it("deactivates consumed dot and schedules respawn on opposite side", () => {
    const nowMs = 1_000;
    const slots = buildInitialLoadingSlots();

    const updated = updateLoadingSlots({
      slots,
      carAngleRad: LOADING_START_ANGLE_RAD + (Math.PI * 2) / LOADING_SLOT_COUNT,
      nowMs,
    });

    expect(updated[1].isActive).toBe(false);

    const scheduledRespawnSlots = updated.filter(
      (slot, index) => index !== 1 && slot.respawnAtMs === nowMs + LOADING_RESPAWN_DELAY_MS,
    );
    expect(scheduledRespawnSlots).toHaveLength(1);
  });

  it("reactivates inactive dots after respawn delay elapsed", () => {
    const nowMs = 1_000;
    const slots = buildInitialLoadingSlots();
    const slotIndex = LOADING_SLOT_COUNT - 1;
    slots[slotIndex] = {
      ...slots[slotIndex],
      isActive: false,
      respawnAtMs: nowMs,
    };

    const updated = updateLoadingSlots({
      slots,
      carAngleRad: LOADING_START_ANGLE_RAD,
      nowMs,
    });

    expect(updated[slotIndex].isActive).toBe(true);
    expect(updated[slotIndex].respawnAtMs).toBe(0);
  });
});
