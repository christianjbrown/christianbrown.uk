'use strict';

import Temperature from './Temperature.js';
import Humidity from './Humidity.js';

export default class ClimateSummary {
    #insideTempC;
    #insideHumidity;
    #outsideTempC;
    #outsideHumidity;

    /**
     * @param {Number}      insideTempC
     * @param {Number|null} insideHumidity
     * @param {Number}      outsideTempC
     * @param {Number|null} outsideHumidity
     */
    constructor(insideTempC, insideHumidity, outsideTempC, outsideHumidity) {
        this.#insideTempC = insideTempC;
        this.#insideHumidity = insideHumidity;
        this.#outsideTempC = outsideTempC;
        this.#outsideHumidity = outsideHumidity;
    }

    /**
     * Returns a sentence comparing the inside and outside climate, e.g.
     * "It's 1.6°c warmer inside (26.6°c inside, 25.0°c outside), and 10.2% more
     * humid (52.8% inside, 42.6% outside)."
     *
     * @returns {String}
     */
    format() {
        let sentence = this.#formatTemperature();

        const humidity = this.#formatHumidity();
        if (humidity !== null) {
            sentence += ', '+humidity;
        }

        return sentence+'.';
    }

    /**
     * @returns {String}
     */
    #formatTemperature() {
        const inside = new Temperature(this.#insideTempC);
        const outside = new Temperature(this.#outsideTempC);

        if (inside.formatC() === outside.formatC()) {
            return `It's ${inside.formatC()} inside and outside`;
        }

        const diff = new Temperature(Math.abs(this.#insideTempC - this.#outsideTempC));
        const warmerOrCooler = this.#insideTempC > this.#outsideTempC ? 'warmer' : 'cooler';

        return `It's ${diff.formatC()} ${warmerOrCooler} inside (${inside.formatC()} inside, ${outside.formatC()} outside)`;
    }

    /**
     * @returns {String|null}
     */
    #formatHumidity() {
        if (this.#insideHumidity === null || this.#insideHumidity === undefined
            || this.#outsideHumidity === null || this.#outsideHumidity === undefined) {
            return null;
        }

        const inside = new Humidity(this.#insideHumidity);
        const outside = new Humidity(this.#outsideHumidity);

        if (inside.formatPercent(1) === outside.formatPercent(1)) {
            return `and it's ${inside.formatPercent(1)} humidity inside and outside`;
        }

        const diff = new Humidity(Math.abs(this.#insideHumidity - this.#outsideHumidity));
        const moreOrLess = this.#insideHumidity > this.#outsideHumidity ? 'more' : 'less';

        return `and ${diff.formatPercent(1)} ${moreOrLess} humid (${inside.formatPercent(1)} inside, ${outside.formatPercent(1)} outside)`;
    }
}
