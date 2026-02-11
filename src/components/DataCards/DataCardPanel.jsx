/**
 * DataCardPanel — Animated stat cards replacing the placeholder InputPanel.
 * Shows 6 live stats with smooth counter animation.
 * In compare mode: shows A vs B side-by-side.
 */
import React, { useState, useEffect, useRef } from 'react';
import { useCompareContext } from '@/compare/CompareContext';
import { extractStats } from '@/analytics/differenceCalculator';
import {
    Ruler, Mountain, Timer, Zap, Battery, ArrowDown
} from 'lucide-react';

const useAnimatedValue = (target, speed = 0.12) => {
    const [value, setValue] = useState(0);
    const ref = useRef(0);

    useEffect(() => {
        let frame;
        const animate = () => {
            ref.current += (target - ref.current) * speed;
            if (Math.abs(target - ref.current) < 0.05) ref.current = target;
            setValue(ref.current);
            if (ref.current !== target) frame = requestAnimationFrame(animate);
        };
        frame = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(frame);
    }, [target, speed]);

    return value;
};

const StatCard = ({ icon: Icon, label, value, unit, color, secondValue }) => {
    const animated = useAnimatedValue(value || 0);
    const animatedB = useAnimatedValue(secondValue || 0);

    return (
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3 flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
                <Icon size={13} className={color} />
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">{label}</span>
            </div>
            <div className="flex items-baseline gap-1">
                <span className={`text-lg font-bold font-mono ${color}`}>
                    {animated.toFixed(1)}
                </span>
                <span className="text-[10px] text-slate-600">{unit}</span>
            </div>
            {secondValue !== undefined && secondValue !== null && (
                <div className="flex items-baseline gap-1 border-t border-slate-700/30 pt-1 mt-0.5">
                    <span className="text-xs font-mono text-emerald-400">
                        {animatedB.toFixed(1)}
                    </span>
                    <span className="text-[9px] text-slate-600">{unit}</span>
                    <span className="text-[9px] text-emerald-500/60 ml-auto">World B</span>
                </div>
            )}
        </div>
    );
};

const DataCardPanel = () => {
    const { single, compare, compareMode } = useCompareContext();
    const [stats, setStats] = useState({ range: 0, maxHeight: 0, flightTime: 0, impactSpeed: 0 });
    const [statsB, setStatsB] = useState(null);

    useEffect(() => {
        let frame;
        const update = () => {
            if (compareMode) {
                const hA = compare.stateA.current?.history;
                const hB = compare.stateB.current?.history;
                if (hA?.length > 1) setStats(extractStats(hA));
                if (hB?.length > 1) setStatsB(extractStats(hB));
            } else {
                const h = single.simulationStateRef.current?.history;
                if (h?.length > 1) setStats(extractStats(h));
                setStatsB(null);
            }
            frame = requestAnimationFrame(update);
        };
        frame = requestAnimationFrame(update);
        return () => cancelAnimationFrame(frame);
    }, [compareMode, single, compare]);

    const gravity = compareMode ? compare.paramsA.gravity : single.params.gravity;
    const v0 = compareMode ? compare.paramsA.v0 : single.params.v0;
    const ke = 0.5 * v0 * v0;
    const pe = gravity * stats.maxHeight;

    return (
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-4 flex flex-col h-full shadow-xl overflow-y-auto">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Zap size={14} className="text-amber-400" />
                Live Analytics
            </h2>
            <div className="grid grid-cols-2 gap-2 flex-1">
                <StatCard icon={Ruler} label="Range" value={stats.range} unit="m" color="text-blue-400"
                    secondValue={statsB?.range} />
                <StatCard icon={Mountain} label="Max Height" value={stats.maxHeight} unit="m" color="text-purple-400"
                    secondValue={statsB?.maxHeight} />
                <StatCard icon={Timer} label="Flight Time" value={stats.flightTime} unit="s" color="text-cyan-400"
                    secondValue={statsB?.flightTime} />
                <StatCard icon={ArrowDown} label="Impact Speed" value={stats.impactSpeed} unit="m/s" color="text-red-400"
                    secondValue={statsB?.impactSpeed} />
                <StatCard icon={Zap} label="Initial KE" value={ke} unit="J" color="text-amber-400" />
                <StatCard icon={Battery} label="Max PE" value={pe} unit="J" color="text-emerald-400" />
            </div>
        </div>
    );
};

export default DataCardPanel;
