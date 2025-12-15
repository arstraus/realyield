import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AmortizationChart = ({ amortizationSchedule, loanAmount }) => {
    if (!amortizationSchedule || amortizationSchedule.length === 0) return null;

    const formatCurrency = (val) => new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0
    }).format(val);

    // Transform data for stacked area chart
    const chartData = amortizationSchedule.map(item => ({
        year: item.year,
        'Principal Paid': item.principalPaid,
        'Remaining Balance': item.balance,
    }));

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Loan Amortization</h3>
                <p className="text-sm text-gray-500 mt-1">
                    Principal paydown over {amortizationSchedule[amortizationSchedule.length - 1].year} years
                </p>
            </div>

            <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis
                            dataKey="year"
                            label={{ value: 'Year', position: 'insideBottom', offset: -5 }}
                        />
                        <YAxis
                            tickFormatter={(val) => `$${val / 1000}k`}
                            label={{ value: 'Amount', angle: -90, position: 'insideLeft' }}
                        />
                        <Tooltip
                            formatter={(val) => formatCurrency(val)}
                            labelFormatter={(label) => `Year ${label}`}
                        />
                        <Legend />
                        <Area
                            type="monotone"
                            dataKey="Principal Paid"
                            stackId="1"
                            stroke="#4f46e5"
                            fill="#818cf8"
                        />
                        <Area
                            type="monotone"
                            dataKey="Remaining Balance"
                            stackId="1"
                            stroke="#ef4444"
                            fill="#fca5a5"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Key Milestones */}
            <div className="mt-6 grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Initial Loan</p>
                    <p className="text-lg font-bold text-gray-900">{formatCurrency(loanAmount)}</p>
                </div>
                <div className="text-center p-3 bg-emerald-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Equity Built</p>
                    <p className="text-lg font-bold text-emerald-600">
                        {formatCurrency(amortizationSchedule[amortizationSchedule.length - 1].principalPaid)}
                    </p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Final Balance</p>
                    <p className="text-lg font-bold text-gray-900">
                        {formatCurrency(amortizationSchedule[amortizationSchedule.length - 1].balance)}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AmortizationChart;
