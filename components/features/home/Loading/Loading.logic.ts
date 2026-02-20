import type {Translations} from "@/i18n/types";

export const buildLoadingText = (language: Translations): string => `${language.displayLabels.loading}...`;

export const LOADING_SLOT_COUNT = 8;
export const LOADING_INITIAL_VISIBLE_SLOT_COUNT = 5;
export const LOADING_VISIBILITY_DELAY_MS = 200;
export const LOADING_START_ANGLE_RAD = Math.PI * 0.34;
export const LOADING_ORBIT_SPEED_RAD_PER_SEC = 3.6;
export const LOADING_EAT_THRESHOLD_RAD = 0.17;
export const LOADING_RESPAWN_DELAY_MS = 90;

export type LoadingSlot = {
    index: number;
    angle: number;
    isActive: boolean;
    respawnAtMs: number;
};

/**
 * Normalizes an angle value into the [0, 2π) range.
 * @param angleRad Angle in radians.
 * @returns Normalized angle in radians.
 */
export const normalizeAngle = (angleRad: number): number => {
    const fullCircle = Math.PI * 2;
    let normalized = angleRad % fullCircle;
    if (normalized < 0) {
        normalized += fullCircle;
    }
    return normalized;
};

/**
 * Computes the shortest angular distance between two angles.
 * @param aRad First angle in radians.
 * @param bRad Second angle in radians.
 * @returns Absolute shortest angular distance in radians.
 */
export const angularDistance = (aRad: number, bRad: number): number => {
    const fullCircle = Math.PI * 2;
    let distance = Math.abs(normalizeAngle(aRad) - normalizeAngle(bRad));
    if (distance > Math.PI) {
        distance = fullCircle - distance;
    }
    return distance;
};

/**
 * Builds initial orbit slots with a fixed visible half-ring in front of the car.
 * @returns Initialized loading slots.
 */
export const buildInitialLoadingSlots = (): LoadingSlot[] => {
    const slots: LoadingSlot[] = [];
    for (let index = 0; index < LOADING_SLOT_COUNT; index++) {
        const angle = normalizeAngle(LOADING_START_ANGLE_RAD + (Math.PI * 2 * index) / LOADING_SLOT_COUNT);
        slots.push({
            index,
            angle,
            isActive: index > 0 && index <= LOADING_INITIAL_VISIBLE_SLOT_COUNT,
            respawnAtMs: 0
        });
    }
    return slots;
};

/**
 * Resolves the next inactive slot index starting from a preferred index.
 * @param slots Current slot states.
 * @param startIndex Preferred start index.
 * @returns Inactive slot index or null when no inactive slot is available.
 */
const findInactiveSlotIndex = (slots: LoadingSlot[], startIndex: number): number | null => {
    for (let step = 0; step < LOADING_SLOT_COUNT; step++) {
        const index = (startIndex + step) % LOADING_SLOT_COUNT;
        if (!slots[index]?.isActive) {
            return index;
        }
    }
    return null;
};

/**
 * Applies one animation step for dot-consume/respawn behaviour.
 * @param slots Current slot states.
 * @param carAngleRad Current car angle in radians.
 * @param nowMs Current timestamp in milliseconds.
 * @returns Updated slot list after processing consume/respawn.
 */
export const updateLoadingSlots = ({
    slots,
    carAngleRad,
    nowMs
}: {
    slots: LoadingSlot[];
    carAngleRad: number;
    nowMs: number;
}): LoadingSlot[] => {
    const nextSlots = slots.map((slot) => ({...slot}));

    for (const slot of nextSlots) {
        if (!slot.isActive && slot.respawnAtMs > 0 && nowMs >= slot.respawnAtMs) {
            slot.isActive = true;
            slot.respawnAtMs = 0;
        }

        if (!slot.isActive || angularDistance(slot.angle, carAngleRad) >= LOADING_EAT_THRESHOLD_RAD) {
            continue;
        }

        slot.isActive = false;
        const oppositeIndex = (slot.index + LOADING_SLOT_COUNT / 2) % LOADING_SLOT_COUNT;
        const targetIndex = findInactiveSlotIndex(nextSlots, oppositeIndex);
        if (targetIndex !== null) {
            const target = nextSlots[targetIndex];
            target.respawnAtMs = Math.max(target.respawnAtMs, nowMs + LOADING_RESPAWN_DELAY_MS);
        }
    }

    return nextSlots;
};

