import React, { useEffect, useRef, useState, useCallback } from 'react';

const SimulationCanvas = ({ simulationStateRef, isRunning, params }) => {
    const canvasRef = useRef(null);
    const tooltipRef = useRef(null); // { show, vx, vy, screenX, screenY }
    const ballScreenPosRef = useRef({ x: 0, y: 0 }); // track ball screen pos for click detection

    // Click handler for inspecting velocities when paused
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const handleClick = (e) => {
            if (isRunning) {
                tooltipRef.current = null;
                return;
            }

            const rect = canvas.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const clickY = e.clientY - rect.top;
            const ballPos = ballScreenPosRef.current;

            const dist = Math.sqrt((clickX - ballPos.x) ** 2 + (clickY - ballPos.y) ** 2);

            if (dist < 30) {
                const state = simulationStateRef.current;
                const lastH = state.history && state.history.length > 0
                    ? state.history[state.history.length - 1]
                    : null;
                tooltipRef.current = {
                    show: true,
                    vx: lastH ? lastH.vx : 0,
                    vy: lastH ? lastH.vy : 0,
                    screenX: ballPos.x,
                    screenY: ballPos.y,
                };
            } else {
                tooltipRef.current = null;
            }
        };

        canvas.addEventListener('click', handleClick);
        return () => canvas.removeEventListener('click', handleClick);
    }, [isRunning, simulationStateRef]);

    // Clear tooltip when simulation resumes
    useEffect(() => {
        if (isRunning) tooltipRef.current = null;
    }, [isRunning]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let animationFrameId;

        const PADDING = 60;
        const BALL_RADIUS = 14; // Bigger ball

        const render = () => {
            const { x: physX, y: physY, vx: curVx, vy: curVy, history } = simulationStateRef.current;

            const W = canvas.width;
            const H = canvas.height;

            // --- Dynamic Camera ---
            let maxX = Math.max(physX, 10);
            let maxY = Math.max(physY, 10);

            // Include predicted trajectory extent in camera
            if (params) {
                const rad = (params.angle * Math.PI) / 180;
                const vy0 = params.v0 * Math.sin(rad);
                const vx0 = params.v0 * Math.cos(rad);
                const g = params.gravity;
                const totalT = (2 * vy0) / g;
                const range = vx0 * totalT;
                const apex = (vy0 * vy0) / (2 * g);
                maxX = Math.max(maxX, range);
                maxY = Math.max(maxY, apex);
            }

            if (history && history.length > 0) {
                for (let i = 0; i < history.length; i += 3) {
                    if (history[i].x > maxX) maxX = history[i].x;
                    if (history[i].y > maxY) maxY = history[i].y;
                }
            }

            maxX *= 1.15;
            maxY *= 1.15;

            const drawableW = W - PADDING * 2;
            const drawableH = H - PADDING * 2;
            const scaleX = drawableW / maxX;
            const scaleY = drawableH / maxY;
            const scale = Math.min(scaleX, scaleY);

            const originX = PADDING;
            const originY = H - PADDING;

            const toCanvasX = (wx) => originX + wx * scale;
            const toCanvasY = (wy) => originY - wy * scale;

            // --- Clear ---
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(0, 0, W, H);

            // --- Adaptive Grid ---
            const rawStep = maxX / 8;
            const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
            const nice = [1, 2, 5, 10];
            let gridStep = magnitude;
            for (const n of nice) {
                if (magnitude * n >= rawStep) { gridStep = magnitude * n; break; }
            }
            if (gridStep < 1) gridStep = 1;

            ctx.strokeStyle = '#1e293b';
            ctx.lineWidth = 1;
            ctx.setLineDash([]);

            for (let wx = 0; wx <= maxX; wx += gridStep) {
                const cx = toCanvasX(wx);
                ctx.beginPath();
                ctx.moveTo(cx, 0);
                ctx.lineTo(cx, H);
                ctx.stroke();
            }
            for (let wy = 0; wy <= maxY; wy += gridStep) {
                const cy = toCanvasY(wy);
                ctx.beginPath();
                ctx.moveTo(0, cy);
                ctx.lineTo(W, cy);
                ctx.stroke();
            }

            // --- Grid Labels ---
            ctx.fillStyle = '#475569';
            ctx.font = '10px monospace';
            ctx.textAlign = 'center';
            for (let wx = gridStep; wx <= maxX; wx += gridStep) {
                ctx.fillText(`${Math.round(wx)}m`, toCanvasX(wx), originY + 16);
            }
            ctx.textAlign = 'right';
            for (let wy = gridStep; wy <= maxY; wy += gridStep) {
                ctx.fillText(`${Math.round(wy)}m`, originX - 8, toCanvasY(wy) + 4);
            }

            // --- Ground Line ---
            ctx.strokeStyle = '#334155';
            ctx.lineWidth = 2;
            ctx.setLineDash([]);
            ctx.beginPath();
            ctx.moveTo(0, originY);
            ctx.lineTo(W, originY);
            ctx.stroke();

            // --- Dotted Predicted Trajectory ---
            if (params) {
                const rad = (params.angle * Math.PI) / 180;
                const vy0 = params.v0 * Math.sin(rad);
                const vx0 = params.v0 * Math.cos(rad);
                const g = params.gravity;
                const totalT = (2 * vy0) / g;
                const steps = 80;
                const dt = totalT / steps;

                ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
                ctx.lineWidth = 1.5;
                ctx.setLineDash([6, 5]);
                ctx.beginPath();

                for (let i = 0; i <= steps; i++) {
                    const t = i * dt;
                    const px = vx0 * t;
                    const py = vy0 * t - 0.5 * g * t * t;
                    const cx = toCanvasX(px);
                    const cy = toCanvasY(Math.max(py, 0));
                    if (i === 0) ctx.moveTo(cx, cy);
                    else ctx.lineTo(cx, cy);
                }
                ctx.stroke();
                ctx.setLineDash([]);
            }

            // --- Determine if ball is in flight ---
            const isInFlight = history && history.length > 1 && (physY > 0.01 || simulationStateRef.current.t < 0.05);

            // --- Trail (ember fade) ---
            if (history && history.length > 1) {
                const len = history.length;
                for (let i = 1; i < len; i++) {
                    const age = (len - i) / len;
                    const alpha = isInFlight ? Math.max(0, 0.6 - age * 0.6) : 0.25;
                    const r = isInFlight ? 255 : 59;
                    const g = isInFlight ? Math.round(165 - age * 100) : 130;
                    const b = isInFlight ? Math.round(50 - age * 50) : 246;
                    ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
                    ctx.lineWidth = isInFlight ? Math.max(1, 3 * (1 - age)) : 2;
                    ctx.beginPath();
                    ctx.moveTo(toCanvasX(history[i - 1].x), toCanvasY(history[i - 1].y));
                    ctx.lineTo(toCanvasX(history[i].x), toCanvasY(history[i].y));
                    ctx.stroke();
                }
            }

            // --- Projectile Ball (bigger + shooting star glow) ---
            const ballCX = toCanvasX(physX);
            const ballCY = toCanvasY(physY);
            ballScreenPosRef.current = { x: ballCX, y: ballCY };

            if (isInFlight) {
                // Outer glow halo
                const outerGlow = ctx.createRadialGradient(ballCX, ballCY, 0, ballCX, ballCY, 50);
                outerGlow.addColorStop(0, 'rgba(255, 160, 50, 0.4)');
                outerGlow.addColorStop(0.5, 'rgba(255, 100, 20, 0.15)');
                outerGlow.addColorStop(1, 'rgba(255, 60, 0, 0)');
                ctx.fillStyle = outerGlow;
                ctx.beginPath();
                ctx.arc(ballCX, ballCY, 50, 0, Math.PI * 2);
                ctx.fill();

                // Mid glow
                const midGlow = ctx.createRadialGradient(ballCX, ballCY, 0, ballCX, ballCY, 28);
                midGlow.addColorStop(0, 'rgba(255, 220, 150, 0.9)');
                midGlow.addColorStop(0.4, 'rgba(255, 160, 50, 0.5)');
                midGlow.addColorStop(1, 'rgba(255, 100, 20, 0)');
                ctx.fillStyle = midGlow;
                ctx.beginPath();
                ctx.arc(ballCX, ballCY, 28, 0, Math.PI * 2);
                ctx.fill();

                // Core (white-hot)
                const coreGlow = ctx.createRadialGradient(ballCX, ballCY, 0, ballCX, ballCY, BALL_RADIUS);
                coreGlow.addColorStop(0, 'rgba(255, 255, 255, 1)');
                coreGlow.addColorStop(0.5, 'rgba(255, 230, 180, 0.9)');
                coreGlow.addColorStop(1, 'rgba(255, 180, 80, 0.3)');
                ctx.fillStyle = coreGlow;
                ctx.beginPath();
                ctx.arc(ballCX, ballCY, BALL_RADIUS, 0, Math.PI * 2);
                ctx.fill();
            } else {
                // Idle / landed — blue ball
                ctx.beginPath();
                ctx.arc(ballCX, ballCY, BALL_RADIUS, 0, Math.PI * 2);
                ctx.fillStyle = '#3b82f6';
                ctx.shadowBlur = 12;
                ctx.shadowColor = '#3b82f6';
                ctx.fill();
                ctx.shadowBlur = 0;
            }

            // --- Velocity Direction Arrow ---
            const lastVx = curVx || 0;
            const lastVy = curVy || 0;
            const speed = Math.sqrt(lastVx * lastVx + lastVy * lastVy);

            if (speed > 0.5 && history && history.length > 1) {
                const nx = lastVx / speed; // normalized direction
                const ny = lastVy / speed;
                const arrowLen = 45; // px length of arrow
                const arrowTipX = ballCX + nx * arrowLen;
                const arrowTipY = ballCY - ny * arrowLen; // -ny because canvas Y is inverted

                // Arrow shaft
                ctx.strokeStyle = '#22d3ee';
                ctx.lineWidth = 2.5;
                ctx.setLineDash([]);
                ctx.beginPath();
                ctx.moveTo(ballCX + nx * (BALL_RADIUS + 4), ballCY - ny * (BALL_RADIUS + 4));
                ctx.lineTo(arrowTipX, arrowTipY);
                ctx.stroke();

                // Arrowhead triangle
                const headLen = 10;
                const angle = Math.atan2(-ny, nx); // canvas angle
                ctx.fillStyle = '#22d3ee';
                ctx.beginPath();
                ctx.moveTo(arrowTipX, arrowTipY);
                ctx.lineTo(
                    arrowTipX - headLen * Math.cos(angle - Math.PI / 6),
                    arrowTipY - headLen * Math.sin(angle - Math.PI / 6) // note: canvas Y
                );
                ctx.lineTo(
                    arrowTipX - headLen * Math.cos(angle + Math.PI / 6),
                    arrowTipY - headLen * Math.sin(angle + Math.PI / 6)
                );
                ctx.closePath();
                ctx.fill();
            }

            // --- Click-to-inspect Tooltip (when paused) ---
            const tip = tooltipRef.current;
            if (tip && tip.show && !isRunning) {
                const tx = tip.screenX + 20;
                const ty = tip.screenY - 50;
                const boxW = 130;
                const boxH = 52;

                // Tooltip background
                ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
                ctx.strokeStyle = '#22d3ee';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.roundRect(tx, ty, boxW, boxH, 8);
                ctx.fill();
                ctx.stroke();

                // Tooltip text
                ctx.fillStyle = '#e2e8f0';
                ctx.font = 'bold 12px monospace';
                ctx.textAlign = 'left';
                ctx.fillText(`Vx: ${tip.vx.toFixed(2)} m/s`, tx + 10, ty + 20);
                ctx.fillText(`Vy: ${tip.vy.toFixed(2)} m/s`, tx + 10, ty + 40);

                // Connector line from tooltip to ball
                ctx.strokeStyle = 'rgba(34, 211, 238, 0.4)';
                ctx.lineWidth = 1;
                ctx.setLineDash([3, 3]);
                ctx.beginPath();
                ctx.moveTo(tx, ty + boxH / 2);
                ctx.lineTo(tip.screenX, tip.screenY);
                ctx.stroke();
                ctx.setLineDash([]);
            }

            // --- Axis Labels ---
            ctx.fillStyle = '#64748b';
            ctx.font = '11px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('Distance (m)', W / 2, H - 10);
            ctx.save();
            ctx.translate(14, H / 2);
            ctx.rotate(-Math.PI / 2);
            ctx.fillText('Height (m)', 0, 0);
            ctx.restore();

            animationFrameId = requestAnimationFrame(render);
        };

        // Handle resize
        const resize = () => {
            const parent = canvas.parentElement;
            if (parent) {
                canvas.width = parent.clientWidth;
                canvas.height = parent.clientHeight;
            }
        };

        window.addEventListener('resize', resize);
        resize();
        render();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, [simulationStateRef, isRunning, params]);

    return (
        <div className="relative w-full h-full bg-slate-900 rounded-2xl overflow-hidden border border-slate-700 shadow-inner">
            <div className="absolute top-4 right-4 bg-slate-800/80 backdrop-blur px-3 py-1 rounded-full text-xs text-slate-400 border border-slate-700 pointer-events-none select-none z-10">
                Canvas: Active
            </div>
            <canvas ref={canvasRef} className="block w-full h-full cursor-pointer" />
        </div>
    );
};

export default SimulationCanvas;
