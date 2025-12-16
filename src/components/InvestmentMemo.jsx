import React, { useRef, useMemo } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { FileDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { calculateSensitivityMatrix } from '../utils/financials';
import { calculateDealScore } from '../utils/scoring';
import DealScoreBadge from './DealScoreBadge';

const InvestmentMemo = ({ property, financing, operations, taxMarket, closingCosts, metrics, forecast, scenarioName }) => {
    const memoRef = useRef(null);
    const [isExporting, setIsExporting] = React.useState(false);

    const formatCurrency = (val) => new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0
    }).format(val);

    const formatPercent = (val) => new Intl.NumberFormat('en-US', {
        style: 'percent',
        minimumFractionDigits: 2
    }).format(val / 100);

    // Calculate Deal Score
    const dealScore = calculateDealScore(metrics);

    // --- Sensitivity Analysis Logic ---
    // 1. IRR: Exit Cap vs Purchase Price
    const priceRange = useMemo(() => {
        const basePrice = property.purchasePrice;
        const range = [];
        for (let i = -10; i <= 10; i += 5) {
            range.push(basePrice * (1 + i / 100));
        }
        return range;
    }, [property.purchasePrice]);

    const exitCapRange = useMemo(() => {
        const baseCap = taxMarket.exitCapRate;
        const range = [];
        for (let i = -1; i <= 1; i += 0.5) {
            range.push(baseCap + i);
        }
        return range.reverse();
    }, [taxMarket.exitCapRate]);

    const priceMatrix = useMemo(() => {
        const baseInputs = { property, financing, operations, taxMarket, closingCosts };
        return calculateSensitivityMatrix(baseInputs, 'property.purchasePrice', priceRange, 'exitCapRate', exitCapRange, 'irr');
    }, [property, financing, operations, taxMarket, closingCosts, priceRange, exitCapRange]);

    // 2. CoC: Rent vs Occupancy
    const rentRange = useMemo(() => {
        const isCommercial = operations.inputMode === 'commercial';
        const baseRent = isCommercial ? operations.annualBaseRentPerSqFt : operations.grossRentMonthly;
        const range = [];
        for (let i = -10; i <= 10; i += 5) {
            range.push(baseRent * (1 + i / 100));
        }
        return range;
    }, [operations]);

    const vacancyRange = [0, 2.5, 5, 7.5, 10];
    const occupancyRange = vacancyRange.map(v => 100 - v);

    const cocMatrix = useMemo(() => {
        const baseInputs = { property, financing, operations, taxMarket, closingCosts };
        const rentVar = operations.inputMode === 'commercial' ? 'operations.annualBaseRentPerSqFt' : 'operations.grossRentMonthly';
        return calculateSensitivityMatrix(baseInputs, rentVar, rentRange, 'operations.vacancyRate', vacancyRange, 'averageCashOnCash');
    }, [property, financing, operations, taxMarket, closingCosts, rentRange, vacancyRange]);

    const getColor = (val, scale = 'irr') => {
        if (val === null) return 'bg-gray-200';
        if (scale === 'irr') {
            if (val < 0) return 'bg-red-600 text-white';
            if (val < 5) return 'bg-red-400 text-white';
            if (val < 10) return 'bg-orange-300';
            if (val < 15) return 'bg-yellow-300';
            if (val < 20) return 'bg-green-300';
            return 'bg-green-500 text-white';
        } else {
            if (val < 0) return 'bg-red-600 text-white';
            if (val < 2) return 'bg-red-400 text-white';
            if (val < 5) return 'bg-orange-300';
            if (val < 8) return 'bg-yellow-300';
            if (val < 12) return 'bg-green-300';
            return 'bg-green-500 text-white';
        }
    };

    const handleExportPDF = async () => {
        setIsExporting(true);
        try {
            const element = memoRef.current;
            const canvas = await html2canvas(element, {
                scale: 1.5,
                useCORS: true,
                logging: false,
            });

            const imgData = canvas.toDataURL('image/jpeg', 0.95);
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            const imgWidth = canvas.width;
            const imgHeight = canvas.height;

            const ratio = pdfWidth / imgWidth;
            const imgHeightInPdf = imgHeight * ratio;

            let heightLeft = imgHeightInPdf;
            let position = 0;

            pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeightInPdf);
            heightLeft -= pdfHeight;

            while (heightLeft >= 0) {
                position = heightLeft - imgHeightInPdf;
                pdf.addPage();
                pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeightInPdf);
                heightLeft -= pdfHeight;
            }

            const filename = scenarioName 
                ? `${scenarioName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_memo.pdf`
                : 'investment-memo.pdf';
            pdf.save(filename);
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Error generating PDF: ' + error.message);
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="space-y-4">
            {/* Export Button */}
            <div className="flex justify-end">
                <button
                    onClick={handleExportPDF}
                    disabled={isExporting}
                    className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50 shadow-sm"
                >
                    <FileDown size={18} className="mr-2" />
                    {isExporting ? 'Generating PDF...' : 'Export PDF'}
                </button>
            </div>

            {/* Memo Content */}
            <div ref={memoRef} className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                {/* Header */}
                <div className="border-b-2 border-indigo-600 pb-6 mb-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-indigo-600 uppercase tracking-wide mb-1">Investment Memorandum</p>
                            <h1 className="text-3xl font-bold text-gray-900">
                                {scenarioName || 'Untitled Analysis'}
                            </h1>
                            {(property.address || property.city) && (
                                <p className="text-lg text-gray-600 mt-1">
                                    {[property.address, property.city, property.state].filter(Boolean).join(', ')}
                                </p>
                            )}
                        </div>
                        <div className="text-right text-sm text-gray-500">
                            <p>Generated on</p>
                            <p className="font-medium text-gray-700">
                                {new Date().toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </p>
                        </div>
                    </div>
                </div>

                {/* Executive Summary */}
                <section className="mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                        Executive Summary
                    </h2>
                    <div className="mb-6">
                        <DealScoreBadge
                            grade={dealScore.grade}
                            score={dealScore.score}
                            breakdown={dealScore.breakdown}
                            size="large"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-sm font-semibold text-gray-700 mb-3">Property Overview</h3>
                            <table className="w-full text-sm">
                                <tbody className="divide-y divide-gray-100">
                                    <tr>
                                        <td className="py-2 text-gray-600">Purchase Price</td>
                                        <td className="py-2 text-right font-medium">{formatCurrency(property.purchasePrice)}</td>
                                    </tr>
                                    <tr>
                                        <td className="py-2 text-gray-600">Building Size</td>
                                        <td className="py-2 text-right font-medium">{property.buildingSize.toLocaleString()} SF</td>
                                    </tr>
                                    <tr>
                                        <td className="py-2 text-gray-600">Price per SF</td>
                                        <td className="py-2 text-right font-medium">
                                            {formatCurrency(property.purchasePrice / property.buildingSize)}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="py-2 text-gray-600">Going-In Cap Rate</td>
                                        <td className="py-2 text-right font-medium">{formatPercent(metrics.capRate)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-gray-700 mb-3">Investment Returns</h3>
                            <table className="w-full text-sm">
                                <tbody className="divide-y divide-gray-100">
                                    <tr>
                                        <td className="py-2 text-gray-600">IRR (After-Tax)</td>
                                        <td className="py-2 text-right font-bold text-indigo-600">{formatPercent(metrics.irrAfterTax)}</td>
                                    </tr>
                                    <tr>
                                        <td className="py-2 text-gray-600">Equity Multiple</td>
                                        <td className="py-2 text-right font-medium">{metrics.equityMultipleAfterTax.toFixed(2)}x</td>
                                    </tr>
                                    <tr>
                                        <td className="py-2 text-gray-600">Total Profit</td>
                                        <td className="py-2 text-right font-medium">{formatCurrency(metrics.totalProfit)}</td>
                                    </tr>
                                    <tr>
                                        <td className="py-2 text-gray-600">Avg Cash-on-Cash</td>
                                        <td className="py-2 text-right font-medium">{formatPercent(metrics.averageCashOnCashAfterTax)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>

                {/* Investment Structure */}
                <section className="mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                        Investment Structure
                    </h2>
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-sm font-semibold text-gray-700 mb-3">Sources of Funds</h3>
                            <table className="w-full text-sm">
                                <tbody className="divide-y divide-gray-100">
                                    <tr>
                                        <td className="py-2 text-gray-600">Equity (Down Payment)</td>
                                        <td className="py-2 text-right font-medium">
                                            {formatCurrency(property.purchasePrice * (financing.downPaymentPercent / 100))}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="py-2 text-gray-600">Loan Amount</td>
                                        <td className="py-2 text-right font-medium">
                                            {formatCurrency(property.purchasePrice * (1 - financing.downPaymentPercent / 100))}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-gray-700 mb-3">Uses of Funds</h3>
                            <table className="w-full text-sm">
                                <tbody className="divide-y divide-gray-100">
                                    <tr>
                                        <td className="py-2 text-gray-600">Purchase Price</td>
                                        <td className="py-2 text-right font-medium">{formatCurrency(property.purchasePrice)}</td>
                                    </tr>
                                    <tr>
                                        <td className="py-2 text-gray-600">Closing Costs</td>
                                        <td className="py-2 text-right font-medium">{formatCurrency(metrics.closingCostsBreakdown.total)}</td>
                                    </tr>
                                    <tr>
                                        <td className="py-2 text-gray-600">Rehab/CapEx</td>
                                        <td className="py-2 text-right font-medium">
                                            {formatCurrency(property.rehabCosts + (operations.initialCapEx || 0))}
                                        </td>
                                    </tr>
                                    <tr className="font-bold">
                                        <td className="py-2 text-gray-900">Total Investment</td>
                                        <td className="py-2 text-right text-indigo-600">{formatCurrency(metrics.totalInitialInvestment)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>

                {/* Closing Costs Detail */}
                <section className="mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                        Closing Costs Breakdown
                    </h2>
                    <table className="w-full text-sm">
                        <tbody className="divide-y divide-gray-100">
                            <tr>
                                <td className="py-2 text-gray-600">Title Insurance</td>
                                <td className="py-2 text-right font-medium">{formatCurrency(metrics.closingCostsBreakdown.titleInsurance)}</td>
                            </tr>
                            <tr>
                                <td className="py-2 text-gray-600">Escrow Fees</td>
                                <td className="py-2 text-right font-medium">{formatCurrency(metrics.closingCostsBreakdown.escrowFees)}</td>
                            </tr>
                            <tr>
                                <td className="py-2 text-gray-600">Lender Fees</td>
                                <td className="py-2 text-right font-medium">{formatCurrency(metrics.closingCostsBreakdown.lenderFees)}</td>
                            </tr>
                            <tr>
                                <td className="py-2 text-gray-600">Recording Fees</td>
                                <td className="py-2 text-right font-medium">{formatCurrency(metrics.closingCostsBreakdown.recordingFees)}</td>
                            </tr>
                            <tr>
                                <td className="py-2 text-gray-600">Inspection & Appraisal</td>
                                <td className="py-2 text-right font-medium">{formatCurrency(metrics.closingCostsBreakdown.inspectionAppraisal)}</td>
                            </tr>
                            <tr className="font-bold">
                                <td className="py-2 text-gray-900">Total Closing Costs</td>
                                <td className="py-2 text-right text-indigo-600">{formatCurrency(metrics.closingCostsBreakdown.total)}</td>
                            </tr>
                        </tbody>
                    </table>
                </section>

                {/* Operating Assumptions */}
                <section className="mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                        Operating Assumptions
                    </h2>
                    <div className="grid grid-cols-2 gap-6 text-sm">
                        <div>
                            <table className="w-full">
                                <tbody className="divide-y divide-gray-100">
                                    <tr>
                                        <td className="py-2 text-gray-600">Vacancy Rate</td>
                                        <td className="py-2 text-right font-medium">{operations.vacancyRate}%</td>
                                    </tr>
                                    <tr>
                                        <td className="py-2 text-gray-600">Annual Rent Growth</td>
                                        <td className="py-2 text-right font-medium">{operations.annualRentGrowth}%</td>
                                    </tr>
                                    <tr>
                                        <td className="py-2 text-gray-600">Annual Expense Growth</td>
                                        <td className="py-2 text-right font-medium">{operations.annualExpenseGrowth}%</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div>
                            <table className="w-full">
                                <tbody className="divide-y divide-gray-100">
                                    <tr>
                                        <td className="py-2 text-gray-600">Hold Period</td>
                                        <td className="py-2 text-right font-medium">{taxMarket.holdPeriod} years</td>
                                    </tr>
                                    <tr>
                                        <td className="py-2 text-gray-600">Exit Cap Rate</td>
                                        <td className="py-2 text-right font-medium">{taxMarket.exitCapRate}%</td>
                                    </tr>
                                    <tr>
                                        <td className="py-2 text-gray-600">Discount Rate</td>
                                        <td className="py-2 text-right font-medium">{taxMarket.discountRate}%</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>

                {/* 5-Year Pro Forma Summary */}
                <section className="mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                        5-Year Pro Forma Summary
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-3 py-2 text-left font-medium text-gray-700">Year</th>
                                    <th className="px-3 py-2 text-right font-medium text-gray-700">Revenue</th>
                                    <th className="px-3 py-2 text-right font-medium text-gray-700">Expenses</th>
                                    <th className="px-3 py-2 text-right font-medium text-gray-700">NOI</th>
                                    <th className="px-3 py-2 text-right font-medium text-gray-700">Cash Flow (After-Tax)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {forecast.slice(0, 5).map((row) => (
                                    <tr key={row.year}>
                                        <td className="px-3 py-2 font-medium">{row.year}</td>
                                        <td className="px-3 py-2 text-right">{formatCurrency(row.effectiveGrossIncome)}</td>
                                        <td className="px-3 py-2 text-right">{formatCurrency(row.totalExpenses)}</td>
                                        <td className="px-3 py-2 text-right font-medium">{formatCurrency(row.noi)}</td>
                                        <td className="px-3 py-2 text-right text-emerald-600 font-bold">{formatCurrency(row.cashFlowAfterTax)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* Financial Visualizations */}
                <section className="mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                        Financial Visualizations
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Cash Flow Forecast */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-700 mb-3">Cash Flow Forecast</h3>
                            <div className="h-64 border border-gray-100 rounded-lg p-2">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={forecast}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="year" tick={{ fontSize: 10 }} />
                                        <YAxis tickFormatter={(val) => `$${val / 1000}k`} tick={{ fontSize: 10 }} width={40} />
                                        <Tooltip formatter={(val) => formatCurrency(val)} />
                                        <Legend wrapperStyle={{ fontSize: '10px' }} />
                                        <Bar dataKey="noi" name="NOI" fill="#818cf8" radius={[4, 4, 0, 0]} isAnimationActive={false} />
                                        <Bar dataKey="cashFlow" name="Cash Flow" fill="#4f46e5" radius={[4, 4, 0, 0]} isAnimationActive={false} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Equity Accumulation */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-700 mb-3">Equity Accumulation</h3>
                            <div className="h-64 border border-gray-100 rounded-lg p-2">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={forecast}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="year" tick={{ fontSize: 10 }} />
                                        <YAxis tickFormatter={(val) => `$${val / 1000}k`} tick={{ fontSize: 10 }} width={40} />
                                        <Tooltip formatter={(val) => formatCurrency(val)} />
                                        <Legend wrapperStyle={{ fontSize: '10px' }} />
                                        <Line type="monotone" dataKey="effectiveGrossIncome" name="Revenue" stroke="#10b981" strokeWidth={2} dot={false} isAnimationActive={false} />
                                        <Line type="monotone" dataKey="totalExpenses" name="Expenses" stroke="#ef4444" strokeWidth={2} dot={false} isAnimationActive={false} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Exit Analysis */}
                <section className="mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                        Exit Analysis (Year {taxMarket.holdPeriod})
                    </h2>
                    <table className="w-full text-sm">
                        <tbody className="divide-y divide-gray-100">
                            <tr>
                                <td className="py-2 text-gray-600">Projected Sale Price</td>
                                <td className="py-2 text-right font-medium">{formatCurrency(metrics.exitAnalysis.grossSalePrice)}</td>
                            </tr>
                            <tr>
                                <td className="py-2 text-gray-600">Less: Selling Costs</td>
                                <td className="py-2 text-right font-medium">({formatCurrency(metrics.exitAnalysis.sellingCosts)})</td>
                            </tr>
                            <tr>
                                <td className="py-2 text-gray-600">Less: Loan Balance</td>
                                <td className="py-2 text-right font-medium">({formatCurrency(metrics.exitAnalysis.loanBalanceAtExit)})</td>
                            </tr>
                            <tr>
                                <td className="py-2 text-gray-600">Less: Tax on Sale</td>
                                <td className="py-2 text-right font-medium">({formatCurrency(metrics.exitAnalysis.totalTaxOnSale)})</td>
                            </tr>
                            <tr className="font-bold">
                                <td className="py-2 text-gray-900">Net Cash from Sale</td>
                                <td className="py-2 text-right text-green-600">{formatCurrency(metrics.exitAnalysis.netCashFromSale)}</td>
                            </tr>
                        </tbody>
                    </table>
                </section>

                {/* Sensitivity Analysis */}
                <section>
                    <h2 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                        Sensitivity Analysis
                    </h2>
                    <div className="space-y-6">
                        {/* Table 1: IRR */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-700 mb-2">IRR: Purchase Price vs. Exit Cap Rate</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs border-collapse">
                                    <thead>
                                        <tr>
                                            <th className="border border-gray-200 bg-gray-50 p-2 font-medium text-gray-600 w-32">Exit Cap ↓ / Price →</th>
                                            {priceRange.map(p => (
                                                <th key={p} className="border border-gray-200 bg-gray-50 p-2 font-medium text-gray-600 text-center">
                                                    {formatCurrency(p)}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {priceMatrix.map((row, yIdx) => (
                                            <tr key={yIdx}>
                                                <td className="border border-gray-200 bg-gray-50 p-2 font-medium text-gray-600 text-center w-32">
                                                    {exitCapRange[yIdx].toFixed(1)}%
                                                </td>
                                                {row.map((val, xIdx) => (
                                                    <td key={xIdx} className={`border border-gray-200 p-2 text-center font-medium ${getColor(val, 'irr')}`}>
                                                        {val !== null ? `${val.toFixed(1)}%` : 'N/A'}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Table 2: CoC */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-700 mb-2">Cash-on-Cash: Rent vs. Occupancy</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs border-collapse">
                                    <thead>
                                        <tr>
                                            <th className="border border-gray-200 bg-gray-50 p-2 font-medium text-gray-600 w-32">Occ. ↓ / Rent →</th>
                                            {rentRange.map(r => (
                                                <th key={r} className="border border-gray-200 bg-gray-50 p-2 font-medium text-gray-600 text-center">
                                                    {operations.inputMode === 'commercial' ? formatCurrency(r) : formatCurrency(r)}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {cocMatrix.map((row, yIdx) => (
                                            <tr key={yIdx}>
                                                <td className="border border-gray-200 bg-gray-50 p-2 font-medium text-gray-600 text-center w-32">
                                                    {occupancyRange[yIdx].toFixed(1)}%
                                                </td>
                                                {row.map((val, xIdx) => (
                                                    <td key={xIdx} className={`border border-gray-200 p-2 text-center font-medium ${getColor(val, 'coc')}`}>
                                                        {val !== null ? `${val.toFixed(1)}%` : 'N/A'}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <div className="mt-8 pt-4 border-t border-gray-200 text-xs text-gray-500 text-center">
                    This investment memorandum is for informational purposes only and does not constitute financial advice.
                </div>
            </div>
        </div>
    );
};

export default InvestmentMemo;
