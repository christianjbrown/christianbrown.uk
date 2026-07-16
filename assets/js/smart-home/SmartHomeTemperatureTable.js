'use strict';

import UpdatingKeyValuePairTable from './UpdatingKeyValuePairTable.js';
import { averageTemperature, averageHumidity } from './averageReadings.js';

const JSON_CONTRACT = {
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
            'humidityValue': {'type': 'number', 'cannotBeEmpty': true},
            'humidityTimestamp': {'type': 'number', 'cannotBeEmpty': true},
            'humidityStale': {'type': 'boolean', 'cannotBeEmpty': true},
        },
    },
};

export default class SmartHomeTemperatureTable extends UpdatingKeyValuePairTable {

    /**
     * Title in the first cell, then the temperature and humidity column
     * headings.
     */
    _renderHeader() {
        this._addHeaderRow(['🏠 Inside climate', '🌡️', '💧']);
    }

    /**
     * @param {Object} data
     */
    _renderUpdate(data) {
        const temperature = averageTemperature(data['devices']);
        if (temperature) {
            const humidity = averageHumidity(data['devices']);
            this._addClimateTableRow(
                'Average',
                temperature.value, temperature.timestamp, temperature.stale,
                humidity ? humidity.value : null, humidity ? humidity.timestamp : null, humidity ? humidity.stale : false,
                true
            );
        }
        const that = this;
        const devices = [...data['devices']].sort(
            (a, b) => b['temperatureTimestamp'] - a['temperatureTimestamp']
        );
        devices.forEach(
             (dataPoint) => {
                const roomName = dataPoint['roomName'];
                const label = roomName ? roomName + ' - ' + dataPoint['name'] : dataPoint['name'];
                that._addClimateTableRow(
                    label,
                    dataPoint['temperatureValue'], dataPoint['temperatureTimestamp'], dataPoint['temperatureStale'],
                    dataPoint['humidityValue'] ?? null, dataPoint['humidityTimestamp'] ?? null, dataPoint['humidityStale'] ?? false
                );
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
