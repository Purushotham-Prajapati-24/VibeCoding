/**
 * ConceptOverlay — Force arrows, energy bars, live equation overlay.
 * Draws on a transparent canvas layered on top of the simulation canvas.
 */
import React, { useEffect, useRef } from 'react';

const ConceptOverlay = ({ simulationStateRef, params, canvasWidth, canvasHeight, isVisible }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        if (!isVisible) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let animId;

        const paint = () => {
            const state = simulationStateRef.current;
            const { x: physX, y: physY, vx, vy, history } = state;
            const W = canvasWidth || canvas.width;
            const H = canvasHeight || canvas.height;

            // DPI Scaling for sharp rendering
            const dpr = window.devicePixelRatio || 1;
            canvas.width = W * dpr;
            canvas.height = H * dpr;
            canvas.style.width = `${W}px`;
            canvas.style.height = `${H}px`;

            // Normalize coordinate system
            ctx.scale(dpr, dpr);
            ctx.clearRect(0, 0, W, H);

            // Compute camera (same as main canvas)
            let maxX = 20, maxY = 10;
            if (history) {
                for (const p of history) {
                    if (p.x > maxX) maxX = p.x;
                    if (p.y > maxY) maxY = p.y;
                }
            }
            maxX *= 1.2; maxY *= 1.2;

            const PADDING = 60;
            const drawW = W - PADDING * 2;
            const drawH = H - PADDING * 2;
            const sc = Math.min(drawW / maxX, drawH / maxY);
            const toX = (wx) => PADDING + wx * sc;
            const toY = (wy) => H - PADDING - wy * sc;

            const bx = toX(physX);
            const by = toY(physY);

            // 1. Gravity force arrow (red, downward)
            const gLen = params.gravity * 4;
            drawArrow(ctx, bx, by, bx, by + gLen, '#ef4444', 'Fg');

            // 2. Velocity components (when moving)
            const speed = Math.sqrt((vx || 0) ** 2 + (vy || 0) ** 2);
            if (speed > 0.5) {
                // Vx (cyan)
                drawArrow(ctx, bx, by, bx + (vx || 0) * 3, by, '#22d3ee', 'Vx');
                // Vy (purple)
                drawArrow(ctx, bx, by, bx, by - (vy || 0) * 3, '#a855f7', 'Vy');
            }

            // 3. Drag force arrow (orange, opposing velocity)
            if (params.drag > 0 && speed > 1) {
                const dragMag = params.drag * speed * 2;
                const dragAngle = Math.atan2(vy || 0, vx || 0);
                drawArrow(ctx, bx, by,
                    bx - Math.cos(dragAngle) * dragMag * 3,
                    by + Math.sin(dragAngle) * dragMag * 3,
                    '#fb923c', 'Fd');
            }

            // 4. Energy bars (bottom-left)
            const gravity = params.gravity;
            const keMax = 0.5 * (params.v0 || 50) ** 2;
            const ke = 0.5 * speed * speed;
            const pe = gravity * Math.max(0, physY);

            const barX = 16;
            const barY = H - 28;
            const barW = 120;
            const barH = 10;

            // KE bar
            ctx.fillStyle = 'rgba(30, 41, 59, 0.7)';
            ctx.fillRect(barX, barY - 24, barW, barH);
            ctx.fillStyle = '#3b82f6';
            ctx.fillRect(barX, barY - 24, (ke / keMax) * barW, barH);
            ctx.font = '9px monospace';
            ctx.fillStyle = '#94a3b8';
            ctx.fillText(`KE: ${ke.toFixed(0)} J`, barX + barW + 6, barY - 16);

            // PE bar
            ctx.fillStyle = 'rgba(30, 41, 59, 0.7)';
            ctx.fillRect(barX, barY - 10, barW, barH);
            ctx.fillStyle = '#a855f7';
            ctx.fillRect(barX, barY - 10, (pe / keMax) * barW, barH);
            ctx.fillText(`PE: ${pe.toFixed(0)} J`, barX + barW + 6, barY - 2);

            // 5. Live equation (top-center)
            const t = state.t || 0;
            ctx.font = 'italic 13px serif';
            ctx.fillStyle = 'rgba(226, 232, 240, 0.7)';
            const eqStr = `y = ${(params.v0 * Math.sin(params.angle * Math.PI / 180)).toFixed(1)}·${t.toFixed(2)} − ½·${gravity}·${t.toFixed(2)}²`;
            const eqW = ctx.measureText(eqStr).width;
            ctx.fillText(eqStr, (W - eqW) / 2, 20);

            // Equation result
            const yCalc = params.v0 * Math.sin(params.angle * Math.PI / 180) * t - 0.5 * gravity * t * t;
            ctx.font = 'bold 13px serif';
            ctx.fillStyle = '#fbbf24';
            ctx.fillText(` = ${Math.max(0, yCalc).toFixed(2)}m`, (W + eqW) / 2 + 4, 20);

            animId = requestAnimationFrame(paint);
        };

        animId = requestAnimationFrame(paint);
        return () => cancelAnimationFrame(animId);
    }, [isVisible, simulationStateRef, params, canvasWidth, canvasHeight]);

    if (!isVisible) return null;

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 pointer-events-none z-10"
            style={{ width: '100%', height: '100%' }}
        />
    );
};

function drawArrow(ctx, x1, y1, x2, y2, color, label) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len < 2) return;

    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    // Arrowhead
    const angle = Math.atan2(dy, dx);
    const headLen = 8;
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - headLen * Math.cos(angle - 0.4), y2 - headLen * Math.sin(angle - 0.4));
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - headLen * Math.cos(angle + 0.4), y2 - headLen * Math.sin(angle + 0.4));
    ctx.stroke();

    // Label
    ctx.font = 'bold 10px monospace';
    ctx.fillStyle = color;
    ctx.fillText(label, x2 + 5, y2 - 5);
}

export default ConceptOverlay;
