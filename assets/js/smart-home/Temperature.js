'use strict';

import EN_GB from '../i18n/messages.en-GB.js';

export default class Temperature {
    #degreesC;
    #catalogue;

    /**
     * @param {Number} degreesC
     * @param {Object} catalogue  a message catalogue (locale + unit strings);
     *                            defaults to en-GB so callers that don't care
     *                            about locale keep the original behaviour.
     */
    constructor(degreesC, catalogue = EN_GB) {
        this.#degreesC = degreesC;
        this.#catalogue = catalogue;
    }

    /**
     * Returns a string like "21°c" (or "21 °C" in de-DE/fr-FR). Rounds to the
     * given number of decimal places and drops a trailing ".0" (and any trailing
     * zeros), so 26.0 reads as "26°c" while 25.9 keeps its decimal. The locale's
     * decimal separator is used (a comma in de-DE/fr-FR).
     *
     * @param {Number} decimalPlaces
     *
     * @returns {String}
     */
    formatC(decimalPlaces = 1) {
        return this.#formatNumber(this.#degreesC, 0, decimalPlaces) + this.#catalogue.units.tempC;
    };

    /**
     * Returns a string like "69.8°f". Unlike formatC this keeps trailing zeros,
     * so a whole number still shows its decimal (e.g. "32.0°f").
     *
     * @param {Number} decimalPlaces
     *
     * @returns {String}
     */
    formatF(decimalPlaces = 1) {
        return this.#formatNumber(this.#concertToF(), decimalPlaces, decimalPlaces) + this.#catalogue.units.tempF;
    };

    /**
     * @param {Number} value
     * @param {Number} minimumFractionDigits
     * @param {Number} maximumFractionDigits
     *
     * @returns {String}
     */
    #formatNumber(value, minimumFractionDigits, maximumFractionDigits) {
        return new Intl.NumberFormat(this.#catalogue.locale, { minimumFractionDigits, maximumFractionDigits }).format(value);
    }

    /**
     * Returns the fahrenheit equivalent of celsius.
     *
     * @returns {Number}
     */
    #concertToF() {
        return (this.#degreesC*1.8)+32;
    };
}
