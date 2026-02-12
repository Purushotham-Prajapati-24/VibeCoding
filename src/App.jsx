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
import Home from '@/pages/Home';
import Explore from '@/pages/Explore';
import ConceptOverlay from '@/overlays/ConceptOverlay';
import SpotlightOverlay from '@/overlays/SpotlightOverlay';
import ComparePage from '@/pages/ComparePage';
import ChallengeMode from '@/modes/ChallengeMode';
import JuryMode from '@/modes/JuryMode';

const AppInner = () => {
  const ctx = useCompareContext();
  const {
    compareMode, conceptOverlay, spotlightEnabled,
    isRunning, start, pause, reset,
    single, compare,
  } = ctx;

  const [viewMode, setViewMode] = useState('home');

  // Determine effective mode (Compare Page forces compare functionality)
  const isEffectiveCompare = compareMode || viewMode === 'compare-fullscreen';

  // Active params / state based on mode
  const params = isEffectiveCompare ? compare.paramsA : single.params;
  const setParams = isEffectiveCompare ? compare.setParamsA : single.setParams;
  const simulationStateRef = isEffectiveCompare ? compare.stateA : single.simulationStateRef;

  // Remotion modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [activeComposition, setActiveComposition] = useState(null);
  const [compositionTitle, setCompositionTitle] = useState('');
  const [compositionDuration, setCompositionDuration] = useState(180);
  const [compositionInputProps, setCompositionInputProps] = useState({});
  const [challengeOpen, setChallengeOpen] = useState(false);

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
    setActiveComposition(() => ReplayComposition);
    setCompositionInputProps({ ...params });
    setCompositionTitle('🎓 Physics Walkthrough');
    setCompositionDuration(360);
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

  const layout = viewMode === 'compare-fullscreen' ? (
    <ComparePage
      onBack={() => setViewMode('dashboard')}
      onReplay={openReplay}
      onExplain={openExplanation}
      hasLanded={hasLanded}
    />
  ) : (
    <MainLayout
      ctx={ctx}
      onChallenge={() => setChallengeOpen(true)}
      onFullscreen={() => setViewMode('compare-fullscreen')}
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
          />
        </div>
      </div>

      {/* Bottom Panel: Graphs */}
      <div className="col-span-12 h-[32%]">
        {graphElement}
      </div>
    </MainLayout>
  );

  // Main Navigation / Routing Switch
  if (viewMode === 'home') {
    return (
      <Home
        onContinue={() => setViewMode('explore')}
        onDashboard={() => setViewMode('dashboard')}
      />
    );
  }

  if (viewMode === 'explore') {
    return (
      <Explore
        onBack={() => setViewMode('home')}
        onEnterLab={() => setViewMode('dashboard')}
      />
    );
  }

  return (
    <>
      {layout}
      <RemotionPlayerModal
        isOpen={modalOpen}
        onClose={closeModal}
        composition={activeComposition}
        compositionProps={compositionInputProps}
        title={compositionTitle}
        durationInFrames={compositionDuration}
      />
      <ChallengeMode isOpen={challengeOpen} onClose={() => setChallengeOpen(false)} />
    </>
  );
};

const App = () => (
  <CompareProvider>
    <AppInner />
  </CompareProvider>
);

export default App;