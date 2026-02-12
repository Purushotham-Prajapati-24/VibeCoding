import React, { createContext, useContext, useState, useEffect } from 'react';
import { parsePhysicsProblem } from '../ai/physicsInterpreter';
import { analyzeMisconception } from '../ai/misconceptionEngine';
import { calculateMastery, getExplanation } from '../ai/adaptiveEngine';

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

    // Actions
    const solveProblem = async (text) => {
        setIsProcessing(true);
        setInputValue(text);

        const result = await parsePhysicsProblem(text);

        setLastInterpretation(result);
        setIsProcessing(false);
        return result;
    };

    const recordAttempt = (attempt) => {
        // attempt: { prediction, outcome, correct: boolean }
        const newHistory = [...history, attempt];
        setHistory(newHistory);

        // Update Mastery
        const newMastery = calculateMastery(newHistory);
        setMastery(newMastery);

        // Check for Misconceptions
        if (!attempt.correct) {
            const misconception = analyzeMisconception(attempt.prediction, attempt.outcome);
            if (misconception) {
                setActiveMisconception(misconception);
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
