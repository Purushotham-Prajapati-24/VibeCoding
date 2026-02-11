/**
 * SpotlightOverlay — Auto-detects apex/impact and shows glow + label.
 * DOM overlay with pointer-events: none.
 */
import React, { useState, useEffect, useRef } from 'react';
import { detectMoments, checkNearMoment } from '../analytics/peakDetector';

const SpotlightOverlay = ({ simulationStateRef, isRunning, enabled }) => {
    const [activeMoment, setActiveMoment] = useState(null);
    const momentsRef = useRef([]);
    const lastIndexRef = useRef(0);

    useEffect(() => {
        if (!enabled || !isRunning) {
            setActiveMoment(null);
            return;
        }

        let frame;
        const check = () => {
            const history = simulationStateRef.current?.history;
            if (!history || history.length < 3) {
                frame = requestAnimationFrame(check);
                return;
            }

            // Detect moments from full history
            momentsRef.current = detectMoments(history);

            // Check if we're near a moment
            const idx = history.length - 1;
            if (idx !== lastIndexRef.current) {
                lastIndexRef.current = idx;
                const near = checkNearMoment(momentsRef.current, idx, 5);
                if (near) {
                    setActiveMoment(near);
                    // Auto-clear after 2 seconds
                    setTimeout(() => setActiveMoment(null), 2000);
                }
            }

            frame = requestAnimationFrame(check);
        };
        frame = requestAnimationFrame(check);
        return () => cancelAnimationFrame(frame);
    }, [enabled, isRunning, simulationStateRef]);

    if (!activeMoment) return null;

    return (
        <div className="absolute inset-0 pointer-events-none z-20 flex items-center justify-center">
            {/* Radial glow */}
            <div className="absolute inset-0" style={{
                background: activeMoment.type === 'apex'
                    ? 'radial-gradient(circle at center, rgba(168, 85, 247, 0.15) 0%, transparent 60%)'
                    : 'radial-gradient(circle at center, rgba(59, 130, 246, 0.15) 0%, transparent 60%)',
                animation: 'pulse 0.8s ease-in-out',
            }} />

            {/* Label card */}
            <div
                className="relative animate-bounce"
                style={{
                    background: activeMoment.type === 'apex'
                        ? 'rgba(168, 85, 247, 0.9)'
                        : 'rgba(59, 130, 246, 0.9)',
                    borderRadius: 16,
                    padding: '12px 24px',
                    boxShadow: activeMoment.type === 'apex'
                        ? '0 0 40px rgba(168, 85, 247, 0.5)'
                        : '0 0 40px rgba(59, 130, 246, 0.5)',
                    textAlign: 'center',
                }}
            >
                <div className="text-white text-lg font-bold">{activeMoment.label}</div>
                <div className="text-white/70 text-xs mt-1">{activeMoment.description}</div>
                <div className="text-white/50 text-[10px] mt-1 font-mono">
                    t = {activeMoment.time.toFixed(2)}s
                </div>
            </div>
        </div>
    );
};

export default SpotlightOverlay;
