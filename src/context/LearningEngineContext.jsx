import React, { createContext, useContext } from 'react';
import { ScenarioProvider, useScenario } from './StructuredScenarioContext';
import { TutorProvider, useTutor } from '@/features/tutor/TutorContext';
import { CompareProvider, useCompareContext } from '@/features/compare/CompareContext';
import { SoundProvider, useSound } from '../components/Audio/SoundManager';

/**
 * LearningEngineContext
 * 
 * Unified Global Store as requested in the Master Execution Prompt.
 * Aggregates:
 * - Structured Scenario (Single Source of Truth)
 * - Simulation Logic (Single & Compare)
 * - Tutor AI State
 * - Sound System
 * 
 * Usage: const { scenario, runSimulation, tutorState } = useLearningEngine();
 */

const LearningEngineCtx = createContext(null);

export const useLearningEngine = () => {
    // We can either use a context value or just aggregate hooks here
    // Aggregating hooks ensures we always get the latest context values
    // without needing another provider layer overhead, 
    // BUT strictly speaking, a Context wrapper is cleaner for dependency injection.

    // For now, let's just re-export the hooks if we are inside the huge wrapper
    // or we can just use this hook to grab everything.

    const scenario = useScenario();
    const tutor = useTutor();
    const compare = useCompareContext();
    const sound = useSound();

    return {
        // --- 1. Scenario / Intepreter ---
        scenario: scenario.scenario,
        updateParameters: scenario.updateParameters,
        loadScenario: scenario.loadScenario,

        // --- 2. Simulation / Compare ---
        simulation: {
            isRunning: compare.isRunning,
            start: compare.start,
            pause: compare.pause,
            reset: compare.reset,
            activeMode: compare.compareMode ? 'compare' : 'single',
            // Main engine (Single or World A)
            main: compare.compareMode ? compare.compare : compare.single,
            // Secondary (World B)
            secondary: compare.compareMode ? compare.compare : null
        },
        compareControls: {
            setCompareMode: compare.setCompareMode,
            isCompareMode: compare.compareMode,
            setSharedParams: compare.compare.setSharedParams
        },

        // --- 3. Tutor / AI ---
        tutor: {
            solve: tutor.solveProblem,
            state: tutor.tutorState, // Assuming access
            mastery: tutor.mastery,
            history: tutor.history,
            misconception: tutor.activeMisconception
        },

        // --- 4. System / Sound ---
        sound
    };
};

export const LearningEngineProvider = ({ children }) => {
    return (
        <ScenarioProvider>
            <SoundProvider>
                <TutorProvider>
                    <CompareProvider>
                        {children}
                    </CompareProvider>
                </TutorProvider>
            </SoundProvider>
        </ScenarioProvider>
    );
};
