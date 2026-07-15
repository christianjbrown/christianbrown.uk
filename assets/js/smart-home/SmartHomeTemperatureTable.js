'use strict';

import UpdatingKeyValuePairTable from './UpdatingKeyValuePairTable.js';
import Time from './Time.js';

const JSON_CONTRACT = {
    'averageTempDegrees': {'type': 'number', 'keyRequired': true, 'cannotBeEmpty': true},
    'averageTempTimestamp': {'type': 'number', 'keyRequired': true, 'cannotBeEmpty': true},
    'devices': {
        'type': 'array',
        'cannotBeEmpty': true,
        'keyRequired': true,
        'contract': {
            'name': {'type': 'string', 'keyRequired': true, 'cannotBeEmpty': true},
            'roomName': {'type': 'string', 'cannotBeEmpty': true},
            'temperatureTimestamp': {'type': 'number', 'keyRequired': true, 'cannotBeEmpty': true},
            'temperatureValue': {'type': 'number', 'keyRequired': true, 'cannotBeEmpty': true},
            'temperatureStale': {'type': 'boolean', 'keyRequired': true, 'cannotBeEmpty': true},
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
        const devices = [...data['devices']].sort(
            (a, b) => b['temperatureTimestamp'] - a['temperatureTimestamp']
        );
        devices.forEach(
             (dataPoint) => {
                const roomName = dataPoint['roomName'];
                const label = roomName ? roomName + ' - ' + dataPoint['name'] : dataPoint['name'];
                that._addTempTableRow(label, dataPoint['temperatureValue'], dataPoint['temperatureTimestamp'], dataPoint['temperatureStale']);
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
