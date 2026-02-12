import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateChallenge } from './ChallengeGenerator';
import { useTutor } from '@/tutor/TutorContext'; // Reusing context for global state if needed or just local
import { Loader2, Zap, Brain, Trophy, ArrowRight, RefreshCw } from 'lucide-react';
import { useSound } from '../components/Audio/SoundManager.jsx';

const ChallengeMode = ({ isOpen, onClose, onApplyParams }) => {
    const [challenge, setChallenge] = useState(null);
    const [loading, setLoading] = useState(false);
    const [phase, setPhase] = useState('start'); // start, question, simulation, success
    const [selectedOption, setSelectedOption] = useState(null);
    const { play } = useSound();

    const loadNewChallenge = async () => {
        setLoading(true);
        const newChallenge = await generateChallenge();
        setChallenge(newChallenge);
        setLoading(false);
        setPhase('question');
        setSelectedOption(null);
    };

    // Initial load
    useEffect(() => {
        if (isOpen && !challenge) {
            loadNewChallenge();
        }
    }, [isOpen]);

    const handleOptionSelect = (id) => setSelectedOption(id);

    const handleSubmit = () => {
        const isCorrect = challenge.options.find(o => o.id === selectedOption)?.correct;
        if (isCorrect) {
            play('success');
            // "Correct prediction! Now prove it in the sim."
        }

        // Apply physics parameters to the lab
        if (onApplyParams) {
            onApplyParams({
                gravity: challenge.gravity,
                label: challenge.planet,
                v0: 20, // Default start
                angle: 45 // Default start
            });
        }

        setPhase('simulation');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl relative"
            >
                {/* Background Details */}
                <div className="absolute top-0 right-0 p-32 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

                {loading ? (
                    <div className="h-96 flex flex-col items-center justify-center gap-4">
                        <Loader2 className="animate-spin text-purple-400" size={48} />
                        <p className="text-slate-400 font-mono animate-pulse">Consulting the AI Physics Oracle...</p>
                    </div>
                ) : challenge ? (
                    <div className="relative z-10">
                        {/* Header */}
                        <div className="p-8 bg-linear-to-br from-slate-900 via-slate-900 to-purple-900/20 border-b border-slate-800">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-purple-500/30">
                                    AI Challenge
                                </span>
                                <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-blue-500/30">
                                    {challenge.planet}
                                </span>
                            </div>
                            <h2 className="text-3xl font-bold text-white mb-2">{challenge.title}</h2>
                            <p className="text-slate-400 text-lg leading-relaxed">{challenge.scenario}</p>
                        </div>

                        {/* Question Content */}
                        <div className="p-8 space-y-6">
                            <div className="flex items-start gap-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                                <Brain className="text-purple-400 shrink-0 mt-1" />
                                <div>
                                    <h3 className="text-lg font-semibold text-white mb-2">Prediction Phase</h3>
                                    <p className="text-slate-300">{challenge.question}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-3">
                                {challenge.options.map(opt => (
                                    <button
                                        key={opt.id}
                                        onClick={() => handleOptionSelect(opt.id)}
                                        className={`p-4 rounded-xl border text-left transition-all ${selectedOption === opt.id
                                            ? 'bg-purple-600 border-purple-400 text-white shadow-lg shadow-purple-900/50'
                                            : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750 hover:border-slate-600'}`}
                                    >
                                        <span className="font-bold mr-2">{opt.id}.</span> {opt.text}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-6 bg-slate-900 border-t border-slate-800 flex justify-between items-center">
                            <button
                                onClick={loadNewChallenge}
                                className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
                            >
                                <RefreshCw size={16} /> New Challenge
                            </button>

                            <div className="flex gap-3">
                                <button onClick={onClose} className="px-6 py-2 text-slate-400 hover:text-white font-medium">
                                    Close
                                </button>
                                <button
                                    disabled={!selectedOption}
                                    onClick={handleSubmit} // This would ideally close and set params
                                    className="px-8 py-2 bg-linear-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold shadow-lg shadow-purple-900/30 disabled:opacity-50 hover:scale-105 transition-transform flex items-center gap-2"
                                >
                                    Locked In <ArrowRight size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                ) : null}
            </motion.div>
        </div>
    );
};

export default ChallengeMode;
