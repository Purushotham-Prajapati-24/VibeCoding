import React from 'react';

const MainLayout = ({ children }) => {
    return (
        <div className="min-h-screen bg-[#0f172a] text-slate-200 p-4 font-sans overflow-hidden flex flex-col">
            <header className="mb-4 px-2">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                    AI Physics Studio
                </h1>
            </header>

            <main className="flex-1 grid grid-cols-12 gap-4 h-[calc(100vh-80px)]">
                {children}
            </main>
        </div>
    );
};

export default MainLayout;
