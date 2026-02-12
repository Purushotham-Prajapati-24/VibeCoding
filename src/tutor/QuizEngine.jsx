import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTutor } from './TutorContext';

const QuizEngine = ({ onComplete }) => {
    const { recordAttempt } = useTutor();
    const [answer, setAnswer] = useState(null);
    const [submitted, setSubmitted] = useState(false);

    // Mock Question for now (This would be dynamic based on scenario)
    const question = {
        text: "If we double the mass of the ball, how will the time to hit the ground change?",
        options: [
            { id: 'a', text: "It will fall faster (half the time)" },
            { id: 'b', text: "It will stay the same", correct: true },
            { id: 'c', text: "It will fall slower (double the time)" }
        ]
    };

    const handleSubmit = () => {
        if (!answer) return;
        setSubmitted(true);

        const isCorrect = answer.correct;

        // Record Attempt
        recordAttempt({
            prediction: { mass: 2, time: 'same' }, // varied
            outcome: { time: 'same' }, // varied
            correct: isCorrect
        });

        setTimeout(() => {
            onComplete && onComplete();
        }, 1500);
    };

    return (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-50 w-full max-w-md">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-slate-900/90 backdrop-blur-xl border border-blue-500/30 p-6 rounded-2xl shadow-2xl"
            >
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <span className="text-2xl">🤔</span>
                    Predict the Outcome
                </h3>

                <p className="text-slate-300 mb-6 text-lg">{question.text}</p>

                <div className="space-y-3">
                    {question.options.map((opt) => (
                        <button
                            key={opt.id}
                            onClick={() => !submitted && setAnswer(opt)}
                            className={`w-full p-4 rounded-xl text-left transition-all border ${answer?.id === opt.id
                                    ? 'bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-500/20'
                                    : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800 hover:border-slate-600'
                                } ${submitted && opt.correct ? 'bg-green-500/20 border-green-500 text-green-200' : ''}
                              ${submitted && answer?.id === opt.id && !opt.correct ? 'bg-red-500/20 border-red-500 text-red-200' : ''}
                            `}
                        >
                            {opt.text}
                        </button>
                    ))}
                </div>

                <div className="mt-6 flex justify-end">
                    {!submitted && (
                        <button
                            onClick={handleSubmit}
                            disabled={!answer}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Lock In Answer
                        </button>
                    )}
                    {submitted && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center w-full text-slate-300 font-medium"
                        >
                            {answer.correct ? "🎉 Correct! Gravity is independent of mass." : "Running calibration..."}
                        </motion.div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default QuizEngine;
