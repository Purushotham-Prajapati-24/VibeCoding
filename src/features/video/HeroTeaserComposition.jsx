import React from 'react';
import { interpolate, useCurrentFrame, useVideoConfig, AbsoluteFill } from 'remotion';

export const HeroTeaserComposition = () => {
    const frame = useCurrentFrame();
    const { width, height, fps } = useVideoConfig();

    // Physics constants for teaser
    const v0 = 60;
    const angle = 45;
    const g = 9.81;
    const angleRad = (angle * Math.PI) / 180;

    const t = frame / fps;
    const x = v0 * Math.cos(angleRad) * t;
    const y = v0 * Math.sin(angleRad) * t - 0.5 * g * t * t;

    // Scaling to fit 1280x720
    const scale = 8;
    const canvasX = 100 + x * scale;
    const canvasY = height - 100 - y * scale;

    const opacity = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: 'clamp' });

    return (
        <AbsoluteFill className="bg-slate-950 overflow-hidden">
            {/* Ground Line */}
            <div
                className="absolute left-0 right-0 border-t border-slate-800/50"
                style={{ top: height - 100 }}
            />

            {/* Trajectory Path (approx) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <path
                    d={`M 100 ${height - 100} Q ${(100 + canvasX) / 2} ${canvasY - 100} ${canvasX} ${canvasY}`}
                    fill="none"
                    stroke="rgba(59, 130, 246, 0.2)"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                />
            </svg>

            {/* The Ball */}
            <div
                className="absolute rounded-full bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.8)] border border-blue-300/50"
                style={{
                    width: 24,
                    height: 24,
                    transform: `translate(${canvasX - 12}px, ${canvasY - 12}px)`,
                    opacity
                }}
            />

            {/* Vector Arrow (Velocities) */}
            <div
                className="absolute h-0.5 bg-emerald-400 origin-left shadow-[0_0_10px_rgba(52,211,153,0.5)]"
                style={{
                    left: canvasX,
                    top: canvasY,
                    width: 60,
                    transform: `rotate(${-angle}deg)`,
                    opacity: interpolate(frame, [10, 20], [0, 0.6], { extrapolateLeft: 'clamp' })
                }}
            />

            {/* Floating Equation Text */}
            <div
                className="absolute text-slate-500 font-mono text-xs"
                style={{
                    left: canvasX + 20,
                    top: canvasY - 40,
                    opacity: interpolate(frame, [30, 45], [0, 0.5], { extrapolateLeft: 'clamp' })
                }}
            >
                y = v₀sin(θ)t - ½gt²
            </div>
        </AbsoluteFill>
    );
};

export default HeroTeaserComposition;
