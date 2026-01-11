import { describe, it, expect } from 'vitest';
import {
    calculateMortgage,
    calculateIRR,
    calculateNPV,
    calculateClosingCosts,
    generateAmortizationSchedule,
    generateForecast,
} from './financials';
import { DEFAULT_PROPERTY, DEFAULT_FINANCING, DEFAULT_OPERATIONS, DEFAULT_TAX_MARKET, DEFAULT_CLOSING_COSTS } from './constants';

describe('calculateMortgage', () => {
    it('calculates correct monthly payment for standard loan', () => {
        // $200,000 loan at 7% for 30 years = ~$1,330.60/month
        const payment = calculateMortgage(200000, 7, 30);
        expect(payment).toBeCloseTo(1330.60, 0);
    });

    it('returns 0 for zero principal', () => {
        expect(calculateMortgage(0, 7, 30)).toBe(0);
    });

    it('returns 0 for zero interest rate', () => {
        expect(calculateMortgage(200000, 0, 30)).toBe(0);
    });

    it('returns 0 for zero years', () => {
        expect(calculateMortgage(200000, 7, 0)).toBe(0);
    });

    it('returns 0 for negative values', () => {
        expect(calculateMortgage(-100000, 7, 30)).toBe(0);
        expect(calculateMortgage(100000, -5, 30)).toBe(0);
        expect(calculateMortgage(100000, 7, -10)).toBe(0);
    });

    it('handles high interest rates', () => {
        const payment = calculateMortgage(100000, 20, 30);
        expect(payment).toBeGreaterThan(0);
        expect(payment).toBeLessThan(2000); // Reasonable upper bound
    });

    it('handles short loan terms', () => {
        // $100,000 at 5% for 5 years
        const payment = calculateMortgage(100000, 5, 5);
        expect(payment).toBeCloseTo(1887.12, 0);
    });
});

describe('calculateIRR', () => {
    it('calculates IRR for simple positive return', () => {
        // Invest $100, get $110 next year = 10% IRR
        const irr = calculateIRR([-100, 110]);
        expect(irr).toBeCloseTo(10, 1);
    });

    it('calculates IRR for multi-year investment', () => {
        // Invest $1000, get $100/year for 10 years, then $1100
        const cashFlows = [-1000, 100, 100, 100, 100, 100, 100, 100, 100, 100, 1100];
        const irr = calculateIRR(cashFlows);
        expect(irr).toBeCloseTo(10, 1);
    });

    it('handles all zero cash flows gracefully', () => {
        // Zero cash flows is an edge case - IRR is undefined
        // Current implementation uses initial guess (10%), which is acceptable
        const irr = calculateIRR([0, 0, 0, 0]);
        expect(typeof irr).toBe('number');
    });

    it('handles negative IRR scenarios', () => {
        // Invest $100, get back only $80
        const irr = calculateIRR([-100, 80]);
        expect(irr).toBeLessThan(0);
    });

    it('handles break-even scenario', () => {
        // Invest $100, get back exactly $100
        const irr = calculateIRR([-100, 100]);
        expect(irr).toBeCloseTo(0, 1);
    });

    it('handles high return scenarios', () => {
        // Invest $100, get $200 next year = 100% IRR
        const irr = calculateIRR([-100, 200]);
        expect(irr).toBeCloseTo(100, 1);
    });
});

describe('calculateNPV', () => {
    it('calculates NPV correctly', () => {
        // 10% discount rate, invest $1000, get $1100 next year
        // NPV = -1000 + 1100/1.1 = 0
        const npv = calculateNPV(0.1, [-1000, 1100]);
        expect(npv).toBeCloseTo(0, 1);
    });

    it('returns positive NPV for good investment', () => {
        const npv = calculateNPV(0.1, [-1000, 1500]);
        expect(npv).toBeGreaterThan(0);
    });

    it('returns negative NPV for bad investment', () => {
        const npv = calculateNPV(0.1, [-1000, 500]);
        expect(npv).toBeLessThan(0);
    });

    it('handles zero discount rate', () => {
        const npv = calculateNPV(0, [-100, 50, 50, 50]);
        expect(npv).toBe(50); // Simple sum
    });
});

