import React from 'react';
import { Play, Pause, RotateCcw, Moon } from 'lucide-react';

const ControlPanel = ({ onStart, onPause, onReset, onMoon, params, setParams, isRunning }) => {

    const handleChange = (e) => {
        const { name, value } = e.target;
        setParams(prev => ({
            ...prev,
            [name]: parseFloat(value)
        }));
    };

    return (
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-6 flex flex-col gap-6 h-full shadow-xl">
            <h2 className="text-lg font-semibold text-slate-300 mb-2">Controls</h2>

            {/* Sliders */}
            <div className="space-y-6 flex-1">
                <div className="space-y-2">
                    <label className="text-sm text-slate-400 flex justify-between">
                        Initial Velocity (v0)
                        <span className="text-blue-400 font-mono">{params.v0} m/s</span>
                    </label>
                    <input
                        type="range"
                        name="v0"
                        min="0" max="100" step="1"
                        value={params.v0}
                        onChange={handleChange}
                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm text-slate-400 flex justify-between">
                        Launch Angle (θ)
                        <span className="text-purple-400 font-mono">{params.angle}°</span>
                    </label>
                    <input
                        type="range"
                        name="angle"
                        min="0" max="90" step="1"
                        value={params.angle}
                        onChange={handleChange}
                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm text-slate-400 flex justify-between">
                        Gravity (g)
                        <span className="text-emerald-400 font-mono">{params.gravity} m/s²</span>
                    </label>
                    <input
                        type="range"
                        name="gravity"
                        min="1" max="25" step="0.1"
                        value={params.gravity}
                        onChange={handleChange}
                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    />
                </div>
            </div>

            {/* Buttons */}
            <div className="grid grid-cols-2 gap-3">
                {!isRunning ? (
                    <button className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white py-2 px-4 rounded-xl transition-all font-medium" onClick={onStart}>
                        <Play size={18} /> Start
                    </button>
                ) : (
                    <button className="flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-500 text-white py-2 px-4 rounded-xl transition-all font-medium" onClick={onPause}>
                        <Pause size={18} /> Pause
                    </button>
                )}

                <button className="flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white py-2 px-4 rounded-xl transition-all font-medium" onClick={onReset}>
                    <RotateCcw size={18} /> Reset
                </button>

                <button className="flex items-center justify-center gap-2 border border-slate-600 hover:bg-slate-800 text-slate-300 py-2 px-4 rounded-xl transition-all font-medium col-span-2 group" onClick={onMoon}>
                    <Moon size={18} className="group-hover:text-yellow-300 transition-colors" /> Simulate on Moon
                </button>
            </div>
        </div>
    );
};

export default ControlPanel;
