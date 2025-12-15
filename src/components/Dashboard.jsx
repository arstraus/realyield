import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import AmortizationChart from './AmortizationChart';
import DealScoreBadge from './DealScoreBadge';
import { calculateDealScore } from '../utils/scoring';

const MetricCard = ({ title, value, subtext, highlight = false }) => (
    <div className={`bg-white rounded-xl shadow-sm border p-6 ${highlight ? 'border-emerald-100 bg-emerald-50/30' : 'border-gray-100'}`}>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className={`mt-2 text-3xl font-bold ${highlight ? 'text-emerald-600' : 'text-gray-900'}`}>{value}</p>
        {subtext && <p className="mt-1 text-sm text-gray-500">{subtext}</p>}
    </div>
);

const Dashboard = ({ metrics, forecast, amortizationSchedule, loanAmount }) => {
    if (!metrics || !forecast) return null;

    const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
    const formatPercent = (val) => new Intl.NumberFormat('en-US', { style: 'percent', minimumFractionDigits: 2 }).format(val / 100);
    const formatCompactCurrency = (val) => {
        if (Math.abs(val) >= 1_000_000) {
            return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 1 }).format(val);
        }
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
    };

    // Calculate deal score
    const dealScore = calculateDealScore(metrics);

    return (
        <div className="space-y-8">
            {/* Deal Score + Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <DealScoreBadge
                    grade={dealScore.grade}
                    score={dealScore.score}
                    breakdown={dealScore.breakdown}
                />
                <MetricCard
                    title="Internal Rate of Return (IRR)"
                    value={formatPercent(metrics.irr)}
                    subtext="Pre-Tax Annualized Return"
                    highlight
                />
                <MetricCard
                    title="Cash on Cash (Avg)"
                    value={formatPercent(metrics.averageCashOnCash)}
                    subtext="Pre-Tax Average Yield"
                />
                <MetricCard
                    title="Equity Multiple"
                    value={`${metrics.equityMultiple.toFixed(2)}x`}
                    subtext="Pre-Tax Total Return"
                />
                <MetricCard
                    title="Total Profit"
                    value={formatCompactCurrency(metrics.totalProfit)}
                    subtext="After-Tax Profit"
                />
            </div>

            {/* Advanced Metrics Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* After-Tax Returns */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                        <h3 className="text-lg font-semibold text-gray-900">After-Tax Investment Returns</h3>
                    </div>
                    <div className="p-4">
                        <table className="w-full">
                            <tbody className="divide-y divide-gray-100">
                                <tr className="py-2">
                                    <td className="py-2 text-sm font-medium text-gray-700">After-Tax IRR</td>
                                    <td className="py-2 text-sm font-bold text-emerald-600 text-right">{formatPercent(metrics.irrAfterTax)}</td>
                                </tr>
                                <tr className="py-2">
                                    <td className="py-2 text-sm font-medium text-gray-700">Equity Multiple (After-Tax)</td>
                                    <td className="py-2 text-sm text-gray-900 text-right">{metrics.equityMultipleAfterTax.toFixed(2)}x</td>
                                </tr>
                                <tr className="py-2">
                                    <td className="py-2 text-sm font-medium text-gray-700">Avg Cash-on-Cash (After-Tax)</td>
                                    <td className="py-2 text-sm text-gray-900 text-right">{formatPercent(metrics.averageCashOnCashAfterTax)}</td>
                                </tr>
                                <tr className="py-2">
                                    <td className="py-2 text-sm font-medium text-gray-700">After-Tax NPV</td>
                                    <td className="py-2 text-sm text-gray-900 text-right">{formatCurrency(metrics.npvAfterTax)}</td>
                                </tr>
                                <tr className="py-2">
                                    <td className="py-2 text-sm font-medium text-gray-700">Total Profit</td>
                                    <td className="py-2 text-sm text-gray-900 text-right">{formatCurrency(metrics.totalProfit)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Year 1 Performance */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                        <h3 className="text-lg font-semibold text-gray-900">Year 1 Performance Metrics</h3>
                    </div>
                    <div className="p-4">
                        <table className="w-full">
                            <tbody className="divide-y divide-gray-100">
                                <tr className="py-2">
                                    <td className="py-2 text-sm font-medium text-gray-700">Year 1 NOI</td>
                                    <td className="py-2 text-sm text-gray-900 text-right">{formatCurrency(metrics.year1Noi)}</td>
                                </tr>
                                <tr className="py-2">
                                    <td className="py-2 text-sm font-medium text-gray-700">Going-In Cap Rate</td>
                                    <td className="py-2 text-sm text-gray-900 text-right">{formatPercent(metrics.capRate)}</td>
                                </tr>
                                <tr className="py-2">
                                    <td className="py-2 text-sm font-medium text-gray-700">Year 1 DSCR</td>
                                    <td className="py-2 text-sm text-gray-900 text-right">{metrics.dscr.toFixed(2)}</td>
                                </tr>
                                <tr className="py-2">
                                    <td className="py-2 text-sm font-medium text-gray-700">Year 1 After-Tax CoC</td>
                                    <td className="py-2 text-sm text-gray-900 text-right">{formatPercent(metrics.year1CashOnCashAfterTax)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Exit Analysis */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                        <h3 className="text-lg font-semibold text-gray-900">Exit Analysis (Year 10)</h3>
                    </div>
                    <div className="p-4">
                        <table className="w-full">
                            <tbody className="divide-y divide-gray-100">
                                <tr className="py-2">
                                    <td className="py-2 text-sm font-medium text-gray-700">Gross Sale Price</td>
                                    <td className="py-2 text-sm text-gray-900 text-right">{formatCurrency(metrics.exitAnalysis.grossSalePrice)}</td>
                                </tr>
                                <tr className="py-2">
                                    <td className="py-2 text-sm font-medium text-gray-700">Net Sale Proceeds</td>
                                    <td className="py-2 text-sm text-gray-900 text-right">{formatCurrency(metrics.exitAnalysis.netSaleProceeds)}</td>
                                </tr>
                                <tr className="py-2">
                                    <td className="py-2 text-sm font-medium text-gray-700">Loan Balance at Exit</td>
                                    <td className="py-2 text-sm text-gray-900 text-right">{formatCurrency(metrics.exitAnalysis.loanBalanceAtExit)}</td>
                                </tr>
                                <tr className="py-2">
                                    <td className="py-2 text-sm font-medium text-gray-700">Total Tax on Sale</td>
                                    <td className="py-2 text-sm text-gray-900 text-right">{formatCurrency(metrics.exitAnalysis.totalTaxOnSale)}</td>
                                </tr>
                                <tr className="py-2">
                                    <td className="py-2 text-sm font-medium text-gray-700">Net Cash from Sale</td>
                                    <td className="py-2 text-sm font-bold text-emerald-600 text-right">{formatCurrency(metrics.exitAnalysis.netCashFromSale)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Cash Flow Forecast</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={forecast}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="year" />
                                <YAxis tickFormatter={(val) => `$${val / 1000}k`} />
                                <Tooltip formatter={(val) => formatCurrency(val)} />
                                <Legend />
                                <Bar dataKey="noi" name="NOI" fill="#818cf8" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="cashFlow" name="Cash Flow (Pre-Tax)" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Equity Accumulation</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={forecast}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="year" />
                                <YAxis tickFormatter={(val) => `$${val / 1000}k`} />
                                <Tooltip formatter={(val) => formatCurrency(val)} />
                                <Legend />
                                <Line type="monotone" dataKey="effectiveGrossIncome" name="Revenue" stroke="#10b981" strokeWidth={2} />
                                <Line type="monotone" dataKey="totalExpenses" name="Expenses" stroke="#ef4444" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Amortization Chart */}
            {amortizationSchedule && loanAmount && (
                <AmortizationChart
                    amortizationSchedule={amortizationSchedule}
                    loanAmount={loanAmount}
                />
            )}

            {/* Detailed Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900">10-Year Pro Forma</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Gross Income</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Expenses</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">NOI</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Debt Service</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Cash Flow</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">CoC Return</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {forecast.map((row) => (
                                <tr key={row.year} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{row.year}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">{formatCurrency(row.effectiveGrossIncome)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">{formatCurrency(row.totalExpenses)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 font-medium">{formatCurrency(row.noi)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">{formatCurrency(row.debtService)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-emerald-600 font-bold">{formatCurrency(row.cashFlow)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">{row.cashOnCash.toFixed(2)}%</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
