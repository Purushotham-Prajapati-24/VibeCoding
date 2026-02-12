/**
 * DifferencePanel — Live comparison stats between World A and World B.
 * Animated percentage diffs with color coding.
 */
import React, { useState, useEffect, useRef } from 'react';
import { useCompareContext } from './CompareContext';
import { computeDifferences } from '@/features/analytics/differenceCalculator';
import { ArrowUpRight, ArrowDownRight, Minus, BarChart3 } from 'lucide-react';

const AnimatedValue = ({ value, suffix = '', decimals = 1 }) => {
    const [displayed, setDisplayed] = useState(0);
    const ref = useRef(null);

    useEffect(() => {
        const target = value || 0;
        let start = displayed;
        let frame;
        const animate = () => {
            start += (target - start) * 0.15;
            if (Math.abs(target - start) < 0.01) start = target;
            setDisplayed(start);
            if (start !== target) frame = requestAnimationFrame(animate);
        };
        frame = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(frame);
    }, [value]);

    return <span>{displayed.toFixed(decimals)}{suffix}</span>;
};

const DiffIndicator = ({ pct }) => {
    if (Math.abs(pct) < 0.5) return <Minus size={14} className="text-slate-500" />;
    if (pct > 0) return <ArrowUpRight size={14} className="text-emerald-400" />;
    return <ArrowDownRight size={14} className="text-red-400" />;
};

const DifferencePanel = () => {
    const { compare } = useCompareContext();
    const [diffs, setDiffs] = useState(null);

    useEffect(() => {
        let frame;
        const update = () => {
            const hA = compare.stateA.current?.history;
            const hB = compare.stateB.current?.history;
            if (hA?.length > 1 && hB?.length > 1) {
                setDiffs(computeDifferences(hA, hB));
            }
            frame = requestAnimationFrame(update);
        };
        frame = requestAnimationFrame(update);
        return () => cancelAnimationFrame(frame);
    }, [compare]);

    const rows = diffs ? [
        { label: 'Range', a: diffs.a.range, b: diffs.b.range, pct: diffs.rangeDiff, unit: 'm' },
        { label: 'Max Height', a: diffs.a.maxHeight, b: diffs.b.maxHeight, pct: diffs.heightDiff, unit: 'm' },
        { label: 'Flight Time', a: diffs.a.flightTime, b: diffs.b.flightTime, pct: diffs.timeDiff, unit: 's' },
        { label: 'Impact Speed', a: diffs.a.impactSpeed, b: diffs.b.impactSpeed, pct: diffs.impactDiff, unit: 'm/s' },
    ] : [];

    return (
        <div className="bg-slate-900/60 absolute top-[10vh] backdrop-blur-md rounded-2xl border border-white/5 p-4 shadow-2xl ring-1 ring-white/10">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-3">
                <BarChart3 size={14} className="text-cyan-400" />
                Difference Meter
            </h3>
            {rows.length === 0 ? (
                <p className="text-xs text-slate-600 italic">Run simulation to see comparison…</p>
            ) : (
                <div className="space-y-2">
                    {rows.map(r => (
                        <div key={r.label} className="flex items-center justify-between text-xs">
                            <span className="text-slate-500 w-20">{r.label}</span>
                            <span className="text-blue-400 font-mono w-16 text-right">
                                <AnimatedValue value={r.a} suffix={r.unit} />
                            </span>
                            <span className="text-emerald-400 font-mono w-16 text-right">
                                <AnimatedValue value={r.b} suffix={r.unit} />
                            </span>
                            <span className={`flex items-center gap-0.5 font-bold w-16 text-right font-mono ${Math.abs(r.pct) < 0.5 ? 'text-slate-500' :
                                r.pct > 0 ? 'text-emerald-400' : 'text-red-400'
                                }`}>
                                <DiffIndicator pct={r.pct} />
                                <AnimatedValue value={Math.abs(r.pct)} suffix="%" decimals={0} />
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DifferencePanel;
