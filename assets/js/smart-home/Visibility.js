'use strict';

import EN_GB from '../i18n/messages.en-GB.js';

// A non-breaking space keeps the figure and its unit together on one line,
// matching how the wind figures couple their number and unit.
const NBSP = String.fromCharCode(0xA0);

// Below this the value reads more naturally in metres; at or above it, in
// kilometres (Met Office visibility arrives as an integer number of metres).
const METRES_PER_KM = 1000;

export default class Visibility {
    #metres;
    #catalogue;

    /**
     * @param {Number} metres  visibility in metres (as the weather feed sends it).
     * @param {Object} catalogue  a message catalogue (locale and unit strings);
     *                             defaults to en-GB.
     */
    constructor(metres, catalogue = EN_GB) {
        this.#metres = metres;
        this.#catalogue = catalogue;
    }

    /**
     * A localised distance that switches unit by magnitude: metres below a
     * kilometre (e.g. "800 m"), kilometres at or above one, to one decimal place
     * (e.g. "12 km", "12.5 km").
     *
     * @returns {String}
     */
    format() {
        const units = this.#catalogue.units;
        if (this.#metres >= METRES_PER_KM) {
            return `${this.#round(this.#metres / METRES_PER_KM, 1)}${NBSP}${units.km}`;
        }

        return `${this.#round(this.#metres, 0)}${NBSP}${units.metre}`;
    };

    /**
     * Formats with the locale's decimal separator, dropping any trailing zero.
     *
     * @param {Number} value
     * @param {Number} maximumFractionDigits
     * @returns {String}
     */
    #round(value, maximumFractionDigits) {
        return new Intl.NumberFormat(this.#catalogue.locale, { maximumFractionDigits }).format(value);
    };
}
