
import React, { useRef, useEffect } from 'react';

const PendulumCanvas = ({ isRunning, params, simulationStateRef }) => {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        const render = () => {
            if (!canvas || !containerRef.current) return;

            // Resize canvas to match container
            const { width, height } = containerRef.current.getBoundingClientRect();
            canvas.width = width;
            canvas.height = height;

            // Clear
            ctx.clearRect(0, 0, width, height);

            // Physics State
            const state = simulationStateRef.current;
            const { theta } = state; // Angle from vertical
            const L = params.length || 1; // Meters

            // Scaling
            // Let's say the canvas height represents 5 meters (or adaptive?)
            // If L max is 5m, we need to fit it.
            const scale = Math.min(width, height) / (Math.max(L, 2) * 2.2);
            const centerX = width / 2;
            const anchorY = height * 0.2;

            // Calculate Bob Position
            // x = L sin(theta)
            // y = L cos(theta)
            const bobX = centerX + (L * Math.sin(theta)) * scale;
            const bobY = anchorY + (L * Math.cos(theta)) * scale;

            // Draw Trail
            if (state.history && state.history.length > 1) {
                ctx.beginPath();
                ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)'; // Light Blue
                ctx.lineWidth = 2;

                // Draw only last N points
                const trail = state.history.slice(-100);

                trail.forEach((point, index) => {
                    // Re-calculate screen pos from stored physics pos (x,y)
                    // Note: Engine history stores x,y relative to pivot
                    const screenX = centerX + point.x * scale;
                    const screenY = anchorY + point.y * scale; // positive y is down

                    if (index === 0) ctx.moveTo(screenX, screenY);
                    else ctx.lineTo(screenX, screenY);
                });
                ctx.stroke();
            }

            // Draw String
            ctx.beginPath();
            ctx.moveTo(centerX, anchorY);
            ctx.lineTo(bobX, bobY);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Draw Pivot
            ctx.beginPath();
            ctx.arc(centerX, anchorY, 4, 0, Math.PI * 2);
            ctx.fillStyle = '#94a3b8'; // Slate 400
            ctx.fill();

            // Draw Bob
            ctx.beginPath();
            ctx.arc(bobX, bobY, 15 + (params.mass || 1) * 2, 0, Math.PI * 2); // Radius based on mass

            // Gradient for Bob
            const gradient = ctx.createRadialGradient(bobX - 5, bobY - 5, 2, bobX, bobY, 20);
            gradient.addColorStop(0, '#60a5fa'); // Blue 400
            gradient.addColorStop(1, '#1d4ed8'); // Blue 700
            ctx.fillStyle = gradient;
            ctx.fill();

            // Shine
            ctx.beginPath();
            ctx.arc(bobX - 5, bobY - 5, 3, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.fill();

            // Loop
            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => cancelAnimationFrame(animationFrameId);
    }, [params, simulationStateRef]); // Re-bind if params change (scale might change)

    return (
        <div ref={containerRef} className="w-full h-full bg-slate-900 relative">
            <canvas ref={canvasRef} className="block w-full h-full" />

            {/* Overlay Info */}
            <div className="absolute top-4 left-4 text-slate-400 font-mono text-xs pointer-events-none">
                <p>Length: {params.length}m</p>
                <p>Mass: {params.mass}kg</p>
                <p>Angle: {((simulationStateRef.current?.theta || 0) * 180 / Math.PI).toFixed(1)}°</p>
                <p>Time: {(simulationStateRef.current?.t || 0).toFixed(2)}s</p>
            </div>
        </div>
    );
};

export default PendulumCanvas;
