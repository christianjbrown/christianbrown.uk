'use strict';

import UpdatingKeyValuePairTable from './UpdatingKeyValuePairTable.js';

const JSON_CONTRACT = {
    'averageTempDegrees': {'type': 'number', 'keyRequired': true, 'cannotBeEmpty': true},
    'averageTempTimestamp': {'type': 'number', 'keyRequired': true, 'cannotBeEmpty': true},
    'devices': {
        'type': 'array',
        'cannotBeEmpty': true,
        'keyRequired': true,
        'contract': {
            'name': {'type': 'string', 'keyRequired': true, 'cannotBeEmpty': true},
            'timestamp': {'type': 'number', 'keyRequired': true, 'cannotBeEmpty': true},
            'temp': {'type': 'number', 'keyRequired': true, 'cannotBeEmpty': true},
            'stale': {'type': 'boolean', 'keyRequired': true, 'cannotBeEmpty': true},
        },
    },
};

export default class SmartHomeTemperatureTable extends UpdatingKeyValuePairTable {

    /**
     * @param {Object} data
     */
    _renderUpdate(data) {
        this._addTempTableRow('Average', data['averageTempDegrees'], data['averageTempTimestamp'], false, true);
        const that = this;
        data['devices'].forEach(
             (dataPoint) => {
                that._addTempTableRow(dataPoint['name'], dataPoint['temp'], dataPoint['timestamp'], dataPoint['stale']);
            }
        );
    }

    /**
     * @returns {Object}
     */
    _getContract() {
        return JSON_CONTRACT;
    }
}
