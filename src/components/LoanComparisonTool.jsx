import React, { useState } from 'react';
import { calculateMortgage } from '../utils/financials';

const LoanComparisonTool = ({ purchasePrice = 0, downPaymentPercent = 25 }) => {
    const [loans, setLoans] = useState([
        { id: 1, name: 'Option 1', rate: 6.5, term: 30, points: 0 },
        { id: 2, name: 'Option 2', rate: 6.25, term: 30, points: 1 },
        { id: 3, name: 'Option 3', rate: 7.0, term: 25, points: 0 },
    ]);

    const loanAmount = (purchasePrice || 0) * (1 - (downPaymentPercent || 25) / 100);

    const calculateLoanMetrics = (loan) => {
        if (!loanAmount || loanAmount <= 0) {
            return {
                monthlyPayment: 0,
                pointsCost: 0,
                totalInterest: 0,
                totalCost: 0,
                effectiveRate: 0
            };
        }

        const monthlyPayment = calculateMortgage(loanAmount, loan.rate, loan.term);
        const pointsCost = loanAmount * (loan.points / 100);
        const totalInterest = (monthlyPayment * loan.term * 12) - loanAmount;
        const totalCost = loanAmount + totalInterest + pointsCost;

        return {
            monthlyPayment: monthlyPayment || 0,
            pointsCost: pointsCost || 0,
            totalInterest: totalInterest || 0,
            totalCost: totalCost || 0,
            effectiveRate: loanAmount > 0 ? ((totalInterest + pointsCost) / loanAmount / loan.term) * 100 : 0
        };
    };

    const updateLoan = (id, field, value) => {
        setLoans(loans.map(loan =>
            loan.id === id ? { ...loan, [field]: parseFloat(value) || 0 } : loan
        ));
    };

    const formatCurrency = (val) => new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0
    }).format(val);

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Loan Comparison Tool</h2>
            <p className="text-sm text-gray-600 mb-6">
                Compare financing options side-by-side. Loan Amount: {formatCurrency(loanAmount)}
            </p>

            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-4 py-3 text-left font-medium text-gray-700">Metric</th>
                            {loans.map(loan => (
                                <th key={loan.id} className="px-4 py-3 text-center font-medium text-gray-700">
                                    <input
                                        type="text"
                                        value={loan.name}
                                        onChange={(e) => updateLoan(loan.id, 'name', e.target.value)}
                                        className="w-full text-center font-medium border-0 bg-transparent focus:ring-0"
                                    />
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        <tr className="bg-emerald-50/30">
                            <td className="px-4 py-3 font-medium text-gray-700">Interest Rate (%)</td>
                            {loans.map(loan => (
                                <td key={loan.id} className="px-4 py-3 text-center">
                                    <input
                                        type="number"
                                        step="0.125"
                                        value={loan.rate}
                                        onChange={(e) => updateLoan(loan.id, 'rate', e.target.value)}
                                        className="w-20 text-center border border-gray-300 rounded px-2 py-1"
                                    />
                                </td>
                            ))}
                        </tr>
                        <tr className="bg-emerald-50/30">
                            <td className="px-4 py-3 font-medium text-gray-700">Term (Years)</td>
                            {loans.map(loan => (
                                <td key={loan.id} className="px-4 py-3 text-center">
                                    <input
                                        type="number"
                                        value={loan.term}
                                        onChange={(e) => updateLoan(loan.id, 'term', e.target.value)}
                                        className="w-20 text-center border border-gray-300 rounded px-2 py-1"
                                    />
                                </td>
                            ))}
                        </tr>
                        <tr className="bg-emerald-50/30">
                            <td className="px-4 py-3 font-medium text-gray-700">Points (%)</td>
                            {loans.map(loan => (
                                <td key={loan.id} className="px-4 py-3 text-center">
                                    <input
                                        type="number"
                                        step="0.25"
                                        value={loan.points}
                                        onChange={(e) => updateLoan(loan.id, 'points', e.target.value)}
                                        className="w-20 text-center border border-gray-300 rounded px-2 py-1"
                                    />
                                </td>
                            ))}
                        </tr>
                        <tr>
                            <td className="px-4 py-3 font-medium text-gray-900">Monthly Payment</td>
                            {loans.map(loan => {
                                const metrics = calculateLoanMetrics(loan);
                                return (
                                    <td key={loan.id} className="px-4 py-3 text-center font-medium text-gray-900">
                                        {formatCurrency(metrics.monthlyPayment)}
                                    </td>
                                );
                            })}
                        </tr>
                        <tr>
                            <td className="px-4 py-3 text-gray-700">Points Cost</td>
                            {loans.map(loan => {
                                const metrics = calculateLoanMetrics(loan);
                                return (
                                    <td key={loan.id} className="px-4 py-3 text-center text-gray-700">
                                        {formatCurrency(metrics.pointsCost)}
                                    </td>
                                );
                            })}
                        </tr>
                        <tr>
                            <td className="px-4 py-3 text-gray-700">Total Interest</td>
                            {loans.map(loan => {
                                const metrics = calculateLoanMetrics(loan);
                                return (
                                    <td key={loan.id} className="px-4 py-3 text-center text-gray-700">
                                        {formatCurrency(metrics.totalInterest)}
                                    </td>
                                );
                            })}
                        </tr>
                        <tr className="bg-gray-50 font-medium">
                            <td className="px-4 py-3 text-gray-900">Total Cost</td>
                            {loans.map(loan => {
                                const metrics = calculateLoanMetrics(loan);
                                return (
                                    <td key={loan.id} className="px-4 py-3 text-center text-emerald-600 font-bold">
                                        {formatCurrency(metrics.totalCost)}
                                    </td>
                                );
                            })}
                        </tr>
                        <tr>
                            <td className="px-4 py-3 text-gray-700">Effective Rate</td>
                            {loans.map(loan => {
                                const metrics = calculateLoanMetrics(loan);
                                return (
                                    <td key={loan.id} className="px-4 py-3 text-center text-gray-700">
                                        {metrics.effectiveRate.toFixed(2)}%
                                    </td>
                                );
                            })}
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default LoanComparisonTool;
