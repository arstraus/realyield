import React, { useState, useMemo } from 'react';
import { calculateSensitivityMatrix } from '../utils/financials';

const VARIABLE_OPTIONS = [
    { value: 'exitCapRate', label: 'Exit Cap Rate (%)', min: 4, max: 10, step: 0.5 },
    { value: 'operations.annualRentGrowth', label: 'Rent Growth (%)', min: 0, max: 8, step: 0.5 },
    { value: 'operations.vacancyRate', label: 'Vacancy Rate (%)', min: 0, max: 20, step: 2 },
    { value: 'financing.interestRate', label: 'Interest Rate (%)', min: 3, max: 10, step: 0.5 },
];

const SensitivityTable = ({
    title,
    xLabel,
    yLabel,
    xRange,
    yRange,
    matrix,
    currentX,
    currentY,
    formatter = (val) => `${val.toFixed(1)}%`,
    colorScale = 'irr' // 'irr' or 'coc'
}) => {
    const getColor = (val) => {
        if (val === null) return 'bg-gray-200';

        if (colorScale === 'irr') {
            if (val < 0) return 'bg-red-600 text-white';
            if (val < 5) return 'bg-red-400 text-white';
            if (val < 10) return 'bg-orange-300';
            if (val < 15) return 'bg-yellow-300';
            if (val < 20) return 'bg-green-300';
            return 'bg-green-500 text-white';
        } else {
            // Cash on Cash scale
            if (val < 0) return 'bg-red-600 text-white';
            if (val < 2) return 'bg-red-400 text-white';
            if (val < 5) return 'bg-orange-300';
            if (val < 8) return 'bg-yellow-300';
            if (val < 12) return 'bg-green-300';
            return 'bg-green-500 text-white';
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
            <div className="overflow-x-auto">
                <table className="min-w-full border-collapse">
                    <thead>
                        <tr>
                            <th className="border border-gray-300 bg-gray-50 p-2 text-xs font-medium text-gray-700">
                                {yLabel} ↓ / {xLabel} →
                            </th>
                            {xRange.map(x => (
                                <th key={x} className="border border-gray-300 bg-gray-50 p-2 text-xs font-medium text-gray-700">
                                    {typeof x === 'number' ? x.toLocaleString() : x}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {matrix.map((row, yIdx) => (
                            <tr key={yIdx}>
                                <td className="border border-gray-300 bg-gray-50 p-2 text-xs font-medium text-gray-700 text-center">
                                    {typeof yRange[yIdx] === 'number' ? yRange[yIdx].toLocaleString() : yRange[yIdx]}
                                </td>
                                {row.map((val, xIdx) => {
                                    const isCurrentScenario =
                                        Math.abs(xRange[xIdx] - currentX) < (xRange[1] - xRange[0]) / 2 &&
                                        Math.abs(yRange[yIdx] - currentY) < (Math.abs(yRange[1] - yRange[0])) / 2;

                                    return (
                                        <td
                                            key={xIdx}
                                            className={`border border-gray-300 p-2 text-center text-xs font-medium ${getColor(val)} ${isCurrentScenario ? 'ring-4 ring-emerald-600 ring-inset' : ''}`}
                                        >
                                            {val !== null ? formatter(val) : 'N/A'}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const SensitivityAnalysis = ({ property, financing, operations, taxMarket, closingCosts }) => {
    // 1. Dynamic Analysis State
    const [xVariable, setXVariable] = useState('exitCapRate');
    const [yVariable, setYVariable] = useState('operations.annualRentGrowth');

    const xConfig = VARIABLE_OPTIONS.find(v => v.value === xVariable);
    const yConfig = VARIABLE_OPTIONS.find(v => v.value === yVariable);

    // Dynamic Ranges
    const xRange = useMemo(() => {
        const range = [];
        for (let i = xConfig.min; i <= xConfig.max; i += xConfig.step) {
            range.push(parseFloat(i.toFixed(2)));
        }
        return range;
    }, [xConfig]);

    const yRange = useMemo(() => {
        const range = [];
        for (let i = yConfig.min; i <= yConfig.max; i += yConfig.step) {
            range.push(parseFloat(i.toFixed(2)));
        }
        return range.reverse();
    }, [yConfig]);

    // Dynamic Matrix
    const dynamicMatrix = useMemo(() => {
        const baseInputs = { property, financing, operations, taxMarket, closingCosts };
        return calculateSensitivityMatrix(baseInputs, xVariable, xRange, yVariable, yRange, 'irr');
    }, [property, financing, operations, taxMarket, closingCosts, xVariable, xRange, yVariable, yRange]);

    // 2. IRR: Exit Cap vs Purchase Price
    const priceRange = useMemo(() => {
        const basePrice = property.purchasePrice;
        const range = [];
        for (let i = -10; i <= 10; i += 5) { // -10%, -5%, 0%, +5%, +10%
            range.push(basePrice * (1 + i / 100));
        }
        return range;
    }, [property.purchasePrice]);

    const exitCapRange = useMemo(() => {
        const baseCap = taxMarket.exitCapRate;
        const range = [];
        for (let i = -1; i <= 1; i += 0.5) { // -1%, -0.5%, 0%, +0.5%, +1%
            range.push(baseCap + i);
        }
        return range.reverse();
    }, [taxMarket.exitCapRate]);

    const priceMatrix = useMemo(() => {
        const baseInputs = { property, financing, operations, taxMarket, closingCosts };
        return calculateSensitivityMatrix(baseInputs, 'property.purchasePrice', priceRange, 'exitCapRate', exitCapRange, 'irr');
    }, [property, financing, operations, taxMarket, closingCosts, priceRange, exitCapRange]);

    // 3. CoC: Rent vs Occupancy
    const rentRange = useMemo(() => {
        const isCommercial = operations.inputMode === 'commercial';
        const baseRent = isCommercial ? operations.annualBaseRentPerSqFt : operations.grossRentMonthly;
        const range = [];
        for (let i = -10; i <= 10; i += 5) {
            range.push(baseRent * (1 + i / 100));
        }
        return range;
    }, [operations]);

    const vacancyRange = [0, 2.5, 5, 7.5, 10]; // Vacancy Rates
    const occupancyRange = vacancyRange.map(v => 100 - v); // For display

    const cocMatrix = useMemo(() => {
        const baseInputs = { property, financing, operations, taxMarket, closingCosts };
        const rentVar = operations.inputMode === 'commercial' ? 'operations.annualBaseRentPerSqFt' : 'operations.grossRentMonthly';
        return calculateSensitivityMatrix(baseInputs, rentVar, rentRange, 'operations.vacancyRate', vacancyRange, 'averageCashOnCash');
    }, [property, financing, operations, taxMarket, closingCosts, rentRange, vacancyRange]);

    // Helpers
    const getCurrentValue = (variable) => {
        if (variable.includes('.')) {
            const [obj, key] = variable.split('.');
            return { operations, financing, taxMarket, property }[obj][key];
        }
        return taxMarket[variable];
    };

    return (
        <div className="space-y-8">
            {/* 1. Dynamic Analysis */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Dynamic Sensitivity Analysis</h3>
                    <p className="text-sm text-gray-500">Select variables to analyze their impact on IRR.</p>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">X-Axis Variable</label>
                        <select
                            value={xVariable}
                            onChange={(e) => setXVariable(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                        >
                            {VARIABLE_OPTIONS.filter(v => v.value !== yVariable).map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Y-Axis Variable</label>
                        <select
                            value={yVariable}
                            onChange={(e) => setYVariable(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                        >
                            {VARIABLE_OPTIONS.filter(v => v.value !== xVariable).map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <SensitivityTable
                    title="IRR Sensitivity"
                    xLabel={xConfig.label}
                    yLabel={yConfig.label}
                    xRange={xRange}
                    yRange={yRange}
                    matrix={dynamicMatrix}
                    currentX={getCurrentValue(xVariable)}
                    currentY={getCurrentValue(yVariable)}
                />
            </div>

            {/* 2. Common Scenarios */}
            <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Common Scenarios</h2>

                <SensitivityTable
                    title="IRR: Purchase Price vs. Exit Cap Rate"
                    xLabel="Purchase Price ($)"
                    yLabel="Exit Cap Rate (%)"
                    xRange={priceRange}
                    yRange={exitCapRange}
                    matrix={priceMatrix}
                    currentX={property.purchasePrice}
                    currentY={taxMarket.exitCapRate}
                    formatter={(val) => `${val.toFixed(1)}%`}
                />

                <SensitivityTable
                    title="Cash-on-Cash: Rent vs. Occupancy"
                    xLabel={`Rent (${operations.inputMode === 'commercial' ? '$/SF' : '$/Mo'})`}
                    yLabel="Occupancy (%)"
                    xRange={rentRange}
                    yRange={occupancyRange} // Display Occupancy
                    matrix={cocMatrix} // Calculated with Vacancy
                    currentX={operations.inputMode === 'commercial' ? operations.annualBaseRentPerSqFt : operations.grossRentMonthly}
                    currentY={100 - operations.vacancyRate}
                    formatter={(val) => `${val.toFixed(1)}%`}
                    colorScale="coc"
                />
            </div>
        </div>
    );
};

export default SensitivityAnalysis;
