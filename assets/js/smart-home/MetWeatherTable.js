'use strict';

import UpdatingKeyValuePairTable from './UpdatingKeyValuePairTable.js';

const JSON_CONTRACT = {
    'temp': {'type': 'number', 'keyRequired': true, 'cannotBeEmpty': true},
    'temp_feels_like': {'type': 'number', 'keyRequired': true, 'cannotBeEmpty': true},
    'humidity': {'type': 'number', 'keyRequired': true, 'cannotBeEmpty': true},
    'precipitation': {'type': 'number', 'keyRequired': true, 'cannotBeEmpty': true},
};

export default class MetWeatherTable extends UpdatingKeyValuePairTable {
    /**
     * @param {Object} data
     */
    _renderUpdate(data) {
        this._addTempTableRow('Temperature', data['temp'], null, false, true);
        this._addTempTableRow('Temperature feels like', data['temp_feels_like']);
        this._addTableRow('Humidity', data['humidity']+'%');
        this._addTableRow('Chance of precipitation', data['precipitation']+'%');
    }

    /**
     * @returns {Object}
     */
    _getContract() {
        return JSON_CONTRACT;
    }
}
