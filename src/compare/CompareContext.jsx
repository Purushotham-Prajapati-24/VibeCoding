/**
 * CompareContext — Global context for compare mode + feature toggles.
 * Wraps both single engine and compare engine, exposes everything via context.
 */
import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import usePhysicsSimulation from '../hooks/usePhysicsSimulation';
import useCompareEngine from './useCompareEngine';

const CompareCtx = createContext(null);

export const useCompareContext = () => {
    const ctx = useContext(CompareCtx);
    if (!ctx) throw new Error('useCompareContext must be inside CompareProvider');
    return ctx;
};

export const CompareProvider = ({ children }) => {
    // Feature toggles
    const [compareMode, setCompareMode] = useState(false);
    const [conceptOverlay, setConceptOverlay] = useState(false);
    const [spotlightEnabled, setSpotlightEnabled] = useState(true);
    const [juryMode, setJuryMode] = useState(false);

    // Keep a ref to compareMode so functions (start/reset) don't need it as a dependency
    // This solves the stale closure issue in JuryMode's setTimeout chain.
    const compareModeRef = useRef(compareMode);
    useEffect(() => { compareModeRef.current = compareMode; }, [compareMode]);

    // Engines
    const single = usePhysicsSimulation();
    const compare = useCompareEngine();

    // Use refs to hold latest engine instances so start/stop/reset are stable
    const singleRef = useRef(single);
    const compareRef = useRef(compare);
    useEffect(() => { singleRef.current = single; }, [single]);
    useEffect(() => { compareRef.current = compare; }, [compare]);

    // Unified start/pause/reset taking the *current* mode and engine from refs
    // This function never changes identity, making it safe for Jury Mode closures.
    const start = useCallback(() => {
        if (compareModeRef.current) compareRef.current.start();
        else singleRef.current.start();
    }, []);

    const pause = useCallback(() => {
        if (compareModeRef.current) compareRef.current.pause();
        else singleRef.current.pause();
    }, []);

    const reset = useCallback(() => {
        // Reset BOTH to be safe, or just the active one.
        // Resetting both ensures no background state lingers if user switched modes while running.
        singleRef.current.reset();
        compareRef.current.reset();
    }, []);

    const isRunning = compareMode ? compare.isRunning : single.isRunning;

    const value = {
        // Mode
        compareMode, setCompareMode,
        conceptOverlay, setConceptOverlay,
        spotlightEnabled, setSpotlightEnabled,
        juryMode, setJuryMode,

        // Unified controls
        isRunning, start, pause, reset,

        // Single engine
        single,

        // Compare engine
        compare,
    };

    return <CompareCtx.Provider value={value}>{children}</CompareCtx.Provider>;
};
