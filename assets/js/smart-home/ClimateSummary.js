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
     * "It's 1.6°c warmer inside (26.6°c inside, 25°c outside), and 10.2% more
     * humid (52.8% inside, 42.6% outside)." Whole numbers drop their ".0".
     *
     * @returns {String}
     */
    format() {
        let sentence = this.#formatTemperature();

        const humidity = this.#formatHumidity(this.#temperaturesMatch());
        if (humidity !== null) {
            sentence += `, ${this.#conjunction()} ${humidity}`;
        }

        return sentence+'.';
    }

    /**
     * Whether the inside and outside temperatures round to the same display
     * value, so the sentence collapses them to "N°c inside and outside".
     *
     * @returns {Boolean}
     */
    #temperaturesMatch() {
        const inside = new Temperature(this.#insideTempC);
        const outside = new Temperature(this.#outsideTempC);

        return inside.formatC() === outside.formatC();
    }

    /**
     * Chooses the conjunction joining the temperature and humidity clauses.
     * "but" marks a contrast, and only ever appears when it's cold (below 18°c)
     * or hot (above 25°c) out — a mild day in between reads as comfortable
     * either way, so the temperature takes no side and it's always "and". When
     * it is cold or hot, the temperature has a stance: warmer inside is welcome
     * in the cold, cooler inside is welcome in the heat. The humidity is welcome
     * when it's less humid inside. "but" when exactly one is welcome; otherwise
     * (both or neither, or matching humidity) "and".
     *
     * Only called when both humidities are present.
     *
     * @returns {String}
     */
    #conjunction() {
        const inside = new Humidity(this.#insideHumidity);
        const outside = new Humidity(this.#outsideHumidity);
        if (inside.formatPercent(1) === outside.formatPercent(1)) {
            return 'and';
        }

        if (this.#outsideTempC >= 18 && this.#outsideTempC <= 25) {
            return 'and';
        }

        const temperatureGood = this.#outsideTempC < 18
            ? this.#insideTempC > this.#outsideTempC   // warmer inside is welcome when it's cold
            : this.#insideTempC < this.#outsideTempC;  // cooler inside is welcome when it's hot
        const humidityGood = this.#insideHumidity < this.#outsideHumidity;

        return (temperatureGood !== humidityGood) ? 'but' : 'and';
    }

    /**
     * @returns {String}
     */
    #formatTemperature() {
        const inside = new Temperature(this.#insideTempC);
        const outside = new Temperature(this.#outsideTempC);
        const trim = ClimateSummary.#trimZero;

        if (this.#temperaturesMatch()) {
            return `It's ${trim(inside.formatC())} inside and outside`;
        }

        const diff = new Temperature(Math.abs(this.#insideTempC - this.#outsideTempC));
        const warmerOrCooler = this.#insideTempC > this.#outsideTempC ? 'warmer' : 'cooler';

        return `It's ${trim(diff.formatC())} ${warmerOrCooler} inside (${trim(inside.formatC())} inside, ${trim(outside.formatC())} outside)`;
    }

    /**
     * @param {Boolean} temperaturesMatch
     *
     * @returns {String|null}
     */
    #formatHumidity(temperaturesMatch = false) {
        if (this.#insideHumidity === null || this.#insideHumidity === undefined
            || this.#outsideHumidity === null || this.#outsideHumidity === undefined) {
            return null;
        }

        const inside = new Humidity(this.#insideHumidity);
        const outside = new Humidity(this.#outsideHumidity);
        const trim = ClimateSummary.#trimZero;

        if (inside.formatPercent(1) === outside.formatPercent(1)) {
            return `it's ${trim(inside.formatPercent(1))} humidity inside and outside`;
        }

        const diff = new Humidity(Math.abs(this.#insideHumidity - this.#outsideHumidity));
        const moreOrLess = this.#insideHumidity > this.#outsideHumidity ? 'more' : 'less';

        // When the temperatures match, the temperature clause reads "N°c inside
        // and outside" and so names no side — leaving "more/less humid" with
        // nothing to attach to. Name the side here so the comparison is clear.
        // When they differ, the "warmer/cooler inside" clause already frames it
        // as inside, so adding it again would be redundant.
        const anchor = temperaturesMatch ? ' inside' : '';

        return `${trim(diff.formatPercent(1))} ${moreOrLess} humid${anchor} (${trim(inside.formatPercent(1))} inside, ${trim(outside.formatPercent(1))} outside)`;
    }

    /**
     * Drops a whole number's trailing ".0" for display, e.g. "4.0%" becomes
     * "4%" and "25.0°c" becomes "25°c", while "3.9%" is left alone.
     *
     * @param {String} formatted
     *
     * @returns {String}
     */
    static #trimZero(formatted) {
        return formatted.replace(/\.0(?=°c|%)/, '');
    }
}
