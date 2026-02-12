import { useCallback } from 'react';

// Simple audio context singleton to avoid recreating on every render
// We initialize it lazily to avoid issues with SSR or strict mode double-invocations causing warnings
let audioContext;

const getAudioContext = () => {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioContext;
};

export const useSound = () => {
    const play = useCallback((soundName) => {
        try {
            const ctx = getAudioContext();

            if (ctx.state === 'suspended') {
                ctx.resume();
            }

            const osc = ctx.createOscillator();
            const gainNode = ctx.createGain();

            osc.connect(gainNode);
            gainNode.connect(ctx.destination);

            const now = ctx.currentTime;

            if (soundName === 'click') {
                // Short "pop" sound
                osc.type = 'sine';
                osc.frequency.setValueAtTime(1200, now);
                osc.frequency.exponentialRampToValueAtTime(100, now + 0.1);

                gainNode.gain.setValueAtTime(0.3, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

                osc.start(now);
                osc.stop(now + 0.1);
            }
            else if (soundName === 'success') {
                // Pleasant ascending chime
                const osc2 = ctx.createOscillator();
                const gain2 = ctx.createGain();

                osc2.connect(gain2);
                gain2.connect(ctx.destination);

                osc.type = 'sine';
                osc2.type = 'sine';

                // First note
                osc.frequency.setValueAtTime(523.25, now); // C5
                gainNode.gain.setValueAtTime(0.2, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

                // Second note (delayed)
                osc2.frequency.setValueAtTime(659.25, now + 0.1); // E5
                gain2.gain.setValueAtTime(0, now);
                gain2.gain.setValueAtTime(0.2, now + 0.1);
                gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.6);

                osc.start(now);
                osc2.start(now);
                osc.stop(now + 0.6);
                osc2.stop(now + 0.6);
            }
            else if (soundName === 'error') {
                // Low buzz/thud
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(150, now);
                osc.frequency.linearRampToValueAtTime(100, now + 0.2);

                gainNode.gain.setValueAtTime(0.2, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

                osc.start(now);
                osc.stop(now + 0.2);
            }
        } catch (error) {
            console.error("Audio playback permission denied or failed:", error);
        }
    }, []);

    return { play };
};

export default useSound;
