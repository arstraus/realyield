import { generateForecast } from './src/utils/financials.js';
import { DEFAULT_PROPERTY, DEFAULT_FINANCING, DEFAULT_OPERATIONS, DEFAULT_TAX_MARKET } from './src/utils/constants.js';

const taxMarket = { ...DEFAULT_TAX_MARKET, holdPeriod: 5 };
const results = generateForecast(DEFAULT_PROPERTY, DEFAULT_FINANCING, DEFAULT_OPERATIONS, taxMarket);

console.log(`Forecast length: ${results.forecast.length}`);
if (results.forecast.length === 5) {
    console.log('SUCCESS: Forecast length matches hold period.');
} else {
    console.log(`FAILURE: Expected 5, got ${results.forecast.length}`);
}
