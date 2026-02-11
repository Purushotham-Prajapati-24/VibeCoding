import { useState, useRef, useEffect, useCallback } from 'react';
import { ProjectileEngine } from '../physics/projectileRealtimeEngine';

const usePhysicsSimulation = () => {
    const [params, setParams] = useState({
        v0: 50,
        angle: 45,
        gravity: 9.81,
        drag: 0, // drag coefficient (0 = off)
    });

    const [isRunning, setIsRunning] = useState(false);
    const [simulationTime, setSimulationTime] = useState(0);

    // Two engines: one with drag, one without (for comparison)
    const engineRef = useRef(new ProjectileEngine());
    const noDragEngineRef = useRef(new ProjectileEngine());
    const requestRef = useRef();

    const simulationStateRef = useRef({
        x: 0, y: 0, t: 0,
        history: [],
        noDragHistory: [],
    });

    const updateSimulation = useCallback(() => {
        const dt = 1 / 60;

        // Step main engine (with drag)
        const result = engineRef.current.step(dt);

        // Step no-drag engine (keeps going until it also lands)
        const noDragResult = noDragEngineRef.current.step(dt);

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
        };

        // Stop when BOTH have landed (so the ghost trail completes too)
        if (result.isLanded && noDragResult.isLanded) {
            setIsRunning(false);
            return;
        }

        requestRef.current = requestAnimationFrame(updateSimulation);
    }, []);

    const start = () => {
        if (!isRunning) {
            if (engineRef.current.t === 0) {
                engineRef.current.initialize(params.v0, params.angle, params.gravity, params.drag);
                noDragEngineRef.current.initialize(params.v0, params.angle, params.gravity, 0); // always 0 drag
            }
            setIsRunning(true);
        }
    };

    const pause = () => {
        setIsRunning(false);
    };

    const reset = () => {
        setIsRunning(false);
        engineRef.current.reset();
        noDragEngineRef.current.reset();
        simulationStateRef.current = { x: 0, y: 0, vx: 0, vy: 0, t: 0, history: [], noDragHistory: [] };
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
