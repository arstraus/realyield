/**
 * Calculates the monthly mortgage payment (PI).
 * @param {number} principal Loan amount
 * @param {number} annualRate Annual interest rate (percent)
 * @param {number} years Loan term in years
 * @returns {number} Monthly payment
 */
export const calculateMortgage = (principal, annualRate, years) => {
    if (principal <= 0 || annualRate <= 0 || years <= 0) return 0;
    const monthlyRate = annualRate / 100 / 12;
    const numberOfPayments = years * 12;
    return (
        (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
        (Math.pow(1 + monthlyRate, numberOfPayments) - 1)
    );
};

const calculateAnnualInterest = (principal, rate, monthlyPayment) => {
    let balance = principal;
    let totalInterest = 0;
    const monthlyRate = rate / 100 / 12;
    for (let i = 0; i < 12; i++) {
        const interest = balance * monthlyRate;
        totalInterest += interest;
        balance = balance - (monthlyPayment - interest);
    }
    return totalInterest;
}

/**
 * Calculates Internal Rate of Return (IRR) for a series of cash flows.
 * Uses Newton-Raphson method.
 * @param {number[]} cashFlows Array of cash flows (0 is initial investment - negative)
 * @param {number} guess Initial guess (default 0.1)
 * @returns {number} IRR as a percentage (e.g., 12.5)
 */
export const calculateIRR = (cashFlows, guess = 0.1) => {
    // Handle edge cases
    if (!cashFlows || cashFlows.length < 2) return 0;

    // Check if all cash flows are zero
    const hasNonZero = cashFlows.some(cf => cf !== 0);
    if (!hasNonZero) return 0;

    // Check for valid investment pattern (negative initial, positive later or vice versa)
    const hasNegative = cashFlows.some(cf => cf < 0);
    const hasPositive = cashFlows.some(cf => cf > 0);
    if (!hasNegative || !hasPositive) return 0;

    const maxIterations = 1000;
    const precision = 0.00001;
    let rate = guess;

    for (let i = 0; i < maxIterations; i++) {
        let npv = 0;
        let derivative = 0;

        for (let t = 0; t < cashFlows.length; t++) {
            const denominator = Math.pow(1 + rate, t);
            if (denominator === 0 || !isFinite(denominator)) return 0;
            npv += cashFlows[t] / denominator;
            if (t > 0) {
                derivative -= (t * cashFlows[t]) / (denominator * (1 + rate));
            }
        }

        if (Math.abs(npv) < precision) {
            return isFinite(rate) ? rate * 100 : 0;
        }

        if (derivative === 0 || !isFinite(derivative)) return 0;
        const newRate = rate - npv / derivative;

        // Prevent divergence
        if (!isFinite(newRate) || newRate < -0.99) return 0;

        if (Math.abs(newRate - rate) < precision) {
            return isFinite(newRate) ? newRate * 100 : 0;
        }
        rate = newRate;
    }
    return 0; // Failed to converge
};

/**
 * Calculates Net Present Value (NPV).
 * @param {number} rate Discount rate (decimal, e.g., 0.08)
 * @param {number[]} cashFlows Array of cash flows (0 is initial investment)
 * @returns {number} NPV
 */
export const calculateNPV = (rate, cashFlows) => {
    return cashFlows.reduce((acc, cf, t) => acc + cf / Math.pow(1 + rate, t), 0);
};

/**
 * Calculates sensitivity matrix for IRR across two variables
 * @param {Object} baseInputs - Base scenario inputs (property, financing, operations, taxMarket, closingCosts)
 * @param {string} xVariable - Variable name for X-axis (e.g., 'exitCapRate')
 * @param {Array} xRange - Array of values for X variable
 * @param {string} yVariable - Variable name for Y-axis
 * @param {Array} yRange - Array of values for Y variable
 * @param {string} metric - Metric to calculate ('irr', 'averageCashOnCash', etc.)
 * @returns {Array} Matrix of values
 */
export const calculateSensitivityMatrix = (baseInputs, xVariable, xRange, yVariable, yRange, metric = 'irr') => {
    const matrix = [];

    for (let y of yRange) {
        const row = [];
        for (let x of xRange) {
            // Clone inputs and modify variables
            const modifiedInputs = JSON.parse(JSON.stringify(baseInputs));

            // Apply X variable change
            if (xVariable.includes('.')) {
                const [obj, key] = xVariable.split('.');
                modifiedInputs[obj][key] = x;
            } else {
                modifiedInputs.taxMarket[xVariable] = x;
            }

            // Apply Y variable change
            if (yVariable.includes('.')) {
                const [obj, key] = yVariable.split('.');
                modifiedInputs[obj][key] = y;
            } else {
                modifiedInputs.taxMarket[yVariable] = y;
            }

            // Calculate metric with modified inputs
            try {
                const results = generateForecast(
                    modifiedInputs.property,
                    modifiedInputs.financing,
                    modifiedInputs.operations,
                    modifiedInputs.taxMarket,
                    modifiedInputs.closingCosts
                );
                row.push(results.metrics[metric]);
            } catch (e) {
                row.push(null);
            }
        }
        matrix.push(row);
    }

    return matrix;
};


/**
 * Calculates total closing costs from detailed breakdown
 */
export const calculateClosingCosts = (purchasePrice, closingCosts) => {
    const percentageCosts = (
        (closingCosts.titleInsurancePercent || 0) +
        (closingCosts.escrowFeesPercent || 0) +
        (closingCosts.lenderFeesPercent || 0) +
        (closingCosts.recordingFeesPercent || 0)
    ) / 100 * purchasePrice;

    const fixedCosts = closingCosts.inspectionAppraisalFixed || 0;

    return percentageCosts + fixedCosts;
};

/**
 * Generates amortization schedule for the loan
 */
export const generateAmortizationSchedule = (principal, annualRate, years) => {
    const schedule = [];
    const monthlyRate = annualRate / 100 / 12;
    const numberOfPayments = years * 12;
    const monthlyPayment = calculateMortgage(principal, annualRate, years);

    let balance = principal;

    for (let month = 1; month <= numberOfPayments; month++) {
        const interestPayment = balance * monthlyRate;
        const principalPayment = monthlyPayment - interestPayment;
        balance -= principalPayment;

        // Store annual data (every 12 months)
        if (month % 12 === 0) {
            schedule.push({
                year: month / 12,
                balance: Math.max(0, balance),
                principalPaid: principal - balance,
                equityPercent: ((principal - balance) / principal) * 100
            });
        }
    }

    return schedule;
};

/**
 * Generates a 10-year cash flow forecast with tax and exit analysis.
 */
export const generateForecast = (property, financing, operations, taxMarket, closingCosts) => {
    const forecast = [];
    const years = taxMarket.holdPeriod || 10;
    const isCommercial = operations.inputMode === 'commercial';

    // Initial Investment
    const loanAmount = property.purchasePrice * (1 - financing.downPaymentPercent / 100);
    const downPayment = property.purchasePrice * (financing.downPaymentPercent / 100);
    const closingCostsValue = calculateClosingCosts(property.purchasePrice, closingCosts);

    const totalInitialInvestment = downPayment + closingCostsValue + property.rehabCosts + (operations.initialCapEx || 0);

    const monthlyDebtService = calculateMortgage(
        loanAmount,
        financing.interestRate,
        financing.loanTermYears
    );
    const annualDebtService = monthlyDebtService * 12;

    // Depreciation Basis
    const landValue = property.purchasePrice * (property.landValuePercent / 100);
    const depreciableBasis = property.purchasePrice - landValue + property.rehabCosts + (operations.initialCapEx || 0);
    const annualDepreciation = depreciableBasis / taxMarket.depreciationYears;

    // Initial Operating Figures
    let currentBaseRent = 0;
    let currentReimbursableExpenses = 0;
    let currentOtherIncome = 0;

    // Expenses
    let currentPropertyTax = 0;
    let currentInsurance = 0;
    let currentCAM = 0;
    let currentManagement = 0;
    let currentMaintenance = 0;
    let currentCapEx = 0;

    if (isCommercial) {
        const size = property.buildingSize || 0;
        currentBaseRent = operations.annualBaseRentPerSqFt * size;

        // NNN Expenses (Reimbursable)
        const tax = operations.commercialExpenses.propertyTaxPerSqFt * size;
        const ins = operations.commercialExpenses.insurancePerSqFt * size;
        const cam = operations.commercialExpenses.camPerSqFt * size;

        currentPropertyTax = tax;
        currentInsurance = ins;
        currentCAM = cam;

        // In NNN, these are reimbursed. We model Revenue = Base + Reimbursements.
        // Reimbursements = (Tax + Ins + CAM).
        // Note: Usually reimbursements are based on occupancy, but for simplicity we'll assume 100% pass-through potential
        // and vacancy loss applies to the total potential income.
        currentReimbursableExpenses = tax + ins + cam;

        currentOtherIncome = currentBaseRent * (operations.otherIncomePercent / 100);
    } else {
        // Simple Mode
        currentBaseRent = operations.grossRentMonthly * 12;
        currentOtherIncome = operations.otherIncomeMonthly * 12;
        currentPropertyTax = property.purchasePrice * (operations.propertyTaxRate / 100);
        currentInsurance = operations.insuranceAnnual;
    }

    let loanBalance = loanAmount;

    for (let year = 1; year <= years; year++) {
        let potentialGrossIncome = 0;
        let vacancyLoss = 0;
        let effectiveGrossIncome = 0;
        let totalExpenses = 0;

        if (isCommercial) {
            potentialGrossIncome = currentBaseRent + currentReimbursableExpenses + currentOtherIncome;
            vacancyLoss = potentialGrossIncome * (operations.vacancyRate / 100);
            effectiveGrossIncome = potentialGrossIncome - vacancyLoss;

            // Calculate Variable Expenses
            const managementFee = effectiveGrossIncome * (operations.commercialExpenses.managementPercent / 100);
            const maintenance = operations.commercialExpenses.repairsMaintenanceAnnual; // Fixed annual? Or grow?
            const reserves = (operations.annualCapExReservePerSqFt || 0) * property.buildingSize;

            totalExpenses =
                currentPropertyTax +
                currentInsurance +
                currentCAM +
                managementFee +
                maintenance +
                reserves;

        } else {
            potentialGrossIncome = currentBaseRent + currentOtherIncome;
            vacancyLoss = potentialGrossIncome * (operations.vacancyRate / 100);
            effectiveGrossIncome = potentialGrossIncome - vacancyLoss;

            const managementFee = effectiveGrossIncome * (operations.managementFeeRate / 100);
            const maintenance = effectiveGrossIncome * (operations.maintenanceRate / 100);
            const capex = effectiveGrossIncome * (operations.capexRate / 100);

            totalExpenses =
                currentPropertyTax +
                currentInsurance +
                managementFee +
                maintenance +
                capex;
        }

        const noi = effectiveGrossIncome - totalExpenses;

        const interestPayment = calculateAnnualInterest(loanBalance, financing.interestRate, monthlyDebtService);
        const principalPayment = annualDebtService - interestPayment;

        const cashFlowBeforeTax = noi - annualDebtService;

        const taxableIncome = noi - interestPayment - annualDepreciation;
        const taxLiability = taxableIncome * (taxMarket.incomeTaxRate / 100);
        const cashFlowAfterTax = cashFlowBeforeTax - taxLiability;

        forecast.push({
            year,
            potentialGrossIncome,
            vacancyLoss,
            effectiveGrossIncome,
            totalExpenses,
            noi,
            debtService: annualDebtService,
            cashFlow: cashFlowBeforeTax,
            cashFlowAfterTax,
            taxLiability,
            taxableIncome,
            principalPayment,
            interestPayment,
            loanBalanceEnd: loanBalance - principalPayment,
            cashOnCash: (cashFlowBeforeTax / totalInitialInvestment) * 100,
            cashOnCashAfterTax: (cashFlowAfterTax / totalInitialInvestment) * 100,
        });

        // Update for next year
        loanBalance -= principalPayment;

        // Growth
        const rentGrowth = operations.annualRentGrowth / 100;
        const expenseGrowth = operations.annualExpenseGrowth / 100;

        currentBaseRent *= (1 + rentGrowth);
        currentOtherIncome *= (1 + rentGrowth);

        if (isCommercial) {
            // Grow expenses
            currentPropertyTax *= (1 + expenseGrowth);
            currentInsurance *= (1 + expenseGrowth);
            currentCAM *= (1 + expenseGrowth);
            // Update reimbursements to match expenses
            currentReimbursableExpenses = currentPropertyTax + currentInsurance + currentCAM;
        } else {
            currentPropertyTax *= (1 + expenseGrowth);
            currentInsurance *= (1 + expenseGrowth);
        }
    }

    // --- Exit Analysis (Year 10) ---
    // Use Exit Cap Rate if available, else grow value?
    // Image shows "Exit Cap Rate (%)".
    let futureValue = 0;
    if (taxMarket.exitCapRate) {
        // Value = Year 11 NOI / Cap Rate
        // We need Year 11 NOI. Let's approximate by growing Year 10 NOI.
        const year10NOI = forecast[years - 1].noi;
        const nextYearNOI = year10NOI * (1 + operations.annualRentGrowth / 100); // Simplified growth
        futureValue = nextYearNOI / (taxMarket.exitCapRate / 100);
    } else {
        futureValue = property.purchasePrice * Math.pow(1 + operations.annualRentGrowth / 100, years);
    }

    const sellingCosts = futureValue * (taxMarket.sellingCosts / 100);
    const finalLoanBalance = forecast[years - 1].loanBalanceEnd;
    const netSaleProceedsBeforeTax = futureValue - sellingCosts - finalLoanBalance;

    // Cost Segregation: Additional Year 1 bonus depreciation
    const costSegBonus = taxMarket.useCostSegregation ? (taxMarket.costSegYear1Bonus || 0) : 0;
    const accumulatedDepreciation = (annualDepreciation * years) + costSegBonus;
    const adjustedBasis = property.purchasePrice + property.rehabCosts + closingCostsValue - accumulatedDepreciation;
    const capitalGain = (futureValue - sellingCosts) - adjustedBasis;

    // Calculate tax on sale with depreciation recapture
    const depreciationRecaptureRate = taxMarket.depreciationRecaptureRate || 25;
    const depreciationRecaptureTax = accumulatedDepreciation * (depreciationRecaptureRate / 100);
    const remainingGain = Math.max(0, capitalGain - accumulatedDepreciation);
    const capitalGainsTax = remainingGain * (taxMarket.capitalGainsTaxRate / 100);

    // 1031 Exchange: Defer taxes if enabled
    let taxOnSale = 0;
    let exchangeInfo = null;
    if (taxMarket.use1031Exchange) {
        const bootPercent = taxMarket.exchangeBootPercent || 0;
        const bootAmount = netSaleProceedsBeforeTax * (bootPercent / 100);
        // Only pay taxes on the boot (cash taken out)
        const bootTaxRate = (taxMarket.capitalGainsTaxRate + depreciationRecaptureRate) / 2; // Simplified blended rate
        taxOnSale = bootAmount * (bootTaxRate / 100);
        exchangeInfo = {
            enabled: true,
            bootPercent,
            bootAmount,
            deferredGain: capitalGain - bootAmount,
            taxSaved: (depreciationRecaptureTax + capitalGainsTax) - taxOnSale,
        };
    } else {
        taxOnSale = depreciationRecaptureTax + capitalGainsTax;
    }
    const netCashFromSale = netSaleProceedsBeforeTax - taxOnSale;

    // --- Metrics Calculation ---

    const cashFlowsPreTax = [-totalInitialInvestment, ...forecast.map(f => f.cashFlow)];
    cashFlowsPreTax[years] += netSaleProceedsBeforeTax;

    const cashFlowsAfterTax = [-totalInitialInvestment, ...forecast.map(f => f.cashFlowAfterTax)];
    cashFlowsAfterTax[years] += netCashFromSale;

    const irrPreTax = calculateIRR(cashFlowsPreTax);
    const irrAfterTax = calculateIRR(cashFlowsAfterTax);

    const npvAfterTax = calculateNPV(taxMarket.discountRate / 100, cashFlowsAfterTax);

    const totalCashFlowPreTax = forecast.reduce((sum, f) => sum + f.cashFlow, 0);
    const equityMultiple = totalInitialInvestment > 0
        ? (totalCashFlowPreTax + netSaleProceedsBeforeTax) / totalInitialInvestment
        : 0;

    const totalCashFlowAfterTax = forecast.reduce((sum, f) => sum + f.cashFlowAfterTax, 0);
    const equityMultipleAfterTax = totalInitialInvestment > 0
        ? (totalCashFlowAfterTax + netCashFromSale) / totalInitialInvestment
        : 0;

    const averageCashOnCash = years > 0
        ? forecast.reduce((sum, f) => sum + f.cashOnCash, 0) / years
        : 0;
    const averageCashOnCashAfterTax = years > 0
        ? forecast.reduce((sum, f) => sum + f.cashOnCashAfterTax, 0) / years
        : 0;

    // Generate amortization schedule
    const amortizationSchedule = generateAmortizationSchedule(loanAmount, financing.interestRate, financing.loanTermYears);

    return {
        forecast,
        amortizationSchedule,
        metrics: {
            irr: irrPreTax,
            irrAfterTax,
            equityMultiple,
            equityMultipleAfterTax,
            averageCashOnCash,
            averageCashOnCashAfterTax,
            npvAfterTax,
            totalInitialInvestment,
            closingCostsBreakdown: {
                titleInsurance: (closingCosts.titleInsurancePercent / 100) * property.purchasePrice,
                escrowFees: (closingCosts.escrowFeesPercent / 100) * property.purchasePrice,
                lenderFees: (closingCosts.lenderFeesPercent / 100) * property.purchasePrice,
                recordingFees: (closingCosts.recordingFeesPercent / 100) * property.purchasePrice,
                inspectionAppraisal: closingCosts.inspectionAppraisalFixed,
                total: closingCostsValue
            },
            netSaleProceeds: netSaleProceedsBeforeTax,
            netCashFromSale,
            totalProfit: (totalCashFlowAfterTax + netCashFromSale) - totalInitialInvestment,
            capRate: property.purchasePrice > 0 ? (forecast[0].noi / property.purchasePrice) * 100 : 0,
            dscr: forecast[0].debtService > 0 ? forecast[0].noi / forecast[0].debtService : Infinity,
            year1Noi: forecast[0].noi,
            year1CashOnCashAfterTax: forecast[0].cashOnCashAfterTax,
            exitAnalysis: {
                grossSalePrice: futureValue,
                sellingCosts,
                loanBalanceAtExit: finalLoanBalance,
                netSaleProceeds: netSaleProceedsBeforeTax,
                totalTaxOnSale: taxOnSale,
                depreciationRecapture: depreciationRecaptureTax,
                capitalGainsTax,
                netCashFromSale,
                exchange1031: exchangeInfo,
            },
            costSegregation: taxMarket.useCostSegregation ? {
                enabled: true,
                year1Bonus: costSegBonus,
                totalDepreciation: accumulatedDepreciation,
            } : null
        }
    };
};

