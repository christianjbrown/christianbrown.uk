'use strict';

// The endpoint returns a per-device readings array; the header link only needs
// to average their temperatures, so it validates just those fields.
export const HOME_TEMPERATURE_CONTRACT = {
    'type': 'array',
    'keyRequired': true,
    'cannotBeEmpty': true,
    'contract': {
        'temperatureValue': {'type': 'number', 'keyRequired': true, 'cannotBeEmpty': true},
        'temperatureTimestamp': {'type': 'number', 'keyRequired': true, 'cannotBeEmpty': true},
        'temperatureStale': {'type': 'boolean', 'keyRequired': true, 'cannotBeEmpty': true},
    },
};
