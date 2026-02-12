import React, { useState, useRef, useEffect } from 'react';
import {
    Play, Pause, RotateCcw, Globe, Zap, Compass, ArrowDown,
    SlidersHorizontal, ChevronDown, Sun, Moon, Orbit, Sparkles,
    CircleDot, Star, Wind, Film
} from 'lucide-react';
import ReplayButton from '../Remotion/ReplayButton';
import ExplanationVideoButton from '../Remotion/ExplanationVideoButton';

const PLANETS = [
    { name: 'Mercury', gravity: 3.7, drag: 0, icon: CircleDot, color: 'text-gray-400' },
    { name: 'Venus', gravity: 8.87, drag: 0.8, icon: Star, color: 'text-amber-300' },
    { name: 'Earth', gravity: 9.81, drag: 0.47, icon: Globe, color: 'text-blue-400' },
    { name: 'Moon', gravity: 1.62, drag: 0, icon: Moon, color: 'text-yellow-200' },
    { name: 'Mars', gravity: 3.72, drag: 0.02, icon: Orbit, color: 'text-red-400' },
    { name: 'Jupiter', gravity: 24.79, drag: 0.6, icon: Sun, color: 'text-orange-400' },
    { name: 'Saturn', gravity: 10.44, drag: 0.5, icon: Sparkles, color: 'text-yellow-400' },
    { name: 'Uranus', gravity: 8.69, drag: 0.45, icon: Globe, color: 'text-cyan-300' },
    { name: 'Neptune', gravity: 11.15, drag: 0.55, icon: Globe, color: 'text-indigo-400' },
];

