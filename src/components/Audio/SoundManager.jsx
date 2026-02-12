import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const SoundContext = createContext(null);

export const useSound = () => {
    const ctx = useContext(SoundContext);
    if (!ctx) throw new Error('useSound must be used within SoundProvider');
    return ctx;
};

export const SoundProvider = ({ children }) => {
    const [volume, setVolume] = useState(0.5);
    const [isMuted, setIsMuted] = useState(false);

    // In a real app, we would load actual audio files here.
    // For this prototype, we'll use generic HTML5 Audio or empty placeholders 
    // to verify architecture without needing assets.
    const sounds = {
        click: new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3'), // Generic click
        hover: new Audio('https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3'), // Soft tick
        success: new Audio('https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3'), // Success chime
        launch: new Audio('https://assets.mixkit.co/active_storage/sfx/2044/2044-preview.mp3'), // Swoosh
        impact: new Audio('https://assets.mixkit.co/active_storage/sfx/1614/1614-preview.mp3'), // Thud
    };

    useEffect(() => {
        Object.values(sounds).forEach(audio => {
            audio.volume = volume;
            audio.preload = 'auto';
        });
    }, [volume]);

    const play = useCallback((soundName) => {
        if (isMuted) return;
        const audio = sounds[soundName];
        if (audio) {
            audio.currentTime = 0;
            audio.play().catch(e => console.warn("Audio play failed", e));
        }
    }, [isMuted, sounds]);

    return (
        <SoundContext.Provider value={{ play, setVolume, volume, isMuted, setIsMuted }}>
            {children}
        </SoundContext.Provider>
    );
};
