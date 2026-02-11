import React, { useState, useCallback } from 'react';
import { ArrowLeft, Play, Pause, RotateCcw, Activity, Settings2 } from 'lucide-react';
import { useCompareContext } from '../compare/CompareContext';
import ControlPanel from '../components/Controls/ControlPanel';
import DualCanvasView from '../compare/DualCanvasView';
import DifferencePanel from '../compare/DifferencePanel';
import DataCardPanel from '../components/DataCards/DataCardPanel';

const ComparePage = ({ onBack }) => {
    const ctx = useCompareContext();
    const {
        compareMode, isRunning, start, pause, reset, compare
    } = ctx;

    const { paramsA, setParamsA, paramsB, setParamsB, setSharedParams } = compare;

    return (
        <div className="fixed inset-0 bg-slate-950 z-50 flex flex-col text-slate-100 font-sans">
            {/* Header */}
            <header className="h-16 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-900/80 backdrop-blur-md z-50">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white"
                        title="Back to Dashboard"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                            Comparative Analysis Lab
                        </h1>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700">
                        <button
                            onClick={isRunning ? pause : start}
                            className={`p-2 rounded-md transition-colors flex items-center gap-2 ${isRunning
                                    ? 'bg-amber-500/20 text-amber-500 hover:bg-amber-500/30'
                                    : 'bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500/30'
                                }`}
                        >
                            {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                            <span className="text-xs font-bold uppercase">{isRunning ? 'Pause' : 'Simulate'}</span>
                        </button>
                        <div className="w-px bg-slate-700 mx-1 my-1"></div>
                        <button
                            onClick={reset}
                            className="p-2 hover:bg-slate-700 rounded-md text-slate-400 hover:text-white transition-colors"
                            title="Reset Simulation"
                        >
                            <RotateCcw className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content Grid */}
            <div className="flex-1 p-4 grid grid-cols-12 gap-4 overflow-hidden relative">

                {/* Sidebar (3 cols) - Analytics & Controls */}
                <div className="col-span-3 flex flex-col gap-4 h-full overflow-hidden">
                    <div className="flex-1 bg-slate-900/50 rounded-xl border border-slate-800 overflow-y-auto custom-scrollbar p-3 space-y-4">

                        {/* Analytics Section */}
                        <div className="space-y-2">
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                <Activity className="w-3 h-3" /> Live Telemetry
                            </h3>
                            <DataCardPanel />
                        </div>

                        <div className="h-px bg-slate-800" />

                        {/* Controls Section */}
                        <div className="space-y-2">
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                <Settings2 className="w-3 h-3" /> Simulation Controls
                            </h3>
                            <ControlPanel
                                params={paramsA}
                                setParams={setParamsA}
                                compareMode={true}
                                paramsB={paramsB}
                                setParamsB={setParamsB}
                                setSharedParams={setSharedParams}
                                onStart={start}
                                onPause={pause}
                                onReset={reset}
                                isRunning={isRunning}
                                hasLanded={false}
                            />
                        </div>
                    </div>
                </div>

                {/* Main Canvas Area (9 cols) */}
                <div className="col-span-9 flex flex-col h-full bg-slate-900/40 rounded-2xl border border-slate-700/50 overflow-hidden relative shadow-2xl backdrop-blur-sm">
                    <div className="flex-1 relative w-full h-full">
                        <DualCanvasView />

                        {/* Floating Difference Panel */}
                        <div className="absolute top-[10vh] bottom-6 left-1/2 -translate-x-1/2 w-auto min-w-[320px] max-w-2xl px-4">
                            <DifferencePanel />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ComparePage;
