
/**
 * Projectile Motion Physics Engine
 * Calculates trajectory, range, height, and time of flight.
 */

export const INITIAL_PROJECTILE_STATE = {
    initialVelocity: 20, // m/s
    angle: 45, // degrees
    gravity: 9.81, // m/s^2
    height: 0, // launch height
    drag: 0 // coeff
};

export const calculateProjectile = (params) => {
    const { initialVelocity, angle, gravity, height = 0 } = params;

    // Validation
    const v0 = Math.max(0, parseFloat(initialVelocity) || 0);
    const ang = parseFloat(angle) || 0;
    const g = Math.max(0.1, parseFloat(gravity) || 9.81);
    const h0 = parseFloat(height) || 0;

    const rad = (ang * Math.PI) / 180;
    const vx = v0 * Math.cos(rad);
    const vy = v0 * Math.sin(rad);

    // Time to Apex (vf_y = 0) -> vy - gt = 0 -> t = vy/g
    const timeToApex = vy / g;

    // Total Flight Time (y = h0 + vyt - 0.5gt^2 = 0)
    // -0.5gt^2 + vyt + h0 = 0
    // Quadratic formula: t = (-b +/- sqrt(b^2 - 4ac)) / 2a
    // a = -0.5g, b = vy, c = h0
    const A = -0.5 * g;
    const B = vy;
    const C = h0;

    let totalTime = 0;
    if (g > 0) {
        const discriminant = B * B - 4 * A * C;
        if (discriminant >= 0) {
            const t1 = (-B + Math.sqrt(discriminant)) / (2 * A);
            const t2 = (-B - Math.sqrt(discriminant)) / (2 * A);
            totalTime = Math.max(t1, t2);
        }
    }

    // Max Height (at apex time)
    // h_max = h0 + vy*t_apex - 0.5*g*t_apex^2
    const maxHeight = h0 + (vy * timeToApex) - (0.5 * g * timeToApex * timeToApex);

    // Range
    const range = vx * totalTime;

    return {
        timeOfFlight: parseFloat(totalTime.toFixed(2)),
        maxHeight: parseFloat(maxHeight.toFixed(2)),
        range: parseFloat(range.toFixed(2)),
        vx: parseFloat(vx.toFixed(2)),
        vy: parseFloat(vy.toFixed(2)),
        timeToApex: parseFloat(timeToApex.toFixed(2))
    };
};
