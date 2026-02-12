import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Player } from '@remotion/player';
import ConceptExplainerComposition from '@/remotion/ConceptExplainerComposition';
import { useReelExport } from './useReelExport';
import { Share2, Download, X, Film, Loader2 } from 'lucide-react';

const ReelGenerator = ({ isOpen, onClose, params }) => {
    const playerRef = useRef(null);
    // We need a ref to the actual canvas element inside the player. 
    // Remotion Player doesn't expose the canvas directly via ref easily, 
    // but we can try to find it or query it. 
    // For this prototype, we'll assume we can pass a ref down or find the canvas.
    // *Hack for Hackathon*: Query selector targeting the player ID 

    const [canvasRef, setCanvasRef] = useState({ current: null });
    const { exportReel, isExporting, progress } = useReelExport(canvasRef);

    // Effect to find canvas after mount
    React.useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => {
                const canvas = document.querySelector('#reel-player canvas');
                if (canvas) setCanvasRef({ current: canvas });
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden max-w-lg w-full shadow-2xl flex flex-col max-h-[90vh]"
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                            <h2 className="text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent flex items-center gap-2">
                                <Film size={20} className="text-pink-500" />
                                Physics Reel Studio
                            </h2>
                            <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Player Preview */}
                        <div className="flex-1 bg-black relative flex items-center justify-center p-4" id="reel-player-container">
                            {/* 9:16 Aspect Ratio Container for Reel */}
                            <div className="relative aspect-[9/16] h-[60vh] rounded-xl overflow-hidden shadow-2xl border border-slate-700">
                                <Player
                                    id="reel-player"
                                    component={ConceptExplainerComposition}
                                    durationInFrames={300}
                                    fps={30}
                                    compositionWidth={720}  // 9:16ish vertical
                                    compositionHeight={1280}
                                    style={{ width: '100%', height: '100%' }}
                                    controls={true}
                                    inputProps={{
                                        params,
                                        variable: 'Range' // or dynamic
                                    }}
                                />
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="p-6 bg-slate-900/80 border-t border-slate-800 space-y-4">
                            <div className="flex justify-between items-center">
                                <div className="text-sm text-slate-400">
                                    <span className="text-white font-bold block mb-1">Viral Ready</span>
                                    9:16 Vertical Format • 60 FPS
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => exportReel(`physics_reel_${Date.now()}.webm`)}
                                        disabled={isExporting}
                                        className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-all disabled:opacity-50 border border-slate-700"
                                    >
                                        {isExporting ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
                                        {isExporting ? `${progress}%` : 'Save'}
                                    </button>
                                    <button className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all">
                                        <Share2 size={18} />
                                        Share
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ReelGenerator;
