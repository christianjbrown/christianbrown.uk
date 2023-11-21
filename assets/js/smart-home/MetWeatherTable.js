'use strict';

import UpdatingKeyValuePairTable from './UpdatingKeyValuePairTable.js';
import Time from './Time.js';

const JSON_CONTRACT = {
    'humidity': {'type': 'number', 'keyRequired': true, 'cannotBeEmpty': true},
    'precipitation': {'type': 'number', 'keyRequired': true, 'cannotBeEmpty': true},
    'temp': {'type': 'number', 'keyRequired': true, 'cannotBeEmpty': true},
    'temp_feels_like': {'type': 'number', 'keyRequired': false, 'cannotBeEmpty': true},
    'type_emoji': {'type': 'string', 'keyRequired': false, 'cannotBeEmpty': true},
    'type_string': {'type': 'string', 'keyRequired': false, 'cannotBeEmpty': true},
    'wind_direction': {'type': 'string', 'keyRequired': false, 'cannotBeEmpty': true},
    'wind_gust': {'type': 'number', 'keyRequired': false, 'cannotBeEmpty': true},
    'wind_speed': {'type': 'number', 'keyRequired': true, 'cannotBeEmpty': true},
};

const COMPASS_FRIENDLY_NAMES= {
    'E': 'Easterly',
    'ENE': 'East north easterly',
    'ESE': 'East south easterly',
    'N': 'Northerly',
    'NE': 'North easterly',
    'NNE': 'North north easterly',
    'NNW': 'North north westerly',
    'NW': 'North westerly',
    'S': 'Southerly',
    'SE': 'South easterly',
    'SSE': 'South south easterly',
    'SSW': 'South south westerly',
    'SW': 'South westerly',
    'W': 'Westerly',
    'WNW': 'West north westerly',
    'WSW': 'West south westerly',
}

export default class MetWeatherTable extends UpdatingKeyValuePairTable {
    /**
     * @param {Object} data
     */
    _renderUpdate(data) {
        if ('valid_from' in data && 'valid_to' in data) {
            const timeFrom = (new Time(data.valid_from * 1000)).formatUserFriendlyHour();
            const timeTo = (new Time(data.valid_to * 1000)).formatUserFriendlyHour();
            this._updateDateSpan(`<a href="https://www.metoffice.gov.uk/" target="_blank">Met Office</a> forecast for between ${timeFrom} and ${timeTo}`);
        }

        this._addTempTableRow('Temperature', ('temp' in data) ? data.temp : 'Unknown', null, false, true);
        if ('temp' in data && 'temp_feels_like' in data && data.temp !== data.temp_feels_like) {
            this._addTempTableRow('Temperature feels like', data.temp_feels_like ?? 'Unknown');
        }

        if ('type_string' in data && 'type_emoji' in data) {
            this._addTableRow('Type', `${data.type_emoji} ${data.type_string}`);
        }

        this._addTableRow('Humidity', ('humidity' in data) ? `${data.humidity}%` : 'Unknown');
        this._addTableRow('Chance of precipitation', ('precipitation' in data) ? `${data.precipitation}%` : 'Unknown');

        if ('wind_speed' in data) {
            let wind = this._formatWindSpeed(data);
            this._addTableRow('Wind', wind);
        }
    }

    _formatWindSpeed(data) {
        let wind = '';
        if ('wind_direction' in data && COMPASS_FRIENDLY_NAMES[data.wind_direction]) {
            wind += `${COMPASS_FRIENDLY_NAMES[data.wind_direction]} `;
        }
        wind += ('wind_speed' in data) ? `${data.wind_speed}mph` : '';
        if ('wind_gust' in data && data.wind_gust > 0) {
            wind += ` (${data.wind_gust}mph gusts)`;
        }
        return wind;
    }

    /**
     * @returns {Object|Array}
     */
    _getContract() {
        return JSON_CONTRACT;
    }
}
