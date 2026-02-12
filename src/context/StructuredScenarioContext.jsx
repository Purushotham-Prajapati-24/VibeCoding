import React, { createContext, useContext, useState, useEffect } from 'react';
import { getEngine } from '@/features/experiments/engines';

// 1. Initial State Template
const INITIAL_STATE = {
    scenarioType: 'projectile_motion',
    object: 'ball',
    parameters: {
        initialVelocity: 20, // m/s
        angle: 45, // degrees
        gravity: 9.81, // m/s^2
    },
    environment: 'Earth',
    derivedValues: {
        timeOfFlight: 0,
        maxHeight: 0,
        range: 0,
        vx: 0,
        vy: 0
    },
    userIntent: [], // 'visualize', etc.
    tutorMetadata: {
        assumptions: [],
        confidenceScore: 1.0
    },
    lastUpdatedBy: 'system' // 'system' | 'user' | 'ai'
};

const ScenarioContext = createContext();

export const useScenario = () => useContext(ScenarioContext);

export const ScenarioProvider = ({ children }) => {
    const [scenario, setScenario] = useState(INITIAL_STATE);

    /**
     * DERIVED VALUES ENGINE
     * Automatically re-computes physics metrics when parameters change.
     */
    /**
     * DERIVED VALUES ENGINE
     * Automatically re-computes physics metrics when parameters change.
     */
    useEffect(() => {
        // 1. Identify the active engine
        const engineType = scenario.scenarioType || 'projectile';
        const engine = getEngine(engineType);

        if (!engine) {
            console.warn(`No physics engine found for ${engineType}`);
            return;
        }

        // 2. Calculate Derived Values
        const results = engine.calculate(scenario.parameters);

        // 3. Update State
        setScenario(prev => ({
            ...prev,
            derivedValues: { ...prev.derivedValues, ...results }
        }));

    }, [
        scenario.parameters, // Deep dependency check not ideal, but works for now
        scenario.scenarioType
    ]);

    /**
     * UPDATE ACTIONS
     */
    const updateParameters = (newParams, source = 'user') => {
        setScenario(prev => ({
            ...prev,
            lastUpdatedBy: source,
            parameters: { ...prev.parameters, ...newParams }
        }));
    };

    const loadScenario = (aiParsedScenario) => {
        // Sanitize and Validate AI Output before injecting into state
        const safeParams = {
            initialVelocity: aiParsedScenario.parameters?.initialVelocity || 20,
            angle: aiParsedScenario.parameters?.angle || 45,
            gravity: aiParsedScenario.parameters?.gravity || 9.81
        };

        setScenario(prev => ({
            ...prev,
            scenarioType: aiParsedScenario.scenarioType || 'projectile_motion',
            object: aiParsedScenario.object || 'ball',
            environment: aiParsedScenario.environment || 'Earth',
            parameters: safeParams,
            userIntent: aiParsedScenario.requestedOutputs || [],
            tutorMetadata: {
                assumptions: aiParsedScenario.assumptions || [],
                confidenceScore: aiParsedScenario.confidenceScore || 0.8
            },
            lastUpdatedBy: 'ai'
        }));
    };

    return (
        <ScenarioContext.Provider value={{
            scenario,
            updateParameters,
            loadScenario
        }}>
            {children}
        </ScenarioContext.Provider>
    );
};
