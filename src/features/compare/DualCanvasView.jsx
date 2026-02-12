/**
 * DualCanvasView — Side-by-side simulation canvases for Compare Mode.
 * Each canvas draws an independent trajectory with shared camera zoom.
 * 
 * Fixes:
 * - DPI scaling via devicePixelRatio for crisp text on retina/HiDPI
 * - Labels drawn ONLY via DOM overlays (removed duplicate canvas text)
 */
import React, { useEffect, useRef } from 'react';
import { useCompareContext } from './CompareContext';

const PADDING = 50;
const BALL_RADIUS = 10;

function drawWorld(ctx, W, H, stateRef, params) {
    const { x: physX, y: physY, history } = stateRef.current;
    ctx.clearRect(0, 0, W, H);

    // Background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, W, H);

    // Compute camera
    let maxX = 20, maxY = 10;
    if (history) {
        for (const p of history) {
            if (p.x > maxX) maxX = p.x;
            if (p.y > maxY) maxY = p.y;
        }
    }
    maxX *= 1.2;
    maxY *= 1.2;

    const drawW = W - PADDING * 2;
    const drawH = H - PADDING * 2;
    const scaleX = drawW / maxX;
    const scaleY = drawH / maxY;
    const scale = Math.min(scaleX, scaleY);

    const toX = (wx) => PADDING + wx * scale;
    const toY = (wy) => H - PADDING - wy * scale;

    // Grid
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 0.5;
    const gridStep = Math.pow(10, Math.floor(Math.log10(maxX / 4)));
    for (let gx = 0; gx <= maxX; gx += gridStep) {
        ctx.beginPath(); ctx.moveTo(toX(gx), 0); ctx.lineTo(toX(gx), H); ctx.stroke();
    }
    for (let gy = 0; gy <= maxY; gy += gridStep) {
        ctx.beginPath(); ctx.moveTo(0, toY(gy)); ctx.lineTo(W, toY(gy)); ctx.stroke();
    }

    // Ground
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, toY(0));
    ctx.lineTo(W, toY(0));
    ctx.stroke();

    // Trail
    if (history && history.length > 1) {
        for (let i = 1; i < history.length; i++) {
            const prev = history[i - 1];
            const cur = history[i];
            const progress = i / history.length;
            ctx.strokeStyle = `rgba(251, 191, 36, ${0.2 + progress * 0.8})`;
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(toX(prev.x), toY(prev.y));
            ctx.lineTo(toX(cur.x), toY(cur.y));
            ctx.stroke();
        }
    }

    // Ball glow
    const bx = toX(physX);
    const by = toY(physY);

    const glow = ctx.createRadialGradient(bx, by, 0, bx, by, 25);
    glow.addColorStop(0, 'rgba(251, 191, 36, 0.3)');
    glow.addColorStop(1, 'rgba(251, 191, 36, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath(); ctx.arc(bx, by, 25, 0, Math.PI * 2); ctx.fill();

    // Ball
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(bx, by, BALL_RADIUS, 0, Math.PI * 2); ctx.fill();

    // NOTE: Labels are rendered via DOM overlays, NOT on canvas (avoids doubling)
}

const DualCanvasView = () => {
    const canvasARef = useRef(null);
    const canvasBRef = useRef(null);
    const { compare } = useCompareContext();

    useEffect(() => {
        const cA = canvasARef.current;
        const cB = canvasBRef.current;
        if (!cA || !cB) return;

        const ctxA = cA.getContext('2d');
        const ctxB = cB.getContext('2d');
        let animId;

        const render = () => {
            const dpr = window.devicePixelRatio || 1;

            // Resize canvas A
            const rectA = cA.parentElement.getBoundingClientRect();
            const wA = Math.floor(rectA.width);
            const hA = Math.floor(rectA.height);
            const realWA = wA * dpr;
            const realHA = hA * dpr;

            if (cA.width !== realWA || cA.height !== realHA) {
                cA.width = realWA;
                cA.height = realHA;
                cA.style.width = wA + 'px';
                cA.style.height = hA + 'px';
            }
            ctxA.setTransform(dpr, 0, 0, dpr, 0, 0);

            // Resize canvas B
            const rectB = cB.parentElement.getBoundingClientRect();
            const wB = Math.floor(rectB.width);
            const hB = Math.floor(rectB.height);
            const realWB = wB * dpr;
            const realHB = hB * dpr;

            if (cB.width !== realWB || cB.height !== realHB) {
                cB.width = realWB;
                cB.height = realHB;
                cB.style.width = wB + 'px';
                cB.style.height = hB + 'px';
            }
            ctxB.setTransform(dpr, 0, 0, dpr, 0, 0);

            drawWorld(ctxA, wA, hA, compare.stateA, compare.paramsA);
            drawWorld(ctxB, wB, hB, compare.stateB, compare.paramsB);

            animId = requestAnimationFrame(render);
        };
        animId = requestAnimationFrame(render);
        return () => cancelAnimationFrame(animId);
    }, [compare]);

    return (
        <div className="flex gap-3 h-full">
            <div className="flex-1 bg-slate-900 rounded-2xl overflow-hidden border border-slate-700 relative shadow-2xl">
                <div className="absolute top-2 left-3 z-10 px-2 py-0.5 rounded-lg bg-blue-500/20 text-blue-400 text-xs font-bold">
                    {compare.paramsA.label}
                </div>
                <div className="absolute top-8 left-3 z-10 text-[10px] text-slate-500 font-mono">
                    g = {compare.paramsA.gravity} m/s²
                </div>
                <canvas ref={canvasARef} className="block" />
            </div>
            <div className="flex-1 bg-slate-900 rounded-2xl overflow-hidden border border-slate-700 relative shadow-2xl">
                <div className="absolute top-2 left-3 z-10 px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs font-bold">
                    {compare.paramsB.label}
                </div>
                <div className="absolute top-8 left-3 z-10 text-[10px] text-slate-500 font-mono">
                    g = {compare.paramsB.gravity} m/s²
                </div>
                <canvas ref={canvasBRef} className="block" />
            </div>
        </div>
    );
};

export default DualCanvasView;
