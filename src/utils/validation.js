/**
 * Input validation utilities for real estate analyzer
 */

export const VALIDATION_RULES = {
    property: {
        purchasePrice: { min: 0, max: 1000000000, required: true },
        buildingSize: { min: 0, max: 10000000, required: false },
        rehabCosts: { min: 0, max: 100000000, required: false },
        afterRepairValue: { min: 0, max: 1000000000, required: false },
        landValuePercent: { min: 0, max: 100, required: true },
    },
    financing: {
        downPaymentPercent: { min: 0, max: 100, required: true },
        interestRate: { min: 0, max: 30, required: true },
        loanTermYears: { min: 1, max: 50, required: true },
    },
    operations: {
        vacancyRate: { min: 0, max: 100, required: true },
        annualRentGrowth: { min: -50, max: 50, required: true },
        annualExpenseGrowth: { min: -50, max: 50, required: true },
        grossRentMonthly: { min: 0, max: 10000000, required: false },
        annualBaseRentPerSqFt: { min: 0, max: 1000, required: false },
        managementFeeRate: { min: 0, max: 100, required: false },
        maintenanceRate: { min: 0, max: 100, required: false },
        capexRate: { min: 0, max: 100, required: false },
    },
    taxMarket: {
        incomeTaxRate: { min: 0, max: 100, required: true },
        capitalGainsTaxRate: { min: 0, max: 100, required: true },
        sellingCosts: { min: 0, max: 100, required: true },
        discountRate: { min: 0, max: 100, required: true },
        exitCapRate: { min: 0, max: 100, required: false },
        holdPeriod: { min: 1, max: 50, required: true },
        depreciationYears: { min: 1, max: 100, required: true },
    },
    closingCosts: {
        titleInsurancePercent: { min: 0, max: 10, required: true },
        escrowFeesPercent: { min: 0, max: 10, required: true },
        lenderFeesPercent: { min: 0, max: 10, required: true },
        recordingFeesPercent: { min: 0, max: 5, required: true },
        inspectionAppraisalFixed: { min: 0, max: 50000, required: true },
    }
};

/**
 * Validates a single field value against its rules
 */
export const validateField = (value, rules) => {
    const errors = [];

    // Check if value is empty/missing
    const isEmpty = value === null || value === undefined || value === '';

    if (rules.required && isEmpty) {
        errors.push('This field is required');
        return errors;
    }

    // If optional and empty, skip validation
    if (!rules.required && isEmpty) {
        return errors;
    }

    const numValue = parseFloat(value);

    if (isNaN(numValue)) {
        errors.push('Must be a valid number');
        return errors;
    }

    if (rules.min !== undefined && numValue < rules.min) {
        errors.push(`Must be at least ${rules.min}`);
    }

    if (rules.max !== undefined && numValue > rules.max) {
        errors.push(`Must be at most ${rules.max}`);
    }

    return errors;
};

/**
 * Validates an entire object against validation rules
 */
export const validateObject = (obj, rulesKey) => {
    const rules = VALIDATION_RULES[rulesKey];
    const errors = {};

    if (!rules) return errors;

    Object.keys(rules).forEach(field => {
        const fieldErrors = validateField(obj[field], rules[field]);
        if (fieldErrors.length > 0) {
            errors[field] = fieldErrors;
        }
    });

    return errors;
};

/**
 * Validates property inputs
 */
export const validateProperty = (property) => {
    const errors = validateObject(property, 'property');

    // Custom validation: ARV should be >= purchase price + rehab
    if (property.afterRepairValue && property.purchasePrice && property.rehabCosts) {
        const minARV = property.purchasePrice + property.rehabCosts;
        if (property.afterRepairValue < minARV) {
            errors.afterRepairValue = errors.afterRepairValue || [];
            errors.afterRepairValue.push(`Should be at least ${minARV.toLocaleString()} (purchase + rehab)`);
        }
    }

    return errors;
};

/**
 * Validates financing inputs
 */
export const validateFinancing = (financing) => {
    return validateObject(financing, 'financing');
};

/**
 * Validates operations inputs
 */
export const validateOperations = (operations) => {
    return validateObject(operations, 'operations');
};

/**
 * Validates tax and market inputs
 */
export const validateTaxMarket = (taxMarket) => {
    return validateObject(taxMarket, 'taxMarket');
};

/**
 * Validates closing costs inputs
 */
export const validateClosingCosts = (closingCosts) => {
    return validateObject(closingCosts, 'closingCosts');
};

/**
 * Checks if an object has any validation errors
 */
export const hasErrors = (errors) => {
    return Object.keys(errors).length > 0;
};

/**
 * Gets all error messages from an errors object
 */
export const getAllErrorMessages = (errors) => {
    const messages = [];
    Object.keys(errors).forEach(field => {
        if (Array.isArray(errors[field])) {
            errors[field].forEach(msg => messages.push(`${field}: ${msg}`));
        }
    });
    return messages;
};
