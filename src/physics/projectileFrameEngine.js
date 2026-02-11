/**
 * Frame-based physics engine for Remotion compositions.
 * Stateless, pure functions — no mutation, no class.
 * Computes projectile state at any given time or frame.
 */

/**
 * Compute projectile state at a given time t.
 * Uses analytical solution (no drag) or numerical integration (with drag).
 */
export function computeStateAtTime(t, v0, angleDeg, gravity, drag = 0) {
    const angleRad = (angleDeg * Math.PI) / 180;
    const vx0 = v0 * Math.cos(angleRad);
    const vy0 = v0 * Math.sin(angleRad);

    if (drag <= 0) {
        // Analytical (exact) solution — no drag
        const x = vx0 * t;
        const y = Math.max(0, vy0 * t - 0.5 * gravity * t * t);
        const vx = vx0;
        const vy = vy0 - gravity * t;
        const speed = Math.sqrt(vx * vx + vy * vy);
        return { t, x, y, vx, vy, speed };
    }

    // Numerical integration with quadratic drag (same model as realtime engine)
    const dt = 1 / 300; // Fine step for accuracy
    let x = 0, y = 0, vx = vx0, vy = vy0;
    let elapsed = 0;

    while (elapsed < t) {
        const step = Math.min(dt, t - elapsed);
        const spd = Math.sqrt(vx * vx + vy * vy);
        let ax = 0;
        let ay = -gravity;

        if (drag > 0 && spd > 0.001) {
            ax -= drag * spd * vx;
            ay -= drag * spd * vy;
        }

        vx += ax * step;
        vy += ay * step;
        x += vx * step;
        y += vy * step;
        elapsed += step;

        if (y <= 0 && elapsed > 0.01) {
            y = 0;
            vx = 0;
            vy = 0;
            break;
        }
    }

    const speed = Math.sqrt(vx * vx + vy * vy);
    return { t: elapsed, x, y, vx, vy, speed };
}

/**
 * Pre-compute the full trajectory for all frames.
 * Returns an array of states, one per frame.
 */
export function computeFullTrajectory(fps, durationFrames, v0, angleDeg, gravity, drag = 0) {
    const trajectory = [];
    for (let f = 0; f <= durationFrames; f++) {
        const t = f / fps;
        trajectory.push({ frame: f, ...computeStateAtTime(t, v0, angleDeg, gravity, drag) });
    }
    return trajectory;
}

/**
 * Find the frame index where the projectile reaches maximum height.
 */
export function findApexFrame(trajectory) {
    let maxY = -Infinity;
    let apexIdx = 0;
    for (let i = 0; i < trajectory.length; i++) {
        if (trajectory[i].y > maxY) {
            maxY = trajectory[i].y;
            apexIdx = i;
        }
    }
    return apexIdx;
}

/**
 * Find the frame index where the projectile lands (y ≈ 0 after launch).
 */
export function findLandingFrame(trajectory) {
    for (let i = 2; i < trajectory.length; i++) {
        if (trajectory[i].y <= 0) return i;
    }
    return trajectory.length - 1;
}

/**
 * Compute kinetic, potential, and total energy at a given state.
 */
export function computeEnergy(state, gravity, mass = 1) {
    const kinetic = 0.5 * mass * state.speed * state.speed;
    const potential = mass * gravity * state.y;
    return {
        kinetic,
        potential,
        total: kinetic + potential,
    };
}

/**
 * Estimate total flight time (no drag, analytical).
 */
export function estimateFlightTime(v0, angleDeg, gravity) {
    const angleRad = (angleDeg * Math.PI) / 180;
    return (2 * v0 * Math.sin(angleRad)) / gravity;
}