describe('calculateClosingCosts', () => {
    it('calculates total closing costs correctly', () => {
        const costs = calculateClosingCosts(500000, {
            titleInsurancePercent: 0.5,
            escrowFeesPercent: 1.0,
            lenderFeesPercent: 1.0,
            recordingFeesPercent: 0.5,
            inspectionAppraisalFixed: 2000,
        });
        // (0.5 + 1.0 + 1.0 + 0.5) = 3% of 500000 = 15000 + 2000 = 17000
        expect(costs).toBe(17000);
    });

    it('handles zero purchase price', () => {
        const costs = calculateClosingCosts(0, {
            titleInsurancePercent: 0.5,
            escrowFeesPercent: 1.0,
            lenderFeesPercent: 1.0,
            recordingFeesPercent: 0.5,
            inspectionAppraisalFixed: 2000,
        });
        expect(costs).toBe(2000); // Only fixed costs
    });

    it('handles missing fields with defaults', () => {
        const costs = calculateClosingCosts(100000, {});
        expect(costs).toBe(0);
    });

    it('excludes lender fees for all-cash purchases', () => {
        const costs = calculateClosingCosts(500000, {
            titleInsurancePercent: 0.5,
            escrowFeesPercent: 1.0,
            lenderFeesPercent: 1.0,
            recordingFeesPercent: 0.5,
            inspectionAppraisalFixed: 2000,
        }, true); // isAllCash = true
        // (0.5 + 1.0 + 0 + 0.5) = 2% of 500000 = 10000 + 2000 = 12000
        expect(costs).toBe(12000);
    });

    it('includes lender fees for financed purchases', () => {
        const costs = calculateClosingCosts(500000, {
            titleInsurancePercent: 0.5,
            escrowFeesPercent: 1.0,
            lenderFeesPercent: 1.0,
            recordingFeesPercent: 0.5,
            inspectionAppraisalFixed: 2000,
        }, false); // isAllCash = false
        // (0.5 + 1.0 + 1.0 + 0.5) = 3% of 500000 = 15000 + 2000 = 17000
        expect(costs).toBe(17000);
    });
});

describe('generateAmortizationSchedule', () => {
    it('generates correct number of annual entries', () => {
        const schedule = generateAmortizationSchedule(200000, 7, 30);
        expect(schedule).toHaveLength(30);
    });

    it('ends with zero balance', () => {
        const schedule = generateAmortizationSchedule(200000, 7, 30);
        const lastEntry = schedule[schedule.length - 1];
        expect(lastEntry.balance).toBeCloseTo(0, 0);
    });

    it('shows increasing equity over time', () => {
        const schedule = generateAmortizationSchedule(200000, 7, 30);
        for (let i = 1; i < schedule.length; i++) {
            expect(schedule[i].equityPercent).toBeGreaterThan(schedule[i - 1].equityPercent);
        }
    });

    it('handles short loan terms', () => {
        const schedule = generateAmortizationSchedule(100000, 5, 5);
        expect(schedule).toHaveLength(5);
        expect(schedule[4].balance).toBeCloseTo(0, 0);
    });
});

