import React, { Suspense, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import MainLayout from '@/components/Layout/MainLayout';
import ControlPanel from '@/components/Controls/ControlPanel';
import GraphPanel from '@/components/Graphs/GraphPanel';
import DataCardPanel from '@/components/DataCards/DataCardPanel';
import { EXPERIMENTS } from './experimentConfig';
import { useScenario } from '@/context/StructuredScenarioContext';
import useExperimentSimulation from '@/hooks/useExperimentSimulation';

// Lazy load canvases to avoid bundle bloat
const ProjectileCanvas = React.lazy(() => import('@/components/Canvas/SimulationCanvas'));
// Placeholder for new canvases
const PendulumCanvas = React.lazy(() => import('./components/PendulumCanvas'));

const CANVAS_MAP = {
    'projectile': ProjectileCanvas,
    'pendulum': PendulumCanvas
};

const ExperimentLayout = () => {
    const { experimentId } = useParams();
    const { scenario } = useScenario();

    // Validate Experiment ID
    const config = EXPERIMENTS.find(e => e.id === experimentId);

    if (!config) {
        return <Navigate to="/explore" replace />;
    }

    // Initialize Simulation Hook
    const {
        isRunning,
        start,
        pause,
        reset,
        params,
        setParams,
        simulationStateRef
    } = useExperimentSimulation(experimentId);

    // Sync Context Params -> Simulation Params
    // (This ensures when we switch experiments or load scenarios, the sim updates)
    useEffect(() => {
        if (scenario.parameters) {
            setParams(prev => ({ ...prev, ...scenario.parameters }));
        }
    }, [scenario.parameters, setParams]);

    const CanvasComponent = CANVAS_MAP[experimentId] || (() => <div className="text-white p-10">Canvas under construction</div>);

    return (
        <MainLayout>
            {/* Main Content Area */}
            <div className="flex flex-col h-[calc(100vh-4rem)] lg:flex-row overflow-hidden bg-slate-950">

                {/* LEFT: Simulation Canvas (Flex Grow) */}
                <div className="flex-1 relative order-2 lg:order-1 bg-slate-900 overflow-hidden flex flex-col">

                    {/* Toolbar / Header overlay */}
                    <div className="absolute top-0 left-0 right-0 z-10 p-4 flex justify-between items-start pointer-events-none">
                        <div className="pointer-events-auto bg-slate-900/80 backdrop-blur border border-slate-700 rounded-2xl p-4 shadow-xl">
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                                {config.title}
                            </h1>
                            <p className="text-slate-400 text-sm mt-1 max-w-md">
                                {config.description}
                            </p>
                        </div>
                    </div>

                    {/* The Canvas */}
                    <div className="flex-1 relative z-0">
                        <Suspense fallback={<div className="text-slate-500 flex items-center justify-center h-full">Loading Physics Engine...</div>}>
                            <CanvasComponent
                                isRunning={isRunning}
                                params={params}
                                simulationStateRef={simulationStateRef}
                            />
                        </Suspense>
                    </div>

                </div>

                {/* RIGHT: Control & Analysis Sidebar (Fixed Width) */}
                <div className="w-full lg:w-[400px] xl:w-[450px] bg-slate-900/50 border-l border-slate-800 flex flex-col order-3 lg:order-2 z-20 backdrop-blur-sm">
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">

                        {/* 1. Controls */}
                        <div className="bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-lg">
                            <div className="p-3 bg-slate-800/50 border-b border-slate-700 font-semibold text-slate-200 flex items-center gap-2">
                                <span>🎛️ Controls</span>
                            </div>
                            <div className="p-4">
                                <ControlPanel
                                    experimentId={experimentId}
                                    params={params}
                                    setParams={setParams}
                                    isRunning={isRunning}
                                    onStart={start}
                                    onPause={pause}
                                    onReset={reset}
                                    hasLanded={false} // Todo: Hook up landing detection
                                />
                            </div>
                        </div>

                        {/* 2. Real-time Data */}
                        <DataCardPanel />

                        {/* 3. Graphs */}
                        <GraphPanel />

                    </div>
                </div>

            </div>
        </MainLayout>
    );
};

export default ExperimentLayout;
