/**
 * ReplayComposition — Educational Physics Walkthrough
 * A scripted, phase-by-phase explanation of projectile motion.
 * Uses Remotion Sequences for timeline-driven animation.
 */
import React from 'react';
import {
    useCurrentFrame,
    useVideoConfig,
    AbsoluteFill,
    Sequence,
    spring,
    interpolate,
} from 'remotion';
import { usePhysicsTimeline } from './timeline/usePhysicsTimeline';

// ─── Phase constants ───
const PHASES = {
    EQUATION: { from: 0, dur: 90 },
    LAUNCH: { from: 90, dur: 90 },
    APEX: { from: 180, dur: 60 },
    DESCENT: { from: 240, dur: 60 },
    SUMMARY: { from: 300, dur: 60 },
};
const TOTAL_FRAMES = 360;

// ─── Equation text component ───
const EquationReveal = ({ frame, fps }) => {
    const parts = [
        { text: 'y', color: '#a855f7', delay: 0 },
        { text: ' = ', color: '#94a3b8', delay: 5 },
        { text: 'v₀', color: '#fbbf24', delay: 10 },
        { text: '·sin(θ)', color: '#22d3ee', delay: 18 },
        { text: '·t', color: '#3b82f6', delay: 26 },
        { text: ' − ', color: '#94a3b8', delay: 34 },
        { text: '½g', color: '#f87171', delay: 40 },
        { text: '·t²', color: '#3b82f6', delay: 48 },
    ];

    return (
        <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 42, fontWeight: 700, fontFamily: 'serif',
            gap: 2,
        }}>
            {parts.map((p, i) => {
                const opacity = interpolate(frame, [p.delay, p.delay + 12], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
                const translateY = interpolate(frame, [p.delay, p.delay + 12], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
                return (
                    <span key={i} style={{
                        color: p.color,
                        opacity,
                        transform: `translateY(${translateY}px)`,
                        display: 'inline-block',
                        textShadow: `0 0 20px ${p.color}40`,
                    }}>
                        {p.text}
                    </span>
                );
            })}
        </div>
    );
};

