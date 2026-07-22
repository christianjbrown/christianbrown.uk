'use strict';

import UpdatingKeyValuePairTable from './UpdatingKeyValuePairTable.js';
import Humidity from './Humidity.js';
import Time from './Time.js';
import UvIndex from './UvIndex.js';
import Visibility from './Visibility.js';
import { WEATHER_TYPES } from './weatherTypes.js';

const MPH_TO_KMH = 1.609344;

// A non-breaking space keeps each wind figure and its unit together on one line.
const NBSP = String.fromCharCode(0xA0);

// Decorative row-label emoji live here, not in the message catalogues — they're
// the same in every locale and are rendered as theme-aware monochrome glyphs
// (see `.smart-home-table__value-icon` in smart-home.scss). The table title's
// 🌤 emoji stays a full-colour catalogue string, so it isn't listed here.
const LABEL_EMOJI = {
    temperature: '🌡️',
    humidity: '💧',
    uvIndex: '☀️',
    visibility: '👁️',
};

const JSON_CONTRACT = {
    'humidity': {'type': 'number', 'keyRequired': true, 'cannotBeEmpty': true},
    'precipitation': {'type': 'number', 'keyRequired': true, 'cannotBeEmpty': true},
    'temp': {'type': 'number', 'keyRequired': true, 'cannotBeEmpty': true},
    'temp_feels_like': {'type': 'number', 'keyRequired': false, 'cannotBeEmpty': true},
    'type_name': {'type': 'string', 'keyRequired': false, 'cannotBeEmpty': true},
    'uv_index': {'type': 'number', 'keyRequired': false, 'cannotBeEmpty': true},
    'visibility': {'type': 'number', 'keyRequired': false, 'cannotBeEmpty': true},
    'wind_direction': {'type': 'string', 'keyRequired': false, 'cannotBeEmpty': true},
    'wind_direction_degrees': {'type': 'number', 'keyRequired': false, 'cannotBeEmpty': true},
    'wind_gust': {'type': 'number', 'keyRequired': false, 'cannotBeEmpty': true},
    'wind_speed': {'type': 'number', 'keyRequired': true, 'cannotBeEmpty': true},
};

export default class MetWeatherTable extends UpdatingKeyValuePairTable {
    /**
     * The title spans both columns (this table has no column headings), so it
     * doesn't force the first column wider than its labels need and the value
     * column gets more room. It still keeps this header the same height as the
     * inside table's.
     */
    _renderHeader() {
        // The title keeps its full-colour 🌤 emoji as part of the catalogue
        // string (🌤 U+1F324 needs its U+FE0F variation selector to be
        // fully-qualified, or it renders and copies inconsistently). Only the
        // row labels below are monochrome.
        this._addHeaderRow([this._catalogue.weather.title], 2);
    }

