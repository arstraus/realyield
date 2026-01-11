import React, { useMemo } from 'react';
import { PROPERTY_TEMPLATES } from '../utils/templates';
import { validateProperty, validateFinancing, validateOperations, validateTaxMarket, validateClosingCosts } from '../utils/validation';

const InputGroup = ({ title, children }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {children}
        </div>
    </div>
);

const ToggleSwitch = ({ label, checked, onChange, description }) => (
    <div className="flex items-start space-x-3 py-2">
        <button
            type="button"
            onClick={() => onChange(!checked)}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${checked ? 'bg-emerald-600' : 'bg-gray-200'}`}
            role="switch"
            aria-checked={checked}
        >
            <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${checked ? 'translate-x-5' : 'translate-x-0'}`}
            />
        </button>
        <div className="flex-1">
            <span className="text-sm font-medium text-gray-700">{label}</span>
            {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
        </div>
    </div>
);

const InputField = ({ label, value, onChange, prefix, suffix, type = "number", step = "any", error, allowNegative = false }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <div className="relative rounded-md shadow-sm">
            {prefix && (
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">{prefix}</span>
                </div>
            )}
            <input
                type={type}
                step={step}
                min={!allowNegative && type === 'number' ? "0" : undefined}
                value={value}
                onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    if (isNaN(val)) {
                        // Allow empty/invalid to be handled as 0 or ignore? 
                        // Existing code was: parseFloat(e.target.value) || 0
                        onChange(0);
                        return;
                    }
                    if (!allowNegative && val < 0) {
                        onChange(0);
                        return;
                    }
                    onChange(val);
                }}
                className={`block w-full rounded-md focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm py-2 ${prefix ? 'pl-7' : 'pl-3'} ${suffix ? 'pr-12' : 'pr-3'} border ${error ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                    }`}
            />
            {suffix && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">{suffix}</span>
                </div>
            )}
        </div>
        {error && (
            <p className="mt-1 text-xs text-red-600">{error}</p>
        )}
    </div>
);

