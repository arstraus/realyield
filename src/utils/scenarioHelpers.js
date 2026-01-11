import { DEFAULT_PROPERTY, DEFAULT_FINANCING, DEFAULT_OPERATIONS, DEFAULT_TAX_MARKET, DEFAULT_CLOSING_COSTS } from './constants';

/**
 * Merges scenario data with defaults to ensure all fields exist
 * @param {Object} data - Scenario data to merge
 * @returns {Object} Merged scenario with all defaults applied
 */
export const mergeScenarioData = (data) => {
    if (!data) return null;

    return {
        property: data.property
            ? { ...DEFAULT_PROPERTY, ...data.property }
            : DEFAULT_PROPERTY,
        financing: data.financing
            ? { ...DEFAULT_FINANCING, ...data.financing }
            : DEFAULT_FINANCING,
        operations: data.operations
            ? {
                ...DEFAULT_OPERATIONS,
                ...data.operations,
                commercialExpenses: {
                    ...DEFAULT_OPERATIONS.commercialExpenses,
                    ...(data.operations?.commercialExpenses || {}),
                },
            }
            : DEFAULT_OPERATIONS,
        taxMarket: data.taxMarket
            ? { ...DEFAULT_TAX_MARKET, ...data.taxMarket }
            : DEFAULT_TAX_MARKET,
        closingCosts: data.closingCosts
            ? { ...DEFAULT_CLOSING_COSTS, ...data.closingCosts }
            : DEFAULT_CLOSING_COSTS,
        scenarioName: data.scenarioName || 'Untitled Analysis',
    };
};

/**
 * Creates a scenario data object from current state
 * @param {Object} params - Current scenario state
 * @returns {Object} Scenario data object ready for saving
 */
export const createScenarioData = ({ scenarioName, property, financing, operations, taxMarket, closingCosts }) => {
    return {
        scenarioName,
        property,
        financing,
        operations,
        taxMarket,
        closingCosts,
    };
};
