import React from 'react';
import { motion } from 'framer-motion';
import { useTutor } from './TutorContext';
import { Line } from 'react-chartjs-2'; // Assuming chart.js is installed, if not we'll use simple bars

const LearningDashboard = () => {
    const { mastery, history } = useTutor();

    return (
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md z-[60] flex items-center justify-center p-8">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-slate-900 border border-slate-800 w-full max-w-4xl h-[80vh] rounded-3xl overflow-hidden flex flex-col shadow-2xl"
            >
                {/* Header */}
                <header className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                    <div>
                        <h2 className="text-3xl font-bold text-white font-display">Tutor AI Analytics</h2>
                        <p className="text-slate-400">Your Physics Mastery Journey</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="text-right">
                            <div className="text-xs text-slate-500 uppercase tracking-wider font-bold">Current Level</div>
                            <div className={`text-2xl font-bold ${mastery.level === 'advanced' ? 'text-purple-400' : mastery.level === 'intermediate' ? 'text-blue-400' : 'text-green-400'}`}>
                                {mastery.level.toUpperCase()}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <div className="flex-1 p-8 grid grid-cols-1 md:grid-cols-3 gap-8 overflow-y-auto">

                    {/* Mastery Card */}
                    <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700 col-span-1">
                        <h3 className="text-lg font-bold text-white mb-4">Focus Areas</h3>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-slate-300">Projectile Motion</span>
                                    <span className="text-blue-400">85%</span>
                                </div>
                                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500 w-[85%] rounded-full" />
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-slate-300">Energy Conservation</span>
                                    <span className="text-purple-400">42%</span>
                                </div>
                                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                                    <div className="h-full bg-purple-500 w-[42%] rounded-full" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700 col-span-1 md:col-span-2">
                        <h3 className="text-lg font-bold text-white mb-4">Recent Sessions</h3>
                        {history.length === 0 ? (
                            <p className="text-slate-500 italic">No sessions recorded yet. Start simulating!</p>
                        ) : (
                            <div className="space-y-3">
                                {history.map((h, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-slate-800">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-2 h-2 rounded-full ${h.correct ? 'bg-green-500' : 'bg-red-500'}`} />
                                            <span className="text-slate-300 font-medium">Simulation #{i + 1}</span>
                                        </div>
                                        <span className="text-slate-500 text-sm">{h.timestamp || 'Just now'}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Concept Graph Placeholder */}
                    <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700 col-span-1 md:col-span-3 h-64 flex items-center justify-center relative overflow-hidden group">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-900/0 to-slate-900/0 opacity-50" />
                        <div className="z-10 text-center">
                            <h3 className="text-xl font-bold text-white mb-2">Knowledge Graph</h3>
                            <p className="text-slate-400 max-w-md mx-auto">
                                Visualizing your connection between concepts.
                                <br />
                                <span className="text-xs text-slate-500">(Coming soon: Interactive Node View)</span>
                            </p>
                        </div>
                    </div>

                </div>
            </motion.div>
        </div>
    );
};

export default LearningDashboard;
