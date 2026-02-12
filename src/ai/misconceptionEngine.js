/**
 * Misconception Engine
 * Detects common physics misunderstandings based on user predictions vs actual outcomes.
 */

const MISCONCEPTIONS = [
    {
        id: "mass_affects_fall",
        trigger: (userPred, actual) => {
            // User predicted heavier object falls faster (time is lower)
            // But actual time is same (independent of mass)
            return userPred.time < actual.time && userPred.mass > 1;
        },
        correction: "Common Myth: Heavier objects do NOT fall faster.",
        explanation: "In a vacuum (or neglecting air resistance), gravity accelerates all objects equally regardless of mass. Galileo proved this at the Leaning Tower of Pisa!",
        level: "beginner"
    },
    {
        id: "apex_velocity_zero",
        trigger: (userPred, actual) => {
            // User thinks velocity is 0 at flight apex
            // This is tricky to capture via simple inputs, usually captured via Q&A
            return false;
        },
        correction: "At the top, vertical velocity is zero, but horizontal velocity remains!",
        explanation: "Gravity only affects the vertical component. The ball keeps moving forward at a constant speed.",
        level: "intermediate"
    },
    {
        id: "gravity_stops_at_apex",
        trigger: (userPred, actual) => {
            // User assumes acceleration turns off at top
            return false;
        },
        correction: "Gravity never turns off.",
        explanation: "Acceleration due to gravity is constant (9.81 m/s²) and always points downward, even when the object is momentarily stopped at the peak.",
        level: "advanced"
    }
];

/**
 * Analyzes a user's prediction against the simulation result.
 * @param {object} prediction - User's inputs (mass, assumption, etc.)
 * @param {object} outcome - Actual simulation results
 * @returns {object|null} - Misconception data or null
 */
export const analyzeMisconception = (prediction, outcome) => {
    for (const rule of MISCONCEPTIONS) {
        if (rule.trigger(prediction, outcome)) {
            return {
                isMisconception: true,
                ...rule
            };
        }
    }
    return null;
};
