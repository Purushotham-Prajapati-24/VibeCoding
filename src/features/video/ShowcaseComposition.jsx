import React from 'react';
import { interpolate, useCurrentFrame, useVideoConfig, AbsoluteFill, Easing } from 'remotion';

export const ShowcaseComposition = () => {
    const frame = useCurrentFrame();
    const { width, height, fps } = useVideoConfig();

    // Slow motion physics
    const timeScale = 0.5; // Half speed
    const t = (frame / fps) * timeScale;

    const v0 = 55;
    const angle = 35;
    const g = 9.81;
    const angleRad = (angle * Math.PI) / 180;

    const x = v0 * Math.cos(angleRad) * t;
    const y = v0 * Math.sin(angleRad) * t - 0.5 * g * t * t;

    const scale = 12;
    const canvasX = 150 + x * scale;
    const canvasY = height - 150 - y * scale;

    // Camera follow logic (simulated by panning the whole field)
    const panX = interpolate(frame, [20, 150], [0, -400], { easing: Easing.bezier(0.25, 1, 0.5, 1) });

    // Equation Highlighting Logic
    const equationOpacity = interpolate(frame, [10, 25], [0, 1]);
    const uHighlight = interpolate(frame, [40, 60], [0.4, 1], { extrapolateRight: 'clamp' });
    const gtHighlight = interpolate(frame, [80, 120], [0.4, 1], { extrapolateRight: 'clamp' });

    return (
        <AbsoluteFill className="bg-black overflow-hidden select-none">
            {/* Background Grid - Dark & Cinematic */}
            <div
                className="absolute inset-0 opacity-10"
                style={{
                    backgroundImage: 'radial-gradient(circle, #334155 1px, transparent 1px)',
                    backgroundSize: '40px 40px',
                    transform: `translateX(${panX * 0.5}px)`
                }}
            />

            {/* Panning Container */}
            <div className="absolute inset-0" style={{ transform: `translateX(${panX}px)` }}>
                {/* Ground */}
                <div
                    className="absolute left-[-1000px] right-[-1000px] h-[2px] bg-gradient-to-r from-transparent via-blue-500/40 to-transparent shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                    style={{ top: height - 150 }}
                />

                {/* Vertical Axis */}
                <div
                    className="absolute w-[1px] bg-slate-800"
                    style={{ left: 150, top: 100, bottom: 150 }}
                />

                {/* Trajectory Trail */}
                <svg className="absolute inset-0 w-[3000px] h-full overflow-visible">
                    <path
                        d={`M 150 ${height - 150} Q ${(150 + canvasX) / 2} ${canvasY - 200} ${canvasX} ${canvasY}`}
                        fill="none"
                        stroke="rgba(59, 130, 246, 0.5)"
                        strokeWidth="4"
                        strokeLinecap="round"
                        className="transition-all duration-300"
                    />
                </svg>

                {/* Particle Projectile */}
                <div
                    className="absolute rounded-full bg-white shadow-[0_0_40px_rgba(255,255,255,0.9)]"
                    style={{
                        width: 32,
                        height: 32,
                        transform: `translate(${canvasX - 16}px, ${canvasY - 16}px)`
                    }}
                />

                {/* Dynamics Vectors */}
                <div
                    className="absolute flex flex-col items-center gap-2"
                    style={{
                        left: canvasX + 40,
                        top: canvasY,
                        opacity: equationOpacity
                    }}
                >
                    <div className="text-white font-bold text-lg font-display tracking-widest drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
                        V = <span style={{ opacity: uHighlight, color: '#60a5fa' }}>u</span> - <span style={{ opacity: gtHighlight, color: '#f87171' }}>gt</span>
                    </div>

                    {/* Vector Visualization */}
                    <div className="flex gap-8 mt-4">
                        <div className="flex flex-col items-center gap-1" style={{ opacity: uHighlight }}>
                            <div className="w-1 h-12 bg-blue-400 rounded-full" />
                            <span className="text-[10px] text-blue-300 font-bold uppercase">Initial Velocity</span>
                        </div>
                        <div className="flex flex-col items-center gap-1" style={{ opacity: gtHighlight }}>
                            <div className="w-1 h-20 bg-red-400 rounded-full" />
                            <span className="text-[10px] text-red-300 font-bold uppercase">Gravity Pull</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Overlays - Fixed on screen */}
            <div className="absolute top-12 left-12">
                <div className="text-slate-500 font-display text-sm tracking-[0.3em] uppercase mb-1">Module 01</div>
                <div className="text-4xl font-bold font-display text-white">GRAVITATIONAL DYNAMICS</div>
            </div>

            {/* Subtle Vignette */}
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />
        </AbsoluteFill>
    );
};

export default ShowcaseComposition;
