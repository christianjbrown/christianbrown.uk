'use strict';

import UpdatingKeyValuePairTable from './UpdatingKeyValuePairTable.js';
import Humidity from './Humidity.js';
import Time from './Time.js';

const MPH_TO_KMH = 1.609344;

// A non-breaking space keeps each wind figure and its unit together on one line.
const NBSP = ' ';

const JSON_CONTRACT = {
    'humidity': {'type': 'number', 'keyRequired': true, 'cannotBeEmpty': true},
    'precipitation': {'type': 'number', 'keyRequired': true, 'cannotBeEmpty': true},
    'temp': {'type': 'number', 'keyRequired': true, 'cannotBeEmpty': true},
    'temp_feels_like': {'type': 'number', 'keyRequired': false, 'cannotBeEmpty': true},
    'type_emoji': {'type': 'string', 'keyRequired': false, 'cannotBeEmpty': true},
    'type_string': {'type': 'string', 'keyRequired': false, 'cannotBeEmpty': true},
    'wind_direction': {'type': 'string', 'keyRequired': false, 'cannotBeEmpty': true},
    'wind_direction_degrees': {'type': 'number', 'keyRequired': false, 'cannotBeEmpty': true},
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
     * The title spans both columns (this table has no column headings), so it
     * doesn't force the first column wider than its labels need and the value
     * column gets more room. It still keeps this header the same height as the
     * inside table's.
     */
    _renderHeader() {
        // 🌤 (U+1F324) needs the U+FE0F variation selector to be a fully-qualified
        // emoji; without it it renders and copies inconsistently.
        this._addHeaderRow(['🌤️ Outside weather forecast'], 2);
    }

    /**
     * @param {Object}      data
     * @param {Number|null} generatedAtUnix
     */
    _renderUpdate(data, generatedAtUnix = null) {
        if ('valid_from' in data && 'valid_to' in data) {
            const fromObj = new Time(data.valid_from * 1000);
            const toObj = new Time(data.valid_to * 1000);
            const timeFrom = fromObj.formatUserFriendlyHour();
            const timeTo = toObj.formatUserFriendlyHour();

            // Both ends of the hour-long window normally share a timezone and
            // date; only the twice-yearly clock change (timezone) or a window
            // that straddles midnight (date) make them differ. Show the shared
            // "TZ on date" suffix once, after the second time, when they match;
            // otherwise show each time's own suffix.
            const suffixFrom = `${fromObj.getTimezoneAbbreviation()} on ${fromObj.formatUserFriendlyDate()}`;
            const suffixTo = `${toObj.getTimezoneAbbreviation()} on ${toObj.formatUserFriendlyDate()}`;
            const range = suffixFrom === suffixTo
                ? `${timeFrom} and ${timeTo} ${suffixTo}`
                : `${timeFrom} ${suffixFrom} and ${timeTo} ${suffixTo}`;

            const metOfficeLink = document.createElement('a');
            metOfficeLink.href = 'https://www.metoffice.gov.uk/';
            metOfficeLink.target = '_blank';
            metOfficeLink.textContent = 'Met Office';

            // The freshness sits on its own line beneath the source line (the
            // `freshness` span is display:block), e.g.
            //   Source: Met Office forecast for between … on Fri 17th Jul.
            //   Updated 9 mins ago
            const nodes = ['Source: ', metOfficeLink, ` forecast for between ${range}.`];
            const updated = this._updatedElement(generatedAtUnix);
            if (updated) {
                nodes.push(updated);
            }
            this._updateDateSpan(...nodes);
        }

        if ('type_string' in data && 'type_emoji' in data) {
            this._addTableRow('Weather type', `${data.type_emoji} ${data.type_string}`);
        }

        this._addTempTableRow('🌡️ Temperature', ('temp' in data) ? data.temp : 'Unknown', null, false, false);
        if ('temp' in data && 'temp_feels_like' in data && data.temp !== data.temp_feels_like) {
            this._addTempTableRow('Temperature feels like', data.temp_feels_like ?? 'Unknown');
        }

        const humidityDescription = ('humidity' in data) ? (new Humidity(data.humidity)).describe() : null;
        this._addTableRow('💧 Humidity', ('humidity' in data) ? `${data.humidity}%` : 'Unknown', humidityDescription, null, false, false, true);
        this._addTableRow('Chance of precipitation', ('precipitation' in data) ? `${data.precipitation}%` : 'Unknown');

        if ('wind_speed' in data) {
            this._addTableRow('Wind', this._formatWindSpeed(data), this._formatWindSpeedMph(data), null, false, false, true);
        }
    }

    /**
     * Primary wind line, in km/h with a friendly direction prefix, e.g.
     * "Northerly 24.1 km/h (40.2 km/h gusts)".
     */
    _formatWindSpeed(data) {
        let wind = '';
        if ('wind_direction' in data && COMPASS_FRIENDLY_NAMES[data.wind_direction]) {
            wind += COMPASS_FRIENDLY_NAMES[data.wind_direction];
            if ('wind_direction_degrees' in data) {
                // Keep the direction and its degrees together on one line.
                wind += `${NBSP}(${MetWeatherTable._round(data.wind_direction_degrees)}°)`;
            }
            wind += ' ';
        }
        // wind_speed / wind_gust arrive as full-precision floats (converted m/s → mph);
        // convert to km/h and round to one decimal place for display.
        wind += ('wind_speed' in data) ? `${MetWeatherTable._round(data.wind_speed * MPH_TO_KMH)}${NBSP}km/h` : '';
        if ('wind_gust' in data && data.wind_gust > 0) {
            wind += ` (${MetWeatherTable._round(data.wind_gust * MPH_TO_KMH)}${NBSP}km/h gusts)`;
        }
        return wind;
    }

    /**
     * Muted secondary wind line, in mph without the direction, e.g.
     * "15 mph (25 mph gusts)".
     */
    _formatWindSpeedMph(data) {
        let wind = ('wind_speed' in data) ? `${MetWeatherTable._round(data.wind_speed)}${NBSP}mph` : '';
        if ('wind_gust' in data && data.wind_gust > 0) {
            wind += ` (${MetWeatherTable._round(data.wind_gust)}${NBSP}mph gusts)`;
        }
        return wind;
    }

    /**
     * @param {Number} value
     *
     * @returns {Number}
     */
    static _round(value) {
        return Math.round(value * 10) / 10;
    }

    /**
     * @returns {Object|Array}
     */
    _getContract() {
        return JSON_CONTRACT;
    }
}
