/**
 * Learning Tracker
 * Handles persistence and analysis of user learning progress.
 */

const STORAGE_KEY = 'physics_tutor_history';
const PREFS_KEY = 'physics_tutor_prefs';

export const saveSession = (history) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (e) {
        console.error("Failed to save learning history", e);
    }
};

export const loadHistory = () => {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch (e) {
        console.error("Failed to load learning history", e);
        return [];
    }
};

export const clearHistory = () => {
    localStorage.removeItem(STORAGE_KEY);
};

export const getTopicStats = (history) => {
    if (!history) return {};

    // Group by topic/variable
    const stats = history.reduce((acc, entry) => {
        const topic = entry.variable || 'general';
        if (!acc[topic]) acc[topic] = { total: 0, correct: 0 };
        acc[topic].total++;
        if (entry.correct) acc[topic].correct++;
        return acc;
    }, {});

    // Calculate percentages
    Object.keys(stats).forEach(topic => {
        stats[topic].accuracy = Math.round((stats[topic].correct / stats[topic].total) * 100);
    });

    return stats;
};

export const getMisconceptionFrequency = (history) => {
    if (!history) return {};

    return history.reduce((acc, entry) => {
        if (!entry.correct && entry.misconception) {
            const id = entry.misconception.id;
            if (!acc[id]) acc[id] = { count: 0, name: entry.misconception.name };
            acc[id].count++;
        }
        return acc;
    }, {});
};
