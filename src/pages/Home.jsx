import React from 'react';
import { Player } from '@remotion/player';
import { ArrowRight, Lock } from 'lucide-react';
import HeroTeaserComposition from '@/features/video/HeroTeaserComposition';
import MissionSection from '../components/MissionSection';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-500/30">
            <Navbar onDashboard={() => navigate('/lab')} onHome={() => window.scrollTo({ top: 0, behavior: 'smooth' })} />

            {/* Hero Section */}
            <main className="relative pt-32 pb-24 overflow-hidden">
                {/* Ambient Background Particles (SVG) */}
                <div className="absolute inset-0 pointer-events-none opacity-20">
                    <svg className="w-full h-full">
                        <defs>
                            <pattern id="dotPattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                                <circle cx="2" cy="2" r="1" fill="#3b82f6" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#dotPattern)" />
                    </svg>
                </div>

                <div className="container mx-auto px-6 relative z-10 flex flex-col items-center">
                    {/* Top Badge */}
                    <div className="mb-10 px-4 py-2 rounded-full border border-blue-500/30 bg-blue-500/10 backdrop-blur-sm shadow-[0_0_20px_rgba(59,130,246,0.1)] inline-flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                        <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Knowledge is Freedom</span>
                    </div>

                    {/* Main Headline */}
                    <h1 className="text-6xl md:text-8xl font-black font-display text-center leading-[0.9] tracking-tighter mb-8 max-w-5xl">
                        EDUCATION & RESEARCH <br />
                        <span className="text-slate-500">SHOULD HAVE NO</span> BARRIERS.
                    </h1>

                    <p className="text-xl md:text-2xl text-slate-400 text-center max-w-2xl mb-12 font-light leading-relaxed">
                        Knowledge must be <span className="text-white italic">free</span> for everyone.
                        Conceptual learning should be <span className="text-blue-400">visual</span>, interactive, and accessible to all.
                    </p>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row items-center gap-4 mb-20 w-full max-w-md">
                        <button className="w-full h-14 bg-white text-slate-950 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-100 transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                            <Lock size={18} />
                            Sign In
                        </button>
                        <button
                            onClick={() => navigate('/explore')}
                            className="w-full h-14 bg-slate-900 border border-slate-800 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all hover:scale-105 active:scale-95 group shadow-xl"
                        >
                            Continue Without Account
                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>

                    {/* Mini Remotion Preview */}
                    <div className="w-full max-w-4xl relative">
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-[2rem] blur opacity-25" />
                        <div className="relative bg-slate-900 rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl aspect-video group">
                            <Player
                                component={HeroTeaserComposition}
                                durationInFrames={150}
                                fps={30}
                                compositionWidth={1280}
                                compositionHeight={720}
                                loop
                                autoPlay
                                style={{ width: '100%', height: '100%' }}
                            />
                            {/* Overlay tag */}
                            <div className="absolute bottom-6 left-6 px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-lg border border-white/10 text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                                Live Physics Visualization
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Developer Motive Section */}
            <MissionSection />

            {/* Footer */}
            <footer className="py-12 border-t border-slate-900 text-center">
                <div className="container mx-auto px-6">
                    <p className="text-slate-500 text-sm max-w-xl mx-auto leading-loose italic">
                        Built with the belief that education and research should be free and barrierless.
                    </p>
                    <div className="mt-8 flex items-center justify-center gap-2 text-slate-400 font-display font-bold">
                        <div className="w-1 h-1 rounded-full bg-slate-700" />
                        <span>NewtonX AI Studio</span>
                        <div className="w-1 h-1 rounded-full bg-slate-700" />
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Home;
