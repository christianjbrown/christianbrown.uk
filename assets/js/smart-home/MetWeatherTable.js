'use strict';

import UpdatingKeyValuePairTable from './UpdatingKeyValuePairTable.js';
import Time from './Time.js';

const JSON_CONTRACT = {
    'temp': {'type': 'number', 'keyRequired': true, 'cannotBeEmpty': true},
    'temp_feels_like': {'type': 'number', 'keyRequired': true, 'cannotBeEmpty': true},
    'humidity': {'type': 'number', 'keyRequired': true, 'cannotBeEmpty': true},
    'precipitation': {'type': 'number', 'keyRequired': true, 'cannotBeEmpty': true},
    'type_string': {'type': 'string', 'keyRequired': true, 'cannotBeEmpty': false},
};

export default class MetWeatherTable extends UpdatingKeyValuePairTable {
    /**
     * @param {Object} data
     */
    _renderUpdate(data) {
        if (data['valid_from']) {
            const timeFrom = (new Time(data['valid_from'] * 1000)).formatUserFriendlyHour();
            const timeTo = (new Time(data['valid_to'] * 1000)).formatUserFriendlyHour();
            this._updateDateSpan('Met Office forecast for between '+timeFrom+' and '+timeTo);
        }
        this._addTempTableRow('Temperature', data['temp'], null, false, true);
        this._addTempTableRow('Temperature feels like', data['temp_feels_like']);
        if (data['type_string']) {
            this._addTableRow('Type', data['type_string']);
        }
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
