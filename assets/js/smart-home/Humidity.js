'use strict';

const SUFFIX = '%';

export default class Humidity {
    #percent;

    /**
     * @param {Number} percent
     */
    constructor(percent) {
        this.#percent = percent;
    }

    /**
     * Returns a string like "55%".
     *
     * @param {Number} decimalPlaces
     *
     * @returns {String}
     */
    formatPercent(decimalPlaces = 0) {
        return this.#percent.toFixed(decimalPlaces)+SUFFIX;
    };

    /**
     * Returns a subjective one-word description of how the humidity feels,
     * e.g. "Comfortable".
     *
     * @returns {String}
     */
    describe() {
        if (this.#percent < 50) {
            return 'Dry';
        } else if (this.#percent <= 55) {
            return 'Pleasant';
        } else if (this.#percent <= 60) {
            return 'Comfortable';
        } else if (this.#percent <= 65) {
            return 'Sticky';
        } else if (this.#percent <= 70) {
            return 'Uncomfortable';
        } else if (this.#percent <= 75) {
            return 'Oppressive';
        }

        return 'Miserable';
    };
}
