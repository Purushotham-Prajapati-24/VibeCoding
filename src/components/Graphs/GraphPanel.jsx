import React, { useEffect, useRef } from 'react';
import { TrendingUp, Gauge } from 'lucide-react';

const COLORS = {
    bg: '#0f172a',
    grid: '#1e293b',
    tick: '#475569',
    axis: '#334155',
};

function drawChart(canvas, points, noDragPoints, { lineColor, fillColor, yLabel, hasDrag }) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.parentElement.getBoundingClientRect();
    const W = rect.width;
    const H = rect.height;

    if (W === 0 || H === 0) return;

    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = `${W}px`;
    canvas.style.height = `${H}px`;
    ctx.scale(dpr, dpr);

    const PAD_L = 48, PAD_R = 14, PAD_T = 10, PAD_B = 28;
    const plotW = W - PAD_L - PAD_R;
    const plotH = H - PAD_T - PAD_B;

    // Clear
    ctx.fillStyle = COLORS.bg;
    ctx.fillRect(0, 0, W, H);

    // Combine both datasets for bounds
    const allPoints = [...(points || []), ...(hasDrag && noDragPoints ? noDragPoints : [])];

    if (allPoints.length === 0) {
        ctx.fillStyle = '#334155';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Waiting for data…', W / 2, H / 2);
        drawAxes(ctx, PAD_L, PAD_T, plotW, plotH, 0, 1, 0, 1);
        return;
    }

    let xMin = 0, xMax = 0, yMin = 0, yMax = 0;
    for (const p of allPoints) {
        if (p.x > xMax) xMax = p.x;
        if (p.y > yMax) yMax = p.y;
        if (p.y < yMin) yMin = p.y;
    }
    if (xMax === 0) xMax = 1;
    const yRange = yMax - yMin || 1;
    yMin -= yRange * 0.1;
    yMax += yRange * 0.1;

    const toX = (v) => PAD_L + ((v - xMin) / (xMax - xMin)) * plotW;
    const toY = (v) => PAD_T + plotH - ((v - yMin) / (yMax - yMin)) * plotH;

    drawAxes(ctx, PAD_L, PAD_T, plotW, plotH, xMin, xMax, yMin, yMax);

    // No-drag reference line (dashed green) — draw first so main line goes on top
    if (hasDrag && noDragPoints && noDragPoints.length > 1) {
        ctx.setLineDash([5, 3]);
        ctx.strokeStyle = 'rgba(34, 197, 94, 0.5)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(toX(noDragPoints[0].x), toY(noDragPoints[0].y));
        for (let i = 1; i < noDragPoints.length; i++) {
            ctx.lineTo(toX(noDragPoints[i].x), toY(noDragPoints[i].y));
        }
        ctx.stroke();
        ctx.setLineDash([]);
    }

    // Main line fill area
    if (points && points.length > 1) {
        ctx.beginPath();
        ctx.moveTo(toX(points[0].x), toY(yMin));
        for (const p of points) ctx.lineTo(toX(p.x), toY(p.y));
        ctx.lineTo(toX(points[points.length - 1].x), toY(yMin));
        ctx.closePath();
        ctx.fillStyle = fillColor;
        ctx.fill();

        // Main line
        ctx.beginPath();
        ctx.moveTo(toX(points[0].x), toY(points[0].y));
        for (let i = 1; i < points.length; i++) {
            ctx.lineTo(toX(points[i].x), toY(points[i].y));
        }
        ctx.strokeStyle = lineColor;
        ctx.lineWidth = 2;
        ctx.lineJoin = 'round';
        ctx.stroke();

        // Latest point dot
        const last = points[points.length - 1];
        ctx.beginPath();
        ctx.arc(toX(last.x), toY(last.y), 4, 0, Math.PI * 2);
        ctx.fillStyle = lineColor;
        ctx.fill();
        ctx.strokeStyle = lineColor;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(toX(last.x), toY(last.y), 7, 0, Math.PI * 2);
        ctx.stroke();
    }

    // Legend (when drag is active)
    if (hasDrag && noDragPoints && noDragPoints.length > 1) {
        ctx.save();
        ctx.globalAlpha = 0.7;
        const legendX = PAD_L + 8;
        const legendY = PAD_T + 12;

        // Solid = with drag
        ctx.strokeStyle = lineColor;
        ctx.lineWidth = 2;
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.moveTo(legendX, legendY);
        ctx.lineTo(legendX + 16, legendY);
        ctx.stroke();
        ctx.fillStyle = '#94a3b8';
        ctx.font = '9px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('Drag', legendX + 20, legendY + 3);

        // Dashed = no drag
        ctx.strokeStyle = 'rgba(34, 197, 94, 0.6)';
        ctx.setLineDash([4, 3]);
        ctx.beginPath();
        ctx.moveTo(legendX, legendY + 14);
        ctx.lineTo(legendX + 16, legendY + 14);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillText('Vacuum', legendX + 20, legendY + 17);

        ctx.restore();
    }
}

