'use strict';

import DataFetcher from '../DataFetcher.js';
import Temperature from '../smart-home/Temperature.js';
import { averageTemperature } from '../smart-home/averageReadings.js';
import EN_GB from '../i18n/messages.en-GB.js';

// The endpoint returns a per-device readings array; the header link only needs
// to average their temperatures, so it validates just those fields.
const JSON_CONTRACT = {
    'type': 'array',
    'keyRequired': true,
    'cannotBeEmpty': true,
    'contract': {
        'temperatureValue': {'type': 'number', 'keyRequired': true, 'cannotBeEmpty': true},
        'temperatureTimestamp': {'type': 'number', 'keyRequired': true, 'cannotBeEmpty': true},
        'temperatureStale': {'type': 'boolean', 'keyRequired': true, 'cannotBeEmpty': true},
    },
};

export default class HomeTemperatureLink {
    #dom;
    #dataFetcher;
    #catalogue;

    /**
     * @param {HTMLElement} dom
     * @param {String}      url
     * @param {Object}      catalogue  message catalogue; defaults to en-GB.
     */
    constructor(dom, url, catalogue = EN_GB) {
        this.#dom = dom;
        this.#dataFetcher = new DataFetcher(url, JSON_CONTRACT);
        this.#catalogue = catalogue;
    }

    /**
     * Fetches the indoor climate and, on success, replaces the link's label with
     * the average indoor temperature.
     *
     * On any failure — or if there is no usable reading to average — it does
     * nothing, leaving whatever label is already there. The link used to ship
     * `hidden` and be revealed here, which meant a single unavailable feed took
     * the only route from the homepage to the smart-home page with it: the page
     * itself degrades fine (the outdoor forecast, the history chart and the
     * write-up do not come from SmartThings), and a crawler never saw the link
     * at all because it was not in the rendered HTML.
     *
     * @return {Promise}
     */
    async update() {
        let data;
        try {
            data = await this.#dataFetcher.fetch();
        } catch {
            return;
        }

        const average = averageTemperature(data);
        if (!average) {
            return;
        }

        const temperature = new Temperature(average.value, this.#catalogue);
        this.#dom.textContent = this.#catalogue.cv.homeTempLink(temperature.formatC());
    }
}
