import React from 'react';
import { Atom, GitCompare, Eye, Lightbulb, Crosshair } from 'lucide-react';
import JuryMode from '@/modes/JuryMode';

const MainLayout = ({ children, ctx, onChallenge }) => {
    return (
        <div className="min-h-screen bg-[#0f172a] text-slate-200 p-4 font-sans overflow-hidden flex flex-col">
            <header className="mb-3 px-2 flex items-center justify-between">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Atom size={24} className="text-blue-400" />
                    <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">NewTonX AI</span>
                    <span className="text-xs text-slate-600 font-normal ml-2">Comparative Physics Lab</span>
                </h1>

                {/* Feature Toolbar */}
                {ctx && (
                    <div className="flex items-center gap-2">
                        {/* Compare Toggle */}
                        <button
                            onClick={() => ctx.setCompareMode(c => !c)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${ctx.compareMode
                                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/30'
                                : 'bg-slate-700/50 hover:bg-slate-600/50 text-slate-400'
                                }`}
                        >
                            <GitCompare size={12} />
                            Compare
                        </button>

                        {/* Concept Overlay Toggle */}
                        <button
                            onClick={() => ctx.setConceptOverlay(c => !c)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${ctx.conceptOverlay
                                ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/30'
                                : 'bg-slate-700/50 hover:bg-slate-600/50 text-slate-400'
                                }`}
                        >
                            <Eye size={12} />
                            Forces
                        </button>

                        {/* Spotlight Toggle */}
                        <button
                            onClick={() => ctx.setSpotlightEnabled(c => !c)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${ctx.spotlightEnabled
                                ? 'bg-amber-600 text-white shadow-lg shadow-amber-900/30'
                                : 'bg-slate-700/50 hover:bg-slate-600/50 text-slate-400'
                                }`}
                        >
                            <Crosshair size={12} />
                            Spotlight
                        </button>

                        {/* Challenge Button */}
                        {onChallenge && (
                            <button
                                onClick={onChallenge}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-700/50 hover:bg-slate-600/50 text-slate-400 transition-all"
                            >
                                <Lightbulb size={12} />
                                Challenge
                            </button>
                        )}

                        {/* Jury Demo */}
                        <JuryMode />

                        {/* Compare Mode World B Selector */}
                        {ctx.compareMode && (
                            <select
                                value={ctx.compare.paramsB.gravity}
                                onChange={(e) => {
                                    const g = parseFloat(e.target.value);
                                    const labels = { 1.62: '🌙 Moon', 3.72: '🔴 Mars', 9.81: '🌍 Earth', 24.79: '🟠 Jupiter' };
                                    ctx.compare.setParamsB(p => ({ ...p, gravity: g, label: labels[g] || `g=${g}` }));
                                }}
                                className="bg-slate-700 border border-slate-600 text-slate-300 text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            >
                                <option value="1.62">🌙 Moon (1.62)</option>
                                <option value="3.72">🔴 Mars (3.72)</option>
                                <option value="9.81">🌍 Earth (9.81)</option>
                                <option value="24.79">🟠 Jupiter (24.79)</option>
                            </select>
                        )}
                    </div>
                )}
            </header>

            <main className="flex-1 grid grid-cols-12 gap-4 h-[calc(100vh-80px)]">
                {children}
            </main>
        </div>
    );
};

export default MainLayout;
