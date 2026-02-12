import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, User, TrendingUp, Crown } from 'lucide-react';

const MOCK_LEADERBOARD = [
    { rank: 1, name: "PhysicsWizard", xp: 12500, accuracy: 94, avatar: "bg-purple-500" },
    { rank: 2, name: "Newton2.0", xp: 11200, accuracy: 91, avatar: "bg-blue-500" },
    { rank: 3, name: "EinsteinFan", xp: 10800, accuracy: 89, avatar: "bg-green-500" },
    { rank: 4, name: "Curieous", xp: 9500, accuracy: 85, avatar: "bg-amber-500" },
    { rank: 5, name: "QuantumLeap", xp: 8900, accuracy: 82, avatar: "bg-red-500" },
];

const Leaderboard = ({ isOpen, onClose }) => {
    const [filter, setFilter] = useState('global');

    if (!isOpen) return null;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
        >
            <div className="bg-slate-900 border border-slate-700/50 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden">
                {/* Header */}
                <div className="bg-linear-to-r from-amber-600/20 to-purple-600/20 p-6 border-b border-white/10 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-amber-500/20 rounded-xl border border-amber-500/30">
                            <Trophy size={28} className="text-amber-400" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white font-display">Global Rankings</h2>
                            <p className="text-amber-200/60 text-sm">Top Physics Minds</p>
                        </div>
                    </div>
                    <div className="flex bg-slate-800 rounded-lg p-1">
                        {['global', 'friends', 'class'].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${filter === f
                                    ? 'bg-slate-700 text-white shadow-sm'
                                    : 'text-slate-400 hover:text-white'
                                    }`}
                            >
                                {f.charAt(0).toUpperCase() + f.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* List */}
                <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
                    {/* User Rank Card */}
                    <div className="bg-linear-to-r from-blue-900/40 to-slate-800 p-4 rounded-2xl border border-blue-500/30 flex items-center gap-4 mb-6 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-blue-500/5 group-hover:bg-blue-500/10 transition-colors" />
                        <div className="text-2xl font-bold text-slate-500 w-8 text-center">#42</div>
                        <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center border-2 border-slate-600">
                            <User size={24} className="text-slate-400" />
                        </div>
                        <div className="flex-1">
                            <div className="font-bold text-white">You</div>
                            <div className="text-xs text-slate-400 flex items-center gap-2">
                                <TrendingUp size={12} className="text-green-400" /> Top 15% this week
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="font-mono font-bold text-blue-400 text-lg">2,450 XP</div>
                            <div className="text-xs text-slate-500">Avg. Accuracy: 78%</div>
                        </div>
                    </div>

                    {/* Top 5 */}
                    {MOCK_LEADERBOARD.map((user, idx) => (
                        <motion.div
                            key={user.rank}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-slate-800/30 hover:bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 flex items-center gap-4 transition-colors"
                        >
                            <div className="w-8 flex justify-center">
                                {user.rank === 1 ? <Crown size={24} className="text-amber-400 fill-amber-400/20" /> :
                                    user.rank === 2 ? <Medal size={24} className="text-slate-300" /> :
                                        user.rank === 3 ? <Medal size={24} className="text-amber-700" /> :
                                            <span className="font-bold text-slate-500">{user.rank}</span>}
                            </div>

                            <div className={`w-10 h-10 rounded-full ${user.avatar} flex items-center justify-center text-white font-bold shadow-lg`}>
                                {user.name[0]}
                            </div>

                            <div className="flex-1">
                                <div className="font-bold text-slate-200">{user.name}</div>
                            </div>

                            <div className="text-right flex items-center gap-6">
                                <div>
                                    <div className="font-mono font-bold text-white">{user.xp.toLocaleString()} XP</div>
                                </div>
                                <div className="w-16 text-right">
                                    <div className={`text-xs font-bold ${user.accuracy > 90 ? 'text-green-400' : 'text-blue-400'}`}>
                                        {user.accuracy}% Acc
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Footer */}
                <div className="p-4 bg-slate-900 border-t border-slate-800 text-center">
                    <button
                        onClick={onClose}
                        className="text-slate-500 hover:text-white text-sm transition-colors"
                    >
                        Close Leaderboard
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default Leaderboard;
