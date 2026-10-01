import { describe, it, expect, vi } from 'vitest';

const { dataFetcherCtor } = vi.hoisted(() => ({ dataFetcherCtor: vi.fn() }));

vi.mock('../DataFetcher.js', () => ({
    default: class {
        constructor(...args) {
            dataFetcherCtor(...args);
        }
    },
}));

import createHistoricalFetcher from './historicalFetcher.js';
import { HISTORICAL_CONTRACT } from './contract.js';

describe('createHistoricalFetcher', () => {
    it('builds a DataFetcher for the URL with the historical contract', () => {
        const fetcher = createHistoricalFetcher('https://api.test/get-historical-climate-data/hourly-1-month');

        expect(dataFetcherCtor).toHaveBeenCalledWith('https://api.test/get-historical-climate-data/hourly-1-month', HISTORICAL_CONTRACT);
        expect(fetcher).toBeDefined();
    });
});
