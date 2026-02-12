import React, { useState, useEffect } from 'react';
import { Player } from '@remotion/player';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Share2, Clapperboard } from 'lucide-react';
import { useReelExport } from './useReelExport';
import SimulationComposition from '@/features/video/SimulationComposition';

const ReelGenerator = ({ isOpen, onClose, params }) => {
    const [duration, setDuration] = useState(150);
    const { isExporting, progress, exportReel } = useReelExport();

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-100 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4"
            >
                <div className="w-full max-w-6xl h-[90vh] grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Left: Preview */}
                    <div className="lg:col-span-8 bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl flex items-center justify-center relative">
                        <div className="aspect-9/16 h-[90%] bg-black rounded-lg overflow-hidden relative shadow-lg border border-slate-700/50">
                            <Player
                                component={SimulationComposition}
                                durationInFrames={duration}
                                compositionWidth={1080}
                                compositionHeight={1920}
                                fps={30}
                                inputProps={{
                                    params: params,
                                    isReel: true // Flag to tell composition to use vertical layout
                                }}
                                style={{ width: '100%', height: '100%' }}
                                controls
                            />

                            {/* Overlay Guidelines (TikTok/Reels Safe Zones) */}
                            <div className="absolute inset-x-0 top-0 h-20 bg-linear-to-b from-black/50 to-transparent pointer-events-none" />
                            <div className="absolute inset-x-0 bottom-0 h-32 bg-linear-to-t from-black/50 to-transparent pointer-events-none" />
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-4 pointer-events-none opacity-50">
                                {[1, 2, 3, 4].map(i => <div key={i} className="w-8 h-8 rounded-full bg-slate-800" />)}
                            </div>
                        </div>
                    </div>

                    {/* Right: Controls */}
                    <div className="lg:col-span-4 flex flex-col justify-between py-4">
                        <div>
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <h2 className="text-3xl font-bold text-white font-display">Physics Reel</h2>
                                    <p className="text-slate-400">Create viral-ready clips</p>
                                </div>
                                <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
                                    <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4">Clip Settings</h3>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-xs text-slate-500 mb-1 block">Duration</label>
                                            <input
                                                type="range"
                                                min="60"
                                                max="300"
                                                value={duration}
                                                onChange={(e) => setDuration(parseInt(e.target.value))}
                                                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                            />
                                            <div className="flex justify-between mt-1">
                                                <span className="text-xs text-slate-500">2s</span>
                                                <span className="text-xs text-blue-400 font-bold">{(duration / 30).toFixed(1)}s</span>
                                                <span className="text-xs text-slate-500">10s</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
                                    <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4">Style</h3>
                                    <div className="flex gap-2">
                                        {['Neon', 'Minimal', 'Scientific'].map(style => (
                                            <button key={style} className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-sm font-medium transition-colors">
                                                {style}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <button
                                onClick={() => exportReel({ duration, params })}
                                disabled={isExporting}
                                className="w-full py-4 bg-linear-to-r from-blue-600 to-indigo-600 rounded-xl font-bold text-white shadow-lg shadow-blue-900/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isExporting ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Rendering... {Math.round(progress * 100)}%
                                    </>
                                ) : (
                                    <>
                                        <Download size={20} />
                                        Export MP4
                                    </>
                                )}
                            </button>
                            <p className="text-center text-xs text-slate-500">
                                Ready for TikTok, Instagram Reels, and YouTube Shorts (9:16)
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default ReelGenerator;
