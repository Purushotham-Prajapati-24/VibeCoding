import React from 'react';
import { AbsoluteFill, useVideoConfig, spring, useCurrentFrame, interpolate } from 'remotion';

const ConceptExplainerComposition = ({
    params = { v0: 50, angle: 45, gravity: 9.81 },
    variable = 'Range'
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // Animations
    const opacity = interpolate(frame, [0, 20], [0, 1]);
    const slideUp = interpolate(frame, [0, 20], [50, 0]);

    // Equation breakdown
    const v0x = (params.v0 * Math.cos(params.angle * Math.PI / 180)).toFixed(1);
    const v0y = (params.v0 * Math.sin(params.angle * Math.PI / 180)).toFixed(1);
    const timeToApex = (v0y / params.gravity).toFixed(2);
    const totalTime = (timeToApex * 2).toFixed(2);
    const range = (v0x * totalTime).toFixed(1);

    return (
        <AbsoluteFill style={{ backgroundColor: '#0f172a', color: 'white', fontFamily: 'Inter, sans-serif' }}>
            <div className="flex flex-col items-center justify-center h-full w-full p-12">

                {/* Title */}
                <div style={{ opacity, transform: `translateY(${slideUp}px)` }} className="text-5xl font-bold mb-8 text-blue-400">
                    Calculating {variable}
                </div>

                {/* Equation Steps */}
                <div className="space-y-6 text-3xl font-mono text-slate-300">

                    {/* Step 1: Components */}
                    {frame > 30 && (
                        <div className="flex items-center gap-4">
                            <span className="text-purple-400">v₀x</span> = {params.v0} · cos({params.angle}°) = <span className="text-white font-bold">{v0x} m/s</span>
                        </div>
                    )}

                    {/* Step 2: Time */}
                    {frame > 60 && (
                        <div className="flex items-center gap-4">
                            <span className="text-green-400">t_total</span> = 2 · ({v0y} / {params.gravity}) = <span className="text-white font-bold">{totalTime} s</span>
                        </div>
                    )}

                    {/* Step 3: Range */}
                    {frame > 90 && (
                        <div className="p-4 border-2 border-blue-500 rounded-xl bg-blue-900/30">
                            Range = <span className="text-purple-400">{v0x}</span> · <span className="text-green-400">{totalTime}</span> = <span className="text-yellow-400 font-bold text-4xl">{range} m</span>
                        </div>
                    )}

                </div>

                {/* Context Tip */}
                {frame > 120 && (
                    <div className="mt-12 text-xl text-slate-400 max-w-2xl text-center italic">
                        "The range depends heavily on the angle. 45 degrees usually gives the maximum range in a vacuum."
                    </div>
                )}

            </div>
        </AbsoluteFill>
    );
};

export default ConceptExplainerComposition;