function drawAxes(ctx, padL, padT, plotW, plotH, xMin, xMax, yMin, yMax) {
    const nTicks = 5;

    ctx.strokeStyle = COLORS.grid;
    ctx.lineWidth = 1;
    for (let i = 0; i <= nTicks; i++) {
        const y = padT + (i / nTicks) * plotH;
        ctx.beginPath();
        ctx.moveTo(padL, y);
        ctx.lineTo(padL + plotW, y);
        ctx.stroke();
    }
    for (let i = 0; i <= nTicks; i++) {
        const x = padL + (i / nTicks) * plotW;
        ctx.beginPath();
        ctx.moveTo(x, padT);
        ctx.lineTo(x, padT + plotH);
        ctx.stroke();
    }

    ctx.fillStyle = COLORS.tick;
    ctx.font = '10px monospace';

    ctx.textAlign = 'center';
    for (let i = 0; i <= nTicks; i++) {
        const val = xMin + (i / nTicks) * (xMax - xMin);
        const x = padL + (i / nTicks) * plotW;
        ctx.fillText(val.toFixed(1) + 's', x, padT + plotH + 16);
    }

    ctx.textAlign = 'right';
    for (let i = 0; i <= nTicks; i++) {
        const val = yMax - (i / nTicks) * (yMax - yMin);
        const y = padT + (i / nTicks) * plotH;
        ctx.fillText(val.toFixed(1), padL - 6, y + 4);
    }

    ctx.strokeStyle = COLORS.axis;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(padL, padT);
    ctx.lineTo(padL, padT + plotH);
    ctx.lineTo(padL + plotW, padT + plotH);
    ctx.stroke();
}

const GraphPanel = ({ simulationStateRef, isRunning, params }) => {
    const heightCanvasRef = useRef(null);
    const velocityCanvasRef = useRef(null);

    useEffect(() => {
        let rafId;
        const hasDrag = params && params.drag > 0;

        const paintOnce = () => {
            const { history, noDragHistory } = simulationStateRef.current;
            const hPoints = history && history.length > 0
                ? history.map(p => ({ x: p.t, y: p.y }))
                : [];
            const vPoints = history && history.length > 0
                ? history.map(p => ({ x: p.t, y: p.vy }))
                : [];
            const ndHPoints = noDragHistory && noDragHistory.length > 0
                ? noDragHistory.map(p => ({ x: p.t, y: p.y }))
                : [];
            const ndVPoints = noDragHistory && noDragHistory.length > 0
                ? noDragHistory.map(p => ({ x: p.t, y: p.vy }))
                : [];

            drawChart(heightCanvasRef.current, hPoints, ndHPoints, {
                lineColor: '#3b82f6',
                fillColor: 'rgba(59, 130, 246, 0.12)',
                yLabel: 'Height (m)',
                hasDrag,
            });
            drawChart(velocityCanvasRef.current, vPoints, ndVPoints, {
                lineColor: '#a855f7',
                fillColor: 'rgba(168, 85, 247, 0.12)',
                yLabel: 'Vy (m/s)',
                hasDrag,
            });
        };

        if (isRunning) {
            // Animate charts live while simulation is running
            const loop = () => {
                paintOnce();
                rafId = requestAnimationFrame(loop);
            };
            loop();
        } else {
            // One final paint to freeze at current state (paused / landed)
            paintOnce();
        }

        return () => cancelAnimationFrame(rafId);
    }, [simulationStateRef, isRunning, params]);

    return (
        <div className="grid grid-cols-2 gap-4 h-full w-full">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-3 flex flex-col overflow-hidden h-[35vh]">
                <h3 className="text-xs font-medium text-slate-400 mb-1 flex items-center gap-1.5 shrink-0">
                    <TrendingUp size={13} className="text-blue-400" />
                    Height (y) vs Time (t)
                </h3>
                <div className="flex-1 min-h-0 relative">
                    <canvas ref={heightCanvasRef} className="absolute inset-0 w-full h-full" />
                </div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-3 flex flex-col overflow-hidden h-[35vh]">
                <h3 className="text-xs font-medium text-slate-400 mb-1 flex items-center gap-1.5 shrink-0">
                    <Gauge size={13} className="text-purple-400" />
                    Velocity (Vy) vs Time (t)
                </h3>
                <div className="flex-1 min-h-0 relative">
                    <canvas ref={velocityCanvasRef} className="absolute inset-0 w-full h-full" />
                </div>
            </div>
        </div>
    );
};

export default GraphPanel;
