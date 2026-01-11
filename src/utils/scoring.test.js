import { describe, it, expect } from 'vitest';
import { calculateDealScore } from './scoring';

describe('calculateDealScore', () => {
    it('returns A grade for excellent metrics', () => {
        const metrics = {
            irrAfterTax: 20,
            averageCashOnCashAfterTax: 12,
            equityMultipleAfterTax: 3.0,
        };
        const result = calculateDealScore(metrics);
        expect(result.grade).toBe('A');
        expect(result.score).toBeGreaterThanOrEqual(90);
    });

    it('returns B grade for good metrics', () => {
        const metrics = {
            irrAfterTax: 12,
            averageCashOnCashAfterTax: 7,
            equityMultipleAfterTax: 2.0,
        };
        const result = calculateDealScore(metrics);
        expect(result.grade).toBe('B');
        expect(result.score).toBeGreaterThanOrEqual(80);
        expect(result.score).toBeLessThan(90);
    });

    it('returns C grade for average metrics', () => {
        const metrics = {
            irrAfterTax: 8,
            averageCashOnCashAfterTax: 5,
            equityMultipleAfterTax: 1.5,
        };
        const result = calculateDealScore(metrics);
        expect(result.grade).toBe('C');
        expect(result.score).toBeGreaterThanOrEqual(70);
        expect(result.score).toBeLessThan(80);
    });

    it('returns D grade for below average metrics', () => {
        // Score calculation: IRR 6% -> 55 (40%), CoC 4% -> 55 (30%), EM 1.25 -> 55 (30%)
        // Total = 55*0.4 + 55*0.3 + 55*0.3 = 55, which is F
        // For D grade (60-70), we need higher values
        const metrics = {
            irrAfterTax: 8,  // Gets 70 points
            averageCashOnCashAfterTax: 5,  // Gets 70 points
            equityMultipleAfterTax: 1.2,  // Gets 55 points
        };
        const result = calculateDealScore(metrics);
        // 70*0.4 + 70*0.3 + 55*0.3 = 28 + 21 + 16.5 = 65.5
        expect(result.grade).toBe('D');
        expect(result.score).toBeGreaterThanOrEqual(60);
        expect(result.score).toBeLessThan(70);
    });

    it('returns F grade for poor metrics', () => {
        const metrics = {
            irrAfterTax: 2,
            averageCashOnCashAfterTax: 1,
            equityMultipleAfterTax: 0.9,
        };
        const result = calculateDealScore(metrics);
        expect(result.grade).toBe('F');
        expect(result.score).toBeLessThan(60);
    });

    it('handles negative IRR', () => {
        const metrics = {
            irrAfterTax: -5,
            averageCashOnCashAfterTax: -2,
            equityMultipleAfterTax: 0.5,
        };
        const result = calculateDealScore(metrics);
        expect(result.grade).toBe('F');
        expect(result.score).toBe(0);
    });

    it('includes breakdown with correct weights', () => {
        const metrics = {
            irrAfterTax: 15,
            averageCashOnCashAfterTax: 10,
            equityMultipleAfterTax: 2.5,
        };
        const result = calculateDealScore(metrics);
        expect(result.breakdown.irr.weight).toBe(40);
        expect(result.breakdown.cashOnCash.weight).toBe(30);
        expect(result.breakdown.equityMultiple.weight).toBe(30);
    });

    it('handles zero metrics', () => {
        const metrics = {
            irrAfterTax: 0,
            averageCashOnCashAfterTax: 0,
            equityMultipleAfterTax: 1.0,
        };
        const result = calculateDealScore(metrics);
        expect(result.score).toBeDefined();
        expect(result.grade).toBeDefined();
    });
});
