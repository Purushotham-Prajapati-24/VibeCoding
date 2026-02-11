/**
 * RemotionPlayerModal — Full-screen glassmorphism modal
 * Embeds @remotion/player with controls, speed multiplier, and close button.
 */
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Player } from '@remotion/player';
import { X, RotateCcw } from 'lucide-react';

const SPEED_OPTIONS = [0.5, 1, 2];

const RemotionPlayerModal = ({ isOpen, onClose, composition, compositionProps, title, durationInFrames }) => {
    const [playbackRate, setPlaybackRate] = useState(1);
    const [loop, setLoop] = useState(false);
    const playerRef = useRef(null);

    // Close on Escape key
    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === 'Escape' && isOpen) onClose();
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [isOpen, onClose]);

    if (!isOpen || !composition) return null;

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(0, 0, 0, 0.85)',
                backdropFilter: 'blur(12px)',
            }}
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div
                style={{
                    position: 'relative',
                    width: '85vw',
                    maxWidth: 1280,
                    background: 'rgba(15, 23, 42, 0.95)',
                    borderRadius: 20,
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    overflow: 'hidden',
                    boxShadow: '0 0 60px rgba(59, 130, 246, 0.15)',
                }}
            >
                {/* Header */}
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '14px 20px',
                    borderBottom: '1px solid rgba(51, 65, 85, 0.5)',
                }}>
                    <h2 style={{ color: '#e2e8f0', fontSize: 16, fontWeight: 700, margin: 0, fontFamily: 'Inter, system-ui, sans-serif' }}>
                        {title || '🎬 Remotion Player'}
                    </h2>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        {/* Speed controls */}
                        <div style={{ display: 'flex', gap: 4 }}>
                            {SPEED_OPTIONS.map((s) => (
                                <button
                                    key={s}
                                    onClick={() => setPlaybackRate(s)}
                                    style={{
                                        padding: '4px 10px',
                                        borderRadius: 8,
                                        fontSize: 11,
                                        fontWeight: 700,
                                        fontFamily: 'monospace',
                                        border: 'none',
                                        cursor: 'pointer',
                                        background: playbackRate === s ? 'rgba(59, 130, 246, 0.8)' : 'rgba(30, 41, 59, 0.8)',
                                        color: playbackRate === s ? '#fff' : '#94a3b8',
                                    }}
                                >
                                    {s}x
                                </button>
                            ))}
                        </div>

                        {/* Loop toggle */}
                        <button
                            onClick={() => setLoop(!loop)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 4,
                                padding: '4px 10px', borderRadius: 8,
                                fontSize: 11, fontWeight: 600,
                                border: 'none', cursor: 'pointer',
                                background: loop ? 'rgba(34, 197, 94, 0.3)' : 'rgba(30, 41, 59, 0.8)',
                                color: loop ? '#4ade80' : '#64748b',
                            }}
                        >
                            <RotateCcw size={12} />
                            Loop
                        </button>

                        {/* Close */}
                        <button
                            onClick={onClose}
                            style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                width: 32, height: 32, borderRadius: '50%',
                                border: 'none', cursor: 'pointer',
                                background: 'rgba(239, 68, 68, 0.2)',
                                color: '#f87171',
                            }}
                        >
                            <X size={16} />
                        </button>
                    </div>
                </div>

                {/* Player */}
                <div style={{ padding: 12 }}>
                    <Player
                        ref={playerRef}
                        component={composition}
                        inputProps={compositionProps}
                        durationInFrames={durationInFrames || 180}
                        fps={30}
                        compositionWidth={1280}
                        compositionHeight={720}
                        style={{
                            width: '100%',
                            borderRadius: 12,
                        }}
                        controls
                        loop={loop}
                        playbackRate={playbackRate}
                        autoPlay
                    />
                </div>
            </div>
        </div>
    );
};

export default RemotionPlayerModal;
