import React from 'react';
import { Plus } from 'lucide-react';

const Layout = ({ children, onNewAnalysis, actions }) => {
    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
            <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
                    <div className="flex justify-between h-14 sm:h-16">
                        <div className="flex items-center flex-shrink-0">
                            <img src="./favicon.png" alt="RealYield" className="h-7 w-7 sm:h-8 sm:w-8" />
                            <span className="ml-2 text-lg sm:text-xl font-bold text-slate-900 tracking-tight hidden xs:inline">RealYield</span>
                        </div>
                        <div className="flex items-center space-x-1 sm:space-x-4 overflow-x-auto">
                            <div className="hidden md:flex items-center">
                                {actions}
                            </div>
                            <button
                                onClick={onNewAnalysis}
                                className="flex items-center bg-emerald-600 hover:bg-emerald-700 text-white px-2 sm:px-4 py-1.5 sm:py-2 rounded-md text-sm font-medium transition-colors shadow-sm flex-shrink-0"
                                title="Start a New Analysis"
                            >
                                <Plus size={18} className="sm:mr-1" />
                                <span className="hidden sm:inline">New</span>
                            </button>
                        </div>
                    </div>
                    {/* Mobile actions bar */}
                    <div className="md:hidden flex items-center justify-end space-x-2 pb-2 overflow-x-auto">
                        {actions}
                    </div>
                </div>
            </nav>
            <main className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8">
                {children}
            </main>
        </div>
    );
};

export default Layout;
