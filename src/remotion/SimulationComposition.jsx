/**
 * SimulationComposition — Cinematic Replay
 * Frame-based rendering of the user's actual simulation data.
 * Mounted inside Remotion Player after landing.
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

const SimulationComposition = ({ v0, angle, gravity, drag }) => {
    const frame = useCurrentFrame();
    const { fps, width, height, durationInFrames } = useVideoConfig();

    const timeline = usePhysicsTimeline({ v0, angle, gravity, drag, fps });
    const { trajectory, noDragTrajectory, apexFrame, landingFrame, maxX, maxY } = timeline;

    // Get current state
    const currentState = timeline.getStateAtFrame(frame);

    // Scaling: map physics world to screen
    const PADDING = 80;
    const drawW = width - PADDING * 2;
    const drawH = height - PADDING * 2;
    const scaleX = maxX > 0 ? drawW / (maxX * 1.15) : 1;
    const scaleY = maxY > 0 ? drawH / (maxY * 1.15) : 1;
    const scale = Math.min(scaleX, scaleY);

    const toScreenX = (wx) => PADDING + wx * scale;
    const toScreenY = (wy) => height - PADDING - wy * scale;

    // Trail points up to current frame
    const trailPoints = trajectory.slice(0, frame + 1);
    const trailPath = trailPoints.map((p, i) =>
        `${i === 0 ? 'M' : 'L'} ${toScreenX(p.x)} ${toScreenY(p.y)}`
    ).join(' ');

    // No-drag ghost trail (full)
    const noDragPath = noDragTrajectory ? noDragTrajectory.map((p, i) =>
        `${i === 0 ? 'M' : 'L'} ${toScreenX(p.x)} ${toScreenY(p.y)}`
    ).join(' ') : '';

    // Ball position
    const ballX = toScreenX(currentState.x);
    const ballY = toScreenY(currentState.y);

    // Velocity arrow
    const speed = currentState.speed || 0;
    const arrowScale = 3;
    const arrowEndX = ballX + (currentState.vx || 0) * arrowScale;
    const arrowEndY = ballY - (currentState.vy || 0) * arrowScale;

    // Apex highlight
    const isNearApex = Math.abs(frame - apexFrame) < 10;
    const apexSpring = spring({ fps, frame: Math.max(0, frame - apexFrame + 10), config: { damping: 15, stiffness: 100 } });

    // Landing highlight
    const isNearLanding = frame >= landingFrame - 5;
    const landingOpacity = interpolate(frame, [landingFrame - 5, landingFrame + 10], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

    // Grid lines
    const gridStep = Math.max(1, Math.ceil(maxX / 8));
    const gridLinesX = [];
    const gridLinesY = [];
    for (let gx = 0; gx <= maxX * 1.15; gx += gridStep) {
        gridLinesX.push(toScreenX(gx));
    }
    for (let gy = 0; gy <= maxY * 1.15; gy += gridStep) {
        gridLinesY.push(toScreenY(gy));
    }

    return (
        <AbsoluteFill style={{ backgroundColor: '#0f172a', fontFamily: 'Inter, system-ui, sans-serif' }}>
            <svg width={width} height={height}>
                {/* Grid */}
                {gridLinesX.map((x, i) => (
                    <line key={`gx-${i}`} x1={x} y1={0} x2={x} y2={height} stroke="#1e293b" strokeWidth={1} />
                ))}
                {gridLinesY.map((y, i) => (
                    <line key={`gy-${i}`} x1={0} y1={y} x2={width} y2={y} stroke="#1e293b" strokeWidth={1} />
                ))}

                {/* Ground line */}
                <line x1={0} y1={toScreenY(0)} x2={width} y2={toScreenY(0)} stroke="#334155" strokeWidth={2} />

                {/* No-drag ghost trail */}
                {noDragPath && (
                    <path d={noDragPath} fill="none" stroke="rgba(34, 197, 94, 0.3)" strokeWidth={2} strokeDasharray="6 4" />
                )}

                {/* Main trail (gradient via multiple segments) */}
                {trailPoints.length > 1 && trailPoints.slice(1).map((p, i) => {
                    const prev = trailPoints[i];
                    const progress = i / trailPoints.length;
                    const alpha = 0.3 + progress * 0.7;
                    return (
                        <line
                            key={`trail-${i}`}
                            x1={toScreenX(prev.x)} y1={toScreenY(prev.y)}
                            x2={toScreenX(p.x)} y2={toScreenY(p.y)}
                            stroke={`rgba(251, 191, 36, ${alpha})`}
                            strokeWidth={2.5}
                            strokeLinecap="round"
                        />
                    );
                })}

                {/* Velocity arrow */}
                {speed > 1 && (
                    <g>
                        <line x1={ballX} y1={ballY} x2={arrowEndX} y2={arrowEndY}
                            stroke="#fbbf24" strokeWidth={2} />
                        <circle cx={arrowEndX} cy={arrowEndY} r={3} fill="#fbbf24" />
                    </g>
                )}

                {/* Gravity arrow (always pointing down) */}
                <g opacity={0.5}>
                    <line x1={ballX} y1={ballY + 20} x2={ballX} y2={ballY + 55}
                        stroke="#f87171" strokeWidth={2} markerEnd="url(#arrowRed)" />
                    <defs>
                        <marker id="arrowRed" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                            <path d="M0,0 L8,4 L0,8 Z" fill="#f87171" />
                        </marker>
                    </defs>
                </g>

                {/* Ball glow */}
                <circle cx={ballX} cy={ballY} r={20} fill="rgba(251, 191, 36, 0.15)" />
                <circle cx={ballX} cy={ballY} r={12} fill="rgba(255, 220, 150, 0.4)" />
                <circle cx={ballX} cy={ballY} r={7} fill="#fff" />
            </svg>

            {/* Apex label */}
            {isNearApex && (
                <Sequence from={Math.max(0, apexFrame - 10)} durationInFrames={40}>
                    <div style={{
                        position: 'absolute',
                        left: toScreenX(trajectory[apexFrame].x) - 60,
                        top: toScreenY(trajectory[apexFrame].y) - 50,
                        transform: `scale(${apexSpring})`,
                        background: 'rgba(168, 85, 247, 0.85)',
                        borderRadius: 8,
                        padding: '6px 14px',
                        color: '#fff',
                        fontSize: 13,
                        fontWeight: 700,
                        boxShadow: '0 0 20px rgba(168, 85, 247, 0.4)',
                        whiteSpace: 'nowrap',
                    }}>
                        🏔 APEX — {trajectory[apexFrame].y.toFixed(1)}m
                    </div>
                </Sequence>
            )}

            {/* Landing label */}
            {isNearLanding && (
                <div style={{
                    position: 'absolute',
                    left: toScreenX(trajectory[Math.min(landingFrame, trajectory.length - 1)].x) - 50,
                    bottom: PADDING + 20,
                    opacity: landingOpacity,
                    background: 'rgba(59, 130, 246, 0.85)',
                    borderRadius: 8,
                    padding: '6px 14px',
                    color: '#fff',
                    fontSize: 13,
                    fontWeight: 700,
                    boxShadow: '0 0 20px rgba(59, 130, 246, 0.4)',
                    whiteSpace: 'nowrap',
                }}>
                    🎯 Range: {trajectory[Math.min(landingFrame, trajectory.length - 1)].x.toFixed(1)}m
                </div>
            )}

            {/* Stats HUD */}
            <div style={{
                position: 'absolute', top: 16, left: 20,
                background: 'rgba(15, 23, 42, 0.8)',
                borderRadius: 12, padding: '10px 16px',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                color: '#94a3b8', fontSize: 12, fontFamily: 'monospace',
                display: 'flex', flexDirection: 'column', gap: 4,
            }}>
                <div style={{ color: '#e2e8f0', fontWeight: 700, fontSize: 14, marginBottom: 4 }}>
                    🎬 Cinematic Replay
                </div>
                <div>t = <span style={{ color: '#3b82f6' }}>{currentState.t.toFixed(2)}s</span></div>
                <div>x = <span style={{ color: '#fbbf24' }}>{currentState.x.toFixed(1)}m</span></div>
                <div>y = <span style={{ color: '#a855f7' }}>{currentState.y.toFixed(1)}m</span></div>
                <div>v = <span style={{ color: '#22d3ee' }}>{speed.toFixed(1)} m/s</span></div>
            </div>
        </AbsoluteFill>
    );
};

export default SimulationComposition;
