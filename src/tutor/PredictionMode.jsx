import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTutor } from './TutorContext';
import { useCompareContext } from '../compare/CompareContext';
import QuizEngine from './QuizEngine';

const PredictionMode = () => {
    const { mode, setMode } = useTutor();
    const { start } = useCompareContext(); // Trigger simulation after prediction

    // Only show if in 'quiz' mode
    if (mode !== 'quiz') return null;

    const handleQuizComplete = () => {
        // 1. Transition to simulation
        setMode('simulation');

        // 2. Start the physics engine
        start();
    };

    return (
        <div className="absolute inset-0 z-40 bg-black/60 backdrop-blur-sm flex items-center justify-center">
            <QuizEngine onComplete={handleQuizComplete} />

            {/* Skip Button */}
            <button
                onClick={() => setMode('simulation')}
                className="absolute top-8 right-8 text-slate-400 hover:text-white underline text-sm"
            >
                Skip Prediction
            </button>
        </div>
    );
};

export default PredictionMode;
