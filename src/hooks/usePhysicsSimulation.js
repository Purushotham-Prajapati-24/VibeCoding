import { useState, useRef, useEffect, useCallback } from 'react';
import { ProjectileEngine } from '../physics/ProjectileEngine';

const usePhysicsSimulation = () => {
    // Simulation Constants
    const [params, setParams] = useState({
        v0: 50,
        angle: 45,
        gravity: 9.81
    });

    // State for UI consumption (Canvas & Graphs)
    // We use refs for the engine to avoid re-renders during the loop, 
    // but we need some state to trigger UI updates (like the button icons or final stats).
    const [isRunning, setIsRunning] = useState(false);
    const [simulationTime, setSimulationTime] = useState(0); // Trigger re-renders for UI if needed

    // The Engine
    const engineRef = useRef(new ProjectileEngine());
    const requestRef = useRef();

    // Using refs for high-frequency data to pass to Canvas/Graph without React Render Cycle if preferred,
    // OR we just use standard state if 60fps React render is acceptable (usually is for simple apps).
    // Let's expose the *latest* data via a Ref for the Canvas to read via `useImperativeHandle` or just callback.
    // Actually, simplest is to return a `liveData` object that we mutate, and a forceUpdate.

    // Better approach: 
    // Canvas runs its own loop, reading from `simulationStateRef`.
    // Graphs run on an interval or just re-render.

    const simulationStateRef = useRef({
        x: 0,
        y: 0,
        t: 0,
        history: []
    });

    const updateSimulation = useCallback(() => {
        // 1. Step Physics
        const dt = 1 / 60; // 60 FPS fixed step
        const result = engineRef.current.step(dt);

        // 2. Update Ref for Canvas
        simulationStateRef.current = {
            x: result.x,
            y: result.y,
            vx: result.vx,
            vy: result.vy,
            t: result.t,
            history: engineRef.current.history
        };

        // 3. Stop if landed
        if (result.isLanded) {
            setIsRunning(false);
            return; // Stop loop
        }

        // 4. Continue Loop
        requestRef.current = requestAnimationFrame(updateSimulation);

        // 5. Optional: Sync React State for "Time" display every few frames to reduce lag?
        // For now, let's NOT sync React state every frame to avoid chart thrashing.
        // Graphs will read from ref or we throttle updates.
    }, []);

    const start = () => {
        if (!isRunning) {
            if (engineRef.current.t === 0) {
                // Initialize if fresh start
                engineRef.current.initialize(params.v0, params.angle, params.gravity);
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
        simulationStateRef.current = { x: 0, y: 0, vx: 0, vy: 0, t: 0, history: [] };
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
        // Force re-render to clear graphs
        setSimulationTime(prev => prev + 1);
    };

    // Watch isRunning to start/stop loop
    useEffect(() => {
        if (isRunning) {
            requestRef.current = requestAnimationFrame(updateSimulation);
        } else {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        }
        return () => cancelAnimationFrame(requestRef.current);
    }, [isRunning, updateSimulation]);

    // Update engine if params change while NOT running (for preview trajectory?)
    // For now, we only update on reset or start.

    return {
        isRunning,
        start,
        pause,
        reset,
        params,
        setParams,
        simulationStateRef, // Pass ref to Canvas for 60fps reading
        // Determine how to expose data to graphs. 
        // If we return the whole history array here, it won't update unless we `useState`.
        // Let's create a specialized 'useGraphData' or just return a version ID.
        dataVersion: simulationTime, // Use this to force graph updates on Reset
    };
};

export default usePhysicsSimulation;
