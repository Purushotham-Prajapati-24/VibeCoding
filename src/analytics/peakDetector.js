/**
 * peakDetector.js — Detects key moments in a simulation history.
 * Returns event objects: { type, index, time, state }
 */

/**
 * Detect all key moments from a history array.
 */
export function detectMoments(history) {
    if (!history || history.length < 3) return [];

    const moments = [];
    let apexFound = false;

    for (let i = 1; i < history.length; i++) {
        const prev = history[i - 1];
        const cur = history[i];

        // Apex: vy sign changes from positive to negative
        if (!apexFound && prev.vy > 0 && cur.vy <= 0) {
            apexFound = true;
            moments.push({
                type: 'apex',
                index: i,
                time: cur.t,
                state: cur,
                label: '🏔 APEX',
                description: 'Vertical velocity = 0. Maximum height reached.',
            });
        }

        // Impact: y reaches ground after being airborne
        if (i > 2 && prev.y > 0.1 && cur.y <= 0.01) {
            moments.push({
                type: 'impact',
                index: i,
                time: cur.t,
                state: cur,
                label: '🎯 IMPACT',
                description: `Projectile lands at ${cur.x.toFixed(1)}m range.`,
            });
        }
    }

    return moments;
}

/**
 * Check if current simulation index is near a key moment.
 * Returns the moment object or null.
 */
export function checkNearMoment(moments, currentIndex, tolerance = 3) {
    for (const m of moments) {
        if (Math.abs(currentIndex - m.index) <= tolerance) {
            return m;
        }
    }
    return null;
}
