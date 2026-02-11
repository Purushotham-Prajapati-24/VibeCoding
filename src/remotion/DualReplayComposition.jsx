/**
 * DualReplayComposition — Side-by-side Remotion composition for Compare Mode.
 * Two SVG canvases rendering World A vs World B trajectories.
 */
import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { computeStateAtTime, computeFullTrajectory } from '../physics/projectileFrameEngine';

const W = 540;
const H = 360;
const PAD = 40;

const WorldSVG = ({ params, totalFrames, frame, label, color }) => {
    const { v0, angle, gravity, drag = 0 } = params;
    const trajectory = computeFullTrajectory(v0, angle, gravity, drag, 1 / 60, 20);

    // Bounds
    let maxX = 10, maxY = 5;
    for (const p of trajectory) {
        if (p.x > maxX) maxX = p.x;
        if (p.y > maxY) maxY = p.y;
    }
    maxX *= 1.15; maxY *= 1.15;

    const sX = (W - PAD * 2) / maxX;
    const sY = (H - PAD * 2) / maxY;
    const sc = Math.min(sX, sY);
    const toX = x => PAD + x * sc;
    const toY = y => H - PAD - y * sc;

    // Current time from frame
    const maxT = trajectory[trajectory.length - 1].t;
    const t = interpolate(frame, [0, totalFrames], [0, maxT], { extrapolateRight: 'clamp' });
    const state = computeStateAtTime(v0, angle, gravity, drag, t);
    const cx = toX(state.x);
    const cy = toY(Math.max(0, state.y));

    // Build path up to current time
    // const pathPts = trajectory.filter(p => p.t <= t).map(p => `${toX(p.x)},${toY(p.y)}`).join(' ');
    const visiblePts = trajectory.filter(p => p.t <= t);

    return (
        <svg width={W} height={H} style={{ background: '#0f172a' }}>
            {/* Grid */}
            {Array.from({ length: 8 }).map((_, i) => {
                const gx = (maxX / 8) * i;
                return <line key={`gx${i}`} x1={toX(gx)} y1={0} x2={toX(gx)} y2={H} stroke="#1e293b" strokeWidth="0.5" />;
            })}
            {Array.from({ length: 6 }).map((_, i) => {
                const gy = (maxY / 6) * i;
                return <line key={`gy${i}`} x1={0} y1={toY(gy)} x2={W} y2={toY(gy)} stroke="#1e293b" strokeWidth="0.5" />;
            })}

            {/* Ground */}
            <line x1={0} y1={toY(0)} x2={W} y2={toY(0)} stroke="#334155" strokeWidth="2" />

            {/* Trail */}
            {visiblePts.length > 1 && (
                <polyline
                    points={visiblePts.map(p => `${toX(p.x)},${toY(p.y)}`).join(' ')}
                    fill="none"
                    stroke={color}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    opacity="0.7"
                />
            )}

            {/* Ball glow */}
            <defs>
                <radialGradient id={`glow-${label}`}>
                    <stop offset="0%" stopColor={color} stopOpacity="0.3" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                </radialGradient>
            </defs>
            <circle cx={cx} cy={cy} r={20} fill={`url(#glow-${label})`} />

            {/* Ball */}
            <circle cx={cx} cy={cy} r={8} fill="#fff" />

            {/* Label */}
            <text x={12} y={22} fill="rgba(148,163,184,0.8)" fontSize="13" fontWeight="bold" fontFamily="Inter, system-ui">{label}</text>
            <text x={12} y={38} fill="#64748b" fontSize="10" fontFamily="monospace">g = {gravity} m/s²</text>
        </svg>
    );
};

export const DualReplayComposition = () => {
    const frame = useCurrentFrame();
    const { fps, durationInFrames } = useVideoConfig();
    const { paramsA, paramsB } = (typeof window !== 'undefined' && window.__REMOTION_COMP_PROPS) || {
        paramsA: { v0: 50, angle: 45, gravity: 9.81, drag: 0, label: '🌍 Earth' },
        paramsB: { v0: 50, angle: 45, gravity: 1.62, drag: 0, label: '🌙 Moon' },
    };

    return (
        <div style={{ display: 'flex', gap: 8, padding: 8, background: '#020617' }}>
            <WorldSVG params={paramsA} totalFrames={durationInFrames} frame={frame} label={paramsA.label || 'World A'} color="#3b82f6" />
            <WorldSVG params={paramsB} totalFrames={durationInFrames} frame={frame} label={paramsB.label || 'World B'} color="#22c55e" />
        </div>
    );
};

export default DualReplayComposition;
