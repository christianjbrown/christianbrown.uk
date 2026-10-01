'use strict';

import Temperature from './Temperature.js';
import Humidity from './Humidity.js';
import Time from './Time.js';

/**
 * Words readings and times for a table in the page's locale: temperatures,
 * humidity, "time ago" and the "Updated" label. It produces strings and
 * nothing else.
 */
export default class ReadingFormatter {
    #catalogue;
    #clock;

    /**
     * @param {Object} catalogue  message catalogue
     * @param {{now: function(): Number}} clock  supplies the current time for relative times
     */
    constructor(catalogue, clock) {
        this.#catalogue = catalogue;
        this.#clock = clock;
    }

    /**
     * A Time for a Unix timestamp in seconds, worded in this catalogue.
     *
     * @param {Number} unixSeconds
     *
     * @returns {Time}
     */
    timeAt(unixSeconds) {
        return new Time(unixSeconds * 1000, this.#clock, undefined, this.#catalogue);
    }

    /**
     * "21 mins ago" for a Unix timestamp in seconds.
     *
     * @param {Number} unixSeconds
     *
     * @returns {String}
     */
    timeAgo(unixSeconds) {
        return this.timeAt(unixSeconds).formatTimeAgo();
    }

    /**
     * A short "Updated <time ago>" label describing when the origin generated
     * the payload (the envelope timestamp), or null when it is unknown.
     * Surfacing this keeps freshness honest even when the edge serves a
     * stale-while-revalidate copy of an older response.
     *
     * @param {Number|null} generatedAtUnix
     *
     * @returns {String|null}
     */
    updatedLabel(generatedAtUnix = null) {
        if (!generatedAtUnix) {
            return null;
        }

        return `${this.#catalogue.table.updatedPrefix}${this.timeAgo(generatedAtUnix)}`;
    }

    /**
     * @param {Number|String} degreesC
     *
     * @returns {{celsius: String, fahrenheit: String}}
     */
    temperature(degreesC) {
        const temperature = new Temperature(degreesC, this.#catalogue);

        return { celsius: temperature.formatC(), fahrenheit: temperature.formatF() };
    }

    /**
     * @param {Number} percent
     *
     * @returns {{value: String, description: String}}
     */
    humidity(percent) {
        const humidity = new Humidity(percent, this.#catalogue);

        return { value: humidity.formatPercent(), description: humidity.describe() };
    }
}
