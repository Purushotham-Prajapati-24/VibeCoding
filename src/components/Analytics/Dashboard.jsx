import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTutor } from '../../tutor/TutorContext';
import { getTopicStats, getMisconceptionFrequency } from '../../analytics/learningTracker';
import {
    Users,
    Target,
    Zap,
    TrendingUp,
    AlertTriangle,
    BookOpen,
    Award
} from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, subtext, color = "blue" }) => (
    <div className={`bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-4 rounded-xl flex items-start gap-4 hover:border-${color}-500/50 transition-colors`}>
        <div className={`p-3 rounded-lg bg-${color}-500/10 text-${color}-400`}>
            <Icon size={24} />
        </div>
        <div>
            <h4 className="text-slate-400 text-sm font-medium">{label}</h4>
            <div className="text-2xl font-bold text-white mt-1">{value}</div>
            {subtext && <div className="text-xs text-slate-500 mt-1">{subtext}</div>}
        </div>
    </div>
);

const Dashboard = ({ onClose }) => {
    const { history, mastery } = useTutor();

    const stats = useMemo(() => getTopicStats(history), [history]);
    const misconceptions = useMemo(() => getMisconceptionFrequency(history), [history]);

    // Sort misconceptions by frequency
    const topMisconceptions = Object.entries(misconceptions)
        .sort(([, a], [, b]) => b.count - a.count)
        .slice(0, 3);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
        >
            <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl h-[85vh] rounded-3xl overflow-hidden flex flex-col shadow-2xl">
                {/* Header */}
                <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                    <div>
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                            <TrendingUp className="text-indigo-400" />
                            Learning Analytics
                        </h2>
                        <p className="text-slate-400 text-sm">Track your physics mastery and catch misconceptions.</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors"
                    >
                        ✕
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                    {/* Top Stats Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatCard
                            icon={Award}
                            label="Current Mastery"
                            value={mastery.level.charAt(0).toUpperCase() + mastery.level.slice(1)}
                            subtext={`Score: ${mastery.score}/100`}
                            color="indigo"
                        />
                        <StatCard
                            icon={Target}
                            label="Total Attempts"
                            value={history.length}
                            subtext="Across all topics"
                            color="blue"
                        />
                        <StatCard
                            icon={Zap}
                            label="Accuracy Rate"
                            value={`${mastery.score}%`}
                            subtext="Last 5 attempts weighted"
                            color="emerald"
                        />
                        <StatCard
                            icon={BookOpen}
                            label="Topics Explored"
                            value={Object.keys(stats).length}
                            subtext="Active learning paths"
                            color="violet"
                        />
                    </div>

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* Topic Breakdown */}
                        <div className="lg:col-span-2 bg-slate-800/30 rounded-2xl p-6 border border-slate-700/50">
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <Target size={18} className="text-blue-400" /> Topic Performance
                            </h3>
                            <div className="space-y-4">
                                {Object.entries(stats).length === 0 ? (
                                    <p className="text-slate-500 text-sm italic">No data yet. Make some predictions!</p>
                                ) : (
                                    Object.entries(stats).map(([topic, data]) => (
                                        <div key={topic} className="group">
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="text-slate-300 capitalize">{topic.replace(/_/g, ' ')}</span>
                                                <span className={`font-mono ${data.accuracy >= 70 ? 'text-green-400' : 'text-amber-400'}`}>
                                                    {data.accuracy}%
                                                </span>
                                            </div>
                                            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${data.accuracy}%` }}
                                                    className={`h-full rounded-full ${data.accuracy >= 80 ? 'bg-green-500' :
                                                            data.accuracy >= 50 ? 'bg-amber-500' : 'bg-red-500'
                                                        }`}
                                                />
                                            </div>
                                            <div className="text-xs text-slate-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {data.correct}/{data.total} correct
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Recent Misconceptions */}
                        <div className="bg-slate-800/30 rounded-2xl p-6 border border-slate-700/50">
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <AlertTriangle size={18} className="text-amber-400" /> Needs Attention
                            </h3>
                            <div className="space-y-4">
                                {topMisconceptions.length === 0 ? (
                                    <div className="text-center py-8">
                                        <div className="text-4xl mb-2">🎉</div>
                                        <p className="text-slate-400 text-sm">No misconceptions detected yet!</p>
                                    </div>
                                ) : (
                                    topMisconceptions.map(([id, data]) => (
                                        <div key={id} className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-lg">
                                            <div className="text-amber-200 text-sm font-medium mb-1">
                                                {data.name || id}
                                            </div>
                                            <div className="text-amber-500/60 text-xs">
                                                Encountered {data.count} times
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Recent History Log */}
                    <div className="bg-slate-800/30 rounded-2xl p-6 border border-slate-700/50">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Users size={18} className="text-slate-400" /> Recent Activity
                        </h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-slate-400">
                                <thead className="text-xs uppercase bg-slate-800/50 text-slate-500">
                                    <tr>
                                        <th className="p-3 rounded-l-lg">Time</th>
                                        <th className="p-3">Type</th>
                                        <th className="p-3">Prediction</th>
                                        <th className="p-3">Result</th>
                                        <th className="p-3 rounded-r-lg">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800">
                                    {history.slice(-5).reverse().map((entry, idx) => (
                                        <tr key={idx} className="hover:bg-slate-700/30 transition-colors">
                                            <td className="p-3 font-mono text-xs">
                                                {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </td>
                                            <td className="p-3 capitalize text-white">{entry.variable}</td>
                                            <td className="p-3 font-mono">{entry.prediction}</td>
                                            <td className="p-3 font-mono">{entry.actual}</td>
                                            <td className="p-3">
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${entry.correct ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                                                    {entry.correct ? 'CORRECT' : 'WRONG'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {history.length === 0 && (
                                <div className="text-center py-4 text-slate-500 italic">No activity recorded.</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default Dashboard;
