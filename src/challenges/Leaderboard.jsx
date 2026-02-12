import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Star, Flame, Target, Zap } from 'lucide-react';

const Leaderboard = () => {
    // Mock Data
    const users = [
        { rank: 1, name: "CosmicRay", score: 9850, streak: 12, avatar: "bg-purple-500" },
        { rank: 2, name: "Newton's Ghost", score: 9420, streak: 8, avatar: "bg-blue-500" },
        { rank: 3, name: "QuantumLeap", score: 8900, streak: 5, avatar: "bg-emerald-500" },
        { rank: 4, name: "GravityGur", score: 7600, streak: 2, avatar: "bg-amber-500" },
        { rank: 5, name: "DarkMatter", score: 7200, streak: 4, avatar: "bg-slate-500" },
    ];

    return (
        <div className="h-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm">
                <h3 className="font-bold text-white flex items-center gap-2">
                    <Trophy className="text-yellow-500" size={18} />
                    Global Rankings
                </h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {users.map((user, index) => (
                    <motion.div
                        key={user.rank}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`group flex items-center gap-4 p-3 rounded-xl border transition-all hover:scale-[1.02] ${user.rank === 1 ? 'bg-yellow-500/10 border-yellow-500/30' :
                                user.rank === 2 ? 'bg-slate-400/10 border-slate-400/30' :
                                    user.rank === 3 ? 'bg-amber-700/10 border-amber-700/30' :
                                        'bg-slate-800/50 border-slate-700'
                            }`}
                    >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${user.rank === 1 ? 'bg-yellow-500 text-black' :
                                user.rank === 2 ? 'bg-slate-400 text-black' :
                                    user.rank === 3 ? 'bg-amber-700 text-white' :
                                        'bg-slate-700 text-slate-400'
                            }`}>
                            {user.rank}
                        </div>

                        <div className="flex-1">
                            <div className="font-bold text-slate-200">{user.name}</div>
                            <div className="text-xs text-slate-500 flex items-center gap-2">
                                <span className="flex items-center gap-1"><Flame size={10} className="text-orange-500" /> {user.streak} Streak</span>
                                <span className="flex items-center gap-1"><Zap size={10} className="text-blue-500" /> {Math.floor(user.score / 100)} Wins</span>
                            </div>
                        </div>

                        <div className="font-mono font-bold text-slate-300">
                            {user.score.toLocaleString()}
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="p-3 border-t border-slate-800 bg-slate-900/50 text-center">
                <button className="text-xs text-blue-400 hover:text-blue-300 font-medium">
                    View Full Leaderboard
                </button>
            </div>
        </div>
    );
};

export default Leaderboard;