const ControlPanel = ({
    onStart, onPause, onReset,
    params, setParams,
    isRunning, hasLanded,
    onReplay, onExplain, onReel,
    // Compare Mode Props
    compareMode, paramsB, setParamsB, setSharedParams
}) => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [dropdownBOpen, setDropdownBOpen] = useState(false);
    const dropdownRef = useRef(null);
    const dropdownBRef = useRef(null);

    // Handle shared or individual updates
    const handleChange = (e) => {
        const { name, value } = e.target;
        const val = parseFloat(value);

        if (compareMode && (name === 'v0' || name === 'angle')) {
            // Update both worlds for shared params
            if (setSharedParams) {
                setSharedParams(name, val);
            }
        } else {
            // Update World A (or single)
            setParams(prev => ({
                ...prev,
                [name]: val
            }));
        }
    };

    const handleChangeB = (e) => {
        const { name, value } = e.target;
        setParamsB(prev => ({
            ...prev,
            [name]: parseFloat(value)
        }));
    };

    const handlePlanetSelect = (planet) => {
        setParams(prev => ({ ...prev, gravity: planet.gravity, drag: planet.drag, label: planet.name }));
        setDropdownOpen(false);
    };

    const handlePlanetSelectB = (planet) => {
        setParamsB(prev => ({ ...prev, gravity: planet.gravity, drag: planet.drag, label: planet.name }));
        setDropdownBOpen(false);
    };

    // Close dropdowns on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
            if (dropdownBRef.current && !dropdownBRef.current.contains(e.target)) {
                setDropdownBOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Find current planets
    const currentPlanet = PLANETS.find(p => Math.abs(p.gravity - params.gravity) < 0.05);
    const currentPlanetB = paramsB ? PLANETS.find(p => Math.abs(p.gravity - paramsB.gravity) < 0.05) : null;

    const PlanetSelector = ({ selected, onSelect, isOpen, setIsOpen, refObj, label }) => (
        <div className="space-y-1.5" ref={refObj}>
            <label className="text-sm text-slate-400 flex items-center gap-2">
                <Globe size={14} className="text-cyan-400" />
                {label}
            </label>
            <div className="relative">
                <button
                    onClick={() => setIsOpen(prev => !prev)}
                    className="w-full bg-slate-700 border border-slate-600 text-slate-200 rounded-xl px-3 py-2 text-sm text-left flex items-center justify-between cursor-pointer transition-all hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                    <span className="flex items-center gap-2">
                        {selected ? (
                            <>
                                {React.createElement(selected.icon, { size: 16, className: selected.color })}
                                <span>{selected.name}</span>
                                <span className="text-slate-500 text-xs">— {selected.gravity} m/s²</span>
                            </>
                        ) : (
                            <>
                                <Orbit size={16} className="text-slate-400" />
                                <span>Custom</span>
                            </>
                        )}
                    </span>
                    <ChevronDown size={16} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {isOpen && (
                    <div className="absolute z-50 mt-1 w-full bg-slate-800 border border-slate-600 rounded-xl shadow-2xl overflow-hidden max-h-52 overflow-y-auto">
                        {PLANETS.map(p => {
                            const isSelected = selected?.name === p.name;
                            const Icon = p.icon;
                            return (
                                <button
                                    key={p.name}
                                    onClick={() => onSelect(p)}
                                    className={`w-full px-3 py-2 text-sm text-left flex items-center gap-2.5 transition-colors cursor-pointer ${isSelected
                                        ? 'bg-cyan-600/20 text-cyan-300'
                                        : 'text-slate-300 hover:bg-slate-700'
                                        }`}
                                >
                                    <Icon size={16} className={p.color} />
                                    <span className="flex-1">{p.name}</span>
                                    <span className="text-slate-500 text-xs font-mono">{p.gravity} m/s²</span>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-6 flex flex-col gap-4 h-full shadow-xl overflow-y-auto">
            <h2 className="text-lg font-semibold text-slate-300 flex items-center gap-2">
                <SlidersHorizontal size={18} className="text-blue-400" />
                Controls
            </h2>

            {/* Shared Launch Parameters */}
            <div className="space-y-4 flex-1">
                <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/50 space-y-3">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Launch Parameters {compareMode && '(Shared)'}</h3>
                    <div className="space-y-1.5">
                        <label className="text-sm text-slate-400 flex justify-between">
                            <span className="flex items-center gap-1"><Zap size={12} className="text-blue-400" /> Initial Velocity (v0)</span>
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

                    <div className="space-y-1.5">
                        <label className="text-sm text-slate-400 flex justify-between">
                            <span className="flex items-center gap-1"><Compass size={12} className="text-purple-400" /> Launch Angle (θ)</span>
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
                </div>

                {/* World A Controls */}
                <div className={`p-3 bg-slate-800/50 rounded-xl border border-slate-700/50 space-y-3 ${compareMode ? 'border-l-4 border-l-blue-500' : ''}`}>
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                        {compareMode ? 'Simulation A' : 'Environment'}
                    </h3>
                    <div className="space-y-1.5">
                        <label className="text-sm text-slate-400 flex justify-between">
                            <span className="flex items-center gap-1"><ArrowDown size={12} className="text-emerald-400" /> Gravity</span>
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

                    <div className="space-y-1.5">
                        <label className="text-sm text-slate-400 flex justify-between">
                            <span className="flex items-center gap-1"><Wind size={12} className="text-rose-400" /> Air Resistance</span>
                            <span className="text-rose-400 font-mono">{params.drag === 0 ? 'Off' : params.drag.toFixed(2)}</span>
                        </label>
                        <input
                            type="range"
                            name="drag"
                            min="0" max="1" step="0.01"
                            value={params.drag}
                            onChange={handleChange}
                            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-rose-500"
                        />
                    </div>

                    <PlanetSelector
                        selected={currentPlanet}
                        onSelect={handlePlanetSelect}
                        isOpen={dropdownOpen}
                        setIsOpen={setDropdownOpen}
                        refObj={dropdownRef}
                        label={compareMode ? "Sim A Planet" : "Simulate on Planet"}
                    />
                </div>

                {/* World B Controls (Compare Mode Only) */}
                {compareMode && paramsB && (
                    <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/50 border-l-4 border-l-amber-500 space-y-3">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Simulation B</h3>
                        <div className="space-y-1.5">
                            <label className="text-sm text-slate-400 flex justify-between">
                                <span className="flex items-center gap-1"><ArrowDown size={12} className="text-emerald-400" /> Gravity</span>
                                <span className="text-emerald-400 font-mono">{paramsB.gravity} m/s²</span>
                            </label>
                            <input
                                type="range"
                                name="gravity"
                                min="1" max="25" step="0.1"
                                value={paramsB.gravity}
                                onChange={handleChangeB}
                                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm text-slate-400 flex justify-between">
                                <span className="flex items-center gap-1"><Wind size={12} className="text-rose-400" /> Air Resistance</span>
                                <span className="text-rose-400 font-mono">{paramsB.drag === 0 ? 'Off' : paramsB.drag.toFixed(2)}</span>
                            </label>
                            <input
                                type="range"
                                name="drag"
                                min="0" max="1" step="0.01"
                                value={paramsB.drag}
                                onChange={handleChangeB}
                                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-rose-500"
                            />
                        </div>

                        <PlanetSelector
                            selected={currentPlanetB}
                            onSelect={handlePlanetSelectB}
                            isOpen={dropdownBOpen}
                            setIsOpen={setDropdownBOpen}
                            refObj={dropdownBRef}
                            label="Sim B Planet"
                        />
                    </div>
                )}
            </div>

            {/* Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
                {!isRunning ? (
                    <button className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white py-2.5 px-4 rounded-xl transition-all font-medium shadow-lg shadow-blue-500/20" onClick={onStart}>
                        <Play size={18} fill="currentColor" /> Start
                    </button>
                ) : (
                    <button className="flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-500 text-white py-2.5 px-4 rounded-xl transition-all font-medium shadow-lg shadow-amber-500/20" onClick={onPause}>
                        <Pause size={18} fill="currentColor" /> Pause
                    </button>
                )}

                <button className="flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white py-2.5 px-4 rounded-xl transition-all font-medium border border-slate-600" onClick={onReset}>
                    <RotateCcw size={18} /> Reset
                </button>
            </div>

            {/* Remotion Video Buttons */}
            <div className="flex flex-col gap-2 pt-2 border-t border-slate-700/50">
                <ReplayButton onClick={onReplay} disabled={!hasLanded} />
                <ExplanationVideoButton onClick={onExplain} />

                <button
                    onClick={onReel}
                    disabled={!hasLanded}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-medium transition-all bg-gradient-to-r from-pink-900/50 to-purple-900/50 hover:from-pink-900/70 hover:to-purple-900/70 text-pink-200 border border-pink-500/30 disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                    <Film size={16} className="group-hover:scale-110 transition-transform" />
                    <span>Create Viral Reel</span>
                </button>
            </div>
        </div>
    );
};
export default ControlPanel;
