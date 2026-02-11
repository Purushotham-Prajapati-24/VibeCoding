/**
 * differenceCalculator.js — Pure functions for comparing two simulation states.
 */

/**
 * Compute percentage difference: (B - A) / A * 100
 * Returns 0 if A is 0 to avoid division by zero.
 */
export function pctDiff(a, b) {
    if (Math.abs(a) < 0.001) return 0;
    return ((b - a) / Math.abs(a)) * 100;
}

/**
 * Extract final stats from a simulation history array.
 */
export function extractStats(history) {
    if (!history || history.length < 2) {
        return { range: 0, maxHeight: 0, flightTime: 0, impactSpeed: 0 };
    }
    let maxHeight = 0;
    for (const p of history) {
        if (p.y > maxHeight) maxHeight = p.y;
    }
    const last = history[history.length - 1];
    const impactSpeed = Math.sqrt((last.vx || 0) ** 2 + (last.vy || 0) ** 2);
    return {
        range: last.x || 0,
        maxHeight,
        flightTime: last.t || 0,
        impactSpeed,
    };
}

/**
 * Compute full difference report between two worlds.
 */
export function computeDifferences(histA, histB) {
    const a = extractStats(histA);
    const b = extractStats(histB);
    return {
        a, b,
        rangeDiff: pctDiff(a.range, b.range),
        heightDiff: pctDiff(a.maxHeight, b.maxHeight),
        timeDiff: pctDiff(a.flightTime, b.flightTime),
        impactDiff: pctDiff(a.impactSpeed, b.impactSpeed),
    };
}

/**
 * Compute kinetic and potential energy.
 */
export function computeEnergy(state, gravity, mass = 1) {
    const speed = Math.sqrt((state.vx || 0) ** 2 + (state.vy || 0) ** 2);
    const ke = 0.5 * mass * speed * speed;
    const pe = mass * gravity * Math.max(0, state.y || 0);
    return { ke, pe, total: ke + pe };
}
