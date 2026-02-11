import React from 'react';
import { Send } from 'lucide-react';

const InputPanel = () => {
    return (
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-6 flex flex-col h-full">
            <h2 className="text-lg font-semibold text-slate-300 mb-4">Problem Input</h2>

            <div className="flex-1 space-y-4">
                <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Physics Problem</label>
                    <textarea
                        className="w-full h-48 bg-slate-900/50 border border-slate-700 rounded-xl p-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none font-mono text-sm leading-relaxed"
                        placeholder="Describe a projectile motion scenario... e.g., 'A ball is thrown at 45 degrees with 20m/s velocity...'"
                    />
                </div>
            </div>

            <button className="mt-4 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white py-3 px-6 rounded-xl transition-all font-semibold shadow-lg shadow-blue-900/20">
                <Send size={18} /> Generate Simulation
            </button>
        </div>
    );
};

export default InputPanel;
