import React, { useState, useRef } from 'react';
import { Player } from '@remotion/player';
import { ArrowLeft, Play, Layout, Activity, FlaskConical, ChevronDown } from 'lucide-react';
import ShowcaseComposition from '../remotion/ShowcaseComposition';
import Navbar from '../components/Navbar';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const Explore = ({ onBack, onEnterLab }) => {
    const containerRef = useRef(null);
    const playerContainerRef = useRef(null);
    const [frame, setFrame] = useState(0);
    const MAX_FRAMES = 300;

    // Parallax & Scroll Logic
    useGSAP(() => {
        // 1. Pin the Player Container
        ScrollTrigger.create({
            trigger: containerRef.current,
            start: "top top",
            end: "bottom bottom",
            pin: playerContainerRef.current,
            scrub: 1, // Smooth scrubbing
            onUpdate: (self) => {
                // Sync Remotion frame with total scroll progress
                // self.progress is 0 to 1
                setFrame(Math.floor(self.progress * (MAX_FRAMES - 1)));
            }
        });

        // 2. Text Animations (Fade In/Out on scroll)
        const sections = gsap.utils.toArray('.content-section');
        sections.forEach((section) => {
            gsap.fromTo(section,
                { opacity: 0, y: 50 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 1,
                    scrollTrigger: {
                        trigger: section,
                        start: "top 80%",
                        end: "top 40%",
                        scrub: 0.5,
                        toggleActions: "play reverse play reverse"
                    }
                }
            );
        });

    }, { scope: containerRef });

    return (
        <div ref={containerRef} className="relative bg-black text-white selection:bg-blue-600/40">
            <Navbar onDashboard={onEnterLab} onHome={onBack} />

            {/* Sticky Remotion Container (Pinned) */}
            <div ref={playerContainerRef} className="absolute inset-0 z-0 h-screen w-full overflow-hidden">
                <div className="relative w-full h-full">
                    {/* Dynamic Starfield Background */}
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-[#020617] to-black z-[-1]" />
                    <div className="absolute inset-0 opacity-30 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"></div>

                    <Player
                        component={ShowcaseComposition}
                        durationInFrames={MAX_FRAMES}
                        fps={30}
                        compositionWidth={1280}
                        compositionHeight={720}
                        frame={frame}
                        controls={false}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />

                    {/* Vignette Shadow for text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/80 pointer-events-none" />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-black/80 pointer-events-none" />
                </div>
            </div>

            {/* Scrollable Content Buffer - Determines total scroll length */}
            <div className="relative z-10">
                {/* Spacer to allow pinning to work for correct duration */}
                {/* 4 Sections * 100vh = 400vh scroll distance */}

                {/* Section 1: Intro */}
                <section className="h-screen flex items-center justify-center content-section px-6">
                    <div className="max-w-4xl text-center space-y-6 transform translate-y-[-10vh]">
                        <div className="inline-block px-3 py-1 rounded-md bg-white text-black text-[10px] font-black uppercase tracking-tighter mb-4">
                            Module 01: Kinematics
                        </div>
                        <h2 className="text-7xl md:text-9xl font-bold font-display leading-[0.85] tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-500">
                            GRAVITY<br />UNLEASHED
                        </h2>
                        <p className="text-xl md:text-2xl text-slate-400 max-w-2xl mx-auto font-light leading-relaxed">
                            Watch how initial velocity fights against the constant pull of the earth.
                            Every curve tells a story of energy conversion.
                        </p>
                        <div className="pt-12 animate-bounce">
                            <ChevronDown className="w-8 h-8 text-white/50 mx-auto" />
                        </div>
                    </div>
                </section>

                {/* Section 2: Launch Equations */}
                <section className="h-screen flex items-center justify-end px-12 lg:px-24 content-section">
                    <div className="max-w-md p-8 rounded-3xl bg-slate-900/40 backdrop-blur-3xl border border-white/10 space-y-6 text-right shadow-2xl">
                        <Activity className="w-10 h-10 text-blue-400 ml-auto" />
                        <h3 className="text-4xl font-bold font-display text-white">THE MOMENTUM</h3>
                        <div className="h-0.5 w-24 bg-blue-500 ml-auto"></div>
                        <p className="text-slate-300 text-lg leading-relaxed font-light">
                            Every forward motion begins with internal energy.
                            We calculate the vertical vectors to understand how air resistance
                            competes with initial velocity.
                        </p>
                        <div className="text-4xl font-mono font-bold text-blue-200 opacity-80 pt-4">
                            v = u + at
                        </div>
                    </div>
                </section>

                {/* Section 3: The Peak */}
                <section className="h-screen flex items-end justify-center pb-32 px-12 text-center content-section">
                    <div className="max-w-2xl space-y-6">
                        <h3 className="text-6xl font-bold font-display italic text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                            ZERO VELOCITY
                        </h3>
                        <p className="text-slate-300 text-xl font-light">
                            At the exact apex, vertical velocity vanishes.
                            Kinetic energy trades completely for Potential energy.
                        </p>
                    </div>
                </section>

                {/* Section 4: Call to action */}
                <section className="h-screen flex flex-col items-center justify-center px-12 text-center content-section bg-gradient-to-t from-black to-transparent">
                    <div className="max-w-3xl space-y-12">
                        <h3 className="text-6xl md:text-8xl font-bold font-display leading-none tracking-tight">
                            READY TO <br /> EXPERIMENT?
                        </h3>

                        <p className="text-slate-400 text-xl">
                            You've seen the theory. Now control the variables yourself.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-6 justify-center">
                            <button
                                onClick={onEnterLab}
                                className="h-16 px-10 bg-white text-black rounded-full font-black text-lg flex items-center gap-3 hover:scale-110 transition-transform shadow-[0_0_50px_rgba(255,255,255,0.4)]"
                            >
                                <FlaskConical size={24} />
                                Enter Lab Studio
                            </button>
                            <button
                                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                                className="h-16 px-10 rounded-full border border-white/20 text-white font-bold hover:bg-white/10 transition-all flex items-center gap-2"
                            >
                                <Play size={20} className="fill-current" />
                                Replay Cinematic
                            </button>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Explore;
