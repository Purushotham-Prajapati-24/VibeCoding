import { useState, useRef, useEffect, useCallback } from 'react';
import { ProjectileEngine } from '@/services/physics/projectileRealtimeEngine';

const usePhysicsSimulation = (onEvent) => {
    const [params, setParams] = useState({
        v0: 50,
        angle: 45,
        gravity: 9.81,
        drag: 0, // drag coefficient (0 = off)
        label: 'Earth',
    });

    const [isRunning, setIsRunning] = useState(false);
    const [simulationTime, setSimulationTime] = useState(0);

    // Two engines: one with drag, one without (for comparison)
    const engineRef = useRef(new ProjectileEngine());
    const noDragEngineRef = useRef(new ProjectileEngine());
    const requestRef = useRef();
    const lastHistoryRef = useRef([]); // Ghost Trajectory

    const simulationStateRef = useRef({
        x: 0, y: 0, t: 0, vx: 0, vy: 0,
        history: [],
        noDragHistory: [],
        previousHistory: [], // Exposed
    });

    // Track previous step for Event Detection
    const prevStepRef = useRef({ vy: 0, isLanded: false });

    const updateSimulation = useCallback(() => {
        const dt = 1 / 60;

        // Step main engine (with drag)
        const result = engineRef.current.step(dt);

        // Step no-drag engine (keeps going until it also lands)
        const noDragResult = noDragEngineRef.current.step(dt);

        // --- Event Detection ---
        // 1. Apex Reached (vy goes from + to -)
        if (prevStepRef.current.vy > 0 && result.vy <= 0) {
            onEvent && onEvent('APEX_REACHED', { ...result });
        }

        // 2. Impact (just landed)
        if (result.isLanded && !prevStepRef.current.isLanded) {
            onEvent && onEvent('IMPACT', { ...result });
        }

        prevStepRef.current = { vy: result.vy, isLanded: result.isLanded };

        // Update ref
        simulationStateRef.current = {
            x: result.x,
            y: result.y,
            vx: result.vx,
            vy: result.vy,
            t: result.t,
            history: engineRef.current.history,
            noDragHistory: noDragEngineRef.current.history,
            noDragLanded: noDragResult.isLanded,
            previousHistory: lastHistoryRef.current // Expose for Ghost View
        };

        // Stop when BOTH have landed (so the ghost trail completes too)
        if (result.isLanded && noDragResult.isLanded) {
            setIsRunning(false);
            return;
        }

        requestRef.current = requestAnimationFrame(updateSimulation);
    }, [onEvent]);

    const start = () => {
        if (!isRunning) {
            if (engineRef.current.t === 0) {
                // If starting fresh, save LAST run as Ghost
                if (simulationStateRef.current.history.length > 0) {
                    lastHistoryRef.current = [...simulationStateRef.current.history];
                }

                engineRef.current.initialize(params.v0, params.angle, params.gravity, params.drag);
                noDragEngineRef.current.initialize(params.v0, params.angle, params.gravity, 0); // always 0 drag
                prevStepRef.current = { vy: params.v0 * Math.sin(params.angle * Math.PI / 180), isLanded: false };
            }
            setIsRunning(true);
        }
    };

    const pause = () => {
        setIsRunning(false);
    };

    const reset = () => {
        setIsRunning(false);
        // Save history as Ghost before wiping? 
        // Typically 'reset' means clear board, so maybe keep it until next 'start'
        if (engineRef.current.history.length > 0) {
            lastHistoryRef.current = [...engineRef.current.history];
        }

        engineRef.current.reset();
        noDragEngineRef.current.reset();
        simulationStateRef.current = {
            x: 0, y: 0, vx: 0, vy: 0, t: 0,
            history: [],
            noDragHistory: [],
            previousHistory: lastHistoryRef.current
        };
        prevStepRef.current = { vy: 0, isLanded: false };

        if (requestRef.current) cancelAnimationFrame(requestRef.current);
        setSimulationTime(prev => prev + 1);
    };

    useEffect(() => {
        if (isRunning) {
            requestRef.current = requestAnimationFrame(updateSimulation);
        } else {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        }
        return () => cancelAnimationFrame(requestRef.current);
    }, [isRunning, updateSimulation]);

    return {
        isRunning,
        start,
        pause,
        reset,
        params,
        setParams,
        simulationStateRef,
        dataVersion: simulationTime,
    };
};

export default usePhysicsSimulation;
