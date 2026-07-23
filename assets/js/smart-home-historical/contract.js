'use strict';

// The per-endpoint payload contract for the historical-climate `data` array,
// validated by DataFetcher via JsonPayloadContractValidator. `date` is always a
// non-empty string; `hour` is present only for the hourly resolutions; the eight
// metric fields are always present but may be null for a side with no data — so
// they are `keyRequired` but NOT `cannotBeEmpty` (null is a legitimate gap).

export const HISTORICAL_CONTRACT = {
    'type': 'array',
    'keyRequired': true,
    'cannotBeEmpty': true,
    'contract': {
        'date': { 'type': 'string', 'keyRequired': true, 'cannotBeEmpty': true },
        'hour': { 'type': 'number' },
        'insideMaxTemp': { 'type': 'number', 'keyRequired': true },
        'insideMinTemp': { 'type': 'number', 'keyRequired': true },
        'insideMinHumidity': { 'type': 'number', 'keyRequired': true },
        'insideMaxHumidity': { 'type': 'number', 'keyRequired': true },
        'outsideMaxTemp': { 'type': 'number', 'keyRequired': true },
        'outsideMinTemp': { 'type': 'number', 'keyRequired': true },
        'outsideMinHumidity': { 'type': 'number', 'keyRequired': true },
        'outsideMaxHumidity': { 'type': 'number', 'keyRequired': true },
    },
};
