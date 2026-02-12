import React, { useState, useCallback, useEffect } from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import SimulationCanvas from '@/components/Canvas/SimulationCanvas';
import ControlPanel from '@/components/Controls/ControlPanel';
import GraphPanel from '@/components/Graphs/GraphPanel';
import DataCardPanel from '@/components/DataCards/DataCardPanel';
import RemotionPlayerModal from '@/components/Remotion/RemotionPlayerModal';
import SimulationComposition from '@/features/video/SimulationComposition';
import ReplayComposition from '@/features/video/ReplayComposition';
import DualReplayComposition from '@/features/video/DualReplayComposition';
import ConceptExplainerComposition from '@/features/video/ConceptExplainerComposition';
import { estimateFlightTime } from '@/services/physics/projectileFrameEngine';
import { useCompareContext } from '@/features/compare/CompareContext';
import CompareLayout from '@/features/compare/CompareLayout';
import ConceptOverlay from '@/components/overlays/ConceptOverlay';
import SpotlightOverlay from '@/components/overlays/SpotlightOverlay';
import ChallengeMode from '@/features/challenges/ChallengeMode';
import { useNavigate } from 'react-router-dom';
import PredictionMode from '@/features/tutor/PredictionMode';
import LearningDashboard from '@/features/tutor/LearningDashboard';
import { useTutor } from '@/features/tutor/TutorContext';
import { useScenario } from '@/context/StructuredScenarioContext';
import ReelGenerator from '@/features/reels/ReelGenerator';

