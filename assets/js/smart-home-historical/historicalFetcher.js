'use strict';

import DataFetcher from '../DataFetcher.js';
import { HISTORICAL_CONTRACT } from './contract.js';

/**
 * Builds the fetcher the climate history chart uses for one resolution's URL,
 * validating the response against the historical contract.
 *
 * @param {String} url
 * @return {DataFetcher}
 */
export default function createHistoricalFetcher(url) {
    return new DataFetcher(url, HISTORICAL_CONTRACT);
}
