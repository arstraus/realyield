import React from 'react';

const ProFormaTable = ({ forecast }) => {
    if (!forecast || forecast.length === 0) {
        return <div className="text-center py-8 text-gray-500">No forecast data available.</div>;
    }

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0,
        }).format(val);
    };

    const formatPercent = (val) => {
        return new Intl.NumberFormat('en-US', {
            style: 'percent',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(val / 100);
    };

    return (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10">Year</th>
                        <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Rental Income</th>
                        <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total Revenue</th>
                        <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Op Expenses</th>
                        <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">NOI</th>
                        <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Debt Service</th>
                        <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Interest</th>
                        <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Depreciation</th>
                        <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Taxable Inc</th>
                        <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Taxes</th>
                        <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Pre-Tax CF</th>
                        <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">After-Tax CF</th>
                        <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">DSCR</th>
                        <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">AT CoC %</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {/* Year 0 Row - Initial Investment */}
                    <tr className="hover:bg-gray-50">
                        <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900 sticky left-0 bg-white">0</td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 text-right">$0</td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 text-right">$0</td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 text-right">$0</td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 text-right">$0</td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 text-right">$0</td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 text-right">$0</td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 text-right">$0</td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 text-right">$0</td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 text-right">$0</td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 text-right">
                            {/* We don't have initial investment in forecast array, skipping for now or passing as prop if needed */}
                            -
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 text-right">-</td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 text-right">-</td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 text-right">-</td>
                    </tr>

                    {forecast.map((row) => (
                        <tr key={row.year} className="hover:bg-gray-50">
                            <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900 sticky left-0 bg-white">{row.year}</td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 text-right">{formatCurrency(row.potentialGrossIncome - row.vacancyLoss)}</td>
                            {/* Note: Rental Income usually means Effective Gross Income in this context? Or Potential? 
                                The image shows "Rental Income" then "Total Revenue". 
                                Let's map Rental Income to Effective Gross Income for now.
                            */}
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 text-right">{formatCurrency(row.effectiveGrossIncome)}</td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 text-right">{formatCurrency(row.totalExpenses)}</td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 font-medium text-right">{formatCurrency(row.noi)}</td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 text-right">{formatCurrency(row.debtService)}</td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 text-right">{formatCurrency(row.interestPayment)}</td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 text-right">{formatCurrency(row.noi - row.taxableIncome - row.interestPayment)}</td>
                            {/* Back-calculating depreciation from taxable income formula: Taxable = NOI - Interest - Depr => Depr = NOI - Interest - Taxable */}
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 text-right">{formatCurrency(row.taxableIncome)}</td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 text-right">{formatCurrency(row.taxLiability)}</td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 font-medium text-right">{formatCurrency(row.cashFlow)}</td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 font-medium text-right">{formatCurrency(row.cashFlowAfterTax)}</td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 text-right">{row.noi / row.debtService > 0 ? (row.noi / row.debtService).toFixed(2) : '-'}</td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 text-right">{formatPercent(row.cashOnCashAfterTax)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ProFormaTable;
