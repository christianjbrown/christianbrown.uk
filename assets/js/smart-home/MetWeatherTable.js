'use strict';

import UpdatingKeyValuePairTable from './UpdatingKeyValuePairTable.js';
import Time from './Time.js';

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
        if (data['valid_from']) {
            const timeObj = new Time(data['valid_from'] * 1000);
            const timeDiff = timeObj.formatTimeAgo();
            this._updateDateSpan('From '+timeDiff);
        }
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
