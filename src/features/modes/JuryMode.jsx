/**
 * JuryMode — 30-second automated demo sequence for jury/showcase.
 * Ctrl+J or button to trigger.
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useCompareContext } from '@/features/compare/CompareContext';
import { Presentation, Square } from 'lucide-react';

const SEQUENCE = [
    { at: 0, action: 'reset', note: '🎬 Starting demo…' },
    { at: 500, action: 'setSingle', note: '🌍 Single world — Earth' },
    { at: 1000, action: 'launch', note: '🚀 Launching projectile' },
    { at: 4000, action: 'pause', note: '⏸ Pausing at mid-flight' },
    { at: 5500, action: 'enableConcept', note: '🔬 Concept Overlay ON' },
    { at: 8000, action: 'disableConcept', note: '🔬 Concept Overlay OFF' },
    { at: 9000, action: 'enableCompare', note: '🌙 Compare Mode — Moon' },
    { at: 10000, action: 'resetCompare', note: '🔄 Resetting for compare' },
    { at: 11000, action: 'launchCompare', note: '🚀 Dual launch' },
    { at: 18000, action: 'pause', note: '⏸ Compare results' },
    { at: 22000, action: 'disableCompare', note: '📊 Returning to single mode' },
    { at: 23000, action: 'reset', note: '✅ Demo complete!' },
];

const JuryMode = ({ onOpenReplay, onOpenExplain }) => {
    const ctx = useCompareContext();
    const [isActive, setIsActive] = useState(false);
    const [currentNote, setCurrentNote] = useState('');
    const timersRef = useRef([]);

    const stop = useCallback(() => {
        timersRef.current.forEach(clearTimeout);
        timersRef.current = [];
        setIsActive(false);
        setCurrentNote('');
    }, []);

    const runSequence = useCallback(() => {
        if (isActive) { stop(); return; }
        setIsActive(true);

        const handlers = {
            reset: () => { ctx.reset(); },
            setSingle: () => { ctx.setCompareMode(false); },
            launch: () => { ctx.start(); },
            pause: () => { ctx.pause(); },
            enableConcept: () => { ctx.setConceptOverlay(true); },
            disableConcept: () => { ctx.setConceptOverlay(false); },
            enableCompare: () => { ctx.setCompareMode(true); },
            resetCompare: () => { ctx.reset(); },
            launchCompare: () => { ctx.start(); },
            disableCompare: () => { ctx.setCompareMode(false); },
        };

        SEQUENCE.forEach(step => {
            const tid = setTimeout(() => {
                setCurrentNote(step.note);
                if (handlers[step.action]) handlers[step.action]();
                if (step.action === 'reset' && step.at > 0) stop();
            }, step.at);
            timersRef.current.push(tid);
        });
    }, [isActive, ctx, stop]);

    // Ctrl+J hotkey
    useEffect(() => {
        const handler = (e) => {
            if (e.ctrlKey && e.key === 'j') {
                e.preventDefault();
                runSequence();
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [runSequence]);

    // Cleanup on unmount
    useEffect(() => { return () => stop(); }, [stop]);

    return (
        <>
            {/* Toggle button */}
            <button
                onClick={runSequence}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${isActive
                    ? 'bg-red-600 hover:bg-red-500 text-white'
                    : 'bg-slate-700/50 hover:bg-slate-600/50 text-slate-400'
                    }`}
                title="Ctrl+J for Jury Demo"
            >
                {isActive ? <Square size={12} /> : <Presentation size={12} />}
                {isActive ? 'Stop Demo' : 'Jury Demo'}
            </button>

            {/* Status banner */}
            {isActive && currentNote && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 bg-slate-900/90 border border-amber-500/30 rounded-xl text-amber-400 text-sm font-semibold shadow-2xl backdrop-blur-sm animate-pulse">
                    {currentNote}
                </div>
            )}
        </>
    );
};

export default JuryMode;