const InputSection = ({ property, setProperty, financing, setFinancing, operations, setOperations, taxMarket, setTaxMarket, closingCosts, setClosingCosts }) => {
    const isCommercial = operations.inputMode === 'commercial';
    const [showClosingCostsDetail, setShowClosingCostsDetail] = React.useState(false);

    // Compute validation errors
    const errors = useMemo(() => ({
        property: validateProperty(property),
        financing: validateFinancing(financing),
        operations: validateOperations(operations),
        taxMarket: validateTaxMarket(taxMarket),
        closingCosts: validateClosingCosts(closingCosts),
    }), [property, financing, operations, taxMarket, closingCosts]);

    // Helper to get first error message for a field
    const getError = (section, field) => {
        const sectionErrors = errors[section];
        if (sectionErrors && sectionErrors[field] && sectionErrors[field].length > 0) {
            return sectionErrors[field][0];
        }
        return null;
    };

    const applyTemplate = (templateKey) => {
        const template = PROPERTY_TEMPLATES[templateKey];
        if (!template) return;

        setOperations({ ...operations, ...template.operations });
        setTaxMarket({ ...taxMarket, ...template.taxMarket });
    };

    return (
        <div className="space-y-6">
            {/* Property Template Selector */}
            <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl shadow-sm border border-emerald-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Quick Start Templates</h3>
                <p className="text-sm text-gray-600 mb-4">Apply industry-standard assumptions for common property types</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {Object.entries(PROPERTY_TEMPLATES).map(([key, template]) => (
                        <button
                            key={key}
                            onClick={() => applyTemplate(key)}
                            className="bg-white hover:bg-emerald-50 border border-gray-200 hover:border-emerald-300 rounded-lg p-4 text-left transition-all"
                        >
                            <div className="font-medium text-gray-900 text-sm">{template.name}</div>
                            <div className="text-xs text-gray-500 mt-1">{template.description}</div>
                        </button>
                    ))}
                </div>
            </div>

            <InputGroup title="Property Details">
                {/* Property Name & Address Row */}
                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Property Name</label>
                        <input
                            type="text"
                            value={property.name || ''}
                            onChange={(e) => setProperty({ ...property, name: e.target.value })}
                            placeholder="e.g., Downtown Office"
                            className="block w-full rounded-md border border-gray-300 shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm py-2 px-3"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                        <input
                            type="text"
                            value={property.address || ''}
                            onChange={(e) => setProperty({ ...property, address: e.target.value })}
                            placeholder="123 Main Street"
                            className="block w-full rounded-md border border-gray-300 shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm py-2 px-3"
                        />
                    </div>
                </div>
                <div className="md:col-span-2 grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                        <input
                            type="text"
                            value={property.city || ''}
                            onChange={(e) => setProperty({ ...property, city: e.target.value })}
                            placeholder="City"
                            className="block w-full rounded-md border border-gray-300 shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm py-2 px-3"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                        <input
                            type="text"
                            value={property.state || ''}
                            onChange={(e) => setProperty({ ...property, state: e.target.value })}
                            placeholder="State"
                            className="block w-full rounded-md border border-gray-300 shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm py-2 px-3"
                        />
                    </div>
                </div>
                <InputField
                    label="Purchase Price"
                    value={property.purchasePrice}
                    onChange={(v) => setProperty({ ...property, purchasePrice: v })}
                    prefix="$"
                    error={getError('property', 'purchasePrice')}
                />
                <InputField
                    label="Building Size"
                    value={property.buildingSize || 0}
                    onChange={(v) => setProperty({ ...property, buildingSize: v })}
                    suffix="SF"
                    error={getError('property', 'buildingSize')}
                />
                <div className="text-sm text-gray-500 px-1">
                    Price per SF: {property.buildingSize ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(property.purchasePrice / property.buildingSize) : '$0'}
                </div>
                <InputField
                    label="Rehab Costs"
                    value={property.rehabCosts}
                    onChange={(v) => setProperty({ ...property, rehabCosts: v })}
                    prefix="$"
                    error={getError('property', 'rehabCosts')}
                />
                <InputField
                    label="After Repair Value"
                    value={property.afterRepairValue}
                    onChange={(v) => setProperty({ ...property, afterRepairValue: v })}
                    prefix="$"
                    error={getError('property', 'afterRepairValue')}
                />
            </InputGroup>

            {/* Closing Costs Detail */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
                <div
                    className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 cursor-pointer hover:bg-gray-100/50 transition-colors"
                    onClick={() => setShowClosingCostsDetail(!showClosingCostsDetail)}
                >
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-gray-900">Closing Costs Detail</h3>
                        <div className="flex items-center space-x-3">
                            <span className="text-sm font-medium text-indigo-600">
                                Total: {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(
                                    (closingCosts.titleInsurancePercent + closingCosts.escrowFeesPercent + closingCosts.lenderFeesPercent + closingCosts.recordingFeesPercent) / 100 * property.purchasePrice + closingCosts.inspectionAppraisalFixed
                                )}
                            </span>
                            <span className="text-gray-400">{showClosingCostsDetail ? '▼' : '▶'}</span>
                        </div>
                    </div>
                </div>
                {showClosingCostsDetail && (
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputField
                            label="Title Insurance"
                            value={closingCosts.titleInsurancePercent}
                            onChange={(v) => setClosingCosts({ ...closingCosts, titleInsurancePercent: v })}
                            suffix="%"
                            error={getError('closingCosts', 'titleInsurancePercent')}
                        />
                        <InputField
                            label="Escrow Fees"
                            value={closingCosts.escrowFeesPercent}
                            onChange={(v) => setClosingCosts({ ...closingCosts, escrowFeesPercent: v })}
                            suffix="%"
                            error={getError('closingCosts', 'escrowFeesPercent')}
                        />
                        <InputField
                            label="Lender Fees"
                            value={closingCosts.lenderFeesPercent}
                            onChange={(v) => setClosingCosts({ ...closingCosts, lenderFeesPercent: v })}
                            suffix="%"
                            error={getError('closingCosts', 'lenderFeesPercent')}
                        />
                        <InputField
                            label="Recording Fees"
                            value={closingCosts.recordingFeesPercent}
                            onChange={(v) => setClosingCosts({ ...closingCosts, recordingFeesPercent: v })}
                            suffix="%"
                            error={getError('closingCosts', 'recordingFeesPercent')}
                        />
                        <InputField
                            label="Inspection & Appraisal"
                            value={closingCosts.inspectionAppraisalFixed}
                            onChange={(v) => setClosingCosts({ ...closingCosts, inspectionAppraisalFixed: v })}
                            prefix="$"
                            error={getError('closingCosts', 'inspectionAppraisalFixed')}
                        />
                    </div>
                )}
            </div>

            <InputGroup title="Financing Structure">
                <InputField
                    label="Down Payment"
                    value={financing.downPaymentPercent}
                    onChange={(v) => setFinancing({ ...financing, downPaymentPercent: v })}
                    suffix="%"
                    error={getError('financing', 'downPaymentPercent')}
                />
                <InputField
                    label="Interest Rate"
                    value={financing.interestRate}
                    onChange={(v) => setFinancing({ ...financing, interestRate: v })}
                    suffix="%"
                    error={getError('financing', 'interestRate')}
                />
                <InputField
                    label="Loan Term"
                    value={financing.loanTermYears}
                    onChange={(v) => setFinancing({ ...financing, loanTermYears: v })}
                    suffix="Years"
                    error={getError('financing', 'loanTermYears')}
                />
            </InputGroup>

            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-gray-900">Revenue Assumptions</h3>
                    <div className="flex space-x-2 text-xs">
                        <button
                            onClick={() => setOperations({ ...operations, inputMode: 'simple' })}
                            className={`px-2 py-1 rounded ${!isCommercial ? 'bg-emerald-100 text-emerald-700' : 'text-gray-500 hover:bg-gray-50'}`}
                        >
                            Simple (Monthly)
                        </button>
                        <button
                            onClick={() => setOperations({ ...operations, inputMode: 'commercial' })}
                            className={`px-2 py-1 rounded ${isCommercial ? 'bg-emerald-100 text-emerald-700' : 'text-gray-500 hover:bg-gray-50'}`}
                        >
                            Commercial (Annual/SF)
                        </button>
                    </div>
                </div>

                <div className="space-y-4">
                    {isCommercial ? (
                        <>
                            <InputField
                                label="Annual Base Rent (NNN)"
                                value={operations.annualBaseRentPerSqFt}
                                onChange={(v) => setOperations({ ...operations, annualBaseRentPerSqFt: v })}
                                prefix="$"
                                suffix="/ SF"
                                error={getError('operations', 'annualBaseRentPerSqFt')}
                            />
                            <InputField
                                label="Vacancy Rate"
                                value={operations.vacancyRate}
                                onChange={(v) => setOperations({ ...operations, vacancyRate: v })}
                                suffix="%"
                                error={getError('operations', 'vacancyRate')}
                            />
                            <InputField
                                label="Annual Rent Growth"
                                value={operations.annualRentGrowth}
                                onChange={(v) => setOperations({ ...operations, annualRentGrowth: v })}
                                suffix="%"
                                allowNegative
                                error={getError('operations', 'annualRentGrowth')}
                            />
                            <InputField
                                label="Other Income"
                                value={operations.otherIncomePercent}
                                onChange={(v) => setOperations({ ...operations, otherIncomePercent: v })}
                                suffix="% of Rent"
                            />
                        </>
                    ) : (
                        <>
                            <InputField
                                label="Gross Rent (Monthly)"
                                value={operations.grossRentMonthly}
                                onChange={(v) => setOperations({ ...operations, grossRentMonthly: v })}
                                prefix="$"
                                error={getError('operations', 'grossRentMonthly')}
                            />
                            <InputField
                                label="Vacancy Rate"
                                value={operations.vacancyRate}
                                onChange={(v) => setOperations({ ...operations, vacancyRate: v })}
                                suffix="%"
                                error={getError('operations', 'vacancyRate')}
                            />
                            <InputField
                                label="Annual Rent Growth"
                                value={operations.annualRentGrowth}
                                onChange={(v) => setOperations({ ...operations, annualRentGrowth: v })}
                                suffix="%"
                                allowNegative
                                error={getError('operations', 'annualRentGrowth')}
                            />
                            <InputField
                                label="Other Income (Monthly)"
                                value={operations.otherIncomeMonthly}
                                onChange={(v) => setOperations({ ...operations, otherIncomeMonthly: v })}
                                prefix="$"
                            />
                        </>
                    )}
                </div>
            </div>

            <InputGroup title={isCommercial ? "Operating Expenses (NNN)" : "Operating Expenses"}>
                {isCommercial ? (
                    <>
                        <InputField
                            label="Property Taxes"
                            value={operations.commercialExpenses?.propertyTaxPerSqFt || 0}
                            onChange={(v) => setOperations({
                                ...operations,
                                commercialExpenses: { ...operations.commercialExpenses, propertyTaxPerSqFt: v }
                            })}
                            prefix="$"
                            suffix="/ SF"
                        />
                        <InputField
                            label="Insurance"
                            value={operations.commercialExpenses?.insurancePerSqFt || 0}
                            onChange={(v) => setOperations({
                                ...operations,
                                commercialExpenses: { ...operations.commercialExpenses, insurancePerSqFt: v }
                            })}
                            prefix="$"
                            suffix="/ SF"
                        />
                        <InputField
                            label="CAM"
                            value={operations.commercialExpenses?.camPerSqFt || 0}
                            onChange={(v) => setOperations({
                                ...operations,
                                commercialExpenses: { ...operations.commercialExpenses, camPerSqFt: v }
                            })}
                            prefix="$"
                            suffix="/ SF"
                        />
                        <InputField
                            label="Management Fee"
                            value={operations.commercialExpenses?.managementPercent || 0}
                            onChange={(v) => setOperations({
                                ...operations,
                                commercialExpenses: { ...operations.commercialExpenses, managementPercent: v }
                            })}
                            suffix="% of Rev"
                        />
                        <InputField
                            label="Repairs & Maint (Annual)"
                            value={operations.commercialExpenses?.repairsMaintenanceAnnual || 0}
                            onChange={(v) => setOperations({
                                ...operations,
                                commercialExpenses: { ...operations.commercialExpenses, repairsMaintenanceAnnual: v }
                            })}
                            prefix="$"
                        />
                        <InputField
                            label="Annual Expense Growth"
                            value={operations.annualExpenseGrowth}
                            onChange={(v) => setOperations({ ...operations, annualExpenseGrowth: v })}
                            suffix="%"
                            allowNegative
                            error={getError('operations', 'annualExpenseGrowth')}
                        />
                    </>
                ) : (
                    <>
                        <InputField
                            label="Property Tax Rate (Annual)"
                            value={operations.propertyTaxRate}
                            onChange={(v) => setOperations({ ...operations, propertyTaxRate: v })}
                            suffix="% of Value"
                        />
                        <InputField
                            label="Insurance (Annual)"
                            value={operations.insuranceAnnual}
                            onChange={(v) => setOperations({ ...operations, insuranceAnnual: v })}
                            prefix="$"
                        />
                        <InputField
                            label="Management Fee"
                            value={operations.managementFeeRate}
                            onChange={(v) => setOperations({ ...operations, managementFeeRate: v })}
                            suffix="% of Rent"
                            error={getError('operations', 'managementFeeRate')}
                        />
                        <InputField
                            label="Maintenance"
                            value={operations.maintenanceRate}
                            onChange={(v) => setOperations({ ...operations, maintenanceRate: v })}
                            suffix="% of Rent"
                            error={getError('operations', 'maintenanceRate')}
                        />
                        <InputField
                            label="Annual Expense Growth"
                            value={operations.annualExpenseGrowth}
                            onChange={(v) => setOperations({ ...operations, annualExpenseGrowth: v })}
                            suffix="%"
                            allowNegative
                            error={getError('operations', 'annualExpenseGrowth')}
                        />
                    </>
                )}
            </InputGroup>

            <InputGroup title="Capital Expenditures">
                <InputField
                    label="Initial CapEx / TI"
                    value={operations.initialCapEx || 0}
                    onChange={(v) => setOperations({ ...operations, initialCapEx: v })}
                    prefix="$"
                />
                <InputField
                    label="Annual Reserve"
                    value={operations.annualCapExReservePerSqFt || 0}
                    onChange={(v) => setOperations({ ...operations, annualCapExReservePerSqFt: v })}
                    prefix="$"
                    suffix={isCommercial ? "/ SF" : ""}
                />
            </InputGroup>

            <InputGroup title="Tax & Market Assumptions">
                <InputField
                    label="Income Tax Rate"
                    value={taxMarket.incomeTaxRate}
                    onChange={(v) => setTaxMarket({ ...taxMarket, incomeTaxRate: v })}
                    suffix="%"
                    error={getError('taxMarket', 'incomeTaxRate')}
                />
                <InputField
                    label="Capital Gains Tax Rate"
                    value={taxMarket.capitalGainsTaxRate}
                    onChange={(v) => setTaxMarket({ ...taxMarket, capitalGainsTaxRate: v })}
                    suffix="%"
                    error={getError('taxMarket', 'capitalGainsTaxRate')}
                />
                <InputField
                    label="Selling Costs"
                    value={taxMarket.sellingCosts}
                    onChange={(v) => setTaxMarket({ ...taxMarket, sellingCosts: v })}
                    suffix="% of Sale"
                    error={getError('taxMarket', 'sellingCosts')}
                />
                <InputField
                    label="Discount Rate (%)"
                    value={taxMarket.discountRate}
                    onChange={(val) => setTaxMarket({ ...taxMarket, discountRate: val })}
                    error={getError('taxMarket', 'discountRate')}
                />
                <InputField
                    label="Hold Period (Years)"
                    value={taxMarket.holdPeriod || 10}
                    onChange={(val) => setTaxMarket({ ...taxMarket, holdPeriod: val })}
                    error={getError('taxMarket', 'holdPeriod')}
                />
                <InputField
                    label="Exit Cap Rate"
                    value={taxMarket.exitCapRate || 0}
                    onChange={(v) => setTaxMarket({ ...taxMarket, exitCapRate: v })}
                    suffix="%"
                    error={getError('taxMarket', 'exitCapRate')}
                />
                <InputField
                    label="Depreciation (Years)"
                    value={taxMarket.depreciationYears}
                    onChange={(v) => setTaxMarket({ ...taxMarket, depreciationYears: v })}
                    suffix="Years"
                    error={getError('taxMarket', 'depreciationYears')}
                />
                <InputField
                    label="Land Value"
                    value={property.landValuePercent}
                    onChange={(v) => setProperty({ ...property, landValuePercent: v })}
                    suffix="% of Price"
                    error={getError('property', 'landValuePercent')}
                />
                <InputField
                    label="Depreciation Recapture Rate"
                    value={taxMarket.depreciationRecaptureRate || 25}
                    onChange={(v) => setTaxMarket({ ...taxMarket, depreciationRecaptureRate: v })}
                    suffix="%"
                />
            </InputGroup>

            {/* Tax Strategy Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
                <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-indigo-50/50 to-purple-50/50">
                    <h3 className="text-lg font-semibold text-gray-900">Tax Strategies</h3>
                    <p className="text-sm text-gray-500 mt-1">Advanced tax planning options</p>
                </div>
                <div className="p-6 space-y-6">
                    {/* 1031 Exchange */}
                    <div className="border-b border-gray-100 pb-6">
                        <ToggleSwitch
                            label="1031 Exchange"
                            checked={taxMarket.use1031Exchange || false}
                            onChange={(v) => setTaxMarket({ ...taxMarket, use1031Exchange: v })}
                            description="Defer capital gains tax by reinvesting in like-kind property"
                        />
                        {taxMarket.use1031Exchange && (
                            <div className="mt-4 ml-14 p-4 bg-indigo-50/50 rounded-lg border border-indigo-100">
                                <InputField
                                    label="Boot Percentage"
                                    value={taxMarket.exchangeBootPercent || 0}
                                    onChange={(v) => setTaxMarket({ ...taxMarket, exchangeBootPercent: v })}
                                    suffix="%"
                                />
                                <p className="text-xs text-gray-500 mt-2">
                                    Portion of sale proceeds taken as cash (taxable). 0% = full deferral.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Cost Segregation */}
                    <div>
                        <ToggleSwitch
                            label="Cost Segregation Study"
                            checked={taxMarket.useCostSegregation || false}
                            onChange={(v) => setTaxMarket({ ...taxMarket, useCostSegregation: v })}
                            description="Accelerate depreciation by reclassifying building components"
                        />
                        {taxMarket.useCostSegregation && (
                            <div className="mt-4 ml-14 p-4 bg-purple-50/50 rounded-lg border border-purple-100">
                                <InputField
                                    label="Year 1 Bonus Depreciation"
                                    value={taxMarket.costSegYear1Bonus || 0}
                                    onChange={(v) => setTaxMarket({ ...taxMarket, costSegYear1Bonus: v })}
                                    prefix="$"
                                />
                                <p className="text-xs text-gray-500 mt-2">
                                    Additional first-year depreciation from accelerated schedules. Typical range: 15-30% of building value.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InputSection;
