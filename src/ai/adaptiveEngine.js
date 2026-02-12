/**
 * Adaptive Engine
 * Manages difficulty scaling and personalized explanations.
 */

const DIFFICULTY_LEVELS = ['beginner', 'intermediate', 'advanced'];

export const calculateMastery = (history) => {
    if (!history || history.length === 0) return { level: 'beginner', score: 0 };

    const correct = history.filter(h => h.correct).length;
    const score = (correct / history.length) * 100;

    let level = 'beginner';
    if (score > 80 && history.length > 5) level = 'advanced';
    else if (score > 50 && history.length > 3) level = 'intermediate';

    return { level, score };
};

export const getExplanation = (conceptId, userLevel) => {
    // This would typically fetch from a larger database or LLM
    // For now, we use a static mapping
    const Explanations = {
        "projectile_motion": {
            beginner: "It's like throwing a ball. Gravity pulls it down while it moves forward.",
            intermediate: "Projectile motion is a combination of constant horizontal velocity and vertical acceleration due to gravity.",
            advanced: "The trajectory is a parabola defined by y = x tan(θ) - (gx² / 2v₀²cos²(θ)). The horizontal and vertical motions are independent."
        },
        "energy_conservation": {
            beginner: "Energy isn't lost, it just changes form. Speed turns into height, and height turns back into speed.",
            intermediate: "Kinetic Energy (motion) converts to Potential Energy (height) and back. Total Mechanical Energy remains constant.",
            advanced: "E = K + U = ½mv² + mgh. In the absence of non-conservative forces like air drag, dE/dt = 0."
        }
    };

    const concept = Explanations[conceptId] || Explanations["projectile_motion"];
    return concept[userLevel] || concept['beginner'];
};
