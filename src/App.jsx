import React, { useState, useCallback, lazy, Suspense } from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import InputPanel from '@/components/InputPanel/InputPanel';
import SimulationCanvas from '@/components/Canvas/SimulationCanvas';
import ControlPanel from '@/components/Controls/ControlPanel';
import GraphPanel from '@/components/Graphs/GraphPanel';
import usePhysicsSimulation from '@/hooks/usePhysicsSimulation';
import ReplayButton from '@/components/Remotion/ReplayButton';
import ExplanationVideoButton from '@/components/Remotion/ExplanationVideoButton';
import RemotionPlayerModal from '@/components/Remotion/RemotionPlayerModal';
import SimulationComposition from '@/remotion/SimulationComposition';
import ReplayComposition from '@/remotion/ReplayComposition';
import { estimateFlightTime } from '@/physics/projectileFrameEngine';

const App = () => {
  const {
    isRunning,
    start,
    pause,
    reset,
    params,
    setParams,
    simulationStateRef
  } = usePhysicsSimulation();

  // Remotion modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [activeComposition, setActiveComposition] = useState(null);
  const [compositionTitle, setCompositionTitle] = useState('');
  const [compositionDuration, setCompositionDuration] = useState(180);

  // Determine if simulation has landed (history exists & not running)
  const hasLanded = !isRunning &&
    simulationStateRef.current.history &&
    simulationStateRef.current.history.length > 10 &&
    simulationStateRef.current.y <= 0.01;

  const compositionProps = {
    v0: params.v0,
    angle: params.angle,
    gravity: params.gravity,
    drag: params.drag,
  };

  const openReplay = useCallback(() => {
    const flightTime = estimateFlightTime(params.v0, params.angle, params.gravity);
    const totalFrames = Math.ceil((flightTime + 1) * 30); // 30 fps + 1s padding
    setActiveComposition(() => SimulationComposition);
    setCompositionTitle('🎬 Cinematic Replay');
    setCompositionDuration(totalFrames);
    setModalOpen(true);
  }, [params]);

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

  return (
    <MainLayout>
      {/* Top Row: 3 Columns */}
      <div className="col-span-12 grid grid-cols-12 gap-4 h-[65%]">
        {/* Left Panel: Input */}
        <div className="col-span-3 h-full">
          <InputPanel />
        </div>

        {/* Center Panel: Canvas */}
        <div className="col-span-6 h-full bg-slate-900 rounded-2xl overflow-hidden border border-slate-700 relative shadow-2xl">
          <SimulationCanvas simulationStateRef={simulationStateRef} isRunning={isRunning} params={params} />
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
        <GraphPanel
          simulationStateRef={simulationStateRef}
          isRunning={isRunning}
          params={params}
        />
      </div>

      {/* Remotion Player Modal */}
      <RemotionPlayerModal
        isOpen={modalOpen}
        onClose={closeModal}
        composition={activeComposition}
        compositionProps={compositionProps}
        title={compositionTitle}
        durationInFrames={compositionDuration}
      />
    </MainLayout>
  );
};

export default App;