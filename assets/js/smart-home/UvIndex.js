'use strict';

import EN_GB from '../i18n/messages.en-GB.js';

export default class UvIndex {
    #uvIndex;
    #catalogue;

    /**
     * @param {Number} uvIndex  the Met Office UV index (a dimensionless integer
     *                          on the standard 1–11+ scale).
     * @param {Object} catalogue  a message catalogue (locale and descriptor
     *                             strings); defaults to en-GB.
     */
    constructor(uvIndex, catalogue = EN_GB) {
        this.#uvIndex = uvIndex;
        this.#catalogue = catalogue;
    }

    /**
     * The UV index as a localised whole number, e.g. "7". UV is dimensionless, so
     * there is no unit suffix.
     *
     * @returns {String}
     */
    format() {
        return new Intl.NumberFormat(this.#catalogue.locale, {
            maximumFractionDigits: 0,
        }).format(this.#uvIndex);
    };

    /**
     * Returns the localised exposure-risk band, e.g. "High" / "Hoch" / "Élevé".
     *
     * @returns {String}
     */
    describe() {
        return this.#catalogue.uvDescriptions[this.#describeKey()];
    };

    /**
     * The stable band token for this UV index, keying into a catalogue's
     * uvDescriptions map. Thresholds follow the WHO / Met Office UV scale
     * (1–2 low, 3–5 moderate, 6–7 high, 8–10 very high, 11+ extreme), kept
     * separate from the wording so they live in one place across all locales.
     *
     * @returns {String}
     */
    #describeKey() {
        if (this.#uvIndex < 3) {
            return 'LOW';
        } else if (this.#uvIndex < 6) {
            return 'MODERATE';
        } else if (this.#uvIndex < 8) {
            return 'HIGH';
        } else if (this.#uvIndex < 11) {
            return 'VERY_HIGH';
        }

        return 'EXTREME';
    };
}
