import React, { useEffect, useRef, useState, useCallback } from 'react';

const SimulationCanvas = ({ simulationStateRef, isRunning, params }) => {
    const canvasRef = useRef(null);
    const tooltipRef = useRef(null); // { show, vx, vy, screenX, screenY }
    const ballScreenPosRef = useRef({ x: 0, y: 0 }); // track ball screen pos for click detection

    // Smooth camera refs
    const camRef = useRef({ scale: 1, cx: 10, cy: 5 });
    // Landing report opacity ref (0→1 fade in, 1→0 fade out)
    const reportRef = useRef({ opacity: 0, show: false, range: 0, maxHeight: 0, flightTime: 0 });

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
        const LERP_SPEED = 0.06; // Camera interpolation speed

        const lerp = (a, b, t) => a + (b - a) * t;

        const render = () => {
            const { x: physX, y: physY, vx: curVx, vy: curVy, history } = simulationStateRef.current;

            const W = canvas.width;
            const H = canvas.height;

            // --- Tracking Camera ---
            const drawableW = W - PADDING * 2;
            const drawableH = H - PADDING * 2;
            const isInMotion = history && history.length > 1 && (physY > 0.01 || simulationStateRef.current.t < 0.05);
            const hasLanded = history && history.length > 1 && !isInMotion;

            let targetScale, targetCX, targetCY;

            if (hasLanded) {
                // After landing — zoom out to show the full trail
                let trailMaxX = Math.max(physX, 10);
                let trailMaxY = 10;
                for (let i = 0; i < history.length; i += 3) {
                    if (history[i].x > trailMaxX) trailMaxX = history[i].x;
                    if (history[i].y > trailMaxY) trailMaxY = history[i].y;
                }
                trailMaxX *= 1.2;
                trailMaxY *= 1.2;
                targetScale = Math.min(drawableW / trailMaxX, drawableH / trailMaxY);
                targetCX = trailMaxX / 2;
                targetCY = trailMaxY / 2;
            } else if (isInMotion) {
                // In flight — track the ball closely
                const viewW = params ? Math.max(params.v0 * 1.2, 30) : 40;
                const viewH = viewW * (drawableH / drawableW);
                targetScale = Math.min(drawableW / viewW, drawableH / viewH);
                targetCX = physX;
                targetCY = Math.max(physY, viewH * 0.3);
            } else {
                // Idle — show a comfortable default view around origin
                const defaultView = params ? Math.max(params.v0 * 0.8, 20) : 20;
                targetScale = drawableW / defaultView;
                targetCX = defaultView / 2;
                targetCY = defaultView * (drawableH / drawableW) / 2;
            }

            // Smooth camera interpolation
            const cam = camRef.current;
            if (isInMotion) {
                // During flight, follow tightly (faster lerp)
                cam.scale = lerp(cam.scale, targetScale, 0.15);
                cam.cx = lerp(cam.cx, targetCX, 0.15);
                cam.cy = lerp(cam.cy, targetCY, 0.15);
            } else {
                // Smooth transition for landing / reset
                cam.scale = lerp(cam.scale, targetScale, LERP_SPEED);
                cam.cx = lerp(cam.cx, targetCX, LERP_SPEED);
                cam.cy = lerp(cam.cy, targetCY, LERP_SPEED);
            }

            const scale = cam.scale;
            const camCenterX = cam.cx;
            const camCenterY = cam.cy;

            // Camera transform: world → canvas
            const camLeft = camCenterX - (drawableW / scale) / 2;
            const camBottom = camCenterY - (drawableH / scale) / 2;

            const toCanvasX = (wx) => PADDING + (wx - camLeft) * scale;
            const toCanvasY = (wy) => (H - PADDING) - (wy - camBottom) * scale;

            // --- Clear ---
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(0, 0, W, H);

            // --- Adaptive Grid (based on visible world range) ---
            const viewWorldW = drawableW / scale;
            const viewWorldH = drawableH / scale;
            const rawStep = viewWorldW / 8;
            const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
            const nice = [1, 2, 5, 10];
            let gridStep = magnitude;
            for (const n of nice) {
                if (magnitude * n >= rawStep) { gridStep = magnitude * n; break; }
            }
            if (gridStep < 1) gridStep = 1;

            const worldLeft = camLeft;
            const worldRight = camLeft + viewWorldW;
            const worldBottom = camBottom;
            const worldTop = camBottom + viewWorldH;

            ctx.strokeStyle = '#1e293b';
            ctx.lineWidth = 1;
            ctx.setLineDash([]);

            const startWx = Math.floor(worldLeft / gridStep) * gridStep;
            for (let wx = startWx; wx <= worldRight; wx += gridStep) {
                const cx = toCanvasX(wx);
                ctx.beginPath();
                ctx.moveTo(cx, 0);
                ctx.lineTo(cx, H);
                ctx.stroke();
            }
            const startWy = Math.floor(worldBottom / gridStep) * gridStep;
            for (let wy = startWy; wy <= worldTop; wy += gridStep) {
                const cy = toCanvasY(wy);
                ctx.beginPath();
                ctx.moveTo(0, cy);
                ctx.lineTo(W, cy);
                ctx.stroke();
            }

            // --- Grid Labels ---
            ctx.fillStyle = '#475569';
            ctx.font = '10px monospace';
            const originY = toCanvasY(0);
            ctx.textAlign = 'center';
            for (let wx = startWx; wx <= worldRight; wx += gridStep) {
                if (wx === 0) continue;
                const cx = toCanvasX(wx);
                if (cx > PADDING && cx < W - 10) {
                    ctx.fillText(`${Math.round(wx)}m`, cx, Math.min(originY + 16, H - 5));
                }
            }
            ctx.textAlign = 'right';
            const originX = toCanvasX(0);
            for (let wy = startWy; wy <= worldTop; wy += gridStep) {
                if (wy === 0) continue;
                const cy = toCanvasY(wy);
                if (cy > 10 && cy < H - PADDING) {
                    ctx.fillText(`${Math.round(wy)}m`, Math.max(originX - 8, 35), cy + 4);
                }
            }

            // --- Ground Line ---
            ctx.strokeStyle = '#334155';
            ctx.lineWidth = 2;
            ctx.setLineDash([]);
            ctx.beginPath();
            ctx.moveTo(0, originY);
            ctx.lineTo(W, originY);
            ctx.stroke();



            // --- Trail (ember fade) ---
            if (history && history.length > 1) {
                const len = history.length;
                for (let i = 1; i < len; i++) {
                    const age = (len - i) / len;
                    const alpha = isInMotion ? Math.max(0, 0.6 - age * 0.6) : 0.25;
                    const r = isInMotion ? 255 : 59;
                    const g = isInMotion ? Math.round(165 - age * 100) : 130;
                    const b = isInMotion ? Math.round(50 - age * 50) : 246;
                    ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
                    ctx.lineWidth = isInMotion ? Math.max(1, 3 * (1 - age)) : 2;
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

            if (isInMotion) {
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

            // --- Velocity Direction Arrow (main — gold) ---
            const lastVx = curVx || 0;
            const lastVy = curVy || 0;
            const speed = Math.sqrt(lastVx * lastVx + lastVy * lastVy);

            if (speed > 0.5 && history && history.length > 1) {
                const nx = lastVx / speed;
                const ny = lastVy / speed;
                const arrowLen = 50;
                const startOff = BALL_RADIUS + 6;
                const startX = ballCX + nx * startOff;
                const startY = ballCY - ny * startOff;
                const arrowTipX = ballCX + nx * (startOff + arrowLen);
                const arrowTipY = ballCY - ny * (startOff + arrowLen);

                // Shaft
                ctx.strokeStyle = '#fbbf24'; // gold
                ctx.lineWidth = 2.5;
                ctx.setLineDash([]);
                ctx.beginPath();
                ctx.moveTo(startX, startY);
                ctx.lineTo(arrowTipX, arrowTipY);
                ctx.stroke();

                // Arrowhead
                const headLen = 10;
                const angle = Math.atan2(-ny, nx);
                ctx.fillStyle = '#fbbf24';
                ctx.beginPath();
                ctx.moveTo(arrowTipX, arrowTipY);
                ctx.lineTo(
                    arrowTipX - headLen * Math.cos(angle - Math.PI / 6),
                    arrowTipY - headLen * Math.sin(angle - Math.PI / 6)
                );
                ctx.lineTo(
                    arrowTipX - headLen * Math.cos(angle + Math.PI / 6),
                    arrowTipY - headLen * Math.sin(angle + Math.PI / 6)
                );
                ctx.closePath();
                ctx.fill();
            }

            // --- Click-to-inspect: Velocity Component Arrows (when paused) ---
            const tip = tooltipRef.current;
            if (tip && tip.show && !isRunning) {
                const bx = tip.screenX;
                const by = tip.screenY;
                const vxVal = tip.vx;
                const vyVal = tip.vy;
                const maxV = Math.max(Math.abs(vxVal), Math.abs(vyVal), 1);
                const arrowScale = 100 / maxV; // longer arrows for visibility
                const headSize = 10;
                const COMP_COLOR = '#22d3ee'; // cyan for both components
                const LABEL_COLOR = '#67e8f9';
                const GAP = BALL_RADIUS + 20; // start arrows away from the ball

                // --- Vx Arrow (horizontal — cyan) ---
                const vxLen = vxVal * arrowScale;
                const vxStartX = bx + GAP;
                const vxStartY = by;
                if (Math.abs(vxLen) > 3) {
                    const vxTipX = vxStartX + vxLen;
                    const vxTipY = vxStartY;

                    // Shaft
                    ctx.strokeStyle = COMP_COLOR;
                    ctx.lineWidth = 2.5;
                    ctx.setLineDash([]);
                    ctx.beginPath();
                    ctx.moveTo(vxStartX, vxStartY);
                    ctx.lineTo(vxTipX, vxTipY);
                    ctx.stroke();

                    // Arrowhead
                    const dir = vxVal > 0 ? 1 : -1;
                    ctx.fillStyle = COMP_COLOR;
                    ctx.beginPath();
                    ctx.moveTo(vxTipX, vxTipY);
                    ctx.lineTo(vxTipX - dir * headSize, vxTipY - headSize * 0.5);
                    ctx.lineTo(vxTipX - dir * headSize, vxTipY + headSize * 0.5);
                    ctx.closePath();
                    ctx.fill();

                    // Label
                    ctx.fillStyle = LABEL_COLOR;
                    ctx.font = 'bold 11px monospace';
                    ctx.textAlign = 'center';
                    ctx.fillText(`Vx: ${vxVal.toFixed(1)} m/s`, vxStartX + vxLen / 2, vxStartY + 18);
                }

                // --- Vy Arrow (vertical — cyan) ---
                const vyLen = -vyVal * arrowScale;
                const vyStartX = bx;
                const vyStartY = by - GAP;
                if (Math.abs(vyLen) > 3) {
                    const vyTipX = vyStartX;
                    const vyTipY = vyStartY + vyLen;

                    // Shaft
                    ctx.strokeStyle = COMP_COLOR;
                    ctx.lineWidth = 2.5;
                    ctx.setLineDash([]);
                    ctx.beginPath();
                    ctx.moveTo(vyStartX, vyStartY);
                    ctx.lineTo(vyTipX, vyTipY);
                    ctx.stroke();

                    // Arrowhead
                    const dir = vyLen > 0 ? 1 : -1;
                    ctx.fillStyle = COMP_COLOR;
                    ctx.beginPath();
                    ctx.moveTo(vyTipX, vyTipY);
                    ctx.lineTo(vyTipX - headSize * 0.5, vyTipY - dir * headSize);
                    ctx.lineTo(vyTipX + headSize * 0.5, vyTipY - dir * headSize);
                    ctx.closePath();
                    ctx.fill();

                    // Label
                    ctx.fillStyle = LABEL_COLOR;
                    ctx.font = 'bold 11px monospace';
                    ctx.textAlign = 'left';
                    ctx.fillText(`Vy: ${vyVal.toFixed(1)} m/s`, vyStartX + 12, vyStartY + vyLen / 2 + 4);
                }

                // --- Dashed connection lines (parallelogram hint) ---
                if (Math.abs(vxLen) > 3 && Math.abs(vyLen) > 3) {
                    ctx.strokeStyle = 'rgba(34, 211, 238, 0.2)';
                    ctx.lineWidth = 1;
                    ctx.setLineDash([4, 4]);
                    // Connector from ball to Vx start
                    ctx.beginPath();
                    ctx.moveTo(bx, by);
                    ctx.lineTo(vxStartX, vxStartY);
                    ctx.stroke();
                    // Connector from ball to Vy start
                    ctx.beginPath();
                    ctx.moveTo(bx, by);
                    ctx.lineTo(vyStartX, vyStartY);
                    ctx.stroke();
                    ctx.setLineDash([]);
                }
            }

            // --- Landing Report (glassmorphism overlay) ---
            const rpt = reportRef.current;
            if (hasLanded) {
                // Compute stats once
                if (!rpt.show) {
                    let maxH = 0;
                    let maxX = 0;
                    let maxT = 0;
                    for (let i = 0; i < history.length; i++) {
                        if (history[i].y > maxH) maxH = history[i].y;
                        if (history[i].x > maxX) maxX = history[i].x;
                        if (history[i].t > maxT) maxT = history[i].t;
                    }
                    rpt.show = true;
                    rpt.range = maxX;
                    rpt.maxHeight = maxH;
                    rpt.flightTime = maxT;
                }
                // Fade in
                rpt.opacity = Math.min(1, rpt.opacity + 0.025);
            } else if (!hasLanded && rpt.show) {
                // Fade out on reset
                rpt.opacity = Math.max(0, rpt.opacity - 0.04);
                if (rpt.opacity <= 0) {
                    rpt.show = false;
                }
            } else if (!hasLanded && !isInMotion) {
                // Idle — make sure it's off
                rpt.opacity = Math.max(0, rpt.opacity - 0.04);
                if (rpt.opacity <= 0) rpt.show = false;
            }

            if (rpt.opacity > 0.01) {
                const alpha = rpt.opacity;
                const cardW = 260;
                const cardH = 150;
                const cardX = W / 2 - cardW / 2;
                const cardY = H / 2 - cardH / 2 - 30;

                ctx.save();
                ctx.globalAlpha = alpha;

                // Card background (glassmorphism)
                ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
                const r = 16;
                ctx.beginPath();
                ctx.moveTo(cardX + r, cardY);
                ctx.lineTo(cardX + cardW - r, cardY);
                ctx.quadraticCurveTo(cardX + cardW, cardY, cardX + cardW, cardY + r);
                ctx.lineTo(cardX + cardW, cardY + cardH - r);
                ctx.quadraticCurveTo(cardX + cardW, cardY + cardH, cardX + cardW - r, cardY + cardH);
                ctx.lineTo(cardX + r, cardY + cardH);
                ctx.quadraticCurveTo(cardX, cardY + cardH, cardX, cardY + cardH - r);
                ctx.lineTo(cardX, cardY + r);
                ctx.quadraticCurveTo(cardX, cardY, cardX + r, cardY);
                ctx.closePath();
                ctx.fill();

                // Card border (subtle glow)
                ctx.strokeStyle = 'rgba(59, 130, 246, 0.4)';
                ctx.lineWidth = 1.5;
                ctx.stroke();

                // Title
                ctx.fillStyle = '#e2e8f0';
                ctx.font = 'bold 15px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('🎯 Flight Report', W / 2, cardY + 30);

                // Divider line
                ctx.strokeStyle = 'rgba(100, 116, 139, 0.3)';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(cardX + 20, cardY + 42);
                ctx.lineTo(cardX + cardW - 20, cardY + 42);
                ctx.stroke();

                // Stats
                const stats = [
                    { label: 'Range (X)', value: `${rpt.range.toFixed(1)} m`, color: '#3b82f6' },
                    { label: 'Max Height', value: `${rpt.maxHeight.toFixed(1)} m`, color: '#a855f7' },
                    { label: 'Flight Time', value: `${rpt.flightTime.toFixed(2)} s`, color: '#22d3ee' },
                ];

                stats.forEach((stat, idx) => {
                    const sy = cardY + 62 + idx * 30;

                    // Label
                    ctx.fillStyle = '#94a3b8';
                    ctx.font = '12px sans-serif';
                    ctx.textAlign = 'left';
                    ctx.fillText(stat.label, cardX + 25, sy);

                    // Value
                    ctx.fillStyle = stat.color;
                    ctx.font = 'bold 14px monospace';
                    ctx.textAlign = 'right';
                    ctx.fillText(stat.value, cardX + cardW - 25, sy);
                });

                ctx.restore();
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
