import React from 'react';
import { Atom } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
    const navigate = useNavigate();

    return (
        <nav className="fixed top-0 left-0 right-0 z-[100] px-8 h-20 flex items-center justify-between pointer-events-none">
            {/* Branding - Clickable */}
            <div
                className="flex items-center gap-2 pointer-events-auto cursor-pointer group"
                onClick={() => navigate('/')}
            >
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/40 group-hover:scale-105 transition-transform">
                    <Atom className="text-white w-6 h-6" />
                </div>
                <span className="text-xl font-bold tracking-tight text-white font-display">
                    NewTonX<span className="text-blue-500">AI</span>
                </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4 pointer-events-auto">
                <button
                    onClick={() => navigate('/lab')}
                    className="px-5 py-2 rounded-full border border-slate-700/50 bg-slate-900/50 backdrop-blur-md text-slate-300 text-sm font-semibold hover:bg-slate-800 transition-all hover:text-white hover:border-slate-600"
                >
                    Enter Lab
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
