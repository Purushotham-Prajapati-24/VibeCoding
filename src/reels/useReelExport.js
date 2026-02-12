import { useState, useCallback } from 'react';

export const useReelExport = (canvasRef) => {
    const [isExporting, setIsExporting] = useState(false);
    const [progress, setProgress] = useState(0);

    const exportReel = useCallback(async (fileName = 'physics-reel.webm') => {
        if (!canvasRef.current) {
            console.error("Canvas reference not found for export.");
            return;
        }

        setIsExporting(true);
        setProgress(0);

        try {
            const stream = canvasRef.current.captureStream(30); // 30 FPS
            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: 'video/webm;codecs=vp9'
            });

            const chunks = [];
            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunks.push(e.data);
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'video/webm' });
                const url = URL.createObjectURL(blob);

                // Trigger Download
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                a.download = fileName;
                document.body.appendChild(a);
                a.click();
                setTimeout(() => {
                    document.body.removeChild(a);
                    window.URL.revokeObjectURL(url);
                }, 100);

                setIsExporting(false);
                setProgress(100);
            };

            // Start recording
            mediaRecorder.start();

            // Simulate progress (fake calculation based on duration would be better, but this is a simple implementation)
            let currentProgress = 0;
            const interval = setInterval(() => {
                currentProgress += 10;
                if (currentProgress > 90) currentProgress = 90;
                setProgress(currentProgress);
            }, 500);

            // Record for 10 seconds (avg reel length) or until manually stopped
            // For now, we'll hardcode a 6-second clips
            setTimeout(() => {
                mediaRecorder.stop();
                clearInterval(interval);
                setProgress(100);
            }, 6000);

        } catch (err) {
            console.error("Export failed:", err);
            setIsExporting(false);
        }
    }, [canvasRef]);

    return { exportReel, isExporting, progress };
};
