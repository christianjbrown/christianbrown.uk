'use strict';

import EN_GB from '../i18n/messages.en-GB.js';

export default class Humidity {
    #percent;
    #catalogue;

    /**
     * @param {Number} percent
     * @param {Object} catalogue  a message catalogue (locale, unit and
     *                            descriptor strings); defaults to en-GB.
     */
    constructor(percent, catalogue = EN_GB) {
        this.#percent = percent;
        this.#catalogue = catalogue;
    }

    /**
     * Returns a string like "55%" (or "55 %" in de-DE/fr-FR). Rounds to the given
     * number of decimal places, dropping a trailing ".0", and uses the locale's
     * decimal separator.
     *
     * @param {Number} decimalPlaces
     *
     * @returns {String}
     */
    formatPercent(decimalPlaces = 0) {
        const number = new Intl.NumberFormat(this.#catalogue.locale, {
            minimumFractionDigits: 0,
            maximumFractionDigits: decimalPlaces,
        }).format(this.#percent);

        return number + this.#catalogue.units.percent;
    };

    /**
     * Returns a subjective one-word description of how the humidity feels,
     * localised, e.g. "Comfortable" / "Behaglich" / "Confortable".
     *
     * @returns {String}
     */
    describe() {
        return this.#catalogue.humidityDescriptions[this.#describeKey()];
    };

    /**
     * The stable descriptor token for this humidity, keying into a catalogue's
     * humidityDescriptions map. Kept separate from the wording so the thresholds
     * live in one place across all locales.
     *
     * @returns {String}
     */
    #describeKey() {
        if (this.#percent < 50) {
            return 'DRY';
        } else if (this.#percent <= 55) {
            return 'PLEASANT';
        } else if (this.#percent <= 60) {
            return 'COMFORTABLE';
        } else if (this.#percent <= 65) {
            return 'STICKY';
        } else if (this.#percent <= 70) {
            return 'UNCOMFORTABLE';
        } else if (this.#percent <= 75) {
            return 'OPPRESSIVE';
        }

        return 'MISERABLE';
    };
}
