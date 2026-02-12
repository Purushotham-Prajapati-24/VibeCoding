import React from 'react';

const MissionSection = () => {
    return (
        <section className="py-24 px-6 relative overflow-hidden">
            <div className="max-w-4xl mx-auto">
                <div className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-12 relative group">
                    {/* Background Glow */}
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-600/10 blur-[100px] rounded-full pointer-events-none group-hover:bg-blue-600/20 transition-all duration-1000" />

                    <div className="relative z-10 space-y-8 text-center md:text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest">
                            Developer Motive
                        </div>

                        <h2 className="text-4xl md:text-5xl font-bold font-display leading-tight text-white">
                            Removing the <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Paywalls</span> to Physics.
                        </h2>

                        <div className="space-y-6 text-xl text-slate-400 leading-relaxed font-light">
                            <p>
                                Traditional education often hides behind paywalls and static textbooks.
                                Knowledge should not be a luxury—it should be a human right.
                            </p>
                            <p>
                                This platform exists to remove those barriers and make conceptual learning
                                <span className="text-white font-semibold"> free</span>,
                                <span className="text-white font-semibold"> interactive</span>, and
                                <span className="text-white font-semibold"> research-driven</span>.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default MissionSection;
