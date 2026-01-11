import React, { useState, useRef, useEffect } from 'react';
import {
    FolderOpen, LayoutDashboard, BarChart2, Table, TrendingUp,
    DollarSign, FileText, Menu, X, ChevronDown, LogOut, User,
    Settings, HelpCircle, Plus, Save, Database
} from 'lucide-react';

const navItems = [
    { id: 'inputs', label: 'Inputs', icon: FolderOpen },
    { id: 'analysis', label: 'Analysis', icon: LayoutDashboard },
    { id: 'compare', label: 'Compare', icon: BarChart2 },
    { id: 'proforma', label: 'Pro Forma', icon: Table },
    { id: 'sensitivity', label: 'Sensitivity', icon: TrendingUp },
    { id: 'loans', label: 'Loans', icon: DollarSign },
    { id: 'memo', label: 'Memo', icon: FileText },
];

// User Menu Dropdown Component
const UserMenu = ({ user, onSignOut }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!user) return null;

    const initials = user.email ? user.email.substring(0, 2).toUpperCase() : 'U';

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center space-x-2 w-full px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-sm font-medium">
                    {initials}
                </div>
                <div className="flex-1 text-left hidden lg:block">
                    <p className="text-sm font-medium text-slate-700 truncate max-w-[140px]">
                        {user.email}
                    </p>
                </div>
                <ChevronDown size={16} className={`text-slate-400 transition-transform hidden lg:block ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50">
                    <div className="px-3 py-2 border-b border-slate-100">
                        <p className="text-xs text-slate-500">Signed in as</p>
                        <p className="text-sm font-medium text-slate-700 truncate">{user.email}</p>
                    </div>
                    <button
                        onClick={() => {
                            setIsOpen(false);
                            onSignOut();
                        }}
                        className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                        <LogOut size={16} className="mr-2" />
                        Sign out
                    </button>
                </div>
            )}
        </div>
    );
};

// Desktop Sidebar
const DesktopSidebar = ({
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
        <aside className="hidden md:flex md:flex-col md:w-64 lg:w-72 bg-white border-r border-slate-200 h-screen sticky top-0">
            {/* Logo */}
            <div className="flex items-center px-4 py-4 border-b border-slate-100">
                <img src="./favicon.png" alt="RealYield" className="h-8 w-8" />
                <span className="ml-2 text-xl font-bold text-slate-900 tracking-tight">RealYield</span>
            </div>

            {/* Scenario Info & Actions */}
            <div className="px-3 py-4 border-b border-slate-100">
                <div className="mb-3">
                    <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Current Scenario</p>
                    <p className="text-sm font-medium text-slate-800 truncate" title={scenarioName}>
                        {scenarioName}
                    </p>
                </div>
                <div className="flex space-x-2">
                    <button
                        onClick={onNewAnalysis}
                        className="flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                        title="New Analysis"
                    >
                        <Plus size={16} className="mr-1" />
                        New
                    </button>
                    <button
                        onClick={onSave}
                        className="flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
                        title={currentDbId ? "Save to database" : "Save to library"}
                    >
                        <Save size={16} className="mr-1" />
                        Save
                    </button>
                </div>
                <button
                    onClick={onOpenLibrary}
                    className="w-full mt-2 flex items-center justify-center px-3 py-2 text-sm font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                    title="Browse saved scenarios"
                >
                    <Database size={16} className="mr-2" />
                    Open Library
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 overflow-y-auto">
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-2 px-2">Navigation</p>
                <ul className="space-y-1">
                    {navItems.map(({ id, label, icon: Icon }) => (
                        <li key={id}>
                            <button
                                onClick={() => setActiveTab(id)}
                                className={`
                                    flex items-center w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                                    ${activeTab === id
                                        ? 'bg-emerald-50 text-emerald-700 border-l-4 border-emerald-500 -ml-0.5 pl-2.5'
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
                                `}
                            >
                                <Icon size={18} className={`mr-3 ${activeTab === id ? 'text-emerald-600' : 'text-slate-400'}`} />
                                {label}
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>

            {/* User Menu */}
            <div className="px-3 py-3 border-t border-slate-100">
                <UserMenu user={user} onSignOut={onSignOut} />
            </div>
        </aside>
    );
};

// Mobile Header & Bottom Nav
const MobileNav = ({
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
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <>
            {/* Mobile Header */}
            <header className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-slate-200 z-50">
                <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center">
                        <img src="./favicon.png" alt="RealYield" className="h-7 w-7" />
                        <span className="ml-2 text-lg font-bold text-slate-900">RealYield</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={onSave}
                            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Save"
                        >
                            <Save size={20} />
                        </button>
                        <button
                            onClick={() => setMenuOpen(true)}
                            className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            <Menu size={20} />
                        </button>
                    </div>
                </div>
                {/* Scenario name bar */}
                <div className="px-4 pb-2 flex items-center justify-between">
                    <p className="text-sm text-slate-600 truncate flex-1">{scenarioName}</p>
                </div>
            </header>

            {/* Mobile Bottom Navigation */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 safe-area-inset-bottom">
                <div className="flex justify-around py-1">
                    {navItems.slice(0, 5).map(({ id, label, icon: Icon }) => (
                        <button
                            key={id}
                            onClick={() => setActiveTab(id)}
                            className={`flex flex-col items-center py-2 px-3 min-w-[60px] ${
                                activeTab === id ? 'text-emerald-600' : 'text-slate-400'
                            }`}
                        >
                            <Icon size={20} />
                            <span className="text-[10px] mt-1 font-medium">{label}</span>
                        </button>
                    ))}
                    <button
                        onClick={() => setMenuOpen(true)}
                        className="flex flex-col items-center py-2 px-3 min-w-[60px] text-slate-400"
                    >
                        <Menu size={20} />
                        <span className="text-[10px] mt-1 font-medium">More</span>
                    </button>
                </div>
            </nav>

            {/* Mobile Slide-out Menu */}
            {menuOpen && (
                <div className="md:hidden fixed inset-0 z-[100]">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/50"
                        onClick={() => setMenuOpen(false)}
                    />

                    {/* Menu Panel */}
                    <div className="absolute right-0 top-0 bottom-0 w-72 bg-white shadow-xl animate-slide-in">
                        <div className="flex items-center justify-between px-4 py-4 border-b border-slate-100">
                            <span className="text-lg font-semibold text-slate-900">Menu</span>
                            <button
                                onClick={() => setMenuOpen(false)}
                                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Actions */}
                        <div className="px-4 py-4 border-b border-slate-100 space-y-2">
                            <button
                                onClick={() => {
                                    setMenuOpen(false);
                                    onNewAnalysis();
                                }}
                                className="w-full flex items-center px-3 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                            >
                                <Plus size={18} className="mr-2" />
                                New Analysis
                            </button>
                            <button
                                onClick={() => {
                                    setMenuOpen(false);
                                    onOpenLibrary();
                                }}
                                className="w-full flex items-center px-3 py-2.5 text-sm font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                            >
                                <Database size={18} className="mr-2" />
                                Open Library
                            </button>
                        </div>

                        {/* All Navigation Items */}
                        <div className="px-4 py-4">
                            <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Navigation</p>
                            <ul className="space-y-1">
                                {navItems.map(({ id, label, icon: Icon }) => (
                                    <li key={id}>
                                        <button
                                            onClick={() => {
                                                setActiveTab(id);
                                                setMenuOpen(false);
                                            }}
                                            className={`
                                                flex items-center w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                                                ${activeTab === id
                                                    ? 'bg-emerald-50 text-emerald-700'
                                                    : 'text-slate-600 hover:bg-slate-50'}
                                            `}
                                        >
                                            <Icon size={18} className={`mr-3 ${activeTab === id ? 'text-emerald-600' : 'text-slate-400'}`} />
                                            {label}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* User Section */}
                        {user && (
                            <div className="absolute bottom-0 left-0 right-0 px-4 py-4 border-t border-slate-100 bg-slate-50">
                                <div className="flex items-center mb-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-medium">
                                        {user.email?.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div className="ml-3 flex-1 min-w-0">
                                        <p className="text-sm font-medium text-slate-700 truncate">{user.email}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        setMenuOpen(false);
                                        onSignOut();
                                    }}
                                    className="w-full flex items-center justify-center px-3 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                                >
                                    <LogOut size={16} className="mr-2" />
                                    Sign out
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

const Sidebar = (props) => {
    return (
        <>
            <DesktopSidebar {...props} />
            <MobileNav {...props} />
        </>
    );
};

export default Sidebar;
