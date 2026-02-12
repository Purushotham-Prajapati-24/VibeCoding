
/**
 * Simple Pendulum Physics Engine
 * Calculates period and frequency based on length and gravity.
 * T = 2π√(L/g)
 */

export const INITIAL_PENDULUM_STATE = {
    length: 1, // meters
    mass: 1, // kg
    gravity: 9.81, // m/s^2
    amplitude: 15, // degrees
    damping: 0 // coeff
};

export const calculatePendulum = (params) => {
    const { length, gravity, amplitude } = params;

    const L = Math.max(0.1, parseFloat(length) || 1);
    const g = Math.max(0.1, parseFloat(gravity) || 9.81);

    // Period T = 2 * PI * sqrt(L/g)
    const period = 2 * Math.PI * Math.sqrt(L / g);

    // Frequency f = 1/T
    const frequency = 1 / period;

    // Angular Frequency omega = sqrt(g/L)
    const angularFreq = Math.sqrt(g / L);

    return {
        period: parseFloat(period.toFixed(2)),
        frequency: parseFloat(frequency.toFixed(2)),
        angularFreq: parseFloat(angularFreq.toFixed(2)),
        // Max speed at bottom (approx for small angles) v_max = sqrt(2gh) where h = L(1-cos(theta))
        // But let's just return key metrics for now
        kineticEnergyMax: 0 // To be impl
    };
};
