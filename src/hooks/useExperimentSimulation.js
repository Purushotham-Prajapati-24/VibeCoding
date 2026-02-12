
import { useState, useRef, useEffect, useCallback } from 'react';
import { ProjectileEngine } from '../physics/projectileRealtimeEngine';
import { PendulumRealtimeEngine } from '../experiments/physics/PendulumRealtimeEngine';

const ENGINE_MAP = {
    'projectile': ProjectileEngine,
    'pendulum': PendulumRealtimeEngine
};

const useExperimentSimulation = (experimentId, onEvent) => {
    // 1. Identify which engine class to use
    const EngineClass = ENGINE_MAP[experimentId] || ProjectileEngine;

    const [params, setParams] = useState({});
    const [isRunning, setIsRunning] = useState(false);
    const [simulationTime, setSimulationTime] = useState(0);

    // Persist engine instance
    // Note: If experimentId changes, we might need to re-instantiate, 
    // but typically we unmount/remount ExperimentLayout so this ref is fresh.
    const engineRef = useRef(new EngineClass());
    const requestRef = useRef();

    // Simulation State (exposed to Canvas)
    const simulationStateRef = useRef({
        t: 0,
        // ... specific props (x, y, theta, etc)
        history: []
    });

    const updateSimulation = useCallback(() => {
        const dt = 1 / 60;
        const result = engineRef.current.step(dt);

        simulationStateRef.current = {
            ...result,
            history: engineRef.current.history || []
        };

        setSimulationTime(prev => prev + 1); // Trigger re-render if needed (or just use ref)

        if (isRunning) {
            requestRef.current = requestAnimationFrame(updateSimulation);
        }
    }, [isRunning]);

    const start = useCallback(() => {
        if (!isRunning) {
            // Initialize if needed? 
            // Usually we initialize on param change or specific reset.
            // But let's ensure params are locked in.
            // engineRef.current.initialize(params); // We might do this on param change instead?
            setIsRunning(true);
        }
    }, [isRunning, params]);

    const pause = useCallback(() => {
        setIsRunning(false);
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
    }, []);

    const reset = useCallback(() => {
        setIsRunning(false);
        if (requestRef.current) cancelAnimationFrame(requestRef.current);

        engineRef.current.reset();
        engineRef.current.initialize(params); // Re-init to start pos

        simulationStateRef.current = {
            t: 0,
            history: [],
            ...engineRef.current.step(0) // Get initial state
        };

        setSimulationTime(0);
    }, [params]);

    // Initialize when params change
    useEffect(() => {
        // Only initialize if NOT running? Or live update?
        // For pendulum, live update is cool (drag length while swinging).
        // For projectile, we usually lock it.
        // Let's allow live update for now, but maybe debounce?

        engineRef.current.initialize(params);

        // If not running, update state to show initial position
        if (!isRunning) {
            simulationStateRef.current = {
                t: 0,
                history: [],
                ...engineRef.current.step(0) // Get initial state 
            };
            setSimulationTime(t => t + 0.001); // Force update
        }

    }, [params, experimentId]);
    // Note: params object identity must be stable or this fires too often.
    // ExperimentLayout should ensure stable params object or we use deep comparison.

    useEffect(() => {
        if (isRunning) {
            requestRef.current = requestAnimationFrame(updateSimulation);
        }
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [isRunning, updateSimulation]);

    return {
        isRunning,
        start,
        pause,
        reset,
        params,
        setParams,
        simulationStateRef,
        dataVersion: simulationTime
    };
};

export default useExperimentSimulation;
