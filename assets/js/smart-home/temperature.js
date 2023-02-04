'use strict';

const SUFFIX_C = '°c';
const SUFFIX_F = '°f';

export default class Temperature {
    #degreesC;

    /**
     * @param {Number} degreesC
     */
    constructor(degreesC) {
        this.#degreesC = degreesC;
    }

    /**
     * Returns a string like "21°c".
     *
     * @param {Number} decimalPlaces
     *
     * @returns {String}
     */
    formatC(decimalPlaces = 1) {
        return this.#degreesC.toFixed(decimalPlaces)+SUFFIX_C;
    };

    /**
     * Returns a string like "69.8°f".
     *
     * @param {Number} decimalPlaces
     *
     * @returns {String}
     */
    formatF(decimalPlaces = 1) {
        return this.#concertToF().toFixed(decimalPlaces)+SUFFIX_F;
    };

    /**
     * Returns the fahrenheit equivalent of celsius.
     *
     * @returns {Number}
     */
    #concertToF() {
        return (this.#degreesC*1.8)+32;
    };
}