    /**
     * @param {Object}      data
     * @param {Number|null} generatedAtUnix
     */
    _renderUpdate(data, generatedAtUnix = null) {
        const weather = this._catalogue.weather;

        if ('valid_from' in data && 'valid_to' in data) {
            const fromObj = new Time(data.valid_from * 1000, undefined, this._catalogue);
            const toObj = new Time(data.valid_to * 1000, undefined, this._catalogue);
            const timeFrom = fromObj.formatUserFriendlyHour();
            const timeTo = toObj.formatUserFriendlyHour();

            // Both ends of the hour-long window normally share a timezone and
            // date; only the twice-yearly clock change (timezone) or a window
            // that straddles midnight (date) make them differ. Show the shared
            // "TZ on date" suffix once, after the second time, when they match;
            // otherwise show each time's own suffix.
            const on = this._catalogue.time.onWord;
            const and = weather.and;
            const suffixFrom = `${fromObj.getTimezoneAbbreviation()}${on}${fromObj.formatUserFriendlyDate()}`;
            const suffixTo = `${toObj.getTimezoneAbbreviation()}${on}${toObj.formatUserFriendlyDate()}`;
            // Some locales' short month names end in a period (e.g. "juil.",
            // "jul."); drop a trailing one so the sentence's own full stop
            // doesn't double it up.
            const range = (suffixFrom === suffixTo
                ? `${timeFrom}${and}${timeTo} ${suffixTo}`
                : `${timeFrom} ${suffixFrom}${and}${timeTo} ${suffixTo}`).replace(/\.$/, '');

            const metOfficeLink = document.createElement('a');
            metOfficeLink.href = 'https://www.metoffice.gov.uk/';
            metOfficeLink.target = '_blank';
            metOfficeLink.textContent = 'Met Office';

            // The freshness sits on its own line beneath the source line (the
            // `freshness` span is display:block), e.g.
            //   Source: Met Office forecast for between … on Fri 17th Jul.
            //   Updated 9 mins ago
            const nodes = [weather.sourcePrefix, metOfficeLink, `${weather.forecastBetween}${range}.`];
            const updated = this._updatedElement(generatedAtUnix);
            if (updated) {
                nodes.push(updated);
            }
            this._updateDateSpan(...nodes);
        }

        // The endpoint sends a stable enum-name token (e.g. "HEAVY_RAIN"); the
        // emoji and (localised) name are resolved here. An unmapped token simply
        // omits the row.
        if ('type_name' in data && WEATHER_TYPES[data.type_name]) {
            const emoji = WEATHER_TYPES[data.type_name].emoji;
            const name = this._catalogue.weatherTypeNames[data.type_name];
            this._addTableRow(weather.weatherTypeLabel, `${emoji} ${name}`);
        }

        this._addTempTableRow(weather.temperatureLabel, ('temp' in data) ? data.temp : weather.unknown, null, false, false, LABEL_EMOJI.temperature);
        if ('temp' in data && 'temp_feels_like' in data && data.temp !== data.temp_feels_like) {
            this._addTempTableRow(weather.feelsLikeLabel, data.temp_feels_like ?? weather.unknown);
        }

        const humidityDescription = ('humidity' in data) ? (new Humidity(data.humidity, this._catalogue)).describe() : null;
        this._addTableRow(weather.humidityLabel, ('humidity' in data) ? this.#formatPercent(data.humidity) : weather.unknown, humidityDescription, null, false, false, true, LABEL_EMOJI.humidity);
        this._addTableRow(weather.precipitationLabel, ('precipitation' in data) ? this.#formatPercent(data.precipitation) : weather.unknown);

        // UV index and visibility are only sent when the Met Office reports them
        // for the hour (the key is absent, not null), so both rows are optional.
        if ('uv_index' in data) {
            const uv = new UvIndex(data.uv_index, this._catalogue);
            this._addTableRow(weather.uvIndexLabel, uv.format(), uv.describe(), null, false, false, true, LABEL_EMOJI.uvIndex);
        }
        if ('visibility' in data) {
            this._addTableRow(weather.visibilityLabel, new Visibility(data.visibility, this._catalogue).format(), null, null, false, false, false, LABEL_EMOJI.visibility);
        }

        if ('wind_speed' in data) {
            this._addTableRow(weather.windLabel, this._formatWindSpeed(data), this._formatWindSpeedMph(data), null, false, false, true);
        }
    }

    /**
     * Primary wind line, in km/h with a friendly direction prefix, e.g.
     * "Northerly 24.1 km/h (40.2 km/h gusts)".
     */
    _formatWindSpeed(data) {
        const units = this._catalogue.units;
        const weather = this._catalogue.weather;
        let wind = '';
        if ('wind_direction' in data && this._catalogue.compassNames[data.wind_direction]) {
            wind += this._catalogue.compassNames[data.wind_direction];
            if ('wind_direction_degrees' in data) {
                // Keep the direction and its degrees together on one line.
                wind += `${NBSP}(${this.#round(data.wind_direction_degrees)}${units.degree})`;
            }
            wind += ' ';
        }
        // wind_speed / wind_gust arrive as full-precision floats (converted m/s → mph);
        // convert to km/h and round to one decimal place for display.
        wind += ('wind_speed' in data) ? `${this.#round(data.wind_speed * MPH_TO_KMH)}${NBSP}${units.kmh}` : '';
        if ('wind_gust' in data && data.wind_gust > 0) {
            wind += ` (${this.#round(data.wind_gust * MPH_TO_KMH)}${NBSP}${units.kmh} ${weather.gusts})`;
        }
        return wind;
    }

    /**
     * Muted secondary wind line, in mph without the direction, e.g.
     * "15 mph (25 mph gusts)".
     */
    _formatWindSpeedMph(data) {
        const units = this._catalogue.units;
        const weather = this._catalogue.weather;
        let wind = ('wind_speed' in data) ? `${this.#round(data.wind_speed)}${NBSP}${units.mph}` : '';
        if ('wind_gust' in data && data.wind_gust > 0) {
            wind += ` (${this.#round(data.wind_gust)}${NBSP}${units.mph} ${weather.gusts})`;
        }
        return wind;
    }

    /**
     * Rounds to one decimal place and formats with the locale's decimal
     * separator, e.g. "24.1" (en-GB) or "24,1" (de-DE/fr-FR).
     *
     * @param {Number} value
     *
     * @returns {String}
     */
    #round(value) {
        return new Intl.NumberFormat(this._catalogue.locale, { maximumFractionDigits: 1 }).format(value);
    }

    /**
     * A whole-number percentage with the locale's unit spacing, e.g. "80%" or
     * "80 %".
     *
     * @param {Number} value
     *
     * @returns {String}
     */
    #formatPercent(value) {
        return new Intl.NumberFormat(this._catalogue.locale, { maximumFractionDigits: 0 }).format(value) + this._catalogue.units.percent;
    }

    /**
     * @returns {Object|Array}
     */
    _getContract() {
        return JSON_CONTRACT;
    }
}
