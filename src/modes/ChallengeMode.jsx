/**
 * ChallengeMode — "Predict what happens" mini-game.
 * Asks physics questions, accepts guess, reveals answer with confetti on correct.
 */
import React, { useState, useMemo, useCallback } from 'react';
import { Lightbulb, Trophy, RotateCcw, Check, X } from 'lucide-react';

const CHALLENGES = [
    {
        question: 'If gravity increases by 50%, what happens to max height?',
        options: ['Increases ↑', 'Decreases ↓', 'Stays same'],
        correct: 1,
        explanation: 'Higher gravity pulls the projectile down faster, reducing maximum height.',
    },
    {
        question: 'What happens to range on the Moon (g = 1.62m/s²) vs Earth?',
        options: ['Much bigger ↑', 'Slightly bigger', 'Smaller ↓'],
        correct: 0,
        explanation: 'With ~1/6th gravity, the projectile stays airborne much longer, greatly increasing range.',
    },
    {
        question: 'At what angle is the range maximized (no drag)?',
        options: ['30°', '45°', '60°'],
        correct: 1,
        explanation: '45° provides the optimal balance between horizontal and vertical velocity components.',
    },
    {
        question: 'If initial speed doubles, max height becomes…',
        options: ['2x', '3x', '4x'],
        correct: 2,
        explanation: 'Max height = v₀²sin²θ / (2g), so doubling v₀ gives 4x the height.',
    },
    {
        question: 'With air drag, which changes more — range or max height?',
        options: ['Range decreases more', 'Height decreases more', 'Both equal'],
        correct: 0,
        explanation: 'Drag primarily opposes horizontal motion over longer distances, reducing range proportionally more.',
    },
];

const ChallengeMode = ({ isOpen, onClose }) => {
    const [current, setCurrent] = useState(0);
    const [selected, setSelected] = useState(null);
    const [score, setScore] = useState(0);
    const [showResult, setShowResult] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);

    const challenge = CHALLENGES[current];

    const handlePick = useCallback((idx) => {
        if (showResult) return;
        setSelected(idx);
        setShowResult(true);
        if (idx === challenge.correct) {
            setScore(s => s + 1);
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 2000);
        }
    }, [showResult, challenge]);

    const next = useCallback(() => {
        setCurrent(c => (c + 1) % CHALLENGES.length);
        setSelected(null);
        setShowResult(false);
    }, []);

    const resetGame = useCallback(() => {
        setCurrent(0);
        setSelected(null);
        setShowResult(false);
        setScore(0);
        setShowConfetti(false);
    }, []);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl relative" onClick={e => e.stopPropagation()}>
                {/* Confetti */}
                {showConfetti && (
                    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
                        {Array.from({ length: 30 }).map((_, i) => (
                            <div key={i} className="absolute animate-ping" style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                                width: 8, height: 8,
                                borderRadius: '50%',
                                background: ['#fbbf24', '#3b82f6', '#a855f7', '#ef4444', '#22c55e'][i % 5],
                                animationDelay: `${Math.random() * 0.5}s`,
                                animationDuration: `${0.5 + Math.random()}s`,
                            }} />
                        ))}
                    </div>
                )}

                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Lightbulb size={18} className="text-amber-400" />
                        Physics Challenge
                    </h3>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-400 font-mono">
                            <Trophy size={14} className="inline text-amber-400 mr-1" />{score}/{CHALLENGES.length}
                        </span>
                        <span className="text-xs text-slate-600">#{current + 1}</span>
                    </div>
                </div>

                {/* Question */}
                <p className="text-slate-200 text-sm mb-4 leading-relaxed">{challenge.question}</p>

                {/* Options */}
                <div className="space-y-2 mb-4">
                    {challenge.options.map((opt, i) => {
                        let cls = 'border-slate-700 hover:border-slate-500';
                        if (showResult) {
                            if (i === challenge.correct) cls = 'border-emerald-500 bg-emerald-500/10';
                            else if (i === selected && i !== challenge.correct) cls = 'border-red-500 bg-red-500/10';
                        } else if (i === selected) {
                            cls = 'border-blue-500';
                        }
                        return (
                            <button
                                key={i}
                                onClick={() => handlePick(i)}
                                className={`w-full text-left px-4 py-2.5 rounded-xl border text-sm text-slate-300 transition-all ${cls}`}
                            >
                                <span className="mr-2 text-xs text-slate-500">{String.fromCharCode(65 + i)}.</span>
                                {opt}
                                {showResult && i === challenge.correct && <Check size={14} className="inline ml-2 text-emerald-400" />}
                                {showResult && i === selected && i !== challenge.correct && <X size={14} className="inline ml-2 text-red-400" />}
                            </button>
                        );
                    })}
                </div>

                {/* Explanation */}
                {showResult && (
                    <div className="bg-slate-800/50 rounded-xl p-3 mb-4 border border-slate-700/50">
                        <p className="text-xs text-slate-400 leading-relaxed">{challenge.explanation}</p>
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                    {showResult && (
                        <button onClick={next} className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-xl font-semibold transition-colors">
                            Next Question →
                        </button>
                    )}
                    <button onClick={resetGame} className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-400 text-sm rounded-xl transition-colors flex items-center gap-1">
                        <RotateCcw size={14} /> Reset
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChallengeMode;