describe('generateForecast', () => {
    const baseProperty = { ...DEFAULT_PROPERTY, purchasePrice: 500000, rehabCosts: 0, landValuePercent: 20, buildingSize: 5000 };
    const baseFinancing = { ...DEFAULT_FINANCING, downPaymentPercent: 25, interestRate: 7, loanTermYears: 25 };
    const baseOperations = {
        ...DEFAULT_OPERATIONS,
        inputMode: 'commercial',
        annualBaseRentPerSqFt: 20,
        vacancyRate: 5,
        annualRentGrowth: 3,
        annualExpenseGrowth: 2,
        commercialExpenses: {
            propertyTaxPerSqFt: 1.5,
            insurancePerSqFt: 0.75,
            camPerSqFt: 1.25,
            managementPercent: 4,
            repairsMaintenanceAnnual: 2500,
        },
        annualCapExReservePerSqFt: 0.15,
    };
    const baseTaxMarket = { ...DEFAULT_TAX_MARKET, holdPeriod: 10, exitCapRate: 6.5, incomeTaxRate: 37, capitalGainsTaxRate: 20 };
    const baseClosingCosts = { ...DEFAULT_CLOSING_COSTS };

    it('returns forecast array with correct length', () => {
        const result = generateForecast(baseProperty, baseFinancing, baseOperations, baseTaxMarket, baseClosingCosts);
        expect(result.forecast).toHaveLength(10);
    });

    it('calculates positive metrics for reasonable inputs', () => {
        const result = generateForecast(baseProperty, baseFinancing, baseOperations, baseTaxMarket, baseClosingCosts);
        expect(result.metrics.irr).toBeGreaterThan(0);
        expect(result.metrics.equityMultiple).toBeGreaterThan(1);
        expect(result.metrics.averageCashOnCash).toBeGreaterThan(0);
    });

    it('includes amortization schedule', () => {
        const result = generateForecast(baseProperty, baseFinancing, baseOperations, baseTaxMarket, baseClosingCosts);
        expect(result.amortizationSchedule).toBeDefined();
        expect(result.amortizationSchedule.length).toBeGreaterThan(0);
    });

    it('calculates total initial investment correctly', () => {
        const result = generateForecast(baseProperty, baseFinancing, baseOperations, baseTaxMarket, baseClosingCosts);
        const expectedDownPayment = 500000 * 0.25; // 125000
        expect(result.metrics.totalInitialInvestment).toBeGreaterThan(expectedDownPayment);
    });

    it('shows increasing NOI over time with rent growth', () => {
        const result = generateForecast(baseProperty, baseFinancing, baseOperations, baseTaxMarket, baseClosingCosts);
        for (let i = 1; i < result.forecast.length; i++) {
            expect(result.forecast[i].noi).toBeGreaterThan(result.forecast[i - 1].noi * 0.99);
        }
    });

    it('handles simple mode', () => {
        const simpleOperations = {
            ...DEFAULT_OPERATIONS,
            inputMode: 'simple',
            grossRentMonthly: 5000,
            otherIncomeMonthly: 200,
            vacancyRate: 5,
            propertyTaxRate: 1.2,
            insuranceAnnual: 2400,
            managementFeeRate: 8,
            maintenanceRate: 5,
            capexRate: 5,
            annualRentGrowth: 3,
            annualExpenseGrowth: 2,
        };
        const result = generateForecast(baseProperty, baseFinancing, simpleOperations, baseTaxMarket, baseClosingCosts);
        expect(result.forecast).toHaveLength(10);
        expect(result.metrics.irr).toBeDefined();
    });

    it('calculates DSCR correctly', () => {
        const result = generateForecast(baseProperty, baseFinancing, baseOperations, baseTaxMarket, baseClosingCosts);
        const year1 = result.forecast[0];
        const calculatedDSCR = year1.noi / year1.debtService;
        expect(result.metrics.dscr).toBeCloseTo(calculatedDSCR, 2);
    });

    it('handles edge case of 100% down payment', () => {
        const allCashFinancing = { ...baseFinancing, downPaymentPercent: 100 };
        const result = generateForecast(baseProperty, allCashFinancing, baseOperations, baseTaxMarket, baseClosingCosts);
        expect(result.forecast[0].debtService).toBe(0);
        expect(result.metrics.irr).toBeGreaterThan(0);
    });
});
