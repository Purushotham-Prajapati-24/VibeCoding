import React from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import InputPanel from '@/components/InputPanel/InputPanel';
import SimulationCanvas from '@/components/Canvas/SimulationCanvas';
import ControlPanel from '@/components/Controls/ControlPanel';
import GraphPanel from '@/components/Graphs/GraphPanel';
import usePhysicsSimulation from '@/hooks/usePhysicsSimulation';

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
            onMoon={() => setParams(p => ({ ...p, gravity: 1.62 }))}
            params={params}
            setParams={setParams}
            isRunning={isRunning}
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
    </MainLayout>
  );
};

export default App;