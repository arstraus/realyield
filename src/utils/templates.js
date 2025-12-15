export const PROPERTY_TEMPLATES = {
    multifamily: {
        name: 'Multifamily',
        description: 'Apartment buildings, condos, townhomes',
        operations: {
            inputMode: 'commercial',
            annualBaseRentPerSqFt: 18,
            vacancyRate: 5,
            annualRentGrowth: 3,
            annualExpenseGrowth: 2.5,
            propertyTaxRate: 1.2,
            insurance: 0.35,
            propertyManagementPercent: 5,
            maintenanceReservePercent: 3,
            utilities: 0.5,
            otherExpenses: 0.3
        },
        taxMarket: {
            exitCapRate: 5.5,
            discountRate: 8,
            holdPeriod: 10
        }
    },
    retail: {
        name: 'Retail',
        description: 'Shopping centers, strip malls',
        operations: {
            inputMode: 'commercial',
            annualBaseRentPerSqFt: 22,
            vacancyRate: 7,
            annualRentGrowth: 2,
            annualExpenseGrowth: 2,
            propertyTaxRate: 1.5,
            insurance: 0.4,
            propertyManagementPercent: 4,
            maintenanceReservePercent: 2,
            utilities: 0.3,
            otherExpenses: 0.5
        },
        taxMarket: {
            exitCapRate: 6.5,
            discountRate: 9,
            holdPeriod: 10
        }
    },
    office: {
        name: 'Office',
        description: 'Office buildings, business parks',
        operations: {
            inputMode: 'commercial',
            annualBaseRentPerSqFt: 28,
            vacancyRate: 10,
            annualRentGrowth: 2.5,
            annualExpenseGrowth: 2.5,
            propertyTaxRate: 1.3,
            insurance: 0.45,
            propertyManagementPercent: 4,
            maintenanceReservePercent: 3.5,
            utilities: 1.2,
            otherExpenses: 0.8
        },
        taxMarket: {
            exitCapRate: 6,
            discountRate: 8.5,
            holdPeriod: 10
        }
    },
    industrial: {
        name: 'Industrial',
        description: 'Warehouses, distribution centers',
        operations: {
            inputMode: 'commercial',
            annualBaseRentPerSqFt: 8,
            vacancyRate: 3,
            annualRentGrowth: 3,
            annualExpenseGrowth: 2,
            propertyTaxRate: 1.1,
            insurance: 0.3,
            propertyManagementPercent: 3,
            maintenanceReservePercent: 1.5,
            utilities: 0.2,
            otherExpenses: 0.3
        },
        taxMarket: {
            exitCapRate: 5,
            discountRate: 7.5,
            holdPeriod: 10
        }
    }
};
