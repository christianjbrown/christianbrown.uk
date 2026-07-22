'use strict';

import Temperature from './Temperature.js';
import Humidity from './Humidity.js';
import { dewPoint } from './dewPoint.js';
import EN_GB from '../i18n/messages.en-GB.js';

export default class ClimateSummary {
    #insideTempC;
    #insideHumidity;
    #outsideTempC;
    #outsideHumidity;
    #outsideDewPointC;
    #catalogue;

    /**
     * @param {Number}      insideTempC
     * @param {Number|null} insideHumidity
     * @param {Number}      outsideTempC
     * @param {Number|null} outsideHumidity
     * @param {Number|null} outsideDewPointC  the reported outdoor dew point (°C);
     *                                        only used by shouldOpenWindow().
     * @param {Object}      catalogue  message catalogue; defaults to en-GB.
     */
    constructor(insideTempC, insideHumidity, outsideTempC, outsideHumidity, outsideDewPointC = null, catalogue = EN_GB) {
        this.#insideTempC = insideTempC;
        this.#insideHumidity = insideHumidity;
        this.#outsideTempC = outsideTempC;
        this.#outsideHumidity = outsideHumidity;
        this.#outsideDewPointC = outsideDewPointC;
        this.#catalogue = catalogue;
    }

    /**
     * Returns a sentence comparing the inside and outside climate, e.g.
     * "It's 1.6°c warmer inside (26.6°c inside, 25°c outside), and 10.2% more
     * humid (52.8% inside, 42.6% outside)." All numbers are locale-formatted;
     * this method computes the semantic facts and hands the wording to the
     * catalogue.
     *
     * @returns {String}
     */
    format() {
        const cat = this.#catalogue;
        const inside = new Temperature(this.#insideTempC, cat);
        const outside = new Temperature(this.#outsideTempC, cat);
        const diff = new Temperature(Math.abs(this.#insideTempC - this.#outsideTempC), cat);
        const temperaturesMatch = inside.formatC() === outside.formatC();

        const facts = {
            temperaturesMatch,
            insideTemp: inside.formatC(),
            outsideTemp: outside.formatC(),
            diffTemp: diff.formatC(),
            warmer: this.#insideTempC > this.#outsideTempC,
            humidity: this.#humidityFacts(temperaturesMatch),
        };

        return cat.climateSummary(facts);
    }

    /**
     * Whether opening a window would freshen the air — a nudge appended to the
     * status line. It compares the outdoor dew point against the dew point
     * calculated from the indoor temperature and humidity, gated by a few
     * comfort bands, and returns true when any band is satisfied. Rain is not
     * considered. Returns false when the indoor humidity or the outdoor dew
     * point is unknown (nothing to compare).
     *
     * @returns {Boolean}
     */
    shouldOpenWindow() {
        if (this.#insideHumidity == null || this.#outsideDewPointC == null) {
            return false;
        }

        const insideTemp = this.#insideTempC;
        const insideHumidity = this.#insideHumidity;
        const outsideTemp = this.#outsideTempC;
        const outsideDewPoint = this.#outsideDewPointC;
        const insideDewPoint = dewPoint(insideTemp, insideHumidity);
        const dewPointDrop = insideDewPoint - outsideDewPoint;

        // Muggy inside: drier outdoor air clearly helps, as long as it isn't cold.
        if (insideHumidity >= 60 && dewPointDrop >= 2 && outsideTemp >= 8) {
            return true;
        }
        // Getting muggy: needs a bigger dew-point gap and a milder day.
        if (insideHumidity >= 55 && insideHumidity < 60 && dewPointDrop >= 3 && outsideTemp >= 12) {
            return true;
        }
        // Pleasant outside: even a small drop in dew point is worth it.
        if (outsideTemp >= 18 && outsideTemp <= 25 && insideTemp >= 18 && insideHumidity >= 45 && dewPointDrop >= 1) {
            return true;
        }
        // Hot inside: open to cool down, unless the outdoor air is noticeably muggier.
        if (insideTemp > 25 && outsideTemp <= insideTemp - 2 && outsideDewPoint - insideDewPoint <= 1) {
            return true;
        }

        return false;
    }

    /**
     * The semantic humidity facts, or null when either humidity is absent (so
     * the humidity clause is omitted entirely).
     *
     * @param {Boolean} temperaturesMatch
     *
     * @returns {Object|null}
     */
    #humidityFacts(temperaturesMatch) {
        if (this.#insideHumidity === null || this.#insideHumidity === undefined
            || this.#outsideHumidity === null || this.#outsideHumidity === undefined) {
            return null;
        }

        const cat = this.#catalogue;
        const inside = new Humidity(this.#insideHumidity, cat);
        const outside = new Humidity(this.#outsideHumidity, cat);
        const diff = new Humidity(Math.abs(this.#insideHumidity - this.#outsideHumidity), cat);

        return {
            match: inside.formatPercent(1) === outside.formatPercent(1),
            inside: inside.formatPercent(1),
            outside: outside.formatPercent(1),
            diff: diff.formatPercent(1),
            moreInside: this.#insideHumidity > this.#outsideHumidity,
            contrast: this.#contrast(),
        };
    }

    /**
     * Whether the temperature and humidity pull in opposite directions, so the
     * clauses read as a contrast ("but") rather than an accumulation ("and").
     *
     * On a cold (below 18°c) or hot (above 25°c) day the temperature has a
     * stance: warmer inside is welcome in the cold, cooler inside is welcome in
     * the heat. The humidity is welcome when it's less humid inside. It's a
     * contrast when exactly one is welcome; otherwise (both or neither, or
     * matching humidity) it isn't.
     *
     * On a mild day in between the temperature takes no side, but a drier inside
     * is still a welcome contrast: "but" when it's less humid inside, otherwise
     * "and".
     *
     * Only called when both humidities are present.
     *
     * @returns {Boolean}
     */
    #contrast() {
        const inside = new Humidity(this.#insideHumidity, this.#catalogue);
        const outside = new Humidity(this.#outsideHumidity, this.#catalogue);
        if (inside.formatPercent(1) === outside.formatPercent(1)) {
            return false;
        }

        const humidityGood = this.#insideHumidity < this.#outsideHumidity;

        if (this.#outsideTempC >= 18 && this.#outsideTempC <= 25) {
            return humidityGood;
        }

        const temperatureGood = this.#outsideTempC < 18
            ? this.#insideTempC > this.#outsideTempC   // warmer inside is welcome when it's cold
            : this.#insideTempC < this.#outsideTempC;  // cooler inside is welcome when it's hot

        return temperatureGood !== humidityGood;
    }
}
