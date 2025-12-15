export const DEFAULT_PROPERTY = {
    name: '',
    address: '',
    city: '',
    state: '',
    purchasePrice: 2000000,
    rehabCosts: 0,
    afterRepairValue: 2000000,
    landValuePercent: 20,
    buildingSize: 10000, // sq ft
};

export const DEFAULT_CLOSING_COSTS = {
    titleInsurancePercent: 0.5,
    escrowFeesPercent: 1.0,
    lenderFeesPercent: 1.0,
    recordingFeesPercent: 0.5,
    inspectionAppraisalFixed: 2000,
};


export const DEFAULT_FINANCING = {
    downPaymentPercent: 25,
    interestRate: 7.0,
    loanTermYears: 25,
};

export const DEFAULT_OPERATIONS = {
    // Mode: 'simple' (Monthly Gross) or 'commercial' (Annual/SF NNN)
    inputMode: 'commercial',

    // Simple Mode Inputs
    grossRentMonthly: 4000,
    otherIncomeMonthly: 0,
    operatingExpensesMonthly: 0,

    // Commercial/NNN Inputs
    annualBaseRentPerSqFt: 18.00,
    annualRentGrowth: 3,
    vacancyRate: 5,
    otherIncomePercent: 0, // % of Rent

    // Expenses (can be used for both, but usually detailed for commercial)
    propertyTaxRate: 1.50, // $/SF for commercial, % value for simple? Let's standardize or split.
    // Image shows Property Taxes ($/SF) 1.50.
    // Let's use specific keys for commercial expenses
    commercialExpenses: {
        propertyTaxPerSqFt: 1.50,
        insurancePerSqFt: 0.75,
        camPerSqFt: 1.25,
        managementPercent: 4.0,
        leasingCommissionsPercent: 0,
        repairsMaintenanceAnnual: 2500,
    },

    // Shared/Simple
    expenseRatio: 35,
    annualExpenseGrowth: 2,
    insuranceAnnual: 1200,
    managementFeeRate: 8,
    maintenanceRate: 5,
    capexRate: 5,

    // Capex
    initialCapEx: 25000,
    annualCapExReservePerSqFt: 0.15,
};

export const DEFAULT_TAX_MARKET = {
    incomeTaxRate: 37,
    capitalGainsTaxRate: 20,
    depreciationYears: 39, // Commercial standard
    sellingCosts: 3,
    discountRate: 10,
    exitCapRate: 6.5,
    holdPeriod: 10,
};
