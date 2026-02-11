/**
 * usePhysicsTimeline — Pre-computes trajectory data for Remotion compositions.
 * Takes simulation params, returns frame-indexed trajectory + key moments.
 */
import { useMemo } from 'react';
import {
    computeFullTrajectory,
    findApexFrame,
    findLandingFrame,
    estimateFlightTime,
} from '../../physics/projectileFrameEngine';

const DEFAULT_FPS = 30;
const TIME_PADDING = 0.5; // extra seconds after landing

export function usePhysicsTimeline({ v0, angle, gravity, drag = 0, fps = DEFAULT_FPS }) {
    return useMemo(() => {
        const flightTime = estimateFlightTime(v0, angle, gravity);
        const totalTime = flightTime + TIME_PADDING;
        const totalFrames = Math.ceil(totalTime * fps);

        const trajectory = computeFullTrajectory(fps, totalFrames, v0, angle, gravity, drag);
        const noDragTrajectory = drag > 0
            ? computeFullTrajectory(fps, totalFrames, v0, angle, gravity, 0)
            : null;

        const apexFrame = findApexFrame(trajectory);
        const landingFrame = findLandingFrame(trajectory);

        const getStateAtFrame = (frame) => {
            const idx = Math.max(0, Math.min(frame, trajectory.length - 1));
            return trajectory[idx];
        };

        // Find max values for scaling
        let maxX = 0, maxY = 0;
        for (const p of trajectory) {
            if (p.x > maxX) maxX = p.x;
            if (p.y > maxY) maxY = p.y;
        }
        if (noDragTrajectory) {
            for (const p of noDragTrajectory) {
                if (p.x > maxX) maxX = p.x;
                if (p.y > maxY) maxY = p.y;
            }
        }

        return {
            trajectory,
            noDragTrajectory,
            apexFrame,
            landingFrame,
            totalFrames,
            totalTime,
            maxX,
            maxY,
            getStateAtFrame,
        };
    }, [v0, angle, gravity, drag, fps]);
}
