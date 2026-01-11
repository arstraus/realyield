import React from 'react';
import Sidebar from './Sidebar';

const Layout = ({
    children,
    activeTab,
    setActiveTab,
    user,
    onSignOut,
    onNewAnalysis,
    onSave,
    onOpenLibrary,
    scenarioName,
    currentDbId
}) => {
    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
            <div className="flex">
                {/* Sidebar */}
                <Sidebar
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    user={user}
                    onSignOut={onSignOut}
                    onNewAnalysis={onNewAnalysis}
                    onSave={onSave}
                    onOpenLibrary={onOpenLibrary}
                    scenarioName={scenarioName}
                    currentDbId={currentDbId}
                />

                {/* Main Content */}
                <main className="flex-1 min-h-screen">
                    {/* Mobile top padding for fixed header */}
                    <div className="md:hidden h-24" />

                    {/* Content area */}
                    <div className="p-4 md:p-6 lg:p-8">
                        {children}
                    </div>

                    {/* Mobile bottom padding for fixed nav */}
                    <div className="md:hidden h-20" />
                </main>
            </div>
        </div>
    );
};

export default Layout;
