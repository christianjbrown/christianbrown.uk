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
}
