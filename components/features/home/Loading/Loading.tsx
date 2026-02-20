import React, {useEffect, useRef, useState} from 'react';
import styles from './Loading.module.css'
import {
    buildInitialLoadingSlots,
    LOADING_ORBIT_SPEED_RAD_PER_SEC,
    LOADING_START_ANGLE_RAD,
    LOADING_VISIBILITY_DELAY_MS,
    LoadingSlot,
    normalizeAngle,
    updateLoadingSlots
} from "@/components/features/home/Loading/Loading.logic";

export default function Loading({}: LoadingProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [carAngleRad, setCarAngleRad] = useState(LOADING_START_ANGLE_RAD);
    const [slots, setSlots] = useState<LoadingSlot[]>(() => buildInitialLoadingSlots());
    const carAngleRef = useRef(LOADING_START_ANGLE_RAD);
    const slotsRef = useRef<LoadingSlot[]>(buildInitialLoadingSlots());

    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            setIsVisible(true);
        }, LOADING_VISIBILITY_DELAY_MS);

        return () => window.clearTimeout(timeoutId);
    }, []);

    useEffect(() => {
        slotsRef.current = slots;
    }, [slots]);

    useEffect(() => {
        if (!isVisible) {
            return;
        }

        let animationFrameId = 0;
        let lastTimestamp = performance.now();

        /**
         * Advances loading animation state and schedules the next frame.
         * @param nowMs Current high-resolution timestamp in milliseconds.
         * @returns No return value.
         */
        const tick = (nowMs: number): void => {
            const deltaSeconds = Math.min((nowMs - lastTimestamp) / 1000, 0.04);
            lastTimestamp = nowMs;

            const nextAngle = normalizeAngle(carAngleRef.current + LOADING_ORBIT_SPEED_RAD_PER_SEC * deltaSeconds);
            carAngleRef.current = nextAngle;
            setCarAngleRad(nextAngle);

            const nextSlots = updateLoadingSlots({
                slots: slotsRef.current,
                carAngleRad: nextAngle,
                nowMs
            });
            slotsRef.current = nextSlots;
            setSlots(nextSlots);

            animationFrameId = requestAnimationFrame(tick);
        };

        animationFrameId = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(animationFrameId);
    }, [isVisible]);

    /**
     * Resolves percentage-based orbit coordinates for a given angle.
     * @param angleRad Angle in radians.
     * @returns CSS percentage positions for orbit placement.
     */
    const resolveOrbitPosition = (angleRad: number): { left: string; top: string } => ({
        left: `${50 + Math.cos(angleRad) * 31}%`,
        top: `${45 + Math.sin(angleRad) * 31}%`
    });

    const carPosition = resolveOrbitPosition(carAngleRad);
    const carRotationDeg = (carAngleRad + Math.PI / 2) * (180 / Math.PI);

    return (
        <div className={styles.isLoadingContainer}>
            {isVisible ? (
                <div className={styles.isLoading}>
                    <div className={styles.dotLayer}>
                        {slots.map((slot) => {
                            const position = resolveOrbitPosition(slot.angle);
                            return (
                                <span
                                    key={slot.index}
                                    className={`${styles.dot} ${slot.isActive ? "" : styles.dotHidden}`}
                                    style={{left: position.left, top: position.top}}
                                />
                            );
                        })}
                    </div>
                    <div
                        className={styles.car}
                        style={{
                            left: carPosition.left,
                            top: carPosition.top,
                            transform: `translate(-50%, -50%) rotate(${carRotationDeg}deg)`
                        }}
                    >
                        <div className={styles.carShadow}></div>
                        <div className={styles.carRoof}></div>
                        <div className={styles.carWindowSplit}></div>
                        <div className={styles.carBody}></div>
                        <div className={`${styles.wheel} ${styles.wheelLeft}`}></div>
                        <div className={`${styles.wheel} ${styles.wheelRight}`}></div>
                    </div>
                </div>
            ) : null}
        </div>
    );
}

export type LoadingProps = {}
