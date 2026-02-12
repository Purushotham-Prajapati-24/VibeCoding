import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTutor } from './TutorContext';
import { useScenario } from '@/context/StructuredScenarioContext';
import { analyzeMisconception } from '@/services/ai/misconceptionEngine';
import { getExplanation } from '@/services/ai/adaptiveEngine';
import { Check, X, ArrowRight, BrainCircuit } from 'lucide-react';

const PREDICTION_TYPES = [
    { id: 'range', label: 'Range (Distance)', unit: 'm', key: 'range' },
    { id: 'maxHeight', label: 'Maximum Height', unit: 'm', key: 'maxHeight' },
    { id: 'timeOfFlight', label: 'Time of Flight', unit: 's', key: 'timeOfFlight' }
];

const QuizEngine = ({ onComplete }) => {
    const { recordAttempt } = useTutor();
    const { scenario } = useScenario();

    // State
    const [targetVar, setTargetVar] = useState(PREDICTION_TYPES[0]);
    const [userValue, setUserValue] = useState(0);
    const [submitted, setSubmitted] = useState(false);
    const [result, setResult] = useState(null);

    // Initialize slider to something reasonable to start
    useEffect(() => {
        if (scenario.derivedValues[targetVar.key]) {
            // Start the guess at 50% of actual to allow room to move
            setUserValue(Math.round(scenario.derivedValues[targetVar.key] * 0.5));
        }
    }, [targetVar, scenario.derivedValues]);

    const handleSubmit = () => {
        setSubmitted(true);
        const actual = scenario.derivedValues[targetVar.key];
        const errorMargin = Math.abs((userValue - actual) / actual);
        const isCorrect = errorMargin < 0.15; // 15% tolerance

        // Construct Prediction Object for AI Analysis
        const predictionObj = {
            [targetVar.key]: userValue,
            mass: 10, // Assumption for now unless we add mass slider
            ...scenario.parameters
        };

        // Construct Actual Object
        const actualObj = {
            ...scenario.derivedValues,
            ...scenario.parameters
        };

        // 🧠 AI Analysis
        const misconception = analyzeMisconception(predictionObj, actualObj);

        // 📚 Adaptive Explanation
        const explanation = getExplanation(
            misconception ? misconception.id : targetVar.key,
            'beginner' // outcome.mastery can go here later
        );

        const resultData = {
            isCorrect,
            actual,
            error: Math.round(errorMargin * 100),
            misconception,
            explanation
        };

        setResult(resultData);

        // Record to Global Tutor Context
        recordAttempt({
            type: 'prediction',
            variable: targetVar.id,
            prediction: userValue,
            actual: actual,
            correct: isCorrect,
            timestamp: Date.now()
        });
    };

    return (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-50 w-full max-w-md">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-900/95 backdrop-blur-xl border border-indigo-500/30 p-6 rounded-2xl shadow-2xl overflow-hidden relative"
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <BrainCircuit className="text-indigo-400" />
                        Predict-Then-See
                    </h3>
                    <div className="flex gap-2">
                        {PREDICTION_TYPES.map(type => (
                            <button
                                key={type.id}
                                onClick={() => !submitted && setTargetVar(type)}
                                className={`text-xs px-2 py-1 rounded-md transition-colors ${targetVar.id === type.id
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-slate-800 text-slate-400 hover:text-white'
                                    }`}
                                disabled={submitted}
                            >
                                {type.label.split(' ')[0]}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Question */}
                <p className="text-slate-300 mb-8 text-lg text-center">
                    Based on current settings, what will be the <span className="text-indigo-400 font-bold">{targetVar.label}</span>?
                </p>

                {/* Input Slider */}
                <div className="mb-8 px-4">
                    <div className="flex justify-between text-slate-400 text-sm mb-2">
                        <span>0 {targetVar.unit}</span>
                        <span className="text-white font-mono text-xl">{userValue} {targetVar.unit}</span>
                        <span>{Math.round(scenario.derivedValues[targetVar.key] * 2)} {targetVar.unit}</span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max={Math.round(scenario.derivedValues[targetVar.key] * 2) || 100}
                        step="0.1"
                        value={userValue}
                        onChange={(e) => !submitted && setUserValue(parseFloat(e.target.value))}
                        disabled={submitted}
                        className="w-full h-3 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400 transition-all"
                    />
                </div>

                {/* Action / Result Area */}
                <div className="flex justify-end items-center">
                    {!submitted ? (
                        <button
                            onClick={handleSubmit}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-indigo-500/25"
                        >
                            Lock In Prediction <ArrowRight size={18} />
                        </button>
                    ) : (
                        <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className={`p-4 rounded-xl mb-4 border ${result.isCorrect ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                                <div className="flex items-center gap-3 mb-2">
                                    {result.isCorrect ? <Check className="text-green-400" /> : <X className="text-red-400" />}
                                    <span className={`font-bold ${result.isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                                        {result.isCorrect ? "Excellent Estimation!" : "Not quite there."}
                                    </span>
                                </div>
                                <div className="text-slate-300 text-sm">
                                    Actual {targetVar.label}: <span className="text-white font-mono">{result.actual} {targetVar.unit}</span>
                                    <br />
                                    Difference: {result.error}%
                                </div>
                            </div>

                            {/* AI Feedback */}
                            <div className="bg-slate-800/50 p-4 rounded-xl border border-white/5">
                                <h4 className="text-indigo-300 text-xs uppercase font-bold mb-1 tracking-wider">AI Analysis</h4>
                                <p className="text-slate-300 text-sm leading-relaxed">
                                    {result.misconception
                                        ? <span className="text-amber-400 font-bold block mb-1">⚠️ {result.misconception.correction}</span>
                                        : result.explanation}
                                </p>
                            </div>

                            <button
                                onClick={onComplete}
                                className="w-full mt-4 bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-lg font-medium transition-colors"
                            >
                                See Simulation
                            </button>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default QuizEngine;
