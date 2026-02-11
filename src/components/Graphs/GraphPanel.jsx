import React, { useEffect, useRef, useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    LinearScale,
    PointElement,
    LineElement,
    Filler,
} from 'chart.js';

ChartJS.register(LinearScale, PointElement, LineElement, Filler);

const commonOptions = {
    responsive: false,          // KEY FIX: disable responsive — we handle sizing ourselves
    maintainAspectRatio: false,
    animation: false,
    resizeDelay: 0,
    plugins: {
        legend: { display: false },
        tooltip: { enabled: false },
    },
    scales: {
        x: {
            type: 'linear',
            grid: { color: '#1e293b' },
            ticks: { color: '#64748b', maxRotation: 0 },
            border: { display: false },
            min: 0,
        },
        y: {
            grid: { color: '#1e293b' },
            ticks: { color: '#64748b' },
            beginAtZero: true,
            border: { display: false },
        },
    },
    elements: {
        point: { radius: 0 },
        line: { tension: 0.4, borderWidth: 2 },
    },
};

const GraphPanel = ({ simulationStateRef, isRunning }) => {
    const heightCanvasContainerRef = useRef(null);
    const velocityCanvasContainerRef = useRef(null);
    const heightChartRef = useRef(null);
    const velocityChartRef = useRef(null);

    const initialHeightData = useMemo(() => ({
        datasets: [{
            label: 'Height (m)',
            data: [],
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.15)',
            fill: true,
            pointRadius: 0,
        }],
    }), []);

    const initialVelocityData = useMemo(() => ({
        datasets: [{
            label: 'Velocity (m/s)',
            data: [],
            borderColor: '#a855f7',
            backgroundColor: 'rgba(168, 85, 247, 0.15)',
            fill: true,
            pointRadius: 0,
        }],
    }), []);

    // Manually size charts to fill their containers, ONE time + on window resize
    useEffect(() => {
        const sizeCharts = () => {
            const hChart = heightChartRef.current;
            const vChart = velocityChartRef.current;
            const hContainer = heightCanvasContainerRef.current;
            const vContainer = velocityCanvasContainerRef.current;

            if (hChart && hContainer) {
                hChart.resize(hContainer.clientWidth, hContainer.clientHeight);
            }
            if (vChart && vContainer) {
                vChart.resize(vContainer.clientWidth, vContainer.clientHeight);
            }
        };

        // Initial sizing after mount
        const timerId = setTimeout(sizeCharts, 50);
        window.addEventListener('resize', sizeCharts);

        return () => {
            clearTimeout(timerId);
            window.removeEventListener('resize', sizeCharts);
        };
    }, []);

    // Update chart data while running
    useEffect(() => {
        let rafId;

        const tick = () => {
            if (!isRunning) return;

            const history = simulationStateRef.current.history;
            const hChart = heightChartRef.current;
            const vChart = velocityChartRef.current;

            if (history.length > 0 && hChart && vChart) {
                hChart.data.datasets[0].data = history.map(p => ({ x: p.t, y: p.y }));
                vChart.data.datasets[0].data = history.map(p => ({ x: p.t, y: p.vy }));
                hChart.update('none');
                vChart.update('none');
            }

            rafId = requestAnimationFrame(tick);
        };

        if (isRunning) {
            tick();
        }

        return () => { if (rafId) cancelAnimationFrame(rafId); };
    }, [isRunning, simulationStateRef]);

    // Clear on reset
    useEffect(() => {
        if (!isRunning && simulationStateRef.current.history.length === 0) {
            const hChart = heightChartRef.current;
            const vChart = velocityChartRef.current;
            if (hChart) { hChart.data.datasets[0].data = []; hChart.update('none'); }
            if (vChart) { vChart.data.datasets[0].data = []; vChart.update('none'); }
        }
    }, [isRunning, simulationStateRef]);

    return (
        <div className="grid grid-cols-2 gap-4 h-full w-full">
            {/* Height Chart */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-4 flex flex-col overflow-hidden">
                <h3 className="text-sm font-medium text-slate-400 mb-2">Height (y) vs Time (t)</h3>
                <div ref={heightCanvasContainerRef} className="flex-1 min-h-0 relative">
                    <div className="absolute inset-0">
                        <Line ref={heightChartRef} data={initialHeightData} options={commonOptions} />
                    </div>
                </div>
            </div>

            {/* Velocity Chart */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-4 flex flex-col overflow-hidden">
                <h3 className="text-sm font-medium text-slate-400 mb-2">Velocity (Vy) vs Time (t)</h3>
                <div ref={velocityCanvasContainerRef} className="flex-1 min-h-0 relative">
                    <div className="absolute inset-0">
                        <Line ref={velocityChartRef} data={initialVelocityData} options={commonOptions} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GraphPanel;
