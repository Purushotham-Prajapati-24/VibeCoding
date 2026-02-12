/**
 * Misconception Engine
 * Detects common physics misunderstandings based on user predictions vs actual outcomes.
 */

/**
 * Misconception Engine
 * Detects common physics misunderstandings based on user predictions vs actual outcomes.
 */

export const MISCONCEPTIONS = [
    {
        id: "mass_affects_fall",
        name: "Mass Dependency Myth",
        trigger: (prediction, actual) => {
            // User believes heavier objects fall faster
            // Prediction: Higher mass -> Lower time of flight
            // Actual: Mass has no effect on time of flight (in vacuum)
            if (!prediction.mass || !prediction.timeOfFlight) return false;
            return prediction.mass > 10 && prediction.timeOfFlight < actual.timeOfFlight * 0.9;
        },
        correction: "Heavier objects do NOT fall faster.",
        explanation: "In the absence of air resistance, gravity accelerates all objects at the same rate (9.81 m/s²), regardless of their mass.",
        severity: "high"
    },
    {
        id: "apex_velocity_zero",
        name: "Zero Velocity at Apex",
        trigger: (prediction, actual) => {
            // User predicts 0 speed at the top
            // Actual: Vx is constant non-zero
            if (prediction.speedAtApex === undefined) return false;
            return prediction.speedAtApex === 0 && actual.vx > 0.1;
        },
        correction: "Velocity is NOT zero at the top!",
        explanation: "Vertical velocity is zero, but the object is still moving horizontally. The total speed is equal to the initial horizontal velocity.",
        severity: "medium"
    },
    {
        id: "acceleration_at_apex",
        name: "Zero Acceleration at Apex",
        trigger: (prediction, actual) => {
            // User thinks gravity turns off at the top
            if (prediction.accelerationAtApex === undefined) return false;
            return prediction.accelerationAtApex === 0;
        },
        correction: "Gravity never turns off.",
        explanation: "Acceleration due to gravity is constant and always points downward, even when the object is momentarily stopped vertically.",
        severity: "high"
    },
    {
        id: "horizontal_force",
        name: "Impetus Theory",
        trigger: (prediction, actual) => {
            // User thinks a force is required to keep it moving horizontally
            // Harder to detect via simple numbers, usually text or force vector selection context
            return false;
        },
        correction: "No horizontal force is needed.",
        explanation: "Once launched, no force pushes the object forward. It continues due to inertia (Newton's First Law).",
        severity: "medium"
    },
    {
        id: "45_degree_optimal",
        name: "45 Degree Myth",
        trigger: (prediction, actual) => {
            // User thinks 45 degrees is ALWAYS max range, even with height difference
            // Actual: If launch height > 0, optimal angle < 45
            if (!prediction.optimalAngle) return false;
            return Math.abs(prediction.optimalAngle - 45) < 1 && actual.optimalAngle < 44;
        },
        correction: "45° is only optimal on level ground.",
        explanation: "When launching from a cliff, the optimal angle is less than 45° because you want to maximize horizontal speed while you have extra time to fall.",
        severity: "advanced"
    }
];

/**
 * Analyzes a user's prediction against the simulation result.
 * @param {object} prediction - User's inputs { timeOfFlight, speedAtApex, mass, ... }
 * @param {object} actual - Actual values { timeOfFlight, vx, optimalAngle, ... }
 * @returns {object|null} - The detected misconception object or null
 */
export const analyzeMisconception = (prediction, actual) => {
    for (const rule of MISCONCEPTIONS) {
        try {
            if (rule.trigger(prediction, actual)) {
                return {
                    isMisconception: true,
                    ...rule
                };
            }
        } catch (e) {
            console.warn(`Error evaluation misconception rule ${rule.id}`, e);
        }
    }
    return null;
};

