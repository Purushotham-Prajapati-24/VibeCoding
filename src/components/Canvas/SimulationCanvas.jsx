import React, { useEffect, useRef, useState, useCallback } from 'react';

const SimulationCanvas = ({ simulationStateRef, isRunning, params }) => {
    const canvasRef = useRef(null);
    const tooltipRef = useRef(null);
    const ballScreenPosRef = useRef({ x: 0, y: 0 });

    // Smooth camera refs
    const camRef = useRef({ scale: 1, cx: 10, cy: 5 });
    // Landing report opacity ref
    const reportRef = useRef({ opacity: 0, show: false, range: 0, maxHeight: 0, flightTime: 0, noDragRange: 0, noDragMaxHeight: 0, noDragFlightTime: 0 });

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
        const BALL_RADIUS = 14;
        const LERP_SPEED = 0.06;

        const lerp = (a, b, t) => a + (b - a) * t;

        const render = () => {
            const { x: physX, y: physY, vx: curVx, vy: curVy, history, noDragHistory } = simulationStateRef.current;

            const W = canvas.width;
            const H = canvas.height;

            const drawableW = W - PADDING * 2;
            const drawableH = H - PADDING * 2;
            const isInMotion = history && history.length > 1 && (physY > 0.01 || simulationStateRef.current.t < 0.05);
            const hasLanded = history && history.length > 1 && !isInMotion;
            const hasDrag = params && params.drag > 0;

            let targetScale, targetCX, targetCY;

            if (hasLanded) {
                // Zoom out to show full trail (both trails if drag active)
                let trailMaxX = Math.max(physX, 10);
                let trailMaxY = 10;
                const allHistories = [history];
                if (noDragHistory && noDragHistory.length > 0) allHistories.push(noDragHistory);

                for (const h of allHistories) {
                    for (let i = 0; i < h.length; i += 3) {
                        if (h[i].x > trailMaxX) trailMaxX = h[i].x;
                        if (h[i].y > trailMaxY) trailMaxY = h[i].y;
                    }
                }
                trailMaxX *= 1.2;
                trailMaxY *= 1.2;
                targetScale = Math.min(drawableW / trailMaxX, drawableH / trailMaxY);
                targetCX = trailMaxX / 2;
                targetCY = trailMaxY / 2;
            } else if (isInMotion) {
                const viewW = params ? Math.max(params.v0 * 1.2, 30) : 40;
                const viewH = viewW * (drawableH / drawableW);
                targetScale = Math.min(drawableW / viewW, drawableH / viewH);
                targetCX = physX;
                targetCY = Math.max(physY, viewH * 0.3);
            } else {
                const defaultView = params ? Math.max(params.v0 * 0.8, 20) : 20;
                targetScale = drawableW / defaultView;
                targetCX = defaultView / 2;
                targetCY = defaultView * (drawableH / drawableW) / 2;
            }

            // Smooth camera interpolation
            const cam = camRef.current;
            if (isInMotion) {
                cam.scale = lerp(cam.scale, targetScale, 0.15);
                cam.cx = lerp(cam.cx, targetCX, 0.15);
                cam.cy = lerp(cam.cy, targetCY, 0.15);
            } else {
                cam.scale = lerp(cam.scale, targetScale, LERP_SPEED);
                cam.cx = lerp(cam.cx, targetCX, LERP_SPEED);
                cam.cy = lerp(cam.cy, targetCY, LERP_SPEED);
            }

            const scale = cam.scale;
            const camCenterX = cam.cx;
            const camCenterY = cam.cy;

            const camLeft = camCenterX - (drawableW / scale) / 2;
            const camBottom = camCenterY - (drawableH / scale) / 2;

            const toCanvasX = (wx) => PADDING + (wx - camLeft) * scale;
            const toCanvasY = (wy) => (H - PADDING) - (wy - camBottom) * scale;

            // --- Clear ---
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(0, 0, W, H);

            // --- Adaptive Grid ---
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

            // --- No-Drag Ghost Trail (dashed, gray/green) ---
            if (hasDrag && noDragHistory && noDragHistory.length > 1) {
                ctx.setLineDash([6, 4]);
                ctx.strokeStyle = 'rgba(34, 197, 94, 0.35)';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(toCanvasX(noDragHistory[0].x), toCanvasY(noDragHistory[0].y));
                for (let i = 1; i < noDragHistory.length; i++) {
                    ctx.lineTo(toCanvasX(noDragHistory[i].x), toCanvasY(noDragHistory[i].y));
                }
                ctx.stroke();
                ctx.setLineDash([]);

                // Landing marker for no-drag
                const lastND = noDragHistory[noDragHistory.length - 1];
                if (lastND.y <= 0.01 && hasLanded) {
                    const ndX = toCanvasX(lastND.x);
                    const ndY = toCanvasY(0);
                    ctx.beginPath();
                    ctx.arc(ndX, ndY, 5, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(34, 197, 94, 0.6)';
                    ctx.fill();
                    ctx.fillStyle = 'rgba(34, 197, 94, 0.7)';
                    ctx.font = '10px sans-serif';
                    ctx.textAlign = 'center';
                    ctx.fillText('No Drag', ndX, ndY - 10);
                }
            }

            // --- Main Trail (ember fade) ---
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

            // --- Projectile Ball ---
            const ballCX = toCanvasX(physX);
            const ballCY = toCanvasY(physY);
            ballScreenPosRef.current = { x: ballCX, y: ballCY };

            if (isInMotion) {
                const outerGlow = ctx.createRadialGradient(ballCX, ballCY, 0, ballCX, ballCY, 50);
                outerGlow.addColorStop(0, 'rgba(255, 160, 50, 0.4)');
                outerGlow.addColorStop(0.5, 'rgba(255, 100, 20, 0.15)');
                outerGlow.addColorStop(1, 'rgba(255, 60, 0, 0)');
                ctx.fillStyle = outerGlow;
                ctx.beginPath();
                ctx.arc(ballCX, ballCY, 50, 0, Math.PI * 2);
                ctx.fill();

                const midGlow = ctx.createRadialGradient(ballCX, ballCY, 0, ballCX, ballCY, 28);
                midGlow.addColorStop(0, 'rgba(255, 220, 150, 0.9)');
                midGlow.addColorStop(0.4, 'rgba(255, 160, 50, 0.5)');
                midGlow.addColorStop(1, 'rgba(255, 100, 20, 0)');
                ctx.fillStyle = midGlow;
                ctx.beginPath();
                ctx.arc(ballCX, ballCY, 28, 0, Math.PI * 2);
                ctx.fill();

                const coreGlow = ctx.createRadialGradient(ballCX, ballCY, 0, ballCX, ballCY, BALL_RADIUS);
                coreGlow.addColorStop(0, 'rgba(255, 255, 255, 1)');
                coreGlow.addColorStop(0.5, 'rgba(255, 230, 180, 0.9)');
                coreGlow.addColorStop(1, 'rgba(255, 180, 80, 0.3)');
                ctx.fillStyle = coreGlow;
                ctx.beginPath();
                ctx.arc(ballCX, ballCY, BALL_RADIUS, 0, Math.PI * 2);
                ctx.fill();
            } else {
                ctx.beginPath();
                ctx.arc(ballCX, ballCY, BALL_RADIUS, 0, Math.PI * 2);
                ctx.fillStyle = '#3b82f6';
                ctx.shadowBlur = 12;
                ctx.shadowColor = '#3b82f6';
                ctx.fill();
                ctx.shadowBlur = 0;
            }

            // --- Velocity Arrow (gold) ---
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

                ctx.strokeStyle = '#fbbf24';
                ctx.lineWidth = 2.5;
                ctx.setLineDash([]);
                ctx.beginPath();
                ctx.moveTo(startX, startY);
                ctx.lineTo(arrowTipX, arrowTipY);
                ctx.stroke();

                const headLen = 10;
                const angle = Math.atan2(-ny, nx);
                ctx.fillStyle = '#fbbf24';
                ctx.beginPath();
                ctx.moveTo(arrowTipX, arrowTipY);
                ctx.lineTo(arrowTipX - headLen * Math.cos(angle - Math.PI / 6), arrowTipY - headLen * Math.sin(angle - Math.PI / 6));
                ctx.lineTo(arrowTipX - headLen * Math.cos(angle + Math.PI / 6), arrowTipY - headLen * Math.sin(angle + Math.PI / 6));
                ctx.closePath();
                ctx.fill();
            }

            // --- Click-to-inspect Velocity Components (paused) ---
            const tip = tooltipRef.current;
            if (tip && tip.show && !isRunning) {
                const bx = tip.screenX;
                const by = tip.screenY;
                const vxVal = tip.vx;
                const vyVal = tip.vy;
                const maxV = Math.max(Math.abs(vxVal), Math.abs(vyVal), 1);
                const arrowScale = 100 / maxV;
                const headSize = 10;
                const COMP_COLOR = '#22d3ee';
                const LABEL_COLOR = '#67e8f9';
                const GAP = BALL_RADIUS + 20;

                const vxLen = vxVal * arrowScale;
                const vxStartX = bx + GAP;
                const vxStartY = by;
                if (Math.abs(vxLen) > 3) {
                    const vxTipX = vxStartX + vxLen;
                    ctx.strokeStyle = COMP_COLOR;
                    ctx.lineWidth = 2.5;
                    ctx.setLineDash([]);
                    ctx.beginPath();
                    ctx.moveTo(vxStartX, vxStartY);
                    ctx.lineTo(vxTipX, vxStartY);
                    ctx.stroke();

                    const dir = vxVal > 0 ? 1 : -1;
                    ctx.fillStyle = COMP_COLOR;
                    ctx.beginPath();
                    ctx.moveTo(vxTipX, vxStartY);
                    ctx.lineTo(vxTipX - dir * headSize, vxStartY - headSize * 0.5);
                    ctx.lineTo(vxTipX - dir * headSize, vxStartY + headSize * 0.5);
                    ctx.closePath();
                    ctx.fill();

                    ctx.fillStyle = LABEL_COLOR;
                    ctx.font = 'bold 11px monospace';
                    ctx.textAlign = 'center';
                    ctx.fillText(`Vx: ${vxVal.toFixed(1)} m/s`, vxStartX + vxLen / 2, vxStartY + 18);
                }

                const vyLen = -vyVal * arrowScale;
                const vyStartX = bx;
                const vyStartY = by - GAP;
                if (Math.abs(vyLen) > 3) {
                    const vyTipY = vyStartY + vyLen;
                    ctx.strokeStyle = COMP_COLOR;
                    ctx.lineWidth = 2.5;
                    ctx.setLineDash([]);
                    ctx.beginPath();
                    ctx.moveTo(vyStartX, vyStartY);
                    ctx.lineTo(vyStartX, vyTipY);
                    ctx.stroke();

                    const dir = vyLen > 0 ? 1 : -1;
                    ctx.fillStyle = COMP_COLOR;
                    ctx.beginPath();
                    ctx.moveTo(vyStartX, vyTipY);
                    ctx.lineTo(vyStartX - headSize * 0.5, vyTipY - dir * headSize);
                    ctx.lineTo(vyStartX + headSize * 0.5, vyTipY - dir * headSize);
                    ctx.closePath();
                    ctx.fill();

                    ctx.fillStyle = LABEL_COLOR;
                    ctx.font = 'bold 11px monospace';
                    ctx.textAlign = 'left';
                    ctx.fillText(`Vy: ${vyVal.toFixed(1)} m/s`, vyStartX + 12, vyStartY + vyLen / 2 + 4);
                }

                if (Math.abs(vxLen) > 3 && Math.abs(vyLen) > 3) {
                    ctx.strokeStyle = 'rgba(34, 211, 238, 0.2)';
                    ctx.lineWidth = 1;
                    ctx.setLineDash([4, 4]);
                    ctx.beginPath();
                    ctx.moveTo(bx, by);
                    ctx.lineTo(vxStartX, vxStartY);
                    ctx.stroke();
                    ctx.beginPath();
                    ctx.moveTo(bx, by);
                    ctx.lineTo(vyStartX, vyStartY);
                    ctx.stroke();
                    ctx.setLineDash([]);
                }
            }

            // --- Landing Report (glassmorphism overlay with drag comparison) ---
            const rpt = reportRef.current;
            if (hasLanded) {
                if (!rpt.show) {
                    let maxH = 0, maxX = 0, maxT = 0;
                    for (let i = 0; i < history.length; i++) {
                        if (history[i].y > maxH) maxH = history[i].y;
                        if (history[i].x > maxX) maxX = history[i].x;
                        if (history[i].t > maxT) maxT = history[i].t;
                    }
                    let ndMaxH = 0, ndMaxX = 0, ndMaxT = 0;
                    if (noDragHistory && noDragHistory.length > 0) {
                        for (let i = 0; i < noDragHistory.length; i++) {
                            if (noDragHistory[i].y > ndMaxH) ndMaxH = noDragHistory[i].y;
                            if (noDragHistory[i].x > ndMaxX) ndMaxX = noDragHistory[i].x;
                            if (noDragHistory[i].t > ndMaxT) ndMaxT = noDragHistory[i].t;
                        }
                    }
                    rpt.show = true;
                    rpt.range = maxX;
                    rpt.maxHeight = maxH;
                    rpt.flightTime = maxT;
                    rpt.noDragRange = ndMaxX;
                    rpt.noDragMaxHeight = ndMaxH;
                    rpt.noDragFlightTime = ndMaxT;
                }
                rpt.opacity = Math.min(1, rpt.opacity + 0.025);
            } else if (!hasLanded && rpt.show) {
                rpt.opacity = Math.max(0, rpt.opacity - 0.04);
                if (rpt.opacity <= 0) rpt.show = false;
            } else if (!hasLanded && !isInMotion) {
                rpt.opacity = Math.max(0, rpt.opacity - 0.04);
                if (rpt.opacity <= 0) rpt.show = false;
            }

            if (rpt.opacity > 0.01) {
                const alpha = rpt.opacity;
                const showComparison = hasDrag && rpt.noDragRange > 0;
                const cardW = showComparison ? 340 : 260;
                const cardH = showComparison ? 230 : 150;
                const cardX = W / 2 - cardW / 2;
                const cardY = H / 2 - cardH / 2 - 30;

                ctx.save();
                ctx.globalAlpha = alpha;

                // Card background
                ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
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

                // Card border
                ctx.strokeStyle = 'rgba(59, 130, 246, 0.4)';
                ctx.lineWidth = 1.5;
                ctx.stroke();

                // Title
                ctx.fillStyle = '#e2e8f0';
                ctx.font = 'bold 15px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('🎯 Flight Report', W / 2, cardY + 30);

                // Divider
                ctx.strokeStyle = 'rgba(100, 116, 139, 0.3)';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(cardX + 20, cardY + 42);
                ctx.lineTo(cardX + cardW - 20, cardY + 42);
                ctx.stroke();

                if (showComparison) {
                    // Column headers
                    ctx.font = 'bold 10px sans-serif';
                    ctx.fillStyle = '#94a3b8';
                    ctx.textAlign = 'left';
                    ctx.fillText('Metric', cardX + 20, cardY + 58);
                    ctx.textAlign = 'center';
                    ctx.fillStyle = '#f87171'; // red = with drag
                    ctx.fillText('With Drag', cardX + cardW * 0.50, cardY + 58);
                    ctx.fillStyle = '#4ade80'; // green = no drag
                    ctx.fillText('No Drag', cardX + cardW * 0.72, cardY + 58);
                    ctx.fillStyle = '#fbbf24'; // gold = impact
                    ctx.fillText('Impact', cardX + cardW - 30, cardY + 58);

                    // Thin header line
                    ctx.strokeStyle = 'rgba(100, 116, 139, 0.2)';
                    ctx.beginPath();
                    ctx.moveTo(cardX + 20, cardY + 64);
                    ctx.lineTo(cardX + cardW - 20, cardY + 64);
                    ctx.stroke();

                    const stats = [
                        {
                            label: 'Range',
                            drag: rpt.range,
                            noDrag: rpt.noDragRange,
                            unit: 'm',
                        },
                        {
                            label: 'Max Height',
                            drag: rpt.maxHeight,
                            noDrag: rpt.noDragMaxHeight,
                            unit: 'm',
                        },
                        {
                            label: 'Flight Time',
                            drag: rpt.flightTime,
                            noDrag: rpt.noDragFlightTime,
                            unit: 's',
                        },
                    ];

                    stats.forEach((s, idx) => {
                        const sy = cardY + 84 + idx * 32;
                        const pctDiff = s.noDrag !== 0
                            ? ((s.drag - s.noDrag) / s.noDrag * 100)
                            : 0;

                        // Row label
                        ctx.fillStyle = '#94a3b8';
                        ctx.font = '12px sans-serif';
                        ctx.textAlign = 'left';
                        ctx.fillText(s.label, cardX + 20, sy);

                        // With drag value
                        ctx.fillStyle = '#f87171';
                        ctx.font = 'bold 12px monospace';
                        ctx.textAlign = 'center';
                        ctx.fillText(`${s.drag.toFixed(1)} ${s.unit}`, cardX + cardW * 0.50, sy);

                        // No drag value
                        ctx.fillStyle = '#4ade80';
                        ctx.fillText(`${s.noDrag.toFixed(1)} ${s.unit}`, cardX + cardW * 0.72, sy);

                        // Impact percentage
                        const impactColor = pctDiff < -1 ? '#f87171' : pctDiff > 1 ? '#4ade80' : '#94a3b8';
                        ctx.fillStyle = impactColor;
                        ctx.font = 'bold 12px monospace';
                        ctx.textAlign = 'right';
                        const sign = pctDiff > 0 ? '+' : '';
                        ctx.fillText(`${sign}${pctDiff.toFixed(1)}%`, cardX + cardW - 16, sy);
                    });

                    // Summary
                    const rangeLoss = rpt.noDragRange > 0
                        ? ((rpt.noDragRange - rpt.range) / rpt.noDragRange * 100).toFixed(1)
                        : '0';
                    ctx.fillStyle = '#64748b';
                    ctx.font = '11px sans-serif';
                    ctx.textAlign = 'center';
                    ctx.fillText(
                        `Air resistance reduced range by ${rangeLoss}%`,
                        W / 2,
                        cardY + cardH - 20
                    );
                } else {
                    // Simple report (no drag comparison)
                    const stats = [
                        { label: 'Range (X)', value: `${rpt.range.toFixed(1)} m`, color: '#3b82f6' },
                        { label: 'Max Height', value: `${rpt.maxHeight.toFixed(1)} m`, color: '#a855f7' },
                        { label: 'Flight Time', value: `${rpt.flightTime.toFixed(2)} s`, color: '#22d3ee' },
                    ];

                    stats.forEach((stat, idx) => {
                        const sy = cardY + 62 + idx * 30;
                        ctx.fillStyle = '#94a3b8';
                        ctx.font = '12px sans-serif';
                        ctx.textAlign = 'left';
                        ctx.fillText(stat.label, cardX + 25, sy);
                        ctx.fillStyle = stat.color;
                        ctx.font = 'bold 14px monospace';
                        ctx.textAlign = 'right';
                        ctx.fillText(stat.value, cardX + cardW - 25, sy);
                    });
                }

                ctx.restore();
            }

            // --- Legend (when drag is active) ---
            if (hasDrag && history && history.length > 1) {
                ctx.save();
                ctx.globalAlpha = 0.8;
                const lx = W - 160;
                const ly = 20;

                // Solid line = with drag
                ctx.strokeStyle = '#3b82f6';
                ctx.lineWidth = 2;
                ctx.setLineDash([]);
                ctx.beginPath();
                ctx.moveTo(lx, ly);
                ctx.lineTo(lx + 24, ly);
                ctx.stroke();
                ctx.fillStyle = '#94a3b8';
                ctx.font = '10px sans-serif';
                ctx.textAlign = 'left';
                ctx.fillText('With Air Resistance', lx + 30, ly + 4);

                // Dashed line = no drag
                ctx.strokeStyle = 'rgba(34, 197, 94, 0.6)';
                ctx.lineWidth = 2;
                ctx.setLineDash([6, 4]);
                ctx.beginPath();
                ctx.moveTo(lx, ly + 18);
                ctx.lineTo(lx + 24, ly + 18);
                ctx.stroke();
                ctx.setLineDash([]);
                ctx.fillStyle = '#94a3b8';
                ctx.fillText('Without (Vacuum)', lx + 30, ly + 22);

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
        <div className="relative w-full h-[90vh] bg-slate-900 rounded-2xl overflow-hidden border border-slate-700 shadow-inner">
            <div className="absolute top-4 right-4 bg-slate-800/80 backdrop-blur px-3 py-1 rounded-full text-xs text-slate-400 border border-slate-700 pointer-events-none select-none z-10">
                Canvas: Active
            </div>
            <canvas ref={canvasRef} className="block w-full h-full cursor-pointer" />
        </div>
    );
};

export default SimulationCanvas;