const Lab = () => {
    const navigate = useNavigate();
    const ctx = useCompareContext();
    const {
        compareMode, conceptOverlay, spotlightEnabled,
        isRunning, start, pause, reset,
        single, compare,
    } = ctx;
    const { mode: tutorMode, setMode } = useTutor();

    // Remotion modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [activeComposition, setActiveComposition] = useState(null);
    const [compositionTitle, setCompositionTitle] = useState('');
    const [compositionDuration, setCompositionDuration] = useState(180);
    const [compositionInputProps, setCompositionInputProps] = useState({});
    const [challengeOpen, setChallengeOpen] = useState(false);
    const [reelOpen, setReelOpen] = useState(false);

    const { scenario, updateParameters } = useScenario();

    // Active params / state based on mode
    const isEffectiveCompare = compareMode;
    const params = isEffectiveCompare ? compare.paramsA : single.params;
    const setParams = isEffectiveCompare ? compare.setParamsA : single.setParams;
    const simulationStateRef = isEffectiveCompare ? compare.stateA : single.simulationStateRef;

    // ⚡ SYNC: Incoming AI Scenario -> Lab Params
    // ⚡ SYNC: Incoming AI Scenario -> Lab Params
    useEffect(() => {
        if (!scenario) return;

        // BLAST SHIELD: If the update came from the Lab itself, IGNORE IT.
        // This stops the infinite feedback loop (Slider -> Context -> Slider -> ...)
        if (scenario.lastUpdatedBy === 'lab') return;

        // Check if values allow us to skip update (prevent fighting with slider)
        const v0Diff = Math.abs(params.v0 - scenario.parameters.initialVelocity);
        const angleDiff = Math.abs(params.angle - scenario.parameters.angle);
        const gravDiff = Math.abs(params.gravity - scenario.parameters.gravity);
        const labelDiff = params.label !== scenario.environment;

        if (v0Diff > 0.05 || angleDiff > 0.05 || gravDiff > 0.05 || labelDiff) {
            setParams(prev => ({
                ...prev,
                v0: scenario.parameters.initialVelocity,
                angle: scenario.parameters.angle,
                gravity: scenario.parameters.gravity,
                label: scenario.environment
            }));
        }
    }, [
        scenario.parameters.initialVelocity,
        scenario.parameters.angle,
        scenario.parameters.gravity,
        scenario.environment,
        scenario.lastUpdatedBy // Critical dependency
    ]);

    // ⚡ SYNC: Lab Params -> Central Store (Real-time Feedback)
    useEffect(() => {
        // Debounce or direct update? Direct for now for "Real-time" feel
        // We only update if it differs from scenario to avoid loops
        if (
            Math.abs(params.v0 - scenario.parameters.initialVelocity) > 0.1 ||
            Math.abs(params.angle - scenario.parameters.angle) > 0.1 ||
            Math.abs(params.gravity - scenario.parameters.gravity) > 0.1
        ) {
            updateParameters({
                initialVelocity: params.v0,
                angle: params.angle,
                gravity: params.gravity
            }, 'lab'); // 🏷️ Tag this update as coming from 'lab'
        }
    }, [params.v0, params.angle, params.gravity]);

    // Determine if simulation has landed
    const hasLanded = !isRunning &&
        simulationStateRef.current?.history &&
        simulationStateRef.current.history.length > 10 &&
        (simulationStateRef.current.y || 0) <= 0.01;

    const openReplay = useCallback(() => {
        if (isEffectiveCompare) {
            // Dual replay
            setActiveComposition(() => DualReplayComposition);
            setCompositionInputProps({
                paramsA: params,
                paramsB: compare.paramsB
            });
            setCompositionTitle('🎬 Compare Replay');
            setCompositionDuration(300);
        } else {
            const flightTime = estimateFlightTime(params.v0, params.angle, params.gravity);
            const totalFrames = Math.ceil((flightTime + 1) * 30);
            setActiveComposition(() => SimulationComposition);
            setCompositionInputProps({ ...params });
            setCompositionTitle('🎬 Cinematic Replay');
            setCompositionDuration(totalFrames);
        }
        setModalOpen(true);
    }, [params, isEffectiveCompare, compare.paramsB]);

    const openExplanation = useCallback(() => {
        setActiveComposition(() => ConceptExplainerComposition);
        setCompositionInputProps({ params });
        setCompositionTitle('🧠 AI Concept Explainer');
        setCompositionDuration(450); // Longer for explanation
        setModalOpen(true);
    }, [params]);

    const closeModal = useCallback(() => {
        setModalOpen(false);
        setActiveComposition(null);
        setCompositionInputProps({});
    }, []);

    // Build the single canvas element for non-compare mode
    const singleCanvas = (
        <div className="h-full bg-slate-900 rounded-2xl overflow-hidden border border-slate-700 relative shadow-2xl">
            <SimulationCanvas
                simulationStateRef={simulationStateRef}
                isRunning={isRunning}
                params={params}
            />
            <ConceptOverlay
                simulationStateRef={simulationStateRef}
                params={params}
                isVisible={conceptOverlay}
            />
            <SpotlightOverlay
                simulationStateRef={simulationStateRef}
                isRunning={isRunning}
                enabled={spotlightEnabled}
            />
        </div>
    );

    const graphElement = (
        <GraphPanel
            simulationStateRef={simulationStateRef}
            isRunning={isRunning}
            params={params}
        />
    );

    return (
        <>
            <MainLayout
                ctx={ctx}
                onChallenge={() => setChallengeOpen(true)}
                onFullscreen={() => navigate('/compare')}
            >
                {/* Top Row: 3 Columns */}
                <div className="col-span-12 grid grid-cols-12 gap-4 h-[65%]">
                    {/* Left Panel: Live Analytics */}
                    <div className="col-span-3 h-full">
                        <DataCardPanel />
                    </div>

                    {/* Center Panel: Canvas / Compare */}
                    <div className="col-span-6 h-full">
                        <CompareLayout
                            singleCanvasElement={singleCanvas}
                            graphPanel={null}
                        />
                    </div>

                    {/* Right Panel: Controls */}
                    <div className="col-span-3 h-full">
                        <ControlPanel
                            onStart={start}
                            onPause={pause}
                            onReset={reset}
                            params={params}
                            setParams={setParams}
                            isRunning={isRunning}
                            hasLanded={hasLanded}
                            onReplay={openReplay}
                            onExplain={openExplanation}
                            // Compare Mode Props
                            compareMode={compareMode}
                            paramsB={compareMode ? compare.paramsB : null}
                            setParamsB={compareMode ? compare.setParamsB : null}
                            setSharedParams={compareMode ? compare.setSharedParams : null}
                            onReel={() => setReelOpen(true)}
                        />
                    </div>
                </div>

                {/* Bottom Panel: Graphs */}
                <div className="col-span-12 h-[32%]">
                    {graphElement}
                </div>
            </MainLayout>
            <RemotionPlayerModal
                isOpen={modalOpen}
                onClose={closeModal}
                composition={activeComposition}
                compositionProps={compositionInputProps}
                title={compositionTitle}
                durationInFrames={compositionDuration}
            />
            <ChallengeMode
                isOpen={challengeOpen}
                onClose={() => setChallengeOpen(false)}
                onApplyParams={(newParams) => {
                    setParams(prev => ({ ...prev, ...newParams }));
                    setChallengeOpen(false);
                }}
            />
            <PredictionMode />
            <ReelGenerator isOpen={reelOpen} onClose={() => setReelOpen(false)} params={params} />
            {tutorMode === 'dashboard' && <LearningDashboard onClose={() => setMode('simulation')} />}
        </>
    );
};

export default Lab;
