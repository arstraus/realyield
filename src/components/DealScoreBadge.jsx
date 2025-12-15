import React from 'react';

const DealScoreBadge = ({ grade, score, breakdown, size = 'large' }) => {
    const getGradeColor = (grade) => {
        switch (grade) {
            case 'A': return 'bg-emerald-500 text-white';
            case 'B': return 'bg-green-500 text-white';
            case 'C': return 'bg-yellow-500 text-white';
            case 'D': return 'bg-orange-500 text-white';
            case 'F': return 'bg-red-500 text-white';
            default: return 'bg-gray-500 text-white';
        }
    };

    const getGradeLabel = (grade) => {
        switch (grade) {
            case 'A': return 'Excellent';
            case 'B': return 'Good';
            case 'C': return 'Fair';
            case 'D': return 'Below Average';
            case 'F': return 'Poor';
            default: return 'Unknown';
        }
    };

    if (size === 'small') {
        return (
            <div className={`inline-flex items-center px-3 py-1 rounded-full ${getGradeColor(grade)} font-bold text-sm`}>
                {grade}
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-semibold text-gray-900">Deal Score</h3>
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${getGradeColor(grade)} text-xl font-bold`}>
                    {grade}
                </div>
            </div>
            <p className="text-sm font-medium text-gray-600 mb-3 border-b border-gray-50 pb-2">
                {getGradeLabel(grade)} <span className="text-gray-400 mx-1">•</span> {score}/100
            </p>

            {breakdown && (
                <div className="space-y-3">
                    <div className="space-y-1">
                        <div className="flex justify-between text-xs items-center">
                            <span className="text-gray-500">IRR (40%)</span>
                            <span className="font-semibold text-gray-700">{breakdown.irr.score}</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5">
                            <div
                                className="bg-emerald-500 h-1.5 rounded-full transition-all"
                                style={{ width: `${breakdown.irr.score}%` }}
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <div className="flex justify-between text-xs items-center">
                            <span className="text-gray-500">Cash-on-Cash (30%)</span>
                            <span className="font-semibold text-gray-700">{breakdown.cashOnCash.score}</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5">
                            <div
                                className="bg-emerald-500 h-1.5 rounded-full transition-all"
                                style={{ width: `${breakdown.cashOnCash.score}%` }}
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <div className="flex justify-between text-xs items-center">
                            <span className="text-gray-500">Equity Multiple (30%)</span>
                            <span className="font-semibold text-gray-700">{breakdown.equityMultiple.score}</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5">
                            <div
                                className="bg-emerald-500 h-1.5 rounded-full transition-all"
                                style={{ width: `${breakdown.equityMultiple.score}%` }}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DealScoreBadge;
