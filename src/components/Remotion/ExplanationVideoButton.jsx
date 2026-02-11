/**
 * ExplanationVideoButton — Opens educational walkthrough.
 */
import React from 'react';
import { GraduationCap } from 'lucide-react';

const ExplanationVideoButton = ({ onClick }) => (
    <button
        onClick={onClick}
        className="
            flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold
            bg-gradient-to-r from-purple-500/20 to-indigo-500/20
            text-purple-400 border border-purple-500/30
            hover:from-purple-500/30 hover:to-indigo-500/30
            hover:shadow-lg hover:shadow-purple-500/10
            transition-all duration-200 cursor-pointer
        "
    >
        <GraduationCap size={16} />
        Explain This
    </button>
);

export default ExplanationVideoButton;
