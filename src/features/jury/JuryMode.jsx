import React, { useState } from 'react';
import { Play, Square, Settings, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useJuryModeController } from './JuryModeController';

const JuryMode = () => {
    const [isActive, setIsActive] = useState(false);
    const { step, overlayText } = useJuryModeController(isActive, () => setIsActive(false));

    return (
        <>
            <button
                onClick={() => setIsActive(!isActive)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${isActive
                    ? 'bg-rose-600 text-white shadow-lg shadow-rose-900/40 animate-pulse'
                    : 'bg-slate-700/50 hover:bg-slate-600/50 text-slate-400'
                    }`}
            >
                {isActive ? <Square size={12} fill="currentColor" /> : <Zap size={12} />}
                {isActive ? 'Stop Demo' : 'Jury Mode'}
            </button>

            <AnimatePresence>
                {isActive && overlayText && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-md border border-slate-700 text-white px-8 py-4 rounded-2xl shadow-2xl z-500 pointer-events-none"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                            <span className="text-lg font-display font-bold tracking-wide">{overlayText}</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default JuryMode;
