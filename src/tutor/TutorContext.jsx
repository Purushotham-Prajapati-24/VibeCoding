import React, { createContext, useContext, useState, useEffect } from 'react';
import { parsePhysicsProblem } from '../ai/physicsInterpreter';
import { analyzeMisconception } from '../ai/misconceptionEngine';
import { calculateMastery, getExplanation } from '../ai/adaptiveEngine';
import { useScenario } from '../context/StructuredScenarioContext';
import { saveSession, loadHistory } from '../analytics/learningTracker'; // Import tracker

const TutorContext = createContext();

export const useTutor = () => useContext(TutorContext);

export const TutorProvider = ({ children }) => {
    // State
    const [inputValue, setInputValue] = useState(""); // Natural language input
    const [isProcessing, setIsProcessing] = useState(false);
    const [lastInterpretation, setLastInterpretation] = useState(null);
    const [history, setHistory] = useState([]); // Learning history
    const [mastery, setMastery] = useState({ level: 'beginner', score: 0 });
    const [activeMisconception, setActiveMisconception] = useState(null);
    const [mode, setMode] = useState('simulation'); // 'simulation', 'quiz', 'explainer'

    const { loadScenario } = useScenario();

    // Load history on mount
    useEffect(() => {
        const savedHistory = loadHistory();
        if (savedHistory && savedHistory.length > 0) {
            setHistory(savedHistory);
            setMastery(calculateMastery(savedHistory));
        }
    }, []);

    // Actions
    const solveProblem = async (text) => {
        setIsProcessing(true);
        setInputValue(text);

        const result = await parsePhysicsProblem(text);

        // Update Central Physics Store
        loadScenario(result);

        setLastInterpretation(result);
        setIsProcessing(false);
        return result;
    };

    const recordAttempt = (attempt) => {
        // attempt: { prediction, outcome, correct: boolean, misconception?: object }
        const newHistory = [...history, attempt];
        setHistory(newHistory);
        saveSession(newHistory); // Persist

        // Update Mastery
        const newMastery = calculateMastery(newHistory);
        setMastery(newMastery);


        // Check for Misconceptions
        if (!attempt.correct) {
            // Use pre-calculated misconception if available, otherwise analyze
            const misconception = attempt.misconception || analyzeMisconception(attempt.prediction, attempt.outcome);

            if (misconception) {
                setActiveMisconception(misconception);
                // We could also log this to a persistent analytics store here
            }
        }
    };

    const clearMisconception = () => setActiveMisconception(null);

    return (
        <TutorContext.Provider value={{
            inputValue,
            isProcessing,
            lastInterpretation,
            history,
            mastery,
            activeMisconception,
            mode,
            setMode,
            solveProblem,
            recordAttempt,
            clearMisconception,
            getExplanation
        }}>
            {children}
        </TutorContext.Provider>
    );
};
