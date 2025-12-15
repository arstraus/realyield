import React, { useState, useEffect } from 'react';
import { 
    Database, Search, Star, StarOff, Trash2, Copy, Download, 
    Clock, FolderOpen, Plus, X, ChevronRight, Building2
} from 'lucide-react';
import { generateForecast } from '../utils/financials';
import { DEFAULT_PROPERTY, DEFAULT_FINANCING, DEFAULT_OPERATIONS, DEFAULT_TAX_MARKET, DEFAULT_CLOSING_COSTS } from '../utils/constants';
import ConfirmModal from './ConfirmModal';
import * as dataService from '../services/dataService';

const ScenarioManager = ({ 
    isOpen, 
    onClose, 
    currentScenario, 
    scenarioName,
    onLoadScenario,
    onSaveScenario 
}) => {
    const [scenarios, setScenarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState('all'); // 'all', 'favorites', 'recent'
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [saveMode, setSaveMode] = useState(false);
    const [newScenarioName, setNewScenarioName] = useState('');
    const [newScenarioDesc, setNewScenarioDesc] = useState('');

    // Load scenarios on mount and when filter changes
    useEffect(() => {
        if (isOpen) {
            loadScenarios();
        }
    }, [isOpen, filter]);

    const loadScenarios = async () => {
        setLoading(true);
        try {
            let result;
            if (searchQuery) {
                result = await dataService.searchScenarios(searchQuery);
            } else if (filter === 'favorites') {
                result = await dataService.getFavoriteScenarios();
            } else if (filter === 'recent') {
                result = await dataService.getRecentScenarios(10);
            } else {
                result = await dataService.getAllScenarios();
            }
            setScenarios(result || []);
        } catch (error) {
            console.error('Error loading scenarios:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        loadScenarios();
    };

    const handleSaveNew = async () => {
        if (!newScenarioName.trim()) return;
        
        try {
            const scenario = {
                name: newScenarioName.trim(),
                description: newScenarioDesc.trim() || null,
                property: {
                    address: currentScenario.property?.address || null,
                    city: currentScenario.property?.city || null,
                    state: currentScenario.property?.state || null,
                },
                data: currentScenario
            };
            
            const saved = await dataService.createScenario(scenario);
            setSaveMode(false);
            setNewScenarioName('');
            setNewScenarioDesc('');
            loadScenarios();
            
            if (onSaveScenario) {
                onSaveScenario(saved);
            }
        } catch (error) {
            console.error('Error saving scenario:', error);
            alert('Failed to save scenario');
        }
    };

    const handleLoad = (scenario) => {
        if (onLoadScenario) {
            onLoadScenario(scenario);
        }
        onClose();
    };

    const handleDelete = async (id) => {
        try {
            await dataService.deleteScenario(id);
            setDeleteConfirm(null);
            loadScenarios();
        } catch (error) {
            console.error('Error deleting scenario:', error);
        }
    };

    const handleToggleFavorite = async (id, e) => {
        e.stopPropagation();
        
        try {
            await dataService.toggleFavorite(id);
            loadScenarios();
        } catch (error) {
            console.error('Error toggling favorite:', error);
        }
    };

    const handleDuplicate = async (id, e) => {
        e.stopPropagation();
        
        try {
            await dataService.duplicateScenario(id);
            loadScenarios();
        } catch (error) {
            console.error('Error duplicating scenario:', error);
        }
    };

    const handleExport = async (scenario, e) => {
        e.stopPropagation();
        
        try {
            await dataService.exportToFile(scenario.data, scenario.name);
        } catch (error) {
            console.error('Error exporting scenario:', error);
        }
    };

    const calculateMetrics = (data) => {
        try {
            const merged = {
                property: { ...DEFAULT_PROPERTY, ...data.property },
                financing: { ...DEFAULT_FINANCING, ...data.financing },
                operations: { 
                    ...DEFAULT_OPERATIONS, 
                    ...data.operations,
                    commercialExpenses: {
                        ...DEFAULT_OPERATIONS.commercialExpenses,
                        ...(data.operations?.commercialExpenses || {})
                    }
                },
                taxMarket: { ...DEFAULT_TAX_MARKET, ...data.taxMarket },
                closingCosts: { ...DEFAULT_CLOSING_COSTS, ...data.closingCosts }
            };
            
            const result = generateForecast(
                merged.property,
                merged.financing,
                merged.operations,
                merged.taxMarket,
                merged.closingCosts
            );
            return result.metrics;
        } catch (e) {
            return null;
        }
    };

    const formatCurrency = (val) => new Intl.NumberFormat('en-US', { 
        style: 'currency', 
        currency: 'USD', 
        maximumFractionDigits: 0 
    }).format(val);

    const formatPercent = (val) => `${val.toFixed(1)}%`;

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                onClick={onClose}
            />
            
            {/* Panel */}
            <div className="absolute right-0 top-0 h-full w-full max-w-2xl bg-white shadow-2xl flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-emerald-100 rounded-lg">
                            <Database size={20} className="text-emerald-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">Saved Analyses</h2>
                            <p className="text-sm text-slate-500">{scenarios.length} scenarios in database</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Save Current Section */}
                {!saveMode ? (
                    <div className="px-6 py-4 bg-emerald-50 border-b border-emerald-100">
                        <button
                            onClick={() => {
                                setNewScenarioName(scenarioName || 'Untitled Analysis');
                                setSaveMode(true);
                            }}
                            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors"
                        >
                            <Plus size={18} />
                            <span>Save Current Analysis to Database</span>
                        </button>
                    </div>
                ) : (
                    <div className="px-6 py-4 bg-emerald-50 border-b border-emerald-100 space-y-3">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Scenario Name *
                            </label>
                            <input
                                type="text"
                                value={newScenarioName}
                                onChange={(e) => setNewScenarioName(e.target.value)}
                                placeholder="e.g., Downtown Office Building"
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                autoFocus
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Description (optional)
                            </label>
                            <input
                                type="text"
                                value={newScenarioDesc}
                                onChange={(e) => setNewScenarioDesc(e.target.value)}
                                placeholder="Brief notes about this scenario..."
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            />
                        </div>
                        <div className="flex space-x-2">
                            <button
                                onClick={handleSaveNew}
                                disabled={!newScenarioName.trim()}
                                className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-medium rounded-lg transition-colors"
                            >
                                Save to Database
                            </button>
                            <button
                                onClick={() => {
                                    setSaveMode(false);
                                    setNewScenarioName('');
                                    setNewScenarioDesc('');
                                }}
                                className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

                {/* Search & Filters */}
                <div className="px-6 py-3 border-b border-slate-200 space-y-3">
                    <form onSubmit={handleSearch} className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by name or address..."
                            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                        />
                    </form>
                    <div className="flex space-x-2">
                        {[
                            { id: 'all', label: 'All', icon: FolderOpen },
                            { id: 'favorites', label: 'Favorites', icon: Star },
                            { id: 'recent', label: 'Recent', icon: Clock },
                        ].map(({ id, label, icon: Icon }) => (
                            <button
                                key={id}
                                onClick={() => setFilter(id)}
                                className={`flex items-center space-x-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                                    filter === id 
                                        ? 'bg-emerald-100 text-emerald-700' 
                                        : 'text-slate-600 hover:bg-slate-100'
                                }`}
                            >
                                <Icon size={14} />
                                <span>{label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Scenarios List */}
                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="flex items-center justify-center h-48">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                        </div>
                    ) : scenarios.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-48 text-slate-500">
                            <Database size={40} className="text-slate-300 mb-3" />
                            <p className="font-medium">No scenarios found</p>
                            <p className="text-sm">Save your first analysis to get started</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {scenarios.map((scenario) => {
                                const metrics = calculateMetrics(scenario.data);
                                
                                return (
                                    <div
                                        key={scenario.id}
                                        onClick={() => handleLoad(scenario)}
                                        className="px-6 py-4 hover:bg-slate-50 cursor-pointer transition-colors group"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center space-x-2">
                                                    <h3 className="font-semibold text-slate-900 truncate">
                                                        {scenario.name}
                                                    </h3>
                                                    {scenario.is_favorite && (
                                                        <Star size={14} className="text-amber-500 fill-amber-500 flex-shrink-0" />
                                                    )}
                                                </div>
                                                
                                                {(scenario.property_address || scenario.property_city) && (
                                                    <div className="flex items-center text-sm text-slate-500 mt-0.5">
                                                        <Building2 size={12} className="mr-1" />
                                                        {[scenario.property_address, scenario.property_city, scenario.property_state]
                                                            .filter(Boolean)
                                                            .join(', ')}
                                                    </div>
                                                )}
                                                
                                                {scenario.description && (
                                                    <p className="text-sm text-slate-500 mt-1 line-clamp-1">
                                                        {scenario.description}
                                                    </p>
                                                )}
                                                
                                                {/* Metrics Row */}
                                                {metrics && (
                                                    <div className="flex items-center space-x-4 mt-2 text-xs">
                                                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded font-medium">
                                                            IRR: {formatPercent(metrics.irr)}
                                                        </span>
                                                        <span className="text-slate-600">
                                                            {formatCurrency(scenario.data?.property?.purchasePrice || 0)}
                                                        </span>
                                                        <span className="text-slate-400">
                                                            {formatDate(scenario.updated_at)}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity ml-4">
                                                <button
                                                    onClick={(e) => handleToggleFavorite(scenario.id, e)}
                                                    className="p-1.5 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded transition-colors"
                                                    title={scenario.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
                                                >
                                                    {scenario.is_favorite ? (
                                                        <StarOff size={16} />
                                                    ) : (
                                                        <Star size={16} />
                                                    )}
                                                </button>
                                                <button
                                                    onClick={(e) => handleDuplicate(scenario.id, e)}
                                                    className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors"
                                                    title="Duplicate"
                                                >
                                                    <Copy size={16} />
                                                </button>
                                                <button
                                                    onClick={(e) => handleExport(scenario, e)}
                                                    className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors"
                                                    title="Export to file"
                                                >
                                                    <Download size={16} />
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setDeleteConfirm(scenario.id);
                                                    }}
                                                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                            
                                            <ChevronRight size={18} className="text-slate-300 ml-2 group-hover:text-slate-400" />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer hint */}
                <div className="px-6 py-3 border-t border-slate-200 bg-slate-50">
                    <p className="text-xs text-slate-500 text-center">
                        Click a scenario to load it • Use File → Open to import from external JSON files
                    </p>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={deleteConfirm !== null}
                onClose={() => setDeleteConfirm(null)}
                onConfirm={() => handleDelete(deleteConfirm)}
                title="Delete Scenario?"
                message="This will permanently delete this scenario from your database. This action cannot be undone."
                confirmText="Delete"
                confirmVariant="danger"
            />
        </div>
    );
};

export default ScenarioManager;

