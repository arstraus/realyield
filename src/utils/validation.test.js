import { describe, it, expect } from 'vitest';
import {
    validateField,
    validateObject,
    validateProperty,
    validateFinancing,
    hasErrors,
    getAllErrorMessages,
    VALIDATION_RULES,
} from './validation';

describe('validateField', () => {
    it('returns error for required empty field', () => {
        const errors = validateField('', { required: true });
        expect(errors).toContain('This field is required');
    });

    it('returns error for required null field', () => {
        const errors = validateField(null, { required: true });
        expect(errors).toContain('This field is required');
    });

    it('returns error for NaN value', () => {
        const errors = validateField('abc', { min: 0, max: 100 });
        expect(errors).toContain('Must be a valid number');
    });

    it('returns error for value below minimum', () => {
        const errors = validateField(-5, { min: 0, max: 100 });
        expect(errors).toContain('Must be at least 0');
    });

    it('returns error for value above maximum', () => {
        const errors = validateField(150, { min: 0, max: 100 });
        expect(errors).toContain('Must be at most 100');
    });

    it('returns empty array for valid value', () => {
        const errors = validateField(50, { min: 0, max: 100, required: true });
        expect(errors).toHaveLength(0);
    });

    it('allows optional empty field', () => {
        const errors = validateField('', { required: false, min: 0 });
        expect(errors).toHaveLength(0);
    });
});

describe('validateObject', () => {
    it('validates all fields in object', () => {
        const obj = {
            purchasePrice: -100,
            landValuePercent: 150,
        };
        const errors = validateObject(obj, 'property');
        expect(errors.purchasePrice).toBeDefined();
        expect(errors.landValuePercent).toBeDefined();
    });

    it('returns empty object for valid data', () => {
        const obj = {
            purchasePrice: 500000,
            buildingSize: 5000,
            rehabCosts: 50000,
            afterRepairValue: 600000,
            landValuePercent: 20,
        };
        const errors = validateObject(obj, 'property');
        expect(Object.keys(errors)).toHaveLength(0);
    });

    it('returns empty object for unknown rules key', () => {
        const errors = validateObject({}, 'nonexistent');
        expect(Object.keys(errors)).toHaveLength(0);
    });
});

describe('validateProperty', () => {
    it('validates basic property fields', () => {
        const property = {
            purchasePrice: 500000,
            landValuePercent: 20,
            afterRepairValue: 500000,
        };
        const errors = validateProperty(property);
        expect(hasErrors(errors)).toBe(false);
    });

    it('validates ARV against purchase + rehab', () => {
        const property = {
            purchasePrice: 500000,
            rehabCosts: 100000,
            afterRepairValue: 500000, // Should be at least 600000
            landValuePercent: 20,
        };
        const errors = validateProperty(property);
        expect(errors.afterRepairValue).toBeDefined();
    });

    it('allows valid ARV', () => {
        const property = {
            purchasePrice: 500000,
            rehabCosts: 100000,
            afterRepairValue: 700000,
            landValuePercent: 20,
        };
        const errors = validateProperty(property);
        expect(errors.afterRepairValue).toBeUndefined();
    });
});

describe('validateFinancing', () => {
    it('validates financing fields', () => {
        const financing = {
            downPaymentPercent: 25,
            interestRate: 7,
            loanTermYears: 30,
        };
        const errors = validateFinancing(financing);
        expect(hasErrors(errors)).toBe(false);
    });

    it('rejects invalid interest rate', () => {
        const financing = {
            downPaymentPercent: 25,
            interestRate: 50, // Max is 30
            loanTermYears: 30,
        };
        const errors = validateFinancing(financing);
        expect(errors.interestRate).toBeDefined();
    });

    it('rejects invalid down payment', () => {
        const financing = {
            downPaymentPercent: 150, // Max is 100
            interestRate: 7,
            loanTermYears: 30,
        };
        const errors = validateFinancing(financing);
        expect(errors.downPaymentPercent).toBeDefined();
    });
});

describe('hasErrors', () => {
    it('returns true for object with errors', () => {
        expect(hasErrors({ field: ['error'] })).toBe(true);
    });

    it('returns false for empty object', () => {
        expect(hasErrors({})).toBe(false);
    });
});

describe('getAllErrorMessages', () => {
    it('flattens all error messages', () => {
        const errors = {
            field1: ['Error 1', 'Error 2'],
            field2: ['Error 3'],
        };
        const messages = getAllErrorMessages(errors);
        expect(messages).toHaveLength(3);
        expect(messages).toContain('field1: Error 1');
        expect(messages).toContain('field1: Error 2');
        expect(messages).toContain('field2: Error 3');
    });

    it('returns empty array for no errors', () => {
        const messages = getAllErrorMessages({});
        expect(messages).toHaveLength(0);
    });
});

describe('VALIDATION_RULES', () => {
    it('has rules for all main categories', () => {
        expect(VALIDATION_RULES.property).toBeDefined();
        expect(VALIDATION_RULES.financing).toBeDefined();
        expect(VALIDATION_RULES.operations).toBeDefined();
        expect(VALIDATION_RULES.taxMarket).toBeDefined();
        expect(VALIDATION_RULES.closingCosts).toBeDefined();
    });

    it('has reasonable limits for interest rate', () => {
        expect(VALIDATION_RULES.financing.interestRate.min).toBe(0);
        expect(VALIDATION_RULES.financing.interestRate.max).toBe(30);
    });

    it('has reasonable limits for vacancy rate', () => {
        expect(VALIDATION_RULES.operations.vacancyRate.min).toBe(0);
        expect(VALIDATION_RULES.operations.vacancyRate.max).toBe(100);
    });
});