const ReplayComposition = ({ v0, angle, gravity, drag }) => {
    const frame = useCurrentFrame();
    const { fps, width, height } = useVideoConfig();

    const timeline = usePhysicsTimeline({ v0, angle, gravity, drag, fps });
    const { trajectory, apexFrame, landingFrame, maxX, maxY } = timeline;

    // Remap simulation frames to our composition timeline
    const simFrameCount = landingFrame || trajectory.length - 1;
    const launchPhaseFrames = PHASES.LAUNCH.dur + PHASES.APEX.dur + PHASES.DESCENT.dur; // 210 frames for actual motion
    const simFrame = (phaseFrame) => Math.round((phaseFrame / launchPhaseFrames) * simFrameCount);

    // Scaling
    const PADDING = 100;
    const drawW = width - PADDING * 2;
    const drawH = height - PADDING * 1.5;
    const sx = maxX > 0 ? drawW / (maxX * 1.15) : 1;
    const sy = maxY > 0 ? drawH / (maxY * 1.15) : 1;
    const sc = Math.min(sx, sy);
    const toX = (wx) => PADDING + wx * sc;
    const toY = (wy) => height - PADDING - wy * sc;

    // Current motion frame (mapped from phases 2-4)
    const motionLocalFrame = frame >= PHASES.LAUNCH.from ? frame - PHASES.LAUNCH.from : 0;
    const currentSimFrame = Math.min(simFrame(motionLocalFrame), trajectory.length - 1);
    const state = trajectory[Math.max(0, currentSimFrame)];

    const ballX = toX(state?.x || 0);
    const ballY = toY(state?.y || 0);

    // Trail up to current frame
    const trailEnd = Math.min(currentSimFrame, trajectory.length);
    const trailSlice = trajectory.slice(0, trailEnd + 1);

    return (
        <AbsoluteFill style={{ backgroundColor: '#0f172a', fontFamily: 'Inter, system-ui, sans-serif' }}>
            {/* ── Phase 1: Equation Reveal ── */}
            <Sequence from={PHASES.EQUATION.from} durationInFrames={PHASES.EQUATION.dur}>
                <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 30 }}>
                    <div style={{
                        fontSize: 18, color: '#64748b', fontWeight: 600, letterSpacing: 2,
                        textTransform: 'uppercase',
                        opacity: interpolate(frame, [0, 15], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
                    }}>
                        Projectile Motion
                    </div>
                    <EquationReveal frame={frame} fps={fps} />
                    <div style={{
                        fontSize: 14, color: '#475569', maxWidth: 500, textAlign: 'center', lineHeight: 1.6,
                        opacity: interpolate(frame, [55, 70], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
                    }}>
                        The vertical position of a projectile is determined by initial velocity,
                        launch angle, and gravitational acceleration.
                    </div>
                </AbsoluteFill>
            </Sequence>

            {/* ── Phases 2–4: Motion Visualization ── */}
            <Sequence from={PHASES.LAUNCH.from} durationInFrames={PHASES.LAUNCH.dur + PHASES.APEX.dur + PHASES.DESCENT.dur}>
                <AbsoluteFill>
                    <svg width={width} height={height}>
                        {/* Ground */}
                        <line x1={0} y1={toY(0)} x2={width} y2={toY(0)} stroke="#334155" strokeWidth={2} />

                        {/* Trail */}
                        {trailSlice.length > 1 && trailSlice.slice(1).map((p, i) => {
                            const prev = trailSlice[i];
                            const progress = i / trailSlice.length;
                            return (
                                <line key={i}
                                    x1={toX(prev.x)} y1={toY(prev.y)}
                                    x2={toX(p.x)} y2={toY(p.y)}
                                    stroke={`rgba(251, 191, 36, ${0.2 + progress * 0.8})`}
                                    strokeWidth={2.5} strokeLinecap="round"
                                />
                            );
                        })}

                        {/* Velocity decomposition arrows (Vx, Vy) */}
                        {state && (
                            <g>
                                {/* Vx arrow (horizontal, cyan) */}
                                <line x1={ballX} y1={ballY} x2={ballX + (state.vx || 0) * 2.5} y2={ballY}
                                    stroke="#22d3ee" strokeWidth={2} strokeDasharray="4 2" />
                                {/* Vy arrow (vertical, purple) */}
                                <line x1={ballX} y1={ballY} x2={ballX} y2={ballY - (state.vy || 0) * 2.5}
                                    stroke="#a855f7" strokeWidth={2} strokeDasharray="4 2" />
                                {/* Combined velocity (gold) */}
                                <line x1={ballX} y1={ballY}
                                    x2={ballX + (state.vx || 0) * 2.5} y2={ballY - (state.vy || 0) * 2.5}
                                    stroke="#fbbf24" strokeWidth={2.5} />
                            </g>
                        )}

                        {/* Ball */}
                        <circle cx={ballX} cy={ballY} r={18} fill="rgba(251, 191, 36, 0.12)" />
                        <circle cx={ballX} cy={ballY} r={10} fill="rgba(255, 220, 150, 0.5)" />
                        <circle cx={ballX} cy={ballY} r={6} fill="#fff" />
                    </svg>

                    {/* Velocity labels */}
                    {state && (
                        <>
                            <div style={{
                                position: 'absolute',
                                left: ballX + (state.vx || 0) * 2.5 + 8,
                                top: ballY - 8,
                                color: '#22d3ee', fontSize: 11, fontFamily: 'monospace', fontWeight: 700,
                                opacity: Math.abs(state.vx || 0) > 1 ? 0.8 : 0,
                            }}>
                                Vx: {(state.vx || 0).toFixed(1)}
                            </div>
                            <div style={{
                                position: 'absolute',
                                left: ballX + 10,
                                top: ballY - (state.vy || 0) * 2.5 - 18,
                                color: '#a855f7', fontSize: 11, fontFamily: 'monospace', fontWeight: 700,
                                opacity: Math.abs(state.vy || 0) > 0.5 ? 0.8 : 0,
                            }}>
                                Vy: {(state.vy || 0).toFixed(1)}
                            </div>
                        </>
                    )}
                </AbsoluteFill>
            </Sequence>

            {/* ── Apex Highlight (within Phase 3) ── */}
            <Sequence from={PHASES.APEX.from} durationInFrames={PHASES.APEX.dur}>
                {(() => {
                    const localF = frame - PHASES.APEX.from;
                    const apexState = trajectory[apexFrame] || { x: 0, y: 0 };
                    const pulseScale = spring({ fps, frame: localF, config: { damping: 12, stiffness: 80 } });
                    return (
                        <div style={{
                            position: 'absolute',
                            left: toX(apexState.x) - 80,
                            top: toY(apexState.y) - 60,
                            transform: `scale(${pulseScale})`,
                            background: 'rgba(168, 85, 247, 0.9)',
                            borderRadius: 12,
                            padding: '10px 18px',
                            color: '#fff',
                            fontSize: 14,
                            fontWeight: 700,
                            textAlign: 'center',
                            boxShadow: '0 0 30px rgba(168, 85, 247, 0.5)',
                        }}>
                            <div>🏔 APEX</div>
                            <div style={{ fontSize: 11, opacity: 0.8, marginTop: 4 }}>
                                Vy = 0 | Height = {apexState.y.toFixed(1)}m
                            </div>
                        </div>
                    );
                })()}
            </Sequence>

            {/* ── Phase 5: Summary Stats ── */}
            <Sequence from={PHASES.SUMMARY.from} durationInFrames={PHASES.SUMMARY.dur}>
                {(() => {
                    const localF = frame - PHASES.SUMMARY.from;
                    const fadeIn = interpolate(localF, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
                    const landState = trajectory[Math.min(landingFrame, trajectory.length - 1)];

                    const stats = [
                        { label: 'Range', value: `${landState.x.toFixed(1)} m`, color: '#3b82f6' },
                        { label: 'Max Height', value: `${(trajectory[apexFrame]?.y || 0).toFixed(1)} m`, color: '#a855f7' },
                        { label: 'Flight Time', value: `${landState.t.toFixed(2)} s`, color: '#22d3ee' },
                        { label: 'Initial Speed', value: `${v0} m/s`, color: '#fbbf24' },
                        { label: 'Launch Angle', value: `${angle}°`, color: '#f87171' },
                    ];

                    return (
                        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
                            <div style={{
                                opacity: fadeIn,
                                background: 'rgba(15, 23, 42, 0.95)',
                                border: '1px solid rgba(59, 130, 246, 0.3)',
                                borderRadius: 16,
                                padding: '30px 40px',
                                display: 'flex', flexDirection: 'column', gap: 14,
                                boxShadow: '0 0 40px rgba(59, 130, 246, 0.15)',
                            }}>
                                <div style={{ color: '#e2e8f0', fontSize: 20, fontWeight: 700, textAlign: 'center', marginBottom: 8 }}>
                                    📊 Flight Summary
                                </div>
                                {stats.map((s, i) => {
                                    const delay = i * 5;
                                    const itemFade = interpolate(localF, [delay + 5, delay + 15], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
                                    return (
                                        <div key={i} style={{
                                            display: 'flex', justifyContent: 'space-between',
                                            gap: 40, opacity: itemFade,
                                        }}>
                                            <span style={{ color: '#94a3b8', fontSize: 14 }}>{s.label}</span>
                                            <span style={{ color: s.color, fontSize: 14, fontWeight: 700, fontFamily: 'monospace' }}>{s.value}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </AbsoluteFill>
                    );
                })()}
            </Sequence>

            {/* ── Phase indicator (bottom bar) ── */}
            <div style={{
                position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)',
                display: 'flex', gap: 8,
            }}>
                {Object.entries(PHASES).map(([name, phase]) => {
                    const active = frame >= phase.from && frame < phase.from + phase.dur;
                    return (
                        <div key={name} style={{
                            padding: '3px 10px', borderRadius: 12,
                            fontSize: 10, fontWeight: 600, letterSpacing: 1,
                            background: active ? 'rgba(59, 130, 246, 0.8)' : 'rgba(30, 41, 59, 0.6)',
                            color: active ? '#fff' : '#64748b',
                            transition: 'all 0.3s',
                        }}>
                            {name}
                        </div>
                    );
                })}
            </div>
        </AbsoluteFill>
    );
};

export default ReplayComposition;
