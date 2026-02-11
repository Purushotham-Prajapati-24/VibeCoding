/**
 * useCompareEngine — Dual synchronized physics engines.
 * World A and World B share v0/angle but have independent gravity/drag.
 * Single rAF loop steps both engines simultaneously.
 *
 * Uses refs for isRunning/params to avoid stale closure issues
 * (critical for JuryMode's setTimeout chain).
 */
import { useState, useRef, useEffect, useCallback } from 'react';
import { ProjectileEngine } from '../physics/projectileRealtimeEngine';

const useCompareEngine = () => {
    const [paramsA, setParamsA] = useState({
        v0: 50, angle: 45, gravity: 9.81, drag: 0,
        label: '🌍 Earth',
    });
    const [paramsB, setParamsB] = useState({
        v0: 50, angle: 45, gravity: 1.62, drag: 0,
        label: '🌙 Moon',
    });

    const [isRunning, setIsRunning] = useState(false);

    // Refs mirror state so rAF and setTimeout callbacks never see stale values
    const isRunningRef = useRef(false);
    const paramsARef = useRef(paramsA);
    const paramsBRef = useRef(paramsB);

    // Keep refs in sync
    useEffect(() => { isRunningRef.current = isRunning; }, [isRunning]);
    useEffect(() => { paramsARef.current = paramsA; }, [paramsA]);
    useEffect(() => { paramsBRef.current = paramsB; }, [paramsB]);

    const engineA = useRef(new ProjectileEngine());
    const engineB = useRef(new ProjectileEngine());
    const requestRef = useRef();

    const stateA = useRef({ x: 0, y: 0, t: 0, history: [], noDragHistory: [] });
    const stateB = useRef({ x: 0, y: 0, t: 0, history: [], noDragHistory: [] });

    const update = useCallback(() => {
        const dt = 1 / 60;

        const rA = engineA.current.step(dt);
        const rB = engineB.current.step(dt);

        stateA.current = {
            x: rA.x, y: rA.y, vx: rA.vx, vy: rA.vy, t: rA.t,
            history: engineA.current.history,
            noDragHistory: [],
        };
        stateB.current = {
            x: rB.x, y: rB.y, vx: rB.vx, vy: rB.vy, t: rB.t,
            history: engineB.current.history,
            noDragHistory: [],
        };

        if (rA.isLanded && rB.isLanded) {
            setIsRunning(false);
            return;
        }
        requestRef.current = requestAnimationFrame(update);
    }, []);

    const start = useCallback(() => {
        // Always read from refs — never from stale closure state
        if (isRunningRef.current) return;

        // Always re-initialize engines fresh from current params
        const pA = paramsARef.current;
        const pB = paramsBRef.current;
        engineA.current.initialize(pA.v0, pA.angle, pA.gravity, pA.drag);
        engineB.current.initialize(pB.v0, pB.angle, pB.gravity, pB.drag);
        stateA.current = { x: 0, y: 0, vx: 0, vy: 0, t: 0, history: [], noDragHistory: [] };
        stateB.current = { x: 0, y: 0, vx: 0, vy: 0, t: 0, history: [], noDragHistory: [] };
        setIsRunning(true);
    }, []);

    const pause = useCallback(() => setIsRunning(false), []);

    const reset = useCallback(() => {
        setIsRunning(false);
        engineA.current.reset();
        engineB.current.reset();
        stateA.current = { x: 0, y: 0, vx: 0, vy: 0, t: 0, history: [], noDragHistory: [] };
        stateB.current = { x: 0, y: 0, vx: 0, vy: 0, t: 0, history: [], noDragHistory: [] };
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
    }, []);

    // Sync shared params (v0, angle) from A to B
    const setSharedParams = useCallback((key, value) => {
        if (key === 'v0' || key === 'angle') {
            setParamsA(p => ({ ...p, [key]: value }));
            setParamsB(p => ({ ...p, [key]: value }));
        }
    }, []);

    useEffect(() => {
        if (isRunning) {
            requestRef.current = requestAnimationFrame(update);
        } else {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        }
        return () => { if (requestRef.current) cancelAnimationFrame(requestRef.current); };
    }, [isRunning, update]);

    return {
        isRunning, start, pause, reset,
        paramsA, setParamsA, stateA,
        paramsB, setParamsB, stateB,
        setSharedParams,
    };
};

export default useCompareEngine;
