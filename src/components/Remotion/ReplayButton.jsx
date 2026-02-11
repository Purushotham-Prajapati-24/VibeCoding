/**
 * ReplayButton — Opens cinematic replay after simulation lands.
 */
import React from 'react';
import { Clapperboard } from 'lucide-react';

const ReplayButton = ({ onClick, disabled }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`
            flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold
            transition-all duration-200
            ${disabled
                ? 'bg-slate-800/50 text-slate-600 cursor-not-allowed'
                : 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-400 border border-amber-500/30 hover:from-amber-500/30 hover:to-orange-500/30 hover:shadow-lg hover:shadow-amber-500/10 cursor-pointer'
            }
        `}
    >
        <Clapperboard size={16} />
        Cinematic Replay
    </button>
);

export default ReplayButton;
