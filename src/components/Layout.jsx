import React from 'react';

const Layout = ({ children, onNewAnalysis, actions }) => {
    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
            <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            <div className="flex-shrink-0 flex items-center">
                                <img src="./favicon.png" alt="RealYield" className="h-8 w-8" />
                                <span className="ml-2 text-xl font-bold text-slate-900 tracking-tight">RealYield</span>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            {actions}
                            <button
                                onClick={onNewAnalysis}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors shadow-sm"
                                title="Start a New Analysis"
                            >
                                New Analysis
                            </button>
                        </div>
                    </div>
                </div>
            </nav>
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>
        </div>
    );
};

export default Layout;
