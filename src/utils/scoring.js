/**
 * Calculate deal score based on key investment metrics
 * @param {Object} metrics - Investment metrics from generateForecast
 * @returns {Object} { grade: 'A'|'B'|'C'|'D'|'F', score: 0-100, breakdown: {...} }
 */
export const calculateDealScore = (metrics) => {
    // IRR Score (40% weight)
    const irrScore = scoreMetric(metrics.irrAfterTax, [
        { min: 15, score: 100 },
        { min: 12, score: 85 },
        { min: 8, score: 70 },
        { min: 5, score: 55 },
        { min: 0, score: 40 },
        { min: -Infinity, score: 0 }
    ]);

    // Cash-on-Cash Score (30% weight)
    const cocScore = scoreMetric(metrics.averageCashOnCashAfterTax, [
        { min: 10, score: 100 },
        { min: 7, score: 85 },
        { min: 5, score: 70 },
        { min: 3, score: 55 },
        { min: 0, score: 40 },
        { min: -Infinity, score: 0 }
    ]);

    // Equity Multiple Score (30% weight)
    const emScore = scoreMetric(metrics.equityMultipleAfterTax, [
        { min: 2.5, score: 100 },
        { min: 2.0, score: 85 },
        { min: 1.5, score: 70 },
        { min: 1.2, score: 55 },
        { min: 1.0, score: 40 },
        { min: -Infinity, score: 0 }
    ]);

    // Weighted total
    const totalScore = (irrScore * 0.4) + (cocScore * 0.3) + (emScore * 0.3);

    // Convert to letter grade
    let grade;
    if (totalScore >= 90) grade = 'A';
    else if (totalScore >= 80) grade = 'B';
    else if (totalScore >= 70) grade = 'C';
    else if (totalScore >= 60) grade = 'D';
    else grade = 'F';

    return {
        grade,
        score: Math.round(totalScore),
        breakdown: {
            irr: { score: Math.round(irrScore), weight: 40 },
            cashOnCash: { score: Math.round(cocScore), weight: 30 },
            equityMultiple: { score: Math.round(emScore), weight: 30 }
        }
    };
};

const scoreMetric = (value, thresholds) => {
    for (let i = 0; i < thresholds.length; i++) {
        if (value >= thresholds[i].min) {
            return thresholds[i].score;
        }
    }
    return 0;
};
