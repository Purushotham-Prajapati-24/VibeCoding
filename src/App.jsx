import React, { useState, useCallback } from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import SimulationCanvas from '@/components/Canvas/SimulationCanvas';
import ControlPanel from '@/components/Controls/ControlPanel';
import GraphPanel from '@/components/Graphs/GraphPanel';
import DataCardPanel from '@/components/DataCards/DataCardPanel';
import RemotionPlayerModal from '@/components/Remotion/RemotionPlayerModal';
import SimulationComposition from '@/remotion/SimulationComposition';
import ReplayComposition from '@/remotion/ReplayComposition';
import DualReplayComposition from '@/remotion/DualReplayComposition';
import { estimateFlightTime } from '@/physics/projectileFrameEngine';
import { CompareProvider, useCompareContext } from '@/compare/CompareContext';
import CompareLayout from '@/compare/CompareLayout';
import ConceptOverlay from '@/overlays/ConceptOverlay';
import SpotlightOverlay from '@/overlays/SpotlightOverlay';
import ChallengeMode from '@/modes/ChallengeMode';
import JuryMode from '@/modes/JuryMode';

const AppInner = () => {
  const ctx = useCompareContext();
  const {
    compareMode, conceptOverlay, spotlightEnabled,
    isRunning, start, pause, reset,
    single, compare,
  } = ctx;

  // Active params / state based on mode
  const params = compareMode ? compare.paramsA : single.params;
  const setParams = compareMode ? compare.setParamsA : single.setParams;
  const simulationStateRef = compareMode ? compare.stateA : single.simulationStateRef;

  // Remotion modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [activeComposition, setActiveComposition] = useState(null);
  const [compositionTitle, setCompositionTitle] = useState('');
  const [compositionDuration, setCompositionDuration] = useState(180);
  const [challengeOpen, setChallengeOpen] = useState(false);

  // Determine if simulation has landed
  const hasLanded = !isRunning &&
    simulationStateRef.current?.history &&
    simulationStateRef.current.history.length > 10 &&
    (simulationStateRef.current.y || 0) <= 0.01;

  const compositionProps = {
    v0: params.v0,
    angle: params.angle,
    gravity: params.gravity,
    drag: params.drag,
  };

  const openReplay = useCallback(() => {
    if (compareMode) {
      // Dual replay
      setActiveComposition(() => DualReplayComposition);
      setCompositionTitle('🎬 Compare Replay');
      setCompositionDuration(300);
    } else {
      const flightTime = estimateFlightTime(params.v0, params.angle, params.gravity);
      const totalFrames = Math.ceil((flightTime + 1) * 30);
      setActiveComposition(() => SimulationComposition);
      setCompositionTitle('🎬 Cinematic Replay');
      setCompositionDuration(totalFrames);
    }
    setModalOpen(true);
  }, [params, compareMode]);

  const openExplanation = useCallback(() => {
    setActiveComposition(() => ReplayComposition);
    setCompositionTitle('🎓 Physics Walkthrough');
    setCompositionDuration(360);
    setModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setActiveComposition(null);
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
    <MainLayout ctx={ctx} onChallenge={() => setChallengeOpen(true)}>
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
          />
        </div>
      </div>

      {/* Bottom Panel: Graphs */}
      <div className="col-span-12 h-[32%]">
        {graphElement}
      </div>

      {/* Modals */}
      <RemotionPlayerModal
        isOpen={modalOpen}
        onClose={closeModal}
        composition={activeComposition}
        compositionProps={compositionProps}
        title={compositionTitle}
        durationInFrames={compositionDuration}
      />
      <ChallengeMode isOpen={challengeOpen} onClose={() => setChallengeOpen(false)} />
    </MainLayout>
  );
};

const App = () => (
  <CompareProvider>
    <AppInner />
  </CompareProvider>
);

export default App;