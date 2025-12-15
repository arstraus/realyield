
import React, { useState } from 'react';
import { generateForecast } from '../utils/financials';
import { DEFAULT_TAX_MARKET, DEFAULT_CLOSING_COSTS, DEFAULT_OPERATIONS, DEFAULT_PROPERTY, DEFAULT_FINANCING } from '../utils/constants';
import { FolderPlus, X } from 'lucide-react';

const ComparisonView = ({ comparisonScenarios, setComparisonScenarios, currentScenario, onLoad }) => {

    const handleAddScenarios = async () => {
        if (window.electronAPI) {
            const result = await window.electronAPI.loadScenarioFromDisk();
            if (result) {
                const data = result.data || result;
                const filePath = result.filePath || null;
                const name = data.name || 'Scenario ' + (comparisonScenarios.length + 1);
                const id = data.id || `${Date.now()}_${Math.random()}`;

                // Check if already loaded
                const exists = comparisonScenarios.find(s => s.id === id);
                if (!exists) {
                    setComparisonScenarios([...comparisonScenarios, {
                        id,
                        data,
                        filePath,
                        name
                    }]);
                }
            }
        } else {
            alert("File comparison is only available in the desktop app.");
        }
    };

    const removeScenario = (id) => {
        setComparisonScenarios(comparisonScenarios.filter(s => s.id !== id));
    };

    // Prepare data
    const allItems = [
        { name: 'Current Analysis', data: currentScenario, isCurrent: true, id: 'current' },
        ...comparisonScenarios.map(s => ({ ...s, isCurrent: false }))
    ];

    const comparisons = allItems.map(item => {
        try {
            // Merge with defaults to ensure all required fields exist
            const mergedOperations = {
                ...DEFAULT_OPERATIONS,
                ...item.data.operations,
                commercialExpenses: {
                    ...DEFAULT_OPERATIONS.commercialExpenses,
                    ...(item.data.operations?.commercialExpenses || {})
                }
            };
            const mergedTaxMarket = { ...DEFAULT_TAX_MARKET, ...(item.data.taxMarket || {}) };
            const mergedClosingCosts = { ...DEFAULT_CLOSING_COSTS, ...(item.data.closingCosts || {}) };
            const mergedProperty = { ...DEFAULT_PROPERTY, ...item.data.property };
            const mergedFinancing = { ...DEFAULT_FINANCING, ...item.data.financing };

            const result = generateForecast(mergedProperty, mergedFinancing, mergedOperations, mergedTaxMarket, mergedClosingCosts);
            return {
                ...item,
                metrics: result.metrics,
                isValid: true
            };
        } catch (error) {
            console.error(`Failed to calculate metrics for scenario: ${item.name}`, error);
            return {
                ...item,
                isValid: false,
                error: error.message
            };
        }
    }).filter(item => item.isValid);

    const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
    const formatPercent = (val) => new Intl.NumberFormat('en-US', { style: 'percent', minimumFractionDigits: 2 }).format(val / 100);

    return (
        <div className="space-y-6">
            {/* Header / Actions */}
            <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div>
                    <h3 className="text-lg font-bold text-gray-900">Scenario Comparison</h3>
                    <p className="text-sm text-gray-500">Compare your current analysis against saved scenario files.</p>
                </div>
                <button
                    onClick={handleAddScenarios}
                    className="flex items-center px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg font-medium transition-colors"
                >
                    <FolderPlus size={18} className="mr-2" />
                    Add Scenario File
                </button>
            </div>

            {/* Selected Files List (if any) */}
            {comparisonScenarios.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {comparisonScenarios.map(s => (
                        <div key={s.id} className="inline-flex items-center px-3 py-1 rounded-full bg-white border border-gray-200 text-sm shadow-sm">
                            <span className="font-medium text-gray-700 mr-2">{s.name}</span>
                            <button onClick={() => removeScenario(s.id)} className="text-gray-400 hover:text-red-500">
                                <X size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">Metric</th>
                                {comparisons.map((c, idx) => (
                                    <th key={idx} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">
                                        <div className="flex flex-col">
                                            <span className={`text-sm ${c.isCurrent ? 'text-emerald-700 font-bold' : 'text-gray-900 font-semibold'}`}>{c.name}</span>
                                            {!c.isCurrent && (
                                                <button
                                                    onClick={() => onLoad(c.data, c.filePath, c.name)}
                                                    className="text-indigo-600 hover:text-indigo-800 text-xs font-normal mt-1 text-left"
                                                >
                                                    Load Scenari
                                                </button>
                                            )}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            <tr>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Purchase Price</td>
                                {comparisons.map((c, idx) => (
                                    <td key={idx} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(c.data.property.purchasePrice)}</td>
                                ))}
                            </tr>
                            <tr>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Initial Investment</td>
                                {comparisons.map((c, idx) => (
                                    <td key={idx} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(c.metrics.totalInitialInvestment)}</td>
                                ))}
                            </tr>
                            <tr className="bg-gray-50/50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">IRR</td>
                                {comparisons.map((c, idx) => (
                                    <td key={idx} className={`px-6 py-4 whitespace-nowrap text-sm font-bold ${c.metrics.irr > 15 ? 'text-emerald-600' : 'text-gray-900'}`}>{formatPercent(c.metrics.irr)}</td>
                                ))}
                            </tr>
                            <tr>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Cash on Cash (Avg)</td>
                                {comparisons.map((c, idx) => (
                                    <td key={idx} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatPercent(c.metrics.averageCashOnCash)}</td>
                                ))}
                            </tr>
                            <tr>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Equity Multiple</td>
                                {comparisons.map((c, idx) => (
                                    <td key={idx} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{c.metrics.equityMultiple.toFixed(2)}x</td>
                                ))}
                            </tr>
                            <tr>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Cap Rate (Year 1)</td>
                                {comparisons.map((c, idx) => (
                                    <td key={idx} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatPercent(c.metrics.capRate)}</td>
                                ))}
                            </tr>
                            <tr>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Total Profit</td>
                                {comparisons.map((c, idx) => (
                                    <td key={idx} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(c.metrics.totalProfit)}</td>
                                ))}
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ComparisonView;
