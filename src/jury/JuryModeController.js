import { useEffect, useRef, useState } from 'react';
import { useTutor } from '../tutor/TutorContext';
import { useScenario } from '../context/StructuredScenarioContext';
import { useCompareContext } from '../compare/CompareContext';
import { useNavigate } from 'react-router-dom';

export const useJuryModeController = (active, onComplete) => {
    const { setMode } = useTutor();
    const { setSimulationRunning, setParams, physicsState } = useScenario();
    const { setCompareMode, compare } = useCompareContext();
    const navigate = useNavigate();

    const [step, setStep] = useState('idle');
    const [overlayText, setOverlayText] = useState('');

    const timeoutRefs = useRef([]);

    const addTimeout = (cb, delay) => {
        const id = setTimeout(cb, delay);
        timeoutRefs.current.push(id);
        return id;
    };

    useEffect(() => {
        if (!active) {
            // Cleanup on exit
            timeoutRefs.current.forEach(clearTimeout);
            timeoutRefs.current = [];
            setStep('idle');
            setOverlayText('');
            return;
        }

        // --- SEQUENCE START ---

        // 0s: Init
        setStep('intro');
        setOverlayText("Welcome to the Future of Physics Learning");
        navigate('/lab');
        setMode('simulation');
        setCompareMode(false);
        setSimulationRunning(false);

        // 2s: Setup Simulation
        addTimeout(() => {
            setOverlayText("Real-time Physics Simulation");
            setParams(prev => ({ ...prev, angle: 45, v0: 25, gravity: 9.81 }));
        }, 2000);

        // 4s: Launch
        addTimeout(() => {
            setOverlayText("Precision Trajectory Calculation");
            setSimulationRunning(true);
        }, 4000);

        // 10s: Switch to Compare Mode
        addTimeout(() => {
            setOverlayText("Multi-Environment Comparison");
            setSimulationRunning(false);
            setCompareMode(true);
            compare.setParamsB(prev => ({ ...prev, gravity: 3.72, label: '🔴 Mars' }));
        }, 10000);

        // 12s: Launch Dual Sim
        addTimeout(() => {
            setOverlayText("Earth vs. Mars");
            setSimulationRunning(true);
        }, 12000);

        // 20s: AI Insight
        addTimeout(() => {
            setOverlayText("AI-Driven Insights & Safety");
            setMode('quiz'); // Or 'predict' mode to show AI UI
        }, 20000);

        // 25s: Leaderboard / Gamification
        addTimeout(() => {
            setOverlayText("Gamified Learning Ecology");
            // Here we might ideally trigger the leaderboard modal if exposed, 
            // but for now we'll just show the text overlay
        }, 25000);

        // 30s: End
        addTimeout(() => {
            setOverlayText("");
            if (onComplete) onComplete();
        }, 30000);

        return () => {
            timeoutRefs.current.forEach(clearTimeout);
        };
    }, [active]);

    return { step, overlayText };
};
