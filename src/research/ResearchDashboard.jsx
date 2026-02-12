import React from 'react';
import { motion } from 'framer-motion';
import { Pie, Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement
} from 'chart.js';
import { Brain, Users, TrendingUp, AlertTriangle } from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const MOCK_CLASS_DATA = {
    averageMastery: 78,
    activeStudents: 24,
    misconceptions: [
        { name: 'Gravity vs Mass', count: 12, color: '#ef4444' },
        { name: 'Velocity Vectors', count: 8, color: '#f59e0b' },
        { name: 'Air Resistance', count: 5, color: '#3b82f6' },
    ],
    progress: [65, 70, 75, 78, 82, 85]
};

const ResearchDashboard = () => {
    const pieData = {
        labels: MOCK_CLASS_DATA.misconceptions.map(m => m.name),
        datasets: [{
            data: MOCK_CLASS_DATA.misconceptions.map(m => m.count),
            backgroundColor: MOCK_CLASS_DATA.misconceptions.map(m => m.color),
            borderWidth: 0
        }]
    };

    const barData = {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
        datasets: [{
            label: 'Class Mastery',
            data: MOCK_CLASS_DATA.progress,
            backgroundColor: '#8b5cf6',
            borderRadius: 6
        }]
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: { position: 'bottom', labels: { color: '#94a3b8' } }
        },
        scales: {
            y: { ticks: { color: '#94a3b8' }, grid: { color: '#334155' } },
            x: { ticks: { color: '#94a3b8' }, grid: { display: false } }
        }
    };

    return (
        <div className="p-8 bg-slate-950 min-h-screen text-slate-200 font-sans">
            <header className="mb-8 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-white font-display mb-2">Research Dashboard</h1>
                    <p className="text-slate-400">Classroom Analytics & Insights</p>
                </div>
                <div className="flex gap-4">
                    <div className="bg-slate-900 px-4 py-2 rounded-xl border border-slate-800 flex items-center gap-3">
                        <Users className="text-blue-400" size={20} />
                        <div>
                            <div className="text-xs text-slate-500 uppercase font-bold">Students</div>
                            <div className="text-xl font-bold font-mono">{MOCK_CLASS_DATA.activeStudents} Active</div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    icon={Brain}
                    label="Avg. Mastery"
                    value={`${MOCK_CLASS_DATA.averageMastery}%`}
                    color="text-purple-400"
                    bg="bg-purple-500/10"
                />
                <StatCard
                    icon={AlertTriangle}
                    label="Top Issue"
                    value="Gravity"
                    color="text-red-400"
                    bg="bg-red-500/10"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Misconception Distribution */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800"
                >
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <AlertTriangle size={18} className="text-amber-400" />
                        Common Misconceptions
                    </h3>
                    <div className="h-64 flex justify-center">
                        <Pie data={pieData} options={{ maintainAspectRatio: false }} />
                    </div>
                </motion.div>

                {/* Progress Over Time */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800"
                >
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <TrendingUp size={18} className="text-green-400" />
                        Learning Trajectory
                    </h3>
                    <div className="h-64">
                        <Bar data={barData} options={chartOptions} />
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

const StatCard = ({ icon: Icon, label, value, color, bg }) => (
    <div className="bg-slate-900/50 p-5 rounded-2xl border border-slate-800 flex items-center gap-4">
        <div className={`p-3 rounded-xl ${bg} ${color}`}>
            <Icon size={24} />
        </div>
        <div>
            <div className="text-slate-500 text-xs font-bold uppercase tracking-wider">{label}</div>
            <div className={`text-2xl font-bold font-mono ${color}`}>{value}</div>
        </div>
    </div>
);

export default ResearchDashboard;
