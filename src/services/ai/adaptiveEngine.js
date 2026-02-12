/**
 * Adaptive Engine
 * Manages difficulty scaling and personalized explanations.
 */

const DIFFICULTY_LEVELS = ['beginner', 'intermediate', 'advanced'];

export const calculateMastery = (history) => {
    if (!history || history.length === 0) return { level: 'beginner', score: 0 };

    // Weight recent attempts more heavily
    const recentHistory = history.slice(-5);
    const recentScore = recentHistory.filter(h => h.correct).length / recentHistory.length;

    // Overall score
    const totalScore = history.filter(h => h.correct).length / history.length;

    // Combined Score (70% recent, 30% overall)
    const weightedScore = (recentScore * 0.7) + (totalScore * 0.3) * 100;

    let level = 'beginner';
    if (weightedScore >= 80 && history.length >= 3) level = 'advanced';
    else if (weightedScore >= 50 && history.length >= 2) level = 'intermediate';

    return { level, score: Math.round(weightedScore) };
};

const CONCEPT_LIBRARY = {
    "projectile_motion": {
        beginner: "It's like throwing a ball. Gravity pulls it down while it keeps moving forward.",
        intermediate: "Projectile motion combines constant horizontal velocity with vertical acceleration due to gravity.",
        advanced: "The trajectory is a parabola defined by independent x(t) and y(t) equations. Horizontal acceleration is zero, vertical is -g."
    },
    "energy_conservation": {
        beginner: "Energy isn't lost, it just changes form. Speed turns into height, and height turns back into speed.",
        intermediate: "Kinetic Energy transforms into Potential Energy and back. The total Mechanical Energy stays the same.",
        advanced: "E = K + U = ½mv² + mgh = constant. In the absence of non-conservative forces like air drag, the time derivative dE/dt is zero."
    },
    "time_of_flight": {
        beginner: "How long it stays in the air depends ONLY on how fast you throw it UP.",
        intermediate: "Time of flight is determined solely by the initial vertical velocity and gravity. Horizontal speed doesn't matter.",
        advanced: "t = 2 * (v₀ * sin(θ)) / g. It's the time required for vertical velocity to go from +Vy to -Vy."
    },
    "max_height": {
        beginner: "The highest point depends on how much 'up' speed you give it.",
        intermediate: "Maximum height is reached when vertical velocity becomes zero. It depends on the square of the vertical velocity.",
        advanced: "H = (v₀ * sin(θ))² / 2g. It represents the conversion of all initial vertical kinetic energy into potential energy."
    },
    "range": {
        beginner: "How far it goes depends on both how fast and how high you throw it.",
        intermediate: "Range depends on both initial speed and angle. 45 degrees usually gives the best distance on flat ground.",
        advanced: "R = (v₀² * sin(2θ)) / g. Maximized at 45° for level ground, but requires dR/dθ = 0 analysis for uneven terrain."
    },
    "mass_independence": {
        beginner: "Heavy things and light things fall at the same speed if there's no air.",
        intermediate: "Gravity pulls harder on heavier objects, but they are also harder to move (inertia). These cancel out.",
        advanced: "F = ma and F = mg implies ma = mg, so a = g. Mass cancels out of the equation of motion entirely."
    },
    "independent_motion": {
        beginner: "Moving sideways doesn't stop it from falling.",
        intermediate: "Horizontal and vertical motions happen separately. A dropped ball hits the ground at the same time as a fired bullet.",
        advanced: "The vector equations of motion (x and y) are uncoupled because gravity acts only in the j-hat direction."
    }
};

export const getExplanation = (conceptId, userLevel) => {
    // Fallback to projectile_motion if concept not found
    const concept = CONCEPT_LIBRARY[conceptId] || CONCEPT_LIBRARY["projectile_motion"];
    return concept[userLevel] || concept['beginner'];
};

